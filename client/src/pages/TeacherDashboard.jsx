import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  Users, 
  CheckCircle2, 
  FileSpreadsheet, 
  Upload, 
  Search, 
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  Bell,
  FileText,
  Clock,
  Check,
  X,
  ChevronRight,
  UserPlus,
  IndianRupee,
  Truck,
  Settings,
  ArrowLeft,
  Sun,
  Moon,
  User,
  ArrowUpRight,
  Camera,
  Save,
  Loader2,
  Mail,
  Phone,
  Lock,
  GraduationCap,
  ShieldCheck,
  MapPin,
  LogOut,
  History,
  LayoutDashboard,
  Calendar as CalendarCheck,
  TrendingUp,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFileUrl } from '../services/api';
import { useAttendance } from '../hooks/useAttendance';
import gsap from 'gsap';

const TeacherDashboard = ({ activeTabProp }) => {
  const { user, setUser, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const { isInside, attendanceStatus, handlePunchIn, handlePunchOut } = useAttendance();
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, absentToday: 0 });
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [attendanceData, setAttendanceData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync activeTab with URL or Prop
  const getTabFromPath = () => {
    if (activeTabProp) return activeTabProp;
    const path = location.pathname.split('/').pop();
    if (['students', 'attendance', 'assignments', 'notices', 'settings', 'classes', 'fees'].includes(path)) {
      return path;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, activeTabProp]);

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

  const handleHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      y: isEnter ? -4 : 0,
      scale: isEnter ? 1.02 : 1,
      duration: 0.2,
      ease: "power2.out"
    });
    
    const icon = e.currentTarget.querySelector('svg');
    if (icon) {
      gsap.to(icon, {
        scale: isEnter ? 1.1 : 1,
        duration: 0.2,
        ease: "power2.out"
      });
    }
  };

  const handleClick = (e) => {
    gsap.to(e.currentTarget, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      navigate('/teacher/dashboard');
    } else {
      navigate(`/teacher/${tab}`);
    }
  };

  const [classes, setClasses] = useState([]);
  const fetchClasses = async () => {
    try {
      const res = await api.get('/teacher/classes');
      setClasses(res.data);
    } catch (err) {
      toast.error("Failed to load academic classes");
    }
  };

  const [marksData, setMarksData] = useState([]);
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState(null);
  const [marksFormData, setMarksDataForm] = useState({
    subject: '',
    marksObtained: '',
    totalMarks: 100,
    examType: 'Midterm'
  });

  const fetchStudentMarks = async (studentId) => {
    try {
      const res = await api.get(`/teacher/marks/${studentId}`);
      setMarksData(res.data);
    } catch (err) {
      toast.error("Failed to load marks");
    }
  };

  const handleAddMarks = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teacher/marks', {
        studentId: selectedStudentForMarks.id,
        ...marksFormData
      });
      toast.success("Marks added successfully!");
      fetchStudentMarks(selectedStudentForMarks.id);
      setMarksDataForm({ subject: '', marksObtained: '', totalMarks: 100, examType: 'Midterm' });
    } catch (err) {
      toast.error("Failed to add marks");
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      class: student.class,
      rollNo: student.rollNo,
      section: student.section || '',
      fatherName: student.parent?.name || '',
      parentEmail: student.parent?.email || '',
      parentMobile: student.parent?.phoneNumber || '',
      address: student.parent?.address || ''
    });
    setShowAddModal(true);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [feeData, setFeeData] = useState({}); // studentId: {total, paid, miscellaneous, transport}

  // New student form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class: '',
    rollNo: '',
    section: '',
    fatherName: '',
    parentEmail: '',
    parentMobile: '',
    address: ''
  });

  const fetchStats = async () => {
    try {
      const res = await api.get('/teacher/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchStats();
    // Safety timeout
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/teacher/students');
      setStudents(Array.isArray(res.data) ? res.data : []);
      
      // Initialize feeData
      const fees = {};
      if (Array.isArray(res.data)) {
        res.data.forEach(s => {
          if (s.fee) {
            fees[s.id] = {
              total: s.fee.total,
              paid: s.fee.paid,
              miscellaneous: s.fee.miscellaneous || 0,
              transport: s.fee.transport || 0
            };
          }
        });
      }
      setFeeData(fees);
    } catch (err) {
      toast.error("Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeeChange = (studentId, field, value) => {
    setFeeData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleUpdateFees = async (studentId) => {
    try {
      const fee = feeData[studentId];
      await api.post('/teacher/fees', {
        studentId,
        ...fee
      });
      toast.success("Fees updated successfully!");
      fetchStudents();
    } catch (err) {
      toast.error("Failed to update fees");
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (editingStudent) {
        await api.put(`/teacher/students/${editingStudent.id}`, data);
        toast.success("Student updated successfully!");
      } else {
        await api.post('/teacher/students', data);
        toast.success("Student and Parent accounts created!");
      }
      setShowAddModal(false);
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        class: '',
        rollNo: '',
        section: '',
        fatherName: '',
        parentEmail: '',
        parentMobile: '',
        address: ''
      });
      fetchStudents();
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/teacher/students/${id}`);
        toast.success("Student deleted successfully");
        fetchStudents();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      await api.post('/teacher/attendance', {
        studentId,
        status,
        date: selectedDate
      });
      toast.success("Attendance updated");
      fetchStudents();
    } catch (err) {
      toast.error("Failed to mark attendance");
    }
  };

  const filteredStudents = students.filter(s => {
    const nameMatch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const idMatch = s.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const classMatch = selectedClass === 'All' || s.class === selectedClass;
    return (nameMatch || idMatch) && classMatch;
  });

  const overviewStats = [
    { label: 'Total Students', value: stats.totalStudents || 0, icon: <Users size={24} />, color: 'blue' },
    { label: 'Classes', value: [...new Set(students.map(s => s.class))].length, icon: <BookOpen size={24} />, color: 'indigo' },
    { label: 'Attendance Marked', value: `${stats.attendanceRate || 0}%`, icon: <CheckCircle2 size={24} />, color: 'emerald' },
  ];

  const attendanceChartData = [
    { name: 'Present', value: stats.presentToday || 0 },
    { name: 'Absent', value: stats.absentToday || 0 }
  ];

  const COLORS = ['#10b981', '#f43f5e']; // emerald-500, rose-500

  const role = user?.role ? String(user.role).toLowerCase() : '';

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin shadow-xl"></div>
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Academic Data...</p>
      </div>
    </div>
  );

  if (role !== 'teacher') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-950 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md border-rose-500/20"
        >
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-500 border border-rose-500/20 shadow-xl shadow-rose-500/10">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">This portal is restricted to Faculty members only. Please sign in with your teacher credentials.</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary w-full bg-rose-600 hover:bg-rose-700 border-rose-500/20 shadow-rose-500/25"
          >
            Return to Authentication
          </button>
        </motion.div>
      </div>
    );
  }

  const getStatColor = (color) => {
    const colors = {
      blue: 'from-blue-500/20 to-blue-600/5 text-blue-600 dark:text-blue-400',
      indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-600 dark:text-indigo-400',
      emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-600 dark:text-emerald-400',
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
            Faculty Console <Briefcase className="text-blue-600 dark:text-blue-400" size={32} />
          </h1>
          <p 
            className="text-gray-500 dark:text-gray-400 font-medium"
          >
            Manage students, attendance, and academic records
          </p>
        </div>
        
        <div className="flex items-center gap-3 gsap-header">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-black text-[10px] uppercase tracking-[0.1em] shadow-sm transition-all duration-300 ${isInside ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isInside ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-rose-500 shadow-lg shadow-rose-500/50'}`}></div>
            {isInside ? 'Inside Boundary' : 'Boundary Alert'}
          </div>

          {!attendanceStatus?.loginTime ? (
            <button
              onClick={(e) => {
                handlePunchIn();
                handleClick(e);
              }}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
              disabled={!isInside}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 border border-blue-500/20 group"
            >
              <MapPin size={16} className="group-hover:animate-bounce" /> Punch In
            </button>
          ) : !attendanceStatus?.logoutTime ? (
            <button
              onClick={(e) => {
                handlePunchOut();
                handleClick(e);
              }}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2 border border-rose-500/20 group"
            >
              <LogOut size={16} className="group-hover:rotate-12 transition-transform" /> Punch Out
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
          { id: 'overview', icon: <LayoutDashboard size={16} />, label: 'Overview' },
          { id: 'students', icon: <Users size={16} />, label: 'Students' },
          { id: 'attendance', icon: <CalendarCheck size={16} />, label: 'Attendance' },
          { id: 'assignments', icon: <FileText size={16} />, label: 'Works' },
          { id: 'notices', icon: <Bell size={16} />, label: 'Notices' },
          { id: 'settings', icon: <Settings size={16} />, label: 'Settings' }
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {overviewStats.map((stat, i) => (
                <div 
                  key={i}
                  onMouseEnter={(e) => handleHover(e, true)}
                  onMouseLeave={(e) => handleHover(e, false)}
                  onClick={(e) => handleClick(e)}
                  className="gsap-card stats-card group cursor-pointer"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${getStatColor(stat.color)} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter truncate">{stat.value}</h3>
                    <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Circular Attendance Graph */}
            <div className="lg:col-span-4 gsap-card glass-card p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center relative min-h-[300px]">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 self-start ml-2">Today's Attendance</h4>
              <div className="w-full h-full min-h-[200px] relative">
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <Pie
                      data={attendanceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#111827' : '#ffffff', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.attendanceRate || 0}%</p>
                  <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Present</p>
                </div>
              </div>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Present: {stats.presentToday}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Absent: {stats.absentToday}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Fees (Excel Style) */}
          <div className="gsap-card glass-card p-8 space-y-6 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <IndianRupee className="text-blue-600 dark:text-blue-400" /> Student Fee Management
              </h3>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                  Spreadsheet View
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Student Name</th>
                    <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Total Fee</th>
                    <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Paid</th>
                    <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700 text-center">Status</th>
                    <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group">
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Roll: {student.rollNo}</p>
                      </td>
                      <td className="py-4 px-6">
                        <input 
                          type="number"
                          value={feeData[student.id]?.total || 0}
                          onChange={(e) => handleFeeChange(student.id, 'total', e.target.value)}
                          className="w-24 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <input 
                          type="number"
                          value={feeData[student.id]?.paid || 0}
                          onChange={(e) => handleFeeChange(student.id, 'paid', e.target.value)}
                          className="w-24 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          student.fee?.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {student.fee?.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleUpdateFees(student.id)}
                          className="p-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white rounded-lg transition-all shadow-sm"
                        >
                          <Check size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes.map((cls, i) => (
              <div 
                key={i}
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
                onClick={(e) => handleClick(e)}
                className="gsap-card stats-card border-b-4 border-blue-500 group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-blue-500/10 dark:bg-blue-400/10 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <GraduationCap size={24} />
                  </div>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-gray-700">
                    {cls.studentCount} Students
                  </span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">Class {cls.class}</h3>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Active Academic Session</p>
              </div>
            ))}
            {classes.length === 0 && (
              <div className="col-span-full py-20 text-center glass-card border-dashed border-2 border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.2em]">No classes found. Add students to see classes here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-in fade-in duration-500 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Student Directory</h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manage your students and their academic profiles.</p>
            </div>
            <button 
              onClick={() => {
                setEditingStudent(null);
                setFormData({
                  name: '',
                  email: '',
                  class: '',
                  rollNo: '',
                  section: '',
                  fatherName: '',
                  parentEmail: '',
                  parentMobile: '',
                  address: ''
                });
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 group relative z-10 hover:scale-105 active:scale-95"
            >
              <UserPlus size={18} className="group-hover:scale-110 transition-transform" /> Add New Student
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {['All', ...new Set(students.map(s => s.class))].map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedClass === cls ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {cls === 'All' ? 'All Classes' : `Class ${cls}`}
                </button>
              ))}
            </div>
          </div>

          <div className="gsap-card glass-card overflow-hidden w-full bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/50">
                    <th className="py-6 px-8 border-b border-gray-200 dark:border-gray-700">Student Details</th>
                    <th className="py-6 px-8 border-b border-gray-200 dark:border-gray-700">Class & Roll</th>
                    <th className="py-6 px-8 border-b border-gray-200 dark:border-gray-700">Parent Contact</th>
                    <th className="py-6 px-8 border-b border-gray-200 dark:border-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600/10 dark:bg-blue-500/10 rounded-xl flex items-center justify-center font-black text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            {student.name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">ID: {student.uniqueId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <p className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Class {student.class}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Roll No: {student.rollNo}</p>
                      </td>
                      <td className="py-6 px-8">
                        <p className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{student.parent?.name || 'Mr. Father'}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">{student.parent?.phoneNumber || 'No Contact'}</p>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={(e) => {
                              setSelectedStudentForMarks(student);
                              fetchStudentMarks(student.id);
                              handleClick(e);
                            }}
                            className="p-3 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-xl transition-all border border-emerald-200 dark:border-emerald-800"
                            title="Add Marks"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                              handleEditStudent(student);
                              handleClick(e);
                            }}
                            className="p-3 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-600 dark:hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white rounded-xl transition-all border border-blue-200 dark:border-blue-800"
                          >
                            <Settings size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                              handleDeleteStudent(student.id);
                              handleClick(e);
                            }}
                            className="p-3 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-600 dark:hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl transition-all border border-rose-200 dark:border-rose-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="glass-card p-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div className="space-y-4 w-full md:w-auto">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Daily Attendance</h2>
              <div className="flex flex-wrap gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/50">
                  <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Student</th>
                  <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">Class Info</th>
                  <th className="py-4 px-6 border-b border-gray-200 dark:border-gray-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/10 dark:bg-blue-500/10 rounded-xl flex items-center justify-center font-black text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {student.name?.[0]}
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{student.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Class {student.class}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Roll: {student.rollNo}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => markAttendance(student.id, 'present')}
                          className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 shadow-sm"
                        >
                          <Check size={14} /> Present
                        </button>
                        <button 
                          onClick={() => markAttendance(student.id, 'absent')}
                          className="px-4 py-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-600 dark:hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-rose-200 dark:border-rose-800 shadow-sm"
                        >
                          <X size={14} /> Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="glass-card p-12 text-center space-y-6 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-blue-500/10 dark:bg-blue-400/10 rounded-full flex items-center justify-center mx-auto border-2 border-blue-500/20 dark:border-blue-400/20">
            <FileText size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Assignment Management</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium">Create and track assignments for your students. This feature is being enhanced for better file handling.</p>
          <button className="btn-primary px-8 py-4">
            Create New Assignment
          </button>
        </div>
      )}

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div className="glass-card p-12 text-center space-y-6 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-amber-500/10 dark:bg-amber-400/10 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500/20 dark:border-amber-400/20">
            <Bell size={40} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Notice Board</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium">Broadcast important updates to students and parents. Your recent notices will appear here.</p>
          <button className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20">
            Compose New Notice
          </button>
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Fee Management</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Monitor payment status and generate reminders</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Collection Rate</p>
                <p className="text-xl font-black">84%</p>
              </div>
            </div>
          </div>

          <div className="gsap-card glass-card overflow-hidden bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/50">
                    <th className="py-6 px-8 border-b border-gray-200 dark:border-gray-700">Student</th>
                    <th className="py-6 px-8 border-b border-gray-200 dark:border-gray-700">Total Fee</th>
                    <th className="py-6 px-8 border-b border-gray-200 dark:border-gray-700">Paid Amount</th>
                    <th className="py-6 px-8 border-b border-gray-200 dark:border-gray-700">Status</th>
                    <th className="py-6 px-8 border-b border-gray-200 dark:border-gray-700 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map(student => {
                    const studentFee = feeData[student.id] || { total: 0, paid: 0 };
                    const remaining = studentFee.total - studentFee.paid;
                    const status = remaining <= 0 ? 'Paid' : (studentFee.paid > 0 ? 'Partial' : 'Unpaid');
                    
                    return (
                      <tr key={student.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center font-black text-blue-600 dark:text-blue-400">
                              {student.name?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{student.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Class {student.class}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8 font-black text-gray-900 dark:text-white text-sm">₹{(studentFee.total || 0).toLocaleString()}</td>
                        <td className="py-6 px-8 font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{(studentFee.paid || 0).toLocaleString()}</td>
                        <td className="py-6 px-8">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            status === 'Paid' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
                            status === 'Partial' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                            'bg-rose-100 text-rose-600 border border-rose-200'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-6 px-8 text-right">
                          <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-all">
                            <Bell size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-10 animate-in fade-in duration-500 w-full pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Profile Photo */}
            <div className="lg:col-span-1">
              <div className="glass-card p-8 text-center sticky top-8">
                <div className="relative inline-block group mb-6">
                  <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 dark:border-gray-800 group-hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                        <User size={64} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 p-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-110 active:scale-95 group-hover:shadow-blue-500/50">
                    <Camera size={20} />
                    <input type="file" className="hidden" onChange={handleProfileFileChange} accept="image/*" />
                  </label>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{user?.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Faculty Account</p>
                
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-center gap-3 text-left p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
                    <div>
                      <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Account Status</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Verified Faculty</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Profile Form */}
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleProfileSubmit} className="glass-card p-8 md:p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <Settings className="text-blue-600 dark:text-blue-400" /> Account Settings
                  </h2>
                  <button 
                    type="submit" 
                    disabled={profileLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {profileLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                      <input 
                        type="tel" 
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Account Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                      <input 
                        disabled
                        type="password" 
                        value="********"
                        className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-5 py-4 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="glass-card p-8 md:p-10">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 uppercase tracking-widest text-xs">
                  <Settings size={18} className="text-blue-600 dark:text-blue-400" /> Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all group">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">Email Notifications</span>
                    <div className="w-12 h-6 bg-blue-600 dark:bg-blue-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </button>
                  <button className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all group">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">Two-Factor Auth</span>
                    <ArrowUpRight size={18} className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-all" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400"><X size={24} /></button>
                </div>

                <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="md:col-span-2">
                    <h3 className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-blue-500/20 pb-2">Student Information</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Enter student name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="student@school.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Class</label>
                    <input 
                      required
                      type="text" 
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="e.g. 10th"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Roll Number</label>
                    <input 
                      required
                      type="text" 
                      value={formData.rollNo}
                      onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="e.g. 101"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Section</label>
                    <input 
                      type="text" 
                      value={formData.section}
                      onChange={(e) => setFormData({...formData, section: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="e.g. A"
                    />
                  </div>

                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-amber-500/20 pb-2">Parent Information</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Father's Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.fatherName}
                      onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Enter father's name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Parent Email</label>
                    <input 
                      required
                      type="email" 
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="parent@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Parent Mobile</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.parentMobile}
                      onChange={(e) => setFormData({...formData, parentMobile: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="+91 0000000000"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Address</label>
                    <textarea 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                      placeholder="Enter residential address"
                    />
                  </div>
                  <div className="md:col-span-2 pt-4 sticky bottom-0 bg-white dark:bg-gray-900 pb-2">
                    <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-500/30 uppercase tracking-widest text-sm">
                      {editingStudent ? 'Update Student Record' : 'Register Student & Notify Parent'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Marks Modal */}
      <AnimatePresence>
        {selectedStudentForMarks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentForMarks(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Academic Performance</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Student: {selectedStudentForMarks.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedStudentForMarks(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-white/5 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Add Marks Form */}
                <form onSubmit={handleAddMarks} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-600/5 dark:bg-blue-400/5 p-6 rounded-3xl border border-blue-500/10 dark:border-blue-400/10">
                  <div className="md:col-span-2 mb-2">
                    <h3 className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest">Record New Result</h3>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      required
                      type="text" 
                      value={marksFormData.subject}
                      onChange={(e) => setMarksDataForm({...marksFormData, subject: e.target.value})}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Exam Type</label>
                    <select 
                      value={marksFormData.examType}
                      onChange={(e) => setMarksDataForm({...marksFormData, examType: e.target.value})}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="Midterm" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Midterm</option>
                      <option value="Final" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Final Exam</option>
                      <option value="Unit Test" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Unit Test</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Marks Obtained</label>
                    <input 
                      required
                      type="number" 
                      value={marksFormData.marksObtained}
                      onChange={(e) => setMarksDataForm({...marksFormData, marksObtained: e.target.value})}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Total Marks</label>
                    <input 
                      required
                      type="number" 
                      value={marksFormData.totalMarks}
                      onChange={(e) => setMarksDataForm({...marksFormData, totalMarks: e.target.value})}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <button type="submit" className="md:col-span-2 mt-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/25">
                    Add Result Record
                  </button>
                </form>

                {/* Marks History */}
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <History className="text-blue-600 dark:text-blue-400" /> Result History
                  </h3>
                  <div className="space-y-3">
                    {marksData.map((mark, i) => (
                      <div key={i} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black border ${
                            mark.grade === 'A' ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                            mark.grade === 'B' ? 'bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400' :
                            mark.grade === 'C' ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' :
                            'bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'
                          }`}>
                            {mark.grade}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{mark.subject}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">{mark.examType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-gray-900 dark:text-white">{mark.marksObtained}<span className="text-xs text-gray-500 font-bold ml-1">/ {mark.totalMarks}</span></p>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{new Date(mark.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {marksData.length === 0 && (
                      <div className="py-10 text-center bg-gray-50 dark:bg-transparent rounded-2xl border-dashed border-2 border-gray-200 dark:border-white/10">
                        <p className="text-gray-500 font-black uppercase tracking-widest text-xs italic">No results recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDashboard;
