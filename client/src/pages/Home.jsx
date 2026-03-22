import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  CheckCircle2, 
  MapPin, 
  BarChart3, 
  CreditCard, 
  Bell,
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Users,
  ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { theme } = useTheme();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    // Hero Section Animation
    const ctx = gsap.context(() => {
      // Smoother Hero Entry
      gsap.from(".hero-content > *", {
        y: 60,
        rotationX: -15,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "elastic.out(1, 0.8)"
      });

      // Continuous floating for Hero Buttons
      gsap.to(".hero-btn-primary, .hero-btn-secondary", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2
      });

      // Subtle Hero Background Animation
      gsap.to(".hero-blob-1", {
        x: "random(-50, 50)",
        y: "random(-50, 50)",
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".hero-blob-2", {
        x: "random(-50, 50)",
        y: "random(-50, 50)",
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1
      });

      // Section Header Animations
      gsap.utils.toArray(".text-center").forEach((header) => {
        gsap.from(header.children, {
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        });
      });

      // Features Animation with ScrollTrigger
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 80%",
          toggleActions: "play none none none",
          once: true
        },
        y: 100,
        rotation: 15,
        scale: 0.8,
        opacity: 0,
        duration: 1,
        stagger: {
          amount: 0.8,
          grid: "auto",
          from: "center"
        },
        ease: "elastic.out(1, 0.75)",
        clearProps: "all"
      });

      // About Content Animation
      gsap.from(".about-content > *", {
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      });

      // About Image Animation
      gsap.from(".about-image", {
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 75%",
        },
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      });

      // Stats Animation
      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 85%",
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "all"
      });

      // Contact Section Animation
      gsap.from(".contact-header > *", {
        scrollTrigger: {
          trigger: ".contact-section",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });

      gsap.from(".contact-card", {
        scrollTrigger: {
          trigger: ".contact-section",
          start: "top 75%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.4)"
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  const features = [
    {
      title: "Attendance Tracking",
      desc: "Real-time attendance management with automated reports and manual overrides.",
      icon: <CheckCircle2 className="text-blue-500" />,
      color: "blue"
    },
    {
      title: "Fee Management",
      desc: "Track payments, pending amounts, and generate invoices effortlessly.",
      icon: <CreditCard className="text-emerald-500" />,
      color: "emerald"
    },
    {
      title: "Subject-wise Tracking",
      desc: "Manage and view attendance for each subject separately for better insights.",
      icon: <ClipboardList className="text-indigo-500" />,
      color: "indigo"
    },
    {
      title: "Parent Access",
      desc: "Dedicated panel for parents to monitor their child's progress and attendance.",
      icon: <Users className="text-rose-500" />,
      color: "rose"
    },
    {
      title: "Notifications",
      desc: "Keep everyone informed with instant alerts for attendance, fees, and notices.",
      icon: <Bell className="text-amber-500" />,
      color: "amber"
    },
    {
      title: "Advanced Analytics",
      desc: "Visualize trends, financial performance, and academic data with charts.",
      icon: <BarChart3 className="text-purple-500" />,
      color: "purple"
    },
    {
      title: "Cloud Infrastructure",
      desc: "Securely hosted on high-performance servers with 99.9% uptime and auto-backups.",
      icon: <ShieldCheck className="text-emerald-400" />,
      color: "emerald"
    },
    {
      title: "JWT Security",
      desc: "Industry-standard JSON Web Token authentication for robust data protection.",
      icon: <Zap className="text-blue-400" />,
      color: "blue"
    },
    {
      title: "Responsive UI",
      desc: "Optimized experience across desktops, tablets, and mobile devices.",
      icon: <LayoutDashboard className="text-indigo-400" />,
      color: "indigo"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* Navbar */}
      <nav 
        className="glass-navbar h-20 px-6 md:px-20 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300 border-b border-gray-200 dark:border-white/5"
      >
        <div className="flex items-center gap-3">
          <div 
            className="logo-icon w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30 cursor-pointer text-white"
          >
            S
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-br from-gray-900 dark:from-white to-gray-500 dark:to-gray-400 bg-clip-text text-transparent">
            SMART ATTEND
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 dark:text-gray-400">
          <a href="#features" className="nav-link-crazy">Features</a>
          <a href="#about" className="nav-link-crazy">About</a>
          <a href="#contact" className="nav-link-crazy">Contact</a>
          
          <Link to="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 btn-crazy">
            Sign In
          </Link>
        </div>

        {/* Mobile Toggle & Menu Placeholder */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section relative pt-20 pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div 
            className="hero-blob-1 absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 blur-[150px] rounded-full"
          />
          <div 
            className="hero-blob-2 absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-600/20 blur-[150px] rounded-full"
          />
        </div>

        <div className="hero-content max-w-4xl space-y-8">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest"
          >
            <Zap size={14} /> The Future of School Management
          </div>
          
          <h1 
            className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-gray-900 dark:text-white hero-title-crazy cursor-default"
          >
            Complete SaaS for <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Modern Schools
            </span>
          </h1>
          
          <p 
            className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Manage attendance, fees, subjects, and communications in one powerful, real-time platform. Built for students, teachers, parents, and admins.
          </p>
          
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/login" className="hero-btn-primary btn-crazy w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/40 group">
              Get Started Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="hero-btn-secondary btn-crazy w-full sm:w-auto px-10 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-black transition-all">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section py-32 px-6 md:px-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-xs font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em]">Our Ecosystem</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Everything you need to succeed</h3>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="feature-card feature-card-crazy glow-border glass-card p-8 group border border-gray-200 dark:border-white/5 transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:rotate-[360deg] group-hover:scale-125 group-hover:bg-blue-500/10 transition-all duration-700`}>
                  {React.cloneElement(feature.icon, { size: 28 })}
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed group-hover:translate-x-1 transition-transform duration-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section py-32 px-6 md:px-20 bg-gray-50 dark:bg-white/5 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div 
            className="about-content lg:w-1/2 space-y-8"
          >
            <h2 className="text-xs font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em]">About Smart Attend</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Revolutionizing academic administration</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Smart Attend is a premium SaaS platform designed to bridge the gap between schools, teachers, students, and parents. Our mission is to provide a secure, transparent, and highly efficient way to manage daily school activities.
            </p>
            <div className="stats-section grid grid-cols-2 gap-8">
              <div className="stat-item space-y-2">
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">100%</p>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Real-time Data</p>
              </div>
              <div className="stat-item space-y-2">
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">Secure</p>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">JWT & Encrypted</p>
              </div>
            </div>
          </div>
          <div 
            className="about-image lg:w-1/2"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative glass-card p-4 rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10">
                <div className="w-full h-80 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center rounded-2xl group-hover:scale-105 transition-transform duration-700">
                   <GraduationCap size={100} className="text-blue-600 dark:text-blue-500/30 group-hover:text-blue-500/50 transition-colors duration-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section py-32 px-6 md:px-20 relative">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="contact-header space-y-4">
            <h2 className="text-xs font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em]">Contact Us</h2>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Ready to transform your school?</h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Have questions or need a custom demo? We're here to help you get started with the ultimate school management experience.</p>
          </div>
          
          <div 
            className="contact-card glass-card p-8 border border-gray-200 dark:border-white/10 flex flex-col md:flex-row gap-8 items-center justify-between hover:border-blue-500/30 transition-all duration-500"
          >
            <div className="text-left space-y-2">
              <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Email us at</p>
              <a 
                href="mailto:info@dizipaygroup.com" 
                className="text-xl font-black text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                info@dizipaygroup.com
              </a>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-white/10 hidden md:block"></div>
            <div className="text-left space-y-2">
              <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Call us at</p>
              <a 
                href="tel:+918193079234" 
                className="text-xl font-black text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                +91 99994 41737
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-20 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30 text-white">
              S
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              SMART ATTEND
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-sm font-bold text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Docs</a>
          </div>

          <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">© 2026 Smart Attend SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
