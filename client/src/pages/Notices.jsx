import React, { useState, useEffect, useRef } from 'react';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Bell, 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  Calendar,
  User,
  Search,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const Notices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const noticesRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    attachment: null
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    if (!loading && noticesRef.current) {
      const items = noticesRef.current.querySelectorAll('.notice-item');
      gsap.fromTo(items, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading, searchTerm]);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (err) {
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date);
    if (formData.attachment) {
      data.append('attachment', formData.attachment);
    }

    try {
      await api.post('/notices', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Notice created successfully!");
      setShowModal(false);
      setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], attachment: null });
      fetchNotices();
    } catch (err) {
      toast.error("Failed to create notice");
    }
  };

  const deleteNotice = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success("Notice deleted");
      fetchNotices();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const role = user?.role ? String(user.role).toLowerCase() : '';

  const handleHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      scale: isEnter ? 1.05 : 1,
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

  if (loading) return <div className="flex items-center justify-center h-64 text-blue-400 font-black uppercase tracking-widest">Loading Notices...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Bell className="text-blue-500" /> Notice Board
          </h1>
          <p className="text-gray-400 font-medium">Important announcements and updates</p>
        </div>
        {(role === 'teacher' || role === 'admin') && (
          <button 
            onClick={(e) => {
              setShowModal(true);
              handleClick(e);
            }}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus size={18} /> Post Notice
          </button>
        )}
      </div>

      <div ref={noticesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className="notice-item glass-card p-8 flex flex-col hover:bg-white/5 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                <FileText size={24} />
              </div>
              {(role === 'admin' || role === 'teacher') && (
                <button 
                  onClick={() => deleteNotice(notice.id)}
                  className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <div className="space-y-3 flex-1">
              <h3 className="text-xl font-black text-white leading-tight group-hover:text-blue-400 transition-colors">
                {notice.title}
              </h3>
              <p className="text-sm text-gray-400 font-medium line-clamp-3 leading-relaxed">
                {notice.description}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <Calendar size={12} /> {new Date(notice.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  <User size={12} /> {notice.user?.name}
                </div>
              </div>
              
              {notice.attachment && (
                <a 
                  href={getFileUrl(notice.attachment)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 hover:bg-blue-600 rounded-lg text-gray-400 hover:text-white transition-all shadow-lg"
                  title="Download Attachment"
                >
                  <Download size={16} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Post Notice Modal */}
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
                <h2 className="text-2xl font-black text-white tracking-tight">Post New Notice</h2>
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
                    placeholder="Enter notice title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                    placeholder="Enter notice details"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Attachment</label>
                    <label className="flex items-center justify-center w-full px-4 py-3 bg-white/5 border border-dashed border-white/20 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all group">
                      <Download size={18} className="text-gray-500 group-hover:text-blue-400 transition-colors mr-2" />
                      <span className="text-xs font-bold text-gray-500 group-hover:text-blue-400 truncate max-w-[100px]">
                        {formData.attachment ? formData.attachment.name : 'Upload File'}
                      </span>
                      <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20"
                >
                  Post to Board
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notices;
