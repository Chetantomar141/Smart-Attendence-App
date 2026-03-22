import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  User, 
  LogOut, 
  Search, 
  Settings,
  Menu,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileUrl } from '../services/api';
import gsap from 'gsap';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const themeBtnRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (showUserMenu) {
      gsap.fromTo(".user-menu-dropdown", 
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [showUserMenu]);

  useEffect(() => {
    if (themeBtnRef.current) {
      gsap.fromTo(themeBtnRef.current, 
        { rotate: theme === 'dark' ? -45 : 45, opacity: 0, scale: 0.8 },
        { rotate: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [theme]);

  useEffect(() => {
    if (showNotifications) {
      gsap.fromTo(".notification-dropdown", 
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [showNotifications]);

  useEffect(() => {
    if (unreadCount > 0) {
      gsap.to(".bell-icon", {
        rotate: 15,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: "power1.inOut",
        onComplete: () => gsap.to(".bell-icon", { rotate: 0, duration: 0.2 })
      });
    }
  }, [unreadCount]);

  const handleHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      scale: isEnter ? 1.05 : 1,
      duration: 0.2,
      ease: "power2.out"
    });
    
    const icon = e.currentTarget.querySelector('svg');
    if (icon) {
      gsap.to(icon, {
        y: isEnter ? -2 : 0,
        duration: 0.2,
        ease: "power2.out"
      });
    }
  };

  const handleClick = (e) => {
    gsap.to(e.currentTarget, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  };

  const handleToggleTheme = (newTheme) => {
    // Animate background color transition globally
    gsap.to('body', {
      backgroundColor: newTheme === 'dark' ? '#030712' : '#ffffff',
      duration: 0.5,
      ease: "power2.inOut"
    });
    setTheme(newTheme);
  };

  const role = user?.role ? String(user.role).toLowerCase() : '';

  const handleSettingsClick = () => {
    if (role === 'admin') navigate('/admin/settings');
    else if (role === 'teacher') navigate('/teacher/settings');
    else if (role === 'parent') navigate('/parent/settings');
    else navigate('/student/profile'); // Students don't have separate settings yet
  };

  const handleProfileClick = () => {
    if (role === 'admin') navigate('/admin/profile');
    else if (role === 'teacher') navigate('/teacher/profile');
    else if (role === 'parent') navigate('/parent/profile');
    else navigate('/student/profile');
  };

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 lg:px-8 h-20 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        <button 
          onClick={(e) => {
            onMenuClick();
            handleClick(e);
          }}
          onMouseEnter={(e) => handleHover(e, true)}
          onMouseLeave={(e) => handleHover(e, false)}
          className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        >
          <Menu size={24} />
        </button>

        <div className="relative group hidden lg:block max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm font-medium text-gray-900 dark:text-white"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative">
          <button 
            onClick={(e) => {
              setShowNotifications(!showNotifications);
              handleClick(e);
            }}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-gray-700 relative"
          >
            <Bell size={20} className="bell-icon" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="notification-dropdown absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-20 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            markAsRead(notification.id);
                            setShowNotifications(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition-all mb-1 ${notification.isRead ? 'opacity-50' : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                        >
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2 font-bold uppercase tracking-widest">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>

        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={(e) => {
              setShowUserMenu(!showUserMenu);
              handleClick(e);
            }}
            onMouseEnter={(e) => {
              handleHover(e, true);
              setShowUserMenu(true);
            }}
            onMouseLeave={(e) => {
              handleHover(e, false);
            }}
            className="flex items-center gap-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm group-hover:border-blue-500 transition-colors">
              {user?.profilePhoto ? (
                <img src={getFileUrl(user.profilePhoto)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-left hidden sm:block pr-2">
              <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{user?.name}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mt-0.5">{role}</p>
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                  className="user-menu-dropdown absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-20 overflow-hidden p-2"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 mb-2">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Account</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.email}</p>
                  </div>

                  <div className="px-2 pb-2 space-y-1">
                    <p className="px-2 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Theme</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleToggleTheme('light')}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${theme === 'light' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <Sun size={14} />
                        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Light</span>
                      </button>
                      <button
                        onClick={() => handleToggleTheme('dark')}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <Moon size={14} />
                        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Dark</span>
                      </button>
                      <button
                        onClick={() => handleToggleTheme('system')}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${theme === 'system' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <Monitor size={14} />
                        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">System</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleProfileClick();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all group"
                  >
                    <User size={18} className="group-hover:scale-110 transition-transform" />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      handleSettingsClick();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all group"
                  >
                    <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                    Settings
                  </button>

                  <div className="h-[1px] bg-gray-100 dark:bg-gray-700/50 my-2 mx-2"></div>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all group"
                  >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
