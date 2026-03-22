import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  History, 
  CreditCard, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Bell,
  Calendar,
  FileText,
  ClipboardList,
  User,
  LogOut,
  IndianRupee,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    if (navRef.current) {
      const items = navRef.current.querySelectorAll('.nav-item');
      
      gsap.fromTo(items, 
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.1,
          clearProps: "all"
        }
      );
    }
  }, []);

  const handleHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      scale: isEnter ? 1.05 : 1,
      x: isEnter ? 4 : 0,
      duration: 0.2, // Consistent with button hover rule
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
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Teachers', path: '/admin/teachers', icon: <Briefcase size={20} /> },
      { name: 'Students', path: '/admin/students', icon: <GraduationCap size={20} /> },
      { name: 'Classes', path: '/admin/classes', icon: <ClipboardList size={20} /> },
      { name: 'Finance', path: '/admin/finance', icon: <IndianRupee size={20} /> },
      { name: 'Notices', path: '/admin/notices', icon: <Bell size={20} /> },
      { name: 'Profile', path: '/admin/profile', icon: <User size={20} /> },
      { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ],
    teacher: [
      { name: 'Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Students', path: '/teacher/students', icon: <Users size={20} /> },
      { name: 'Attendance', path: '/teacher/attendance', icon: <UserCheck size={20} /> },
      { name: 'Assignments', path: '/teacher/assignments', icon: <FileText size={20} /> },
      { name: 'Notices', path: '/teacher/notices', icon: <Bell size={20} /> },
      { name: 'Profile', path: '/teacher/profile', icon: <User size={20} /> },
      { name: 'Settings', path: '/teacher/settings', icon: <Settings size={20} /> },
    ],
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Attendance', path: '/student/attendance', icon: <UserCheck size={20} /> },
      { name: 'Assignments', path: '/student/assignments', icon: <ClipboardList size={20} /> },
      { name: 'Fees', path: '/student/fees', icon: <IndianRupee size={20} /> },
      { name: 'Notices', path: '/student/notices', icon: <Bell size={20} /> },
      { name: 'Profile', path: '/student/profile', icon: <User size={20} /> },
      { name: 'Settings', path: '/student/settings', icon: <Settings size={20} /> },
    ],
    parent: [
      { name: 'Dashboard', path: '/parent/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Notices', path: '/parent/notices', icon: <Bell size={20} /> },
      { name: 'Profile', path: '/parent/profile', icon: <User size={20} /> },
      { name: 'Settings', path: '/parent/settings', icon: <Settings size={20} /> },
    ]
  };

  const role = user?.role?.toLowerCase() || localStorage.getItem('role')?.toLowerCase() || 'student';
  const links = navLinks[role] || navLinks.student;

  return (
    <aside 
      className={`
        sidebar-container fixed left-0 top-0 h-full z-[60] transition-all duration-300 border-r 
        bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="logo-icon w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="text-white" size={24} />
            </div>
            {!isCollapsed && (
              <span className="logo-text font-black text-gray-900 dark:text-white tracking-tighter text-xl uppercase">Smart<span className="text-blue-600 dark:text-blue-400">Edu</span></span>
            )}
          </div>
          <button 
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              handleClick(event);
            }}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
            className="hidden md:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav ref={navRef} className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <div className="space-y-1.5">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
                onClick={(e) => {
                  setIsMobileOpen(false);
                  handleClick(e);
                }}
                className={({ isActive }) => `
                  nav-item flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 font-bold scale-[1.02]' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <div className={`transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  {link.icon}
                </div>
                {!isCollapsed && <span className="text-sm font-semibold tracking-tight">{link.name}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
            onClick={(e) => {
              handleLogout();
              handleClick(e);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <div className="group-hover:rotate-12 transition-transform duration-200">
              <LogOut size={20} />
            </div>
            {!isCollapsed && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
