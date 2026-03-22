import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wallet, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  History,
  GraduationCap,
  CreditCard,
  BookOpen,
  Download,
  IndianRupee,
  ChevronRight,
  User,
  BarChart3,
  ArrowLeft,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  Save,
  Loader2,
  Camera,
  Mail,
  Phone,
  Lock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFileUrl } from '../services/api';
import { useAttendance } from '../hooks/useAttendance';
import gsap from 'gsap';

const StudentDashboard = () => {
  const { user, setUser, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const { isInside, attendanceStatus, handlePunchIn, handlePunchOut } = useAttendance();
  const [data, setData] = useState({
    user: { name: '', teacher: { name: 'Unassigned' }, subjects: [] },
    attendancePercentage: 0,
    history: [],
    fee: { total: 0, paid: 0, status: 'Pending' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading && dashboardRef.current) {
      const cards = dashboardRef.current.querySelectorAll('.gsap-card');
      const headers = dashboardRef.current.querySelectorAll('.gsap-header');
      
      gsap.fromTo(headers, 
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2, stagger: 0.05, ease: "power2.out", clearProps: "all" }
      );

      gsap.fromTo(cards, 
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out", delay: 0.1, clearProps: "all" }
      );
    }
  }, [loading, location.pathname]);

  const handleHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      y: isEnter ? -4 : 0,
      scale: isEnter ? 1.02 : 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleClick = (e) => {
    gsap.to(e.currentTarget, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  };

  // Profile management state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    profilePhoto: null
  });
  const [previewUrl, setPreviewUrl] = useState(getFileUrl(user?.profilePhoto));

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        profilePhoto: null
      });
      setPreviewUrl(getFileUrl(user.profilePhoto));
    }
  }, [user]);

  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, profilePhoto: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('email', profileData.email);
    formData.append('phoneNumber', profileData.phoneNumber);
    if (profileData.profilePhoto) {
      formData.append('profilePhoto', profileData.profilePhoto);
    }

    try {
      const res = await api.put('/auth/profile', formData);
      toast.success("Profile updated successfully!");
      const updatedUser = { ...user, ...res.data.user, accessToken: user.accessToken };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  // Sync activeTab with URL
  const getTabFromPath = () => {
    const path = location.pathname.split('/').pop();
    if (['attendance', 'fees', 'settings', 'profile'].includes(path)) {
      return path;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      navigate('/student/dashboard');
    } else {
      navigate(`/student/${tab}`);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Safety timeout
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/student/dashboard');
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin shadow-xl"></div>
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Academic Data...</p>
      </div>
    </div>
  );

  if (!data || !data.user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-950 p-6">
        <div className="glass-card p-12 text-center max-w-md border-rose-500/20">
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-500 border border-rose-500/20 shadow-xl shadow-rose-500/10">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Data Unavailable</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">We couldn't retrieve your student profile. Please contact the administrator.</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary w-full bg-rose-600 hover:bg-rose-700"
          >
            Return to Authentication
          </button>
        </div>
      </div>
    );
  }

  const getStatColor = (color) => {
    const colors = {
      blue: 'from-blue-500/20 to-blue-600/5 text-blue-600 dark:text-blue-400',
      indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-600 dark:text-indigo-400',
      emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-600 dark:text-emerald-400',
      amber: 'from-amber-500/20 to-amber-600/5 text-amber-600 dark:text-amber-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div ref={dashboardRef} className="space-y-8 animate-in fade-in duration-700 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="gsap-header">
          <h1 
            className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3"
          >
            Student Portal <GraduationCap className="text-blue-600 dark:text-blue-400" size={32} />
          </h1>
          <p 
            className="text-gray-500 dark:text-gray-400 font-medium"
          >
            Welcome back, {data.user.name}. Track your academic journey here.
          </p>
        </div>
        
        <div className="flex items-center gap-3 gsap-header">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-black text-[10px] uppercase tracking-[0.1em] shadow-sm transition-all duration-300 ${isInside ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isInside ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-rose-500 shadow-lg shadow-rose-500/50'}`}></div>
            {isInside ? 'Campus Area' : 'Outside Campus'}
          </div>

          {!attendanceStatus?.loginTime ? (
            <button
              onClick={handlePunchIn}
              disabled={!isInside}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 border border-blue-500/20 group"
            >
              <MapPin size={16} className="group-hover:animate-bounce" /> Self Check-in
            </button>
          ) : !attendanceStatus?.logoutTime ? (
            <button
              onClick={() => handlePunchOut()}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2 border border-rose-500/20 group"
            >
              <LogOut size={16} className="group-hover:rotate-12 transition-transform" /> Check-out
            </button>
          ) : (
            <div className="px-6 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 size={16} /> Attendance Logged
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl w-fit border border-gray-200 dark:border-gray-700 mb-10 overflow-x-auto no-scrollbar max-w-full">
        {[
          { id: 'overview', icon: <BarChart3 size={16} />, label: 'Overview' },
          { id: 'attendance', icon: <Calendar size={16} />, label: 'Attendance' },
          { id: 'fees', icon: <IndianRupee size={16} />, label: 'Fees' },
          { id: 'settings', icon: <SettingsIcon size={16} />, label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.id 
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-lg shadow-black/5 border border-gray-100 dark:border-gray-800' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
            `}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              { label: 'Attendance', value: `${data.attendancePercentage}%`, icon: <TrendingUp size={28} />, color: 'blue' },
              { label: 'Total Subjects', value: data.user.subjects?.length || 0, icon: <BookOpen size={28} />, color: 'indigo' },
              { label: 'Today Status', value: attendanceStatus?.loginTime ? 'Present' : 'Not Marked', icon: <CheckCircle2 size={28} />, color: 'emerald' },
              { label: 'Fee Status', value: data.fee?.status || 'Pending', icon: <IndianRupee size={28} />, color: 'amber' },
            ].map((item, idx) => (
              <div 
                key={item.label} 
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
                onClick={(e) => handleClick(e)}
                className="gsap-card stats-card group border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 bg-white dark:bg-gray-900 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl w-full cursor-pointer"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${getStatColor(item.color)} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{item.value}</h3>
                  <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back button for other tabs */}
      {activeTab !== 'overview' && (
        <button 
          onClick={() => handleTabChange('overview')}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all font-bold group mb-6"
        >
          <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 group-hover:border-blue-500/30 transition-all">
            <ArrowLeft size={18} />
          </div>
          Back to Dashboard
        </button>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500 w-full">
          <div className="gsap-card lg:col-span-3 glass-card p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <History className="text-blue-600 dark:text-blue-400" /> Recent Attendance
            </h2>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl w-full">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/50">
                    <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Date</th>
                    <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Login Time</th>
                    <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Logout Time</th>
                    <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.history.slice(0, 10).map((record, i) => (
                    <tr key={i} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300">
                      <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{record.date}</td>
                      <td className="py-4 px-6 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{record.loginTime || '-'}</td>
                      <td className="py-4 px-6 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{record.logoutTime || '-'}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          record.status === 'present' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 
                          'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="gsap-card glass-card p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">Quick Actions</h2>
            <div className="space-y-4">
              <button className="w-full p-4 bg-gray-50 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-500 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 flex items-center justify-between group transition-all hover:scale-[1.05] active:scale-95 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:bg-transparent transition-colors"><Download size={18} /></div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors">Fee Receipt</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full p-4 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-600 dark:hover:bg-indigo-500 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-500 flex items-center justify-between group transition-all hover:scale-[1.05] active:scale-95 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:text-white group-hover:bg-transparent transition-colors"><BookOpen size={18} /></div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors">Assignments</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="glass-card p-8 animate-in fade-in duration-500">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8">Full Attendance History</h2>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/50">
                  <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Date</th>
                  <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Login Time</th>
                  <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Logout Time</th>
                  <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.history.map((record, i) => (
                  <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
                    <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">{record.date}</td>
                    <td className="py-4 px-6 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{record.loginTime || '-'}</td>
                    <td className="py-4 px-6 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{record.logoutTime || '-'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        record.status === 'present' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 
                        'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <div className="glass-card p-12 animate-in fade-in duration-500">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/20">
                <Wallet size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Fee Summary</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Session 2026-27</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Fees</span>
                <span className="text-xl font-black text-gray-900 dark:text-white">₹{data.fee?.total || 0}</span>
              </div>
              <div className="flex justify-between p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Paid Amount</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{data.fee?.paid || 0}</span>
              </div>
              <div className="flex justify-between p-4 bg-rose-50 dark:bg-rose-900/30 rounded-2xl border border-rose-200 dark:border-rose-800">
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Remaining</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">₹{data.fee?.total - data.fee?.paid || 0}</span>
              </div>
            </div>

            <button className="w-full py-5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/30">
              Download Full Receipt (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Settings & Profile Tab */}
      {(activeTab === 'settings' || activeTab === 'profile') && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-2 glass-card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600/10 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">{activeTab === 'profile' ? 'My Profile' : 'Profile Settings'}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{activeTab === 'profile' ? 'View and update your student profile' : 'Update your personal information'}</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 dark:border-gray-800 group-hover:border-blue-500/50 transition-all duration-500">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-black text-white">
                          {user?.name?.[0]}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white rounded-xl cursor-pointer shadow-xl transition-all hover:scale-110">
                      <Camera size={18} />
                      <input type="file" className="hidden" onChange={handleProfileFileChange} accept="image/*" />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{user?.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">{user?.role} • Class {user?.class}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-black font-mono">ID: {user?.uniqueId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-6 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all" 
                        placeholder="Your Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-6 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all" 
                        placeholder="email@school.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                      <input 
                        type="tel" 
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-6 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all" 
                        placeholder="+91 00000 00000"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={profileLoading}
                    className="btn-primary flex items-center gap-3 disabled:opacity-50"
                  >
                    {profileLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Appearance & Preferences */}
            <div className="space-y-8">
              {/* Security Card */}
              <div className="glass-card p-8 border-b-2 border-rose-500/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-rose-600/20 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Lock size={24} />
                  </div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">Security</h2>
                </div>
                <button className="w-full py-4 bg-gray-50 dark:bg-gray-800 hover:bg-rose-500/10 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-rose-500/20 font-bold text-xs uppercase tracking-widest transition-all">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
