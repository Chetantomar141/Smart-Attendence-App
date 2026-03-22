import React, { useState, useEffect, useRef } from 'react';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Camera, 
  Save, 
  Lock, 
  Loader2,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (profileRef.current) {
      gsap.fromTo(profileRef.current.querySelectorAll('.profile-section'), 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", clearProps: "all" }
      );
    }
  }, []);

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

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    profilePhoto: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        profilePhoto: null
      });
    }
  }, [user]);
  const [previewUrl, setPreviewUrl] = useState(getFileUrl(user?.profilePhoto));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePhoto: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phoneNumber', formData.phoneNumber);
    if (formData.profilePhoto) {
      data.append('profilePhoto', formData.profilePhoto);
    }

    try {
      const res = await api.put('/auth/profile', data);
      toast.success("Profile updated successfully!");
      // Update local storage and context
      const updatedUser = { ...user, ...res.data.user, accessToken: user.accessToken };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={profileRef} className="w-full space-y-10 animate-in fade-in duration-700">
      <div className="profile-section flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-5xl text-white">
                {user?.name?.[0]}
              </div>
            )}
            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-black uppercase tracking-widest gap-2">
              <Camera size={24} />
              Change Photo
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border-2 border-[#0f172a] shadow-lg text-white">
            <Camera size={18} />
          </div>
        </div>

        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter">{user?.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} /> {user?.role}
            </span>
            <span className="px-4 py-1 bg-white/5 text-gray-400 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <GraduationCap size={12} /> ID: {user?.uniqueId}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-section grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-card p-10">
            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
              <User className="text-blue-500" /> Personal Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                      type="tel" 
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm"
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
                      className="w-full bg-white/2 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-gray-500 font-medium text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  onMouseEnter={(e) => handleHover(e, true)}
                  onMouseLeave={(e) => handleHover(e, false)}
                  onClick={(e) => handleClick(e)}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
            <Lock className="mb-6 opacity-50" size={32} />
            <h3 className="text-xl font-black mb-2">Security</h3>
            <p className="text-sm font-medium text-indigo-100 mb-6 leading-relaxed">Your account is secured with end-to-end encryption and JWT authentication.</p>
            <button 
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
              onClick={(e) => handleClick(e)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
