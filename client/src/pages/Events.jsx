import React, { useState, useEffect, useRef } from 'react';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  Download, 
  User,
  Search,
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const eventsRef = useRef(null);

  useEffect(() => {
    if (!loading && eventsRef.current) {
      const items = eventsRef.current.querySelectorAll('.event-card');
      gsap.fromTo(items, 
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading, searchTerm]);

  const handleHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      y: isEnter ? -8 : 0,
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
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    attachment: null
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      toast.error("Failed to load events");
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
    data.append('time', formData.time);
    data.append('location', formData.location);
    if (formData.attachment) {
      data.append('attachment', formData.attachment);
    }

    try {
      await api.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Event created successfully!");
      setShowModal(false);
      setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', location: '', attachment: null });
      fetchEvents();
    } catch (err) {
      toast.error("Failed to create event");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const role = user?.role ? String(user.role).toLowerCase() : '';

  if (loading) return <div className="flex items-center justify-center h-64 text-indigo-400 font-black uppercase tracking-widest">Loading Events...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Zap className="text-indigo-500" /> Upcoming Events
          </h1>
          <p className="text-gray-400 text-sm mt-1">Discover what's happening in your school community</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
            />
          </div>
          {(role === 'admin' || role === 'teacher') && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={18} /> Add Event
            </button>
          )}
        </div>
      </div>

      <div ref={eventsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
            className="event-card glass-card overflow-hidden hover:bg-white/5 transition-all group border-l-4 border-indigo-500"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col items-center justify-center w-14 h-16 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                  <span className="text-2xl font-black leading-none">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                {(role === 'admin' || role === 'teacher') && (
                  <button 
                    onClick={() => deleteEvent(event.id)}
                    className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-black text-white leading-tight group-hover:text-indigo-400 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-400 font-medium line-clamp-3 leading-relaxed">
                  {event.description}
                </p>
              </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-widest">
                    <Clock size={14} className="text-indigo-400" /> {event.time || 'All Day'}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-widest">
                    <MapPin size={14} className="text-indigo-400" /> {event.location || 'School Campus'}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <User size={12} /> {event.user?.name}
                  </div>
                  
                  {event.attachment && (
                    <a 
                      href={getFileUrl(event.attachment)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <Download size={14} /> Details
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Add Event Modal */}
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
              className="w-full max-w-xl glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">Create New Event</h2>
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="Enter event name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                    placeholder="Enter event details"
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Time</label>
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="e.g. 10:00 AM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="School Auditorium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Attachment</label>
                    <label className="flex items-center justify-center w-full px-4 py-3 bg-white/5 border border-dashed border-white/20 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all group">
                      <Download size={18} className="text-gray-500 group-hover:text-indigo-400 transition-colors mr-2" />
                      <span className="text-xs font-bold text-gray-500 group-hover:text-indigo-400 truncate max-w-[100px]">
                        {formData.attachment ? formData.attachment.name : 'Upload Info'}
                      </span>
                      <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <Zap size={18} /> Add Event to Calendar
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
