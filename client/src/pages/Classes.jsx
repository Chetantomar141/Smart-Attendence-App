import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  UserCheck, 
  Plus, 
  Search, 
  Settings, 
  ChevronRight, 
  LayoutGrid,
  List,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeView, setActiveView] = useState('grid');
  const [viewingClassDetails, setViewingClassDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    teacherId: ''
  });

  const availableClasses = ['6', '7', '8', '9', '10', '11', '12'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(".class-card", 
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [loading, activeView]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classRes, teacherRes, studentRes] = await Promise.all([
        api.get('/admin/classes-list'),
        api.get('/admin/teachers'),
        api.get('/admin/students')
      ]);
      setClasses(classRes.data);
      setTeachers(teacherRes.data);
      setStudents(studentRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (selectedClass) {
        await api.put(`/admin/classes/${selectedClass.id}`, formData);
        toast.success("Class updated!");
      } else {
        await api.post('/admin/classes', formData);
        toast.success("New class created!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Process failed");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this class?")) {
      try {
        await api.delete(`/admin/classes/${id}`);
        toast.success("Class removed");
        fetchData();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const getStudentCount = (className) => {
    return students.filter(s => s.class === className).length;
  };

  const markBulkAttendance = async (className, status) => {
    const classStudents = students.filter(s => s.class === className);
    try {
      await Promise.all(classStudents.map(s => 
        api.post('/admin/mark-attendance', {
          userId: s.id,
          status,
          date: new Date().toISOString().split('T')[0]
        })
      ));
      toast.success(`Bulk attendance marked as ${status} for ${className}`);
    } catch (err) {
      toast.error("Bulk attendance failed");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 anime-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2 uppercase">
            ACADEMIC <span className="text-blue-600 dark:text-blue-400">STRUCTURE</span>
          </h1>
          <p className="text-gray-500 font-medium italic uppercase tracking-widest text-sm">
            Class Management & Faculty Assignment
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl flex border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setActiveView('grid')}
              className={`p-2 rounded-xl transition-all ${activeView === 'grid' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setActiveView('list')}
              className={`p-2 rounded-xl transition-all ${activeView === 'list' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'}`}
            >
              <List size={20} />
            </button>
          </div>
          <button 
            onClick={() => { setSelectedClass(null); setFormData({name: '6', teacherId: ''}); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm uppercase tracking-tighter"
          >
            <Plus size={20} />
            DEFINE CLASS
          </button>
        </div>
      </div>

      {/* Grid View */}
      {activeView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl" />)
          ) : classes.map(cls => (
            <div 
              key={cls.id} 
              className="class-card bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/30">
                  {cls.name}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelectedClass(cls); setFormData({name: cls.name, teacherId: cls.teacherId}); setIsModalOpen(true); }} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(cls.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"><Trash2 size={16}/></button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Class Teacher</p>
                  <p className="text-gray-900 dark:text-white font-bold">{cls.classTeacher?.name || 'NOT ASSIGNED'}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    <span className="text-sm font-black text-gray-900 dark:text-gray-300">{getStudentCount(cls.name)} Students</span>
                  </div>
                  <button 
                    onClick={() => setViewingClassDetails(cls)}
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Details View */}
      <AnimatePresence>
        {viewingClassDetails && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[110] bg-white dark:bg-gray-950 overflow-y-auto p-4 md:p-8"
          >
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setViewingClassDetails(null)}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-bold flex items-center gap-2"
                >
                  <ArrowRight size={20} className="rotate-180" /> BACK TO DASHBOARD
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => markBulkAttendance(viewingClassDetails.name, 'present')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-green-500/20"
                  >
                    MARK ALL PRESENT
                  </button>
                  <button 
                    onClick={() => markBulkAttendance(viewingClassDetails.name, 'absent')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-red-500/20"
                  >
                    MARK ALL ABSENT
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between border-b-4 border-blue-600 pb-4">
                <div>
                  <h1 className="text-6xl font-black text-gray-900 dark:text-white leading-none uppercase tracking-tighter">CLASS {viewingClassDetails.name}</h1>
                  <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.3em] text-xs mt-2">Class Lead: {viewingClassDetails.classTeacher?.name || 'Unassigned'}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-gray-900 dark:text-white leading-none">{getStudentCount(viewingClassDetails.name)}</p>
                  <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Enrolled Students</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-8 py-5">
                      <th className="px-8 py-6">Student Name</th>
                      <th className="px-8 py-6">Roll Number</th>
                      <th className="px-8 py-6">Unique ID</th>
                      <th className="px-8 py-6 text-right">Activity Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {students.filter(s => s.class === viewingClassDetails.name).map(student => (
                      <tr key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center font-black text-blue-600 dark:text-blue-400">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-black text-indigo-500">{student.rollNo || '-'}</td>
                        <td className="px-8 py-5 text-gray-400 font-mono text-xs">{student.uniqueId}</td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                api.post('/admin/mark-attendance', { userId: student.id, status: 'present', date: new Date().toISOString().split('T')[0] })
                                .then(() => toast.success(`${student.name} Present`));
                              }}
                              className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all"
                            >
                              <UserCheck size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                api.post('/admin/mark-attendance', { userId: student.id, status: 'absent', date: new Date().toISOString().split('T')[0] })
                                .then(() => toast.success(`${student.name} Absent`));
                              }}
                              className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                            >
                              <Plus size={18} className="rotate-45" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List View */}
      {activeView === 'list' && (
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5">Class Grade</th>
                <th className="px-8 py-5">Assigned Faculty</th>
                <th className="px-8 py-5">Student Volume</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {classes.map(cls => (
                <tr key={cls.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors">
                  <td className="px-8 py-4">
                    <span className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-black text-lg">
                      {cls.name}
                    </span>
                  </td>
                  <td className="px-8 py-4 font-bold text-gray-900 dark:text-white uppercase text-sm tracking-tight">{cls.classTeacher?.name || '---'}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {[1, 2, 3].map(i => <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-200 dark:bg-gray-700" />)}
                      </div>
                      <span className="text-xs font-black text-gray-500">+{getStudentCount(cls.name)} enrolled</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button onClick={() => { setSelectedClass(cls); setFormData({name: cls.name, teacherId: cls.teacherId}); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="bg-blue-600 p-8 text-white">
                <h3 className="text-2xl font-black uppercase tracking-tighter">{selectedClass ? 'Modify Class' : 'Define New Class'}</h3>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Configure academic grouping</p>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class Grade</label>
                  <select 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  >
                    {availableClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class Teacher (Lead)</label>
                  <select 
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  >
                    <option value="">Select a Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject || 'Faculty'})</option>)}
                  </select>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-95">
                    {selectedClass ? 'SAVE CHANGES' : 'CREATE CLASSROOM'}
                    <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Classes;
