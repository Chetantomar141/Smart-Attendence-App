import React, { useState, useEffect, useRef } from 'react';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  Download, 
  CheckCircle, 
  XCircle,
  Upload,
  Search,
  X,
  ClipboardList,
  Calendar,
  Eye,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const assignmentsRef = useRef(null);

  useEffect(() => {
    if (!loading && assignmentsRef.current) {
      const items = assignmentsRef.current.querySelectorAll('.assignment-card');
      gsap.fromTo(items, 
        { y: 20, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [loading, searchTerm]);

  const handleHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      scale: isEnter ? 1.02 : 1,
      duration: 0.3,
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    attachment: null
  });

  const [submissionFile, setSubmissionFile] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const role = user?.role ? String(user.role).toLowerCase() : '';
      const endpoint = role === 'teacher' ? '/assignments/teacher' : '/assignments/student';
      const res = await api.get(endpoint);
      setAssignments(res.data);
    } catch (err) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmissionFileChange = (e) => {
    setSubmissionFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('deadline', formData.deadline);
    if (formData.attachment) {
      data.append('attachment', formData.attachment);
    }

    try {
      await api.post('/assignments', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Assignment posted successfully!");
      setShowModal(false);
      setFormData({ title: '', description: '', deadline: '', attachment: null });
      fetchAssignments();
    } catch (err) {
      toast.error("Failed to post assignment");
    }
  };

  const submitAssignment = async (e) => {
    e.preventDefault();
    if (!submissionFile) return toast.error("Please upload a file");

    const data = new FormData();
    data.append('attachment', submissionFile);

    try {
      await api.post(`/assignments/${selectedAssignment.id}/submit`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Assignment submitted successfully!");
      setShowSubmissionModal(false);
      setSubmissionFile(null);
      fetchAssignments();
    } catch (err) {
      toast.error("Submission failed");
    }
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const role = user?.role ? String(user.role).toLowerCase() : '';

  if (loading) return <div className="flex items-center justify-center h-64 text-blue-400 font-black uppercase tracking-widest">Loading Assignments...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="text-blue-500" /> Assignments
          </h1>
          <p className="text-gray-400 font-medium">View and submit your assignments</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>
          {role === 'teacher' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus size={18} /> Post Assignment
            </button>
          )}
        </div>
      </div>

      <div ref={assignmentsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
            className="assignment-card glass-card p-8 flex flex-col md:flex-row gap-8 hover:bg-white/5 transition-all group border-l-4 border-blue-500"
          >
            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white leading-tight group-hover:text-blue-400 transition-colors">
                      {assignment.title}
                    </h3>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-blue-400" /> Due: {new Date(assignment.deadline).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  {assignment.description}
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  {assignment.attachment && (
                    <a 
                      href={getFileUrl(assignment.attachment)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all group/link"
                    >
                      <Download size={16} className="group-hover/link:-translate-y-1 transition-transform" /> 
                      <span>Resources</span>
                    </a>
                  )}
                  {role === 'student' && assignment.submissions?.[0] && (
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest">
                      <CheckCircle size={16} /> Submitted
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center items-center gap-4 md:w-32">
                {role === 'student' ? (
                  !assignment.submissions?.[0] ? (
                    <button 
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmissionModal(true);
                      }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex flex-col items-center gap-2"
                    >
                      <Upload size={20} />
                      Submit
                    </button>
                  ) : (
                    <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-2 text-emerald-400">
                      <CheckCircle size={20} />
                      <span className="text-[10px] font-black uppercase">Done</span>
                    </div>
                  )
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      // In a real app, open submissions view
                      toast.info(`Viewing ${assignment.submissions?.length || 0} submissions`);
                    }}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/10 flex flex-col items-center gap-2 text-gray-400 hover:text-white"
                  >
                    <Eye size={20} />
                    View ({assignment.submissions?.length || 0})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      {/* New Assignment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" 
              onClick={() => setShowModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">Create Assignment</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Enter assignment title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Instructions</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                    placeholder="Enter detailed instructions"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Deadline</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Resource File</label>
                    <label className="flex items-center justify-center w-full px-4 py-3 bg-white/5 border border-dashed border-white/20 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all group">
                      <Download size={18} className="text-gray-500 group-hover:text-blue-400 transition-colors mr-2" />
                      <span className="text-xs font-bold text-gray-500 group-hover:text-blue-400 truncate max-w-[100px]">
                        {formData.attachment ? formData.attachment.name : 'Upload PDF'}
                      </span>
                      <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20"
                >
                  Create & Notify Students
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" 
              onClick={() => setShowSubmissionModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Submit Assignment</h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{selectedAssignment?.title}</p>
                </div>
                <button onClick={() => setShowSubmissionModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={submitAssignment} className="space-y-8">
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-48 bg-white/5 border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-3xl cursor-pointer transition-all group overflow-hidden relative">
                    {submissionFile ? (
                      <div className="flex flex-col items-center gap-2 p-4 text-center">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 mb-2">
                          <Check size={32} />
                        </div>
                        <span className="text-sm font-bold text-white truncate max-w-full px-4">{submissionFile.name}</span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ready to submit</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-blue-400 group-hover:scale-110 transition-all mb-4">
                          <Upload size={32} />
                        </div>
                        <span className="text-sm font-bold text-gray-500 group-hover:text-blue-400 transition-colors">Drag & Drop or Click</span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Maximum file size: 5MB</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={handleSubmissionFileChange} />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!submissionFile}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} /> Complete Submission
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Assignments;
