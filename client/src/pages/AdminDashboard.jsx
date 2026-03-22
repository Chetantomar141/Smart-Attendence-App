import React, { useState, useEffect, useRef } from 'react';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import { 
  ShieldCheck, 
  BarChart3, 
  Briefcase, 
  GraduationCap, 
  ClipboardList, 
  IndianRupee, 
  Settings as SettingsIcon, 
  ArrowLeft, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Save, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Trash2, 
  X,
  UserCheck,
  PieChart,
  Lock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

const AdminDashboard = () => {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const dashboardRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalAttendanceToday: 0,
    totalFeesCollected: 0,
    totalFeesPending: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Teacher management state
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    uniqueId: ''
  });

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
    fetchData();
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

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
  }, [loading, activeTab]);

  const fetchData = async () => {
    try {
      const [statsRes, teachersRes, studentsRes, classesRes, expensesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/teachers'),
        api.get('/admin/students'),
        api.get('/admin/classes-list'),
        api.get('/admin/expenses')
      ]);
      setStats(statsRes.data);
      setTeachers(teachersRes.data);
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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
      toast.success("Profile updated!");
      setUser({ ...user, ...res.data.user });
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/teachers', teacherFormData);
      toast.success("Teacher account created!");
      setShowAddTeacher(false);
      setTeacherFormData({ name: '', username: '', password: '', email: '', uniqueId: '' });
      fetchData();
    } catch (err) {
      console.error("Add teacher error:", err);
      toast.error(err.response?.data?.message || "Failed to add teacher");
    }
  };

  const handleRemoveTeacher = async (id) => {
    if (window.confirm("Remove this teacher?")) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        toast.success("Teacher removed");
        fetchData();
      } catch (err) {
        toast.error("Failed to remove teacher");
      }
    }
  };

  const role = user?.role ? String(user.role).toLowerCase() : '';

  if (loading) return <div className="flex items-center justify-center h-full text-blue-400 font-black tracking-widest uppercase italic">Initializing Admin Core...</div>;

  if (role !== 'admin') {
    return <div className="flex items-center justify-center h-full text-rose-400 font-black italic uppercase tracking-widest">Unauthorized Access</div>;
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

  const financeData = [
    { name: 'Revenue', value: stats.totalFeesCollected },
    { name: 'Expenses', value: stats.totalExpenses },
    { name: 'Profit', value: stats.netProfit }
  ];

  return (
    <div ref={dashboardRef} className="space-y-8 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="gsap-header">
          <h1 
            className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3"
          >
            Admin Console <ShieldCheck className="text-blue-600 dark:text-blue-400" size={32} />
          </h1>
          <p 
            className="text-gray-500 dark:text-gray-400 font-medium"
          >
            Welcome back, {user?.name || 'Admin'}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3 gsap-header">
          <div className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">System Live</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl w-fit border border-gray-200 dark:border-gray-700 mb-10">
        {[
          { id: 'overview', icon: <BarChart3 size={16} />, label: 'Overview' },
          { id: 'teachers', icon: <Briefcase size={16} />, label: 'Faculty' },
          { id: 'students', icon: <GraduationCap size={16} />, label: 'Students' },
          { id: 'classes', icon: <ClipboardList size={16} />, label: 'Classes' },
          { id: 'finance', icon: <IndianRupee size={16} />, label: 'Finance' },
          { id: 'settings', icon: <SettingsIcon size={16} />, label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.id 
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-lg shadow-black/5 border border-gray-100 dark:border-gray-800' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
            `}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'overview' && (
        <button 
          onClick={() => handleTabChange('overview')}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all font-bold group mb-6"
        >
          <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 group-hover:border-blue-500/30 transition-all">
            <ArrowLeft size={18} />
          </div>
          Back to Overview
        </button>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-10 w-full">
          <div className="flex flex-col md:flex-row items-center gap-8 glass-card p-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem]">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-gray-100 dark:border-white/10 shadow-2xl relative">
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
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-white dark:border-[#0f172a] shadow-lg text-white">
                <Camera size={14} />
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{user?.name}</h2>
              <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-xs">System Administrator</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 glass-card p-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-blue-600/10 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Personal Information</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Update your admin profile details</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        disabled
                        value={user?.username}
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 font-bold text-sm cursor-not-allowed"
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

            <div className="space-y-8">
              <div className="glass-card p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem]">
                <h4 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-3 uppercase tracking-widest text-xs">
                  <Lock size={18} className="text-rose-500" /> Security
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-4">Password Management</p>
                <button className="w-full py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                  Change Password
                </button>
              </div>

              <div className="glass-card p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem]">
                <h4 className="font-black text-gray-900 dark:text-white mb-2 uppercase tracking-widest text-xs">System Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-500 uppercase">Version</span>
                    <span className="text-blue-600 dark:text-blue-400">2.0.4-PRO</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-500 uppercase">Last Backup</span>
                    <span className="text-emerald-600 dark:text-emerald-400">2h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-8 w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              { label: 'Total Teachers', value: stats.totalTeachers, icon: <Briefcase size={28} />, color: 'blue' },
              { label: 'Total Students', value: stats.totalStudents, icon: <GraduationCap size={28} />, color: 'indigo' },
              { label: 'Attendance Today', value: `${Math.round(((stats.totalAttendanceToday || 0) / (stats.totalStudents || 1)) * 100)}%`, icon: <UserCheck size={28} />, color: 'emerald' },
              { label: 'Fees Collected', value: `₹${(stats.totalFeesCollected || 0).toLocaleString()}`, icon: <IndianRupee size={28} />, color: 'amber' },
            ].map((item, idx) => (
              <div 
                key={item.label} 
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
                onClick={(e) => handleClick(e)}
                className="gsap-card stats-card group cursor-pointer"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${getStatColor(item.color)} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{item.value}</h3>
                  <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{item.label}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  <TrendingUp size={14} /> +12.5% from last month
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="gsap-card glass-card p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 bg-white dark:bg-gray-900 rounded-2xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                   <IndianRupee size={20} className="text-blue-600 dark:text-blue-400" /> Revenue Flow
                </h2>
                <select className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 px-3 py-1.5 focus:ring-2 focus:ring-blue-500/20">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financeData}>
                       <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#88888810" vertical={false} />
                       <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                       <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                       <Tooltip 
                         contentStyle={{ 
                           backgroundColor: theme === 'dark' ? '#111827' : '#ffffff', 
                           border: '1px solid rgba(148, 163, 184, 0.1)', 
                           borderRadius: '16px', 
                           boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
                         }} 
                       />
                       <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
            </div>

            <div className="gsap-card glass-card p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 bg-white dark:bg-gray-900 rounded-2xl bg-gradient-to-br from-indigo-600/5 to-blue-600/5 hover:shadow-2xl transition-all duration-300">
               <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">System Performance</h2>
               <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium italic">Operational real-time sync active across {stats.totalStudents + stats.totalTeachers} nodes.</p>
               <div className="space-y-4">
                  {[
                    { label: 'Core Database', status: 'Healthy', icon: <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />, color: 'emerald' },
                    { label: 'Socket Engine', status: 'Live Sync', icon: <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />, color: 'emerald' },
                    { label: 'API Latency', status: '24ms', icon: <TrendingDown size={14} className="text-blue-500" />, color: 'blue' },
                    { label: 'Storage Usage', status: '12%', icon: <PieChart size={14} className="text-indigo-500" />, color: 'indigo' },
                  ].map((sys) => (
                    <div key={sys.label} className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-500/30 transition-all group cursor-pointer hover:scale-[1.02]">
                       <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{sys.label}</span>
                       <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                         {sys.icon}
                         {sys.status}
                       </span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'teachers' && (
        <div className="gsap-card glass-card p-8 w-full">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Faculty Management</h2>
              <button 
                onClick={() => setShowAddTeacher(true)}
                className="btn-primary"
              >
                 Add New Teacher
              </button>
           </div>
           
           <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/50">
                       <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700">Teacher</th>
                       <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700">Unique ID</th>
                       <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700">Contact Info</th>
                       <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {teachers.map(t => (
                       <tr key={t.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
                          <td className="py-5 px-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600/10 dark:bg-blue-500/10 rounded-xl flex items-center justify-center font-black text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                   {t.name?.[0]}
                                </div>
                                <div>
                                   <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                                   <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">@{t.username}</p>
                                </div>
                             </div>
                          </td>
                          <td className="py-5 px-6">
                             <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                                {t.uniqueId}
                             </span>
                          </td>
                          <td className="py-5 px-6">
                             <p className="text-sm font-bold text-gray-900 dark:text-white">{t.email}</p>
                             <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Primary Contact</p>
                          </td>
                          <td className="py-5 px-6 text-right">
                             <button 
                                onClick={() => handleRemoveTeacher(t.id)}
                                className="p-3 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-600 dark:hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl transition-all border border-rose-200 dark:border-rose-800"
                             >
                                <Trash2 size={18} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Student Directory</h2>
          </div>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/50">
                  <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700">Student</th>
                  <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700">Class & Roll</th>
                  <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700 text-center">Fee Status</th>
                  <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map(s => (
                  <tr key={s.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600/10 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {s.name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{s.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                       <p className="text-sm font-bold text-gray-900 dark:text-white">Class {s.class}</p>
                       <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Roll: {s.rollNo}</p>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        s.fee?.status === 'Paid' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}>
                        {s.fee?.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                       <button className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-500 text-gray-500 dark:text-gray-400 hover:text-white rounded-xl transition-all border border-gray-200 dark:border-gray-700">
                          <Search size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'classes' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setSelectedClass(cls)}
                className="stats-card group cursor-pointer border-b-4 border-blue-600"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    {cls.className?.[0] || 'C'}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Session 2024-25</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Class {cls.className || 'N/A'}</h3>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Enrolled Students</p>
                       <p className="text-2xl font-black text-gray-900 dark:text-white">{cls.totalStudents}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Presence</p>
                       <p className="text-2xl font-black text-gray-900 dark:text-white">{Math.round((cls.present / (cls.present + cls.absent || 1)) * 100)}%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(cls.present / (cls.present + cls.absent || 1)) * 100}%` }}></div>
                  </div>
                </div>
                <button className="w-full mt-8 py-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-600 dark:hover:bg-blue-500 group-hover:bg-blue-600 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-white border border-gray-200 dark:border-gray-700 group-hover:border-blue-500/20">
                  View Detailed Analytics
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Total Revenue', value: `₹${stats.totalFeesCollected || 0}`, color: 'blue', icon: <TrendingUp /> },
              { label: 'Total Expenses', value: `₹${stats.totalExpenses || 0}`, color: 'rose', icon: <TrendingDown /> },
              { label: 'Net Profit', value: `₹${stats.netProfit || 0}`, color: 'emerald', icon: <BarChart3 /> }
            ].map((item, i) => (
              <div key={i} className="stats-card border-b-4 border-blue-500">
                <div className={`w-14 h-14 bg-blue-500/10 dark:bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6`}>
                  {item.icon}
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white truncate"> {item.value} </h3>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 truncate"> {item.label} </p>
              </div>
            ))}
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black text-gray-900 dark:text-white">Recent Transactions</h2>
               <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-blue-600 transition-colors">
                  Export PDF
               </button>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/50">
                    <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700">Transaction Title</th>
                    <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700">Category</th>
                    <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700">Date</th>
                    <th className="py-5 px-6 border-b border-gray-200 dark:border-gray-700 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map((exp, i) => (
                    <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
                      <td className="py-5 px-6 font-bold text-gray-900 dark:text-white text-sm">{exp.title}</td>
                      <td className="py-5 px-6">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">{exp.category}</span>
                      </td>
                      <td className="py-5 px-6 text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">{exp.date}</td>
                      <td className="py-5 px-6 text-right font-black text-rose-600 dark:text-rose-400">₹{exp.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Class Analytics Modal */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClass(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div 
              className="modal-content relative w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[3rem] p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Class Analytics</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Class {selectedClass.className}</p>
                </div>
                <button onClick={() => setSelectedClass(null)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl text-gray-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-[300px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: selectedClass.present },
                          { name: 'Absent', value: selectedClass.absent }
                        ]}
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff', 
                          border: 'none', 
                          borderRadius: '16px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-4xl font-black text-gray-900 dark:text-white">{Math.round((selectedClass.present / (selectedClass.present + selectedClass.absent || 1)) * 100)}%</p>
                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Presence Rate</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full mt-10">
                  <div className="stats-card border-l-4 border-blue-600 text-center py-6">
                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Present</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{selectedClass.present}</p>
                  </div>
                  <div className="stats-card border-l-4 border-rose-600 text-center py-6">
                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Absent</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{selectedClass.absent}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Teacher Modal */}
      <AnimatePresence>
        {showAddTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddTeacher(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div className="modal-content relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Add Faculty Account</h2>
                <button onClick={() => setShowAddTeacher(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddTeacher} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required type="text" value={teacherFormData.name} onChange={e => setTeacherFormData({...teacherFormData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. Dr. John Smith" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">System Username</label>
                  <input required type="text" value={teacherFormData.username} onChange={e => setTeacherFormData({...teacherFormData, username: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. john_teacher" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Account Password</label>
                  <input required type="password" value={teacherFormData.password} onChange={e => setTeacherFormData({...teacherFormData, password: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Minimum 8 characters" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Faculty ID</label>
                    <input required type="text" value={teacherFormData.uniqueId} onChange={e => setTeacherFormData({...teacherFormData, uniqueId: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. TEA101" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input required type="email" value={teacherFormData.email} onChange={e => setTeacherFormData({...teacherFormData, email: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="teacher@school.com" />
                  </div>
                </div>
                <button 
                  type="submit" 
                  onMouseEnter={(e) => handleHover(e, true)}
                  onMouseLeave={(e) => handleHover(e, false)}
                  onClick={(e) => handleClick(e)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-500/30 uppercase tracking-widest text-sm"
                >
                  Register Faculty Account
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
