import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Calendar,
  User,
  Hash,
  ArrowRight,
  Filter,
  Plus
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentMarks, setStudentMarks] = useState([]);
  const [selectedMarkStudent, setSelectedMarkStudent] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    email: '',
    phoneNumber: '',
    class: '6',
    username: '',
    password: '',
    rollNo: ''
  });

  const [markData, setMarkData] = useState({
    subject: '',
    marks: '',
    totalMarks: '100',
    type: 'Final Exam'
  });

  const classes = ['6', '7', '8', '9', '10', '11', '12'];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(".student-card", 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [loading, activeTab]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (err) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate username/password if empty and name is filled
      if (name === 'name' && !selectedStudent && !prev.username) {
        const base = value.toLowerCase().replace(/\s+/g, '.');
        newData.username = `std.${base}${Math.floor(Math.random() * 100)}`;
        newData.password = Math.random().toString(36).slice(-8);
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedStudent) {
        await api.put(`/admin/students/${selectedStudent.id}`, formData);
        toast.success("Student updated successfully");
      } else {
        await api.post('/admin/students', formData);
        toast.success("Student registered successfully");
      }
      setIsModalOpen(false);
      fetchStudents();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      fatherName: '',
      email: '',
      phoneNumber: '',
      class: '6',
      username: '',
      password: '',
      rollNo: ''
    });
    setSelectedStudent(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student record?")) {
      try {
        await api.delete(`/admin/students/${id}`);
        toast.success("Record deleted successfully");
        fetchStudents();
      } catch (err) {
        toast.error("Failed to delete record");
      }
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      await api.post('/admin/mark-attendance', {
        userId: studentId,
        status,
        date: new Date().toISOString().split('T')[0]
      });
      toast.success(`Attendance marked as ${status}`);
    } catch (err) {
      toast.error("Failed to mark attendance");
    }
  };

  const fetchStudentMarks = async (studentId) => {
    try {
      const res = await api.get(`/admin/student-marks/${studentId}`);
      setStudentMarks(res.data);
    } catch (err) {
      toast.error("Failed to fetch academic records");
    }
  };

  const handleAddMarks = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/add-marks', {
        studentId: selectedStudent.id,
        ...markData
      });
      toast.success("Academic marks added!");
      setIsMarkModalOpen(false);
    } catch (err) {
      toast.error("Failed to add marks");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.class?.includes(searchQuery) ||
    s.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 anime-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2 uppercase">
            STUDENT <span className="text-blue-600 dark:text-blue-400">DATABASE</span>
          </h1>
          <p className="text-gray-500 font-medium italic uppercase tracking-widest text-sm">
            Enrollment Records & Academic Tracking
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 group"
        >
          <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />
          ENROLL STUDENT
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl w-fit border border-gray-200 dark:border-gray-700">
        {['list', 'attendance', 'marks'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-2.5 rounded-xl font-bold text-sm transition-all uppercase tracking-wider
              ${activeTab === tab 
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search & Statistics */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Filter by name, class, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            />
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 text-white shadow-xl flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Active Enrollment</p>
              <h3 className="text-3xl font-black">{students.length}</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              <GraduationCap size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'list' && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl" />)
            ) : filteredStudents.map((student) => (
              <div 
                key={student.id}
                className="student-card bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelectedStudent(student); setFormData({...student, class: student.class || '6'}); setIsModalOpen(true); }}
                      className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/10"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-black uppercase shadow-inner">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{student.name}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Class {student.class || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium flex items-center gap-2"><User size={14} /> Father:</span>
                    <span className="text-gray-900 dark:text-gray-300 font-bold">{student.fatherName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium flex items-center gap-2"><Hash size={14} /> Roll No:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black tracking-widest">{student.rollNo || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Unique ID:</span>
                    <span className="text-gray-400 font-bold text-xs">{student.uniqueId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setSelectedStudent(student); setActiveTab('attendance'); }}
                    className="py-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-black transition-all border border-transparent"
                  >
                    ATTENDANCE
                  </button>
                  <button 
                    onClick={() => { setSelectedStudent(student); setIsMarkModalOpen(true); }}
                    className="py-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-black transition-all border border-transparent"
                  >
                    ADD MARKS
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
              <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">Student Attendance Roll</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-bold bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                <Calendar size={16} className="text-indigo-500" />
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 text-xs font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Class {student.class || '-'}</td>
                      <td className="px-6 py-4 text-sm font-black text-indigo-500 tracking-widest">{student.rollNo || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-4">
                          <button 
                            onClick={() => markAttendance(student.id, 'present')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white transition-all font-black text-xs uppercase"
                          >
                            <CheckCircle size={14} /> PRESENT
                          </button>
                          <button 
                            onClick={() => markAttendance(student.id, 'absent')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all font-black text-xs uppercase"
                          >
                            <XCircle size={14} /> ABSENT
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'marks' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <h3 className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tighter">Select Student</h3>
                <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedMarkStudent(s); fetchStudentMarks(s.id); }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedMarkStudent?.id === s.id ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:border-purple-500/50'}`}
                    >
                      <p className="font-black text-sm">{s.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedMarkStudent?.id === s.id ? 'text-purple-100' : 'text-gray-400'}`}>Class {s.class} • Roll {s.rollNo}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedMarkStudent ? (
                  <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="p-6 bg-purple-50 dark:bg-purple-900/10 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">{selectedMarkStudent.name}</h4>
                        <p className="text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-widest">Academic Performance Record</p>
                      </div>
                      <button 
                        onClick={() => { setSelectedStudent(selectedMarkStudent); setIsMarkModalOpen(true); }}
                        className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    
                    {studentMarks.length > 0 ? (
                      <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {studentMarks.map((m, idx) => (
                          <div key={idx} className="p-6 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-black text-xs uppercase">
                                {m.subject.substring(0, 3)}
                              </div>
                              <div>
                                <h5 className="font-black text-gray-900 dark:text-white">{m.subject}</h5>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{m.examType || m.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-xl text-gray-900 dark:text-white">{m.marksObtained}<span className="text-gray-400 text-sm font-normal"> / {m.totalMarks}</span></p>
                              <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${ (m.marksObtained/m.totalMarks) > 0.8 ? 'bg-green-500' : (m.marksObtained/m.totalMarks) > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${(m.marksObtained / m.totalMarks) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <BookOpen size={48} className="mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">No marks recorded yet</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-800/10 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Select a student to view academic history</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-800 my-8"
            >
              <div className="bg-indigo-600 p-8 text-white relative">
                <h2 className="text-3xl font-black tracking-tighter uppercase">
                  {selectedStudent ? 'Update Details' : 'Student Enrollment'}
                </h2>
                <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest opacity-80 mt-1">
                  Official Academic Registration
                </p>
                <div className="absolute top-8 right-8">
                  <Plus className="rotate-45 cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsModalOpen(false)} />
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</label>
                  <input 
                    name="name" value={formData.name} onChange={handleInputChange} required
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold placeholder:font-medium"
                    placeholder="Student full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Father's Name</label>
                  <input 
                    name="fatherName" value={formData.fatherName} onChange={handleInputChange} required
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold placeholder:font-medium"
                    placeholder="Father / Guardian name"
                  />
                </div>
                {!selectedStudent && (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</label>
                    <input 
                      name="email" type="email" value={formData.email} onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold placeholder:font-medium"
                      placeholder="student@example.com"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone / Parent Phone</label>
                  <input 
                    name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold placeholder:font-medium"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Assigned Class</label>
                  <select 
                    name="class" value={formData.class} onChange={handleInputChange} required
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold cursor-pointer"
                  >
                    {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Roll Number</label>
                  <input 
                    name="rollNo" value={formData.rollNo} onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold placeholder:font-medium"
                    placeholder="e.g. 101"
                  />
                </div>

                {!selectedStudent && (
                  <div className="md:col-span-2 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                      <Hash size={18} />
                      <h4 className="font-black text-sm uppercase tracking-widest">Login Credentials</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Login ID</label>
                        <p className="font-mono text-sm font-bold truncate text-gray-900 dark:text-white p-2 bg-white dark:bg-gray-800 rounded-lg">{formData.username || '...waiting'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Auto Password</label>
                        <p className="font-mono text-sm font-bold truncate text-gray-900 dark:text-white p-2 bg-white dark:bg-gray-800 rounded-lg">{formData.password || '...'}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Credentials are automatically generated based on student name.</p>
                  </div>
                )}
                
                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {selectedStudent ? 'SAVE CHANGES' : 'COMMIT ENROLLMENT'}
                    <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Marks Modal */}
      <AnimatePresence>
        {isMarkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMarkModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="bg-purple-600 p-8 text-white">
                <h2 className="text-2xl font-black tracking-tighter uppercase">Academic Entry</h2>
                <p className="text-purple-100 font-bold text-xs uppercase tracking-widest opacity-80 mt-1">Student: {selectedStudent?.name}</p>
              </div>
              <form onSubmit={handleAddMarks} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Subject Name</label>
                  <input 
                    name="subject" required
                    onChange={(e) => setMarkData({...markData, subject: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Marks Obtained</label>
                    <input 
                      type="number" required
                      onChange={(e) => setMarkData({...markData, marks: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Out of</label>
                    <input 
                      type="number" defaultValue="100"
                      onChange={(e) => setMarkData({...markData, totalMarks: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Assessment Type</label>
                    <select 
                      onChange={(e) => setMarkData({...markData, type: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none font-bold cursor-pointer"
                    >
                      <option>Final Exam</option>
                      <option>Mid Term</option>
                      <option>Class Test</option>
                      <option>Assignment</option>
                    </select>
                  </div>
                <button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-purple-500/30 active:scale-95">
                  POST ACADEMIC RECORD
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
