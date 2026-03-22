import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  LogIn, 
  User, 
  Lock, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Users,
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const formCardRef = useRef(null);
  const leftPanelRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    // Initial state
    gsap.set([formCardRef.current, leftPanelRef.current], { opacity: 0 });
    
    tl.fromTo(leftPanelRef.current, 
      { x: -50, opacity: 0, scale: 0.95 },
      { x: 0, opacity: 1, scale: 1, duration: 0.8 }
    )
    .fromTo(".left-panel-heading", 
      { y: 30, opacity: 0, skewX: -5 },
      { y: 0, opacity: 1, skewX: 0, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.4"
    )
    .fromTo(".feature-item", 
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
      "-=0.3"
    )
    .fromTo(formCardRef.current, 
      { y: 40, opacity: 0, scale: 0.9, rotationY: 10 }, 
      { y: 0, opacity: 1, scale: 1, rotationY: 0, duration: 0.8, ease: "elastic.out(1, 0.75)" },
      "-=0.6"
    )
    .fromTo(titleRef.current.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
      "-=0.4"
    )
    .fromTo(".role-tab",
      { scale: 0.5, opacity: 0, rotation: -10 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.5, stagger: 0.05, ease: "back.out(2)" },
      "-=0.3"
    );

    // Subtle floating for the heading
    gsap.to(".left-panel-heading", {
      y: -5,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  const roles = [
    { id: 'admin', name: 'Admin', icon: <ShieldCheck size={18} />, color: 'rose' },
    { id: 'teacher', name: 'Teacher', icon: <Briefcase size={18} />, color: 'blue' },
    { id: 'student', name: 'Student', icon: <GraduationCap size={18} />, color: 'emerald' },
    { id: 'parent', name: 'Parent', icon: <Users size={18} />, color: 'amber' }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username or Email is required";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    // Basic email validation if it looks like an email
    if (username.includes('@') && !/\S+@\S+\.\S+/.test(username)) {
      newErrors.username = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await login(username, password);
      const userRole = user?.role ? String(user.role).toLowerCase() : '';
      
      toast.success(`Welcome back, ${user.name}!`);
      
      // Strict role-based redirect logic
      switch(userRole) {
        case 'admin': navigate('/admin/dashboard'); break;
        case 'teacher': navigate('/teacher/dashboard'); break;
        case 'student': navigate('/student/dashboard'); break;
        case 'parent': navigate('/parent/dashboard'); break;
        default: 
          toast.error("Access denied: Invalid role configuration");
          navigate('/login');
      }
    } catch (error) {
      toast.error(error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden font-sans">
      {/* Left Panel - Image & Branding */}
      <div 
        ref={leftPanelRef}
        className="hidden lg:flex w-1/2 relative bg-blue-600 dark:bg-blue-900 items-center justify-center p-12 overflow-hidden"
      >
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-400 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-400 dark:bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-12 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-black text-xl shadow-lg">S</div>
            <span className="text-white font-black tracking-widest text-sm uppercase">Smart Attend Pro</span>
          </div>
          
          <h2 className="left-panel-heading text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tighter mb-8">
            Revolutionizing <br />
            <span className="text-blue-200">School Governance.</span>
          </h2>
          
          <p className="feature-item text-lg text-blue-100/80 font-medium mb-12 leading-relaxed">
            The most advanced AI-powered attendance and school management system designed for modern educational institutions.
          </p>
          
          <div className="space-y-6">
            {[
              { icon: <CheckCircle2 size={20} />, text: "Automated Attendance Tracking" },
              { icon: <MapPin size={20} />, text: "Geofenced Faculty Check-ins" },
              { icon: <ShieldCheck size={20} />, text: "Secure Role-Based Access" }
            ].map((feature, i) => (
              <div key={i} className="feature-item flex items-center gap-4 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                  {feature.icon}
                </div>
                <span className="font-bold text-sm tracking-wide">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 relative">
        {/* Mobile decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full lg:hidden"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full lg:hidden"></div>

        <div 
          ref={formCardRef}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10" ref={titleRef}>
            <div className="lg:hidden w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Select your role and enter credentials</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-8 border border-slate-200 dark:border-slate-800">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`role-tab role-tab-crazy flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 relative ${
                  role === r.id 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xl shadow-black/5 ring-1 ring-black/5' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className={`mb-1 transition-transform duration-300 ${role === r.id ? 'scale-110' : 'scale-100'}`}>
                  {r.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{r.name}</span>
                {role === r.id && (
                  <motion.div 
                    layoutId="activeRole"
                    className="absolute -bottom-1 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Glassmorphism Login Card */}
          <div className="login-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Username / Email</label>
                <div className={`relative group transition-all duration-300 ${errors.username ? 'ring-2 ring-rose-500/20' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. admin_pro"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors({...errors, username: null});
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                </div>
                {errors.username && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.username}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className={`relative group transition-all duration-300 ${errors.password ? 'ring-2 ring-rose-500/20' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({...errors, password: null});
                    }}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-700 checked:bg-blue-600 transition-all"
                    />
                    <CheckCircle2 size={10} className="absolute left-0.5 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Remember device</span>
                </label>
                <Link to="/forgot-password" className="text-[11px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.1em] hover:text-blue-700 hover:underline transition-all underline-offset-4">Reset Access</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Sign In to Portal <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-10 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Protected by <span className="text-blue-600 dark:text-blue-400">Smart Shield</span> AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
