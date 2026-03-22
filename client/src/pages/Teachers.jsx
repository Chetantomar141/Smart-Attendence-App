import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  IndianRupee, 
  Calendar,
  Plus,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';

const Teachers = () => {
  const [teachers, setTeachers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('list');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher]     = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [salaries, setSalaries]         = useState([]);

  const [formData, setFormData] = useState({
    name: '', email: '', phoneNumber: '', subject: '',
    salary: '', username: '', password: '', uniqueId: ''
  });

  const [salaryData, setSalaryData] = useState({
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year:  new Date().getFullYear()
  });

  const containerRef = useRef(null);

  useEffect(() => { fetchTeachers(); }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.teacher-card',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.28, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading, activeTab]);

  // ── Data fetching ──────────────────────────────────────────────
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const [teacherRes, salaryRes] = await Promise.all([
        api.get('/admin/teachers'),
        api.get('/admin/salaries')
      ]);
      setTeachers(teacherRes.data);
      setSalaries(salaryRes.data);
    } catch {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────
  const handleInputChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTeacher) {
        await api.put(`/admin/teachers/${selectedTeacher.id}`, formData);
        toast.success('Teacher updated successfully');
      } else {
        await api.post('/admin/teachers', formData);
        toast.success('Teacher added successfully');
      }
      setIsModalOpen(false);
      fetchTeachers();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({ name:'',email:'',phoneNumber:'',subject:'',salary:'',username:'',password:'',uniqueId:'' });
    setSelectedTeacher(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher record?')) return;
    try {
      await api.delete(`/admin/teachers/${id}`);
      toast.success('Teacher deleted');
      fetchTeachers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const markAttendance = async (teacherId, status) => {
    try {
      await api.post('/admin/mark-attendance', {
        userId: teacherId, status,
        date: new Date().toISOString().split('T')[0]
      });
      toast.success(`Attendance marked: ${status}`);
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  const handlePaySalary = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/pay-salary', {
        teacherId: selectedTeacher.id,
        amount:    salaryData.amount || selectedTeacher.salary,
        month:     salaryData.month,
        year:      salaryData.year
      });
      toast.success('Salary payment recorded!');
      setIsSalaryModalOpen(false);
      fetchTeachers();
    } catch {
      toast.error('Failed to process salary');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Shared input style ─────────────────────────────────────────
  const inputCls = 'w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm';

  // ══════════════════════════════════════════════════════════════
  return (
    <div ref={containerRef} className="space-y-5 anime-fade-in">

      {/* ── 1. HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
            TEACHER <span className="text-blue-600 dark:text-blue-400">MANAGEMENT</span>
          </h1>
          <p className="text-gray-500 font-medium italic uppercase tracking-widest text-[11px] mt-1">
            Faculty Directory &amp; Administrative Control
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all text-sm whitespace-nowrap"
        >
          <UserPlus size={17} />
          ADD NEW FACULTY
        </button>
      </div>

      {/* ── 2. TABS ───────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {['list', 'attendance', 'salary'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all border ${
              activeTab === tab
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── 3. SEARCH + STAT (list only) ──────────────────────── */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search — spans 2 cols on lg */}
          <div className="lg:col-span-2 relative group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search by name, subject, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* Total Faculty card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-blue-500/20 flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total Faculty</p>
              <h3 className="text-3xl font-black leading-none">{teachers.length}</h3>
            </div>
            <div className="p-2.5 bg-white/15 rounded-xl">
              <Users size={22} />
            </div>
          </div>
        </div>
      )}

      {/* ── 4. CONTENT ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {loading
              ? [1, 2, 3].map(i => (
                  <div key={i} className="h-56 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />
                ))
              : filteredTeachers.length === 0
              ? (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-400">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No faculty records found</p>
                </div>
              )
              : filteredTeachers.map(teacher => (
                <div
                  key={teacher.id}
                  className="teacher-card bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-400/20 transition-all group relative overflow-hidden"
                >
                  {/* Edit / Delete (hover) */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setSelectedTeacher(teacher); setFormData(teacher); setIsModalOpen(true); }}
                      className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-black uppercase shrink-0">
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-base text-gray-900 dark:text-white leading-tight truncate">{teacher.name}</h3>
                      <p className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">{teacher.subject || 'Faculty'}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-5 text-sm">
                    {[
                      { label: 'ID', value: teacher.uniqueId },
                      { label: 'Phone', value: teacher.phoneNumber || 'N/A' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs font-medium">{label}:</span>
                        <span className="text-gray-800 dark:text-gray-300 font-bold text-xs truncate max-w-[60%] text-right">{value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs font-medium">Salary:</span>
                      <span className="text-green-600 dark:text-green-400 font-black text-xs flex items-center gap-0.5">
                        <IndianRupee size={11} />{teacher.salary?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="w-full py-2.5 bg-gray-50 dark:bg-gray-800/60 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black transition-all"
                  >
                    VIEW ACTIVITY
                  </button>
                </div>
              ))
            }
          </motion.div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
              <h3 className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tight">Daily Attendance Roll</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <Calendar size={13} className="text-blue-500" />
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-5 py-3.5">Faculty Name</th>
                    <th className="px-5 py-3.5">Subject</th>
                    <th className="px-5 py-3.5 text-center">Mark Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {teachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-sm text-gray-900 dark:text-white">{teacher.name}</td>
                      <td className="px-5 py-4 text-xs text-gray-500 italic uppercase">{teacher.subject || '—'}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => markAttendance(teacher.id, 'present')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white transition-all font-black text-xs uppercase"
                          >
                            <CheckCircle size={12} /> Present
                          </button>
                          <button
                            onClick={() => markAttendance(teacher.id, 'absent')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all font-black text-xs uppercase"
                          >
                            <XCircle size={12} /> Absent
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

        {/* SALARY TAB */}
        {activeTab === 'salary' && (
          <motion.div
            key="salary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 gap-3"
          >
            {teachers.map(teacher => (
              <div
                key={teacher.id}
                className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl shrink-0">
                    <IndianRupee size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-base text-gray-900 dark:text-white truncate">{teacher.name}</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Monthly ₹ {teacher.salary?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-row-reverse sm:gap-4">
                  <button
                    onClick={() => { setSelectedTeacher(teacher); setSalaryData({ ...salaryData, amount: teacher.salary }); setIsSalaryModalOpen(true); }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
                  >
                    PROCESS PAYMENT
                  </button>
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">Status</p>
                    {salaries.find(s => s.teacherId === teacher.id)
                      ? <p className="text-emerald-500 font-black uppercase text-xs">PAID</p>
                      : <p className="text-yellow-500 font-black uppercase text-xs">PENDING</p>
                    }
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── FACULTY MODAL ──────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-800 my-8 max-h-[90vh] flex flex-col"
            >
              <div className="bg-blue-600 p-7 text-white flex items-start justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">
                    {selectedTeacher ? 'Edit Faculty' : 'Register Faculty'}
                  </h2>
                  <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest opacity-80 mt-1">
                    Faculty Administrative Record
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:opacity-70 transition-opacity">
                  <Plus className="rotate-45" size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto custom-scrollbar">
                {[
                  { label: 'Full Name',          name: 'name',        type: 'text',     placeholder: 'e.g. Dr. Robert Wilson',  required: true },
                  { label: 'Professional Email',  name: 'email',       type: 'email',    placeholder: 'robert@smartedu.com',     required: true },
                  ...(!selectedTeacher ? [
                    { label: 'Auth Username',     name: 'username',    type: 'text',     placeholder: 'teacher.robert',          required: true },
                    { label: 'Auth Password',     name: 'password',    type: 'password', placeholder: '••••••••',                required: true },
                  ] : []),
                  { label: 'Faculty ID',          name: 'uniqueId',    type: 'text',     placeholder: 'TCH-2024-001',            required: true },
                  { label: 'Primary Subject',     name: 'subject',     type: 'text',     placeholder: 'Physics / Mathematics' },
                  { label: 'Monthly Salary (₹)',  name: 'salary',      type: 'number',   placeholder: '45000' },
                  { label: 'Phone Number',        name: 'phoneNumber', type: 'text',     placeholder: '+91 98XXX XXXXX' },
                ].map(({ label, name, type, placeholder, required }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
                    <input
                      name={name} type={type} value={formData[name]}
                      onChange={handleInputChange} required={required}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {selectedTeacher ? 'UPDATE RECORDS' : 'FINALIZE REGISTRATION'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SALARY MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {isSalaryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSalaryModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="bg-green-600 p-7 text-white">
                <h2 className="text-2xl font-black tracking-tighter uppercase">Process Payment</h2>
                <p className="text-green-100 font-bold text-[10px] uppercase tracking-widest opacity-80 mt-1">
                  Faculty: {selectedTeacher?.name}
                </p>
              </div>

              <form onSubmit={handlePaySalary} className="p-7 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount to Pay</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      defaultValue={selectedTeacher?.salary}
                      onChange={e => setSalaryData({ ...salaryData, amount: e.target.value })}
                      className="w-full pl-11 pr-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Month</label>
                    <select
                      value={salaryData.month}
                      onChange={e => setSalaryData({ ...salaryData, month: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-sm"
                    >
                      {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m =>
                        <option key={m}>{m}</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Year</label>
                    <input
                      type="number" value={salaryData.year}
                      onChange={e => setSalaryData({ ...salaryData, year: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-green-500/30 active:scale-95"
                >
                  CONFIRM PAYMENT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Teachers;
