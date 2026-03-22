import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  Users, 
  CheckCircle2, 
  IndianRupee, 
  Bell, 
  ChevronRight,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  Settings,
  ArrowLeft,
  Sun,
  Moon,
  User,
  ArrowUpRight,
  Download,
  Camera,
  Save,
  Loader2,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFileUrl } from '../services/api';
import gsap from 'gsap';

const ParentDashboard = () => {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const [children, setChildren] = useState([]);
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
    
    const data = new FormData();
    data.append('name', profileData.name);
    data.append('email', profileData.email);
    data.append('phoneNumber', profileData.phoneNumber);
    if (profileData.profilePhoto) {
      data.append('profilePhoto', profileData.profilePhoto);
    }

    try {
      const res = await api.put('/auth/profile', data);
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

  const getTabFromPath = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'profile') return 'settings';
    if (['notices', 'settings', 'notifications'].includes(path)) {
      return path;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      navigate('/parent/dashboard');
    } else {
      navigate(`/parent/${tab}`);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();
    // Safety timeout
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/parent/dashboard');
      setChildren(res.data.children || []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/parent/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/parent/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const downloadReceipt = async (studentId, studentName) => {
    try {
      const response = await api.get(`/parent/fees/${studentId}/receipt`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${studentName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to download receipt");
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin shadow-xl"></div>
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Family Data...</p>
      </div>
    </div>
  );

  return (
    <div ref={dashboardRef} className="space-y-8 animate-in fade-in zoom-in duration-500 w-full">
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 w-fit overflow-x-auto no-scrollbar"
          >
            {['overview', 'notices', 'notifications', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap relative ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
                {tab === 'notifications' && notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] flex items-center justify-center rounded-full border-2 border-[#0f172a]">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}

        {activeTab !== 'overview' && (
          <button 
            onClick={() => handleTabChange('overview')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all font-bold group"
          >
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-blue-500/30 transition-all">
              <ArrowLeft size={18} />
            </div>
            Back to Dashboard
          </button>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="gsap-header">
            <h1 
              className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3"
            >
              Parent Console <Users className="text-blue-600 dark:text-blue-400" size={32} />
            </h1>
            <p 
              className="text-gray-500 dark:text-gray-400 font-medium"
            >
              Welcome back, {user?.name}. Monitor your child's progress.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          {children.length === 0 ? (
            <div className="glass-card p-20 text-center space-y-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto border-2 border-gray-200 dark:border-gray-700">
                <Users size={40} className="text-gray-400 dark:text-gray-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">No Children Linked</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">Please contact the school administration to link your children's accounts to your profile.</p>
            </div>
          ) : (
            <div className="space-y-12 w-full">
              {children.map((child, idx) => (
                <motion.div 
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-8 w-full"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                        {child.name?.[0]}
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{child.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Class {child.class}</span>
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Roll No: {child.rollNo}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
                    <div 
                      onMouseEnter={(e) => handleHover(e, true)}
                      onMouseLeave={(e) => handleHover(e, false)}
                      className="gsap-card glass-card p-6 md:p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all text-blue-400">
                        <IndianRupee size={48} />
                      </div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Fee Details</p>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">₹{child.fee?.remaining || 0}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Remaining Balance</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-black uppercase tracking-widest ${child.fee?.status === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {child.fee?.status || 'Pending'}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500">Status</p>
                          </div>
                        </div>

                        <div className="space-y-2 py-3 border-y border-gray-100 dark:border-gray-800">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-400 uppercase tracking-widest">TUITION</span>
                            <span className="text-gray-900 dark:text-white">₹{(child.fee?.total || 0) - (child.fee?.transport || 0) - (child.fee?.miscellaneous || 0)}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-400 uppercase tracking-widest">TRANSPORT</span>
                            <span className="text-gray-900 dark:text-white">₹{child.fee?.transport || 0}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-400 uppercase tracking-widest">MISC</span>
                            <span className="text-gray-900 dark:text-white">₹{child.fee?.miscellaneous || 0}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${((child.fee?.paid || 0) / (child.fee?.total || 1)) * 100}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="bg-blue-600 h-full" 
                            ></motion.div>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Paid: ₹{child.fee?.paid || 0}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Total: ₹{child.fee?.total || 0}</p>
                          </div>
                        </div>

                        {child.fee?.paid > 0 && (
                          <button 
                            onClick={() => downloadReceipt(child.id, child.name)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 dark:hover:bg-blue-500 border border-blue-100 dark:border-blue-800 hover:border-blue-600 dark:hover:border-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-white transition-all group shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-95"
                          >
                            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                            Download Fee Receipt
                          </button>
                        )}
                      </div>
                    </div>

                    <div 
                      onMouseEnter={(e) => handleHover(e, true)}
                      onMouseLeave={(e) => handleHover(e, false)}
                      className="gsap-card glass-card p-6 md:p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all text-emerald-400">
                        <CheckCircle2 size={48} />
                      </div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Attendance Summary</p>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 text-center group-hover:scale-[1.05] transition-transform">
                            <p className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-1">Present</p>
                            <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{child.presentDays || 0}</p>
                          </div>
                          <div className="p-3 bg-rose-500/5 dark:bg-rose-500/10 rounded-2xl border border-rose-500/10 text-center group-hover:scale-[1.05] transition-transform">
                            <p className="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-1">Absent</p>
                            <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{child.absentDays || 0}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Attendance Rate</p>
                            <p className="text-sm font-black text-blue-600 dark:text-blue-400">{child.attendancePercentage}%</p>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${child.attendancePercentage}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="bg-emerald-500 h-full" 
                            ></motion.div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Child Information</p>
                          <div className="space-y-1">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">ID: <span className="text-gray-900 dark:text-white font-bold">{child.uniqueId}</span></p>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase truncate">Email: <span className="text-gray-900 dark:text-white font-bold">{child.email}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div 
                      onMouseEnter={(e) => handleHover(e, true)}
                      onMouseLeave={(e) => handleHover(e, false)}
                      className="gsap-card glass-card p-6 md:p-8 border border-gray-100 dark:border-gray-800 sm:col-span-2 lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300"
                    >
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Class Teacher</p>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-6 group-hover:scale-[1.02] transition-transform">
                        <div className="w-12 h-12 bg-blue-600/10 dark:bg-blue-500/10 rounded-xl flex items-center justify-center font-black text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {child.teacher?.name?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{child.teacher?.name || 'Unassigned'}</p>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Class Teacher</p>
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Quick Support</p>
                      <div className="grid grid-cols-1 gap-2">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-500 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 transition-all group hover:scale-[1.02] active:scale-95 shadow-sm">
                          <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Contact School</span>
                          <ArrowUpRight size={14} className="text-gray-400 group-hover:text-white" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-rose-600 dark:hover:bg-rose-500 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-rose-600 dark:hover:border-rose-500 transition-all group hover:scale-[1.02] active:scale-95 shadow-sm">
                          <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Request Leave</span>
                          <ArrowUpRight size={14} className="text-gray-400 group-hover:text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-500 w-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Bell className="text-blue-500" /> Recent Alerts
            </h2>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
              {notifications.filter(n => !n.isRead).length} Unread
            </div>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="glass-card p-20 text-center space-y-4">
                <Bell size={48} className="mx-auto text-gray-700 opacity-20" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`glass-card p-6 border-l-4 transition-all hover:bg-white/5 ${
                    n.isRead ? 'border-white/5 opacity-60' : 'border-blue-500 bg-blue-500/5'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        n.type === 'attendance' ? 'bg-emerald-500/10 text-emerald-400' : 
                        n.type === 'fee' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {n.type === 'attendance' ? <CheckCircle2 size={24} /> : 
                         n.type === 'fee' ? <IndianRupee size={24} /> : <Bell size={24} />}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-lg tracking-tight mb-1">{n.title}</h4>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-3">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-10 animate-in fade-in duration-500 w-full pb-10">
          <div className="flex flex-col md:flex-row items-center gap-8 glass-card p-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-4xl text-white">
                    {user?.name?.[0]}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-black uppercase tracking-widest gap-2 text-center p-2">
                  <Camera size={20} />
                  Change Photo
                  <input type="file" className="hidden" onChange={handleProfileFileChange} accept="image/*" />
                </label>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-[#0f172a] shadow-lg text-white">
                <Camera size={14} />
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Parent Settings</h2>
              <p className="text-gray-400 font-medium">Manage your personal profile and dashboard configurations</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span className="px-4 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} /> {user?.role}
                </span>
                <span className="px-4 py-1 bg-white/5 text-gray-400 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <GraduationCap size={12} /> Parent ID: {user?.uniqueId}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card p-10">
                <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
                  <User className="text-blue-500" size={22} /> Personal Information
                </h3>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input
                          type="tel"
                          value={profileData.phoneNumber}
                          onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Username</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                        <input
                          type="text"
                          disabled
                          value={user?.username}
                          className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-white/2 border border-gray-200 dark:border-white/5 rounded-2xl text-gray-500 font-medium text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group"
                    >
                      {profileLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-card p-8 border border-white/5">
                <h4 className="font-bold text-white mb-4 flex items-center gap-3 uppercase tracking-widest text-xs">
                  <Lock size={18} className="text-rose-400" /> Security
                </h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Account Safety</p>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">
                  Change Password
                </button>
              </div>

              <div className="glass-card p-8 border border-gray-200 dark:border-white/5">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 uppercase tracking-widest text-xs">
                  <Download size={18} className="text-blue-400" /> Report Settings
                </h4>
                <div className="space-y-3">
                  <button className="w-full p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl text-left transition-all group">
                    <h5 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">SMS Alerts</h5>
                    <p className="text-[9px] text-gray-500 font-medium">Get instant attendance alerts via SMS</p>
                  </button>
                  <button className="w-full p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl text-left transition-all group">
                    <h5 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">Email Reports</h5>
                    <p className="text-[9px] text-gray-500 font-medium">Weekly academic progress summary</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
