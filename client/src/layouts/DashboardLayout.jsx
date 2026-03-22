import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(mainRef.current, 
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out", clearProps: "all" }
      );
    }
  }, [location.pathname]);

  useEffect(() => {
    // Global Sidebar Animation on mount
    gsap.fromTo(".sidebar-container", 
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, ease: "power2.out", clearProps: "all" }
    );
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-500 overflow-x-hidden relative">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="moving-blob top-[-10%] left-[-10%] animate-blob-slow" />
        <div className="moving-blob bottom-[-10%] right-[-10%] animate-blob-slow [animation-delay:4s]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main 
          ref={mainRef}
          className="flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-6 lg:p-8 custom-scrollbar bg-gray-50/50 dark:bg-gray-950 transition-colors duration-500"
        >
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
