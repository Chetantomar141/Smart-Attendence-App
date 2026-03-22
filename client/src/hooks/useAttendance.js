import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const SCHOOL_LAT = 28.6139; // These should ideally come from an API/config
const SCHOOL_LNG = 77.2090;
const SCHOOL_RADIUS = 100; // meters

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

export const useAttendance = () => {
  const { logout } = useAuth();
  const [location, setLocation] = useState(null);
  const [isInside, setIsInside] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use refs to avoid dependency loops in checkLocation
  const isInsideRef = useRef(isInside);
  const statusRef = useRef(attendanceStatus);

  useEffect(() => {
    isInsideRef.current = isInside;
  }, [isInside]);

  useEffect(() => {
    statusRef.current = attendanceStatus;
  }, [attendanceStatus]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/attendance/status');
      setAttendanceStatus(res.data);
    } catch (err) {
      console.error("Error fetching attendance status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePunchOut = useCallback(async (lat, lng, isAuto = false) => {
    try {
      const res = await api.post('/attendance/punch-out', {
        latitude: lat || location?.latitude,
        longitude: lng || location?.longitude
      });
      toast.success(res.data.message);
      fetchStatus();
      if (isAuto) {
        logout();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Punch out failed");
    }
  }, [location, fetchStatus, logout]);

  const checkLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        const distance = getDistance(latitude, longitude, SCHOOL_LAT, SCHOOL_LNG);
        const inside = distance <= SCHOOL_RADIUS;
        
        // Use refs here instead of state dependencies
        if (isInsideRef.current && !inside && statusRef.current?.loginTime && !statusRef.current?.logoutTime) {
          toast.error("You left the school area. Logging out...");
          handlePunchOut(latitude, longitude, true);
        }
        
        setIsInside(inside);
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true }
    );
  }, [handlePunchOut]);

  useEffect(() => {
    fetchStatus();
    checkLocation();
    const interval = setInterval(checkLocation, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [fetchStatus, checkLocation]);

  const handlePunchIn = async () => {
    if (!isInside) {
      toast.error("You are not at school location");
      return;
    }

    try {
      const res = await api.post('/attendance/punch-in', {
        latitude: location.latitude,
        longitude: location.longitude
      });
      toast.success(res.data.message);
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Punch in failed");
    }
  };

  return {
    location,
    isInside,
    attendanceStatus,
    loading,
    handlePunchIn,
    handlePunchOut,
    refreshStatus: fetchStatus
  };
};
