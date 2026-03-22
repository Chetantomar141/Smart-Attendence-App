import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Filter,
  Download,
  IndianRupee,
  PieChart as PieIcon,
  BarChart3,
  History,
  AlertCircle,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const Finance = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    netProfit: 0,
    monthlyRevenue: []
  });
  const [expenses, setExpenses] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'Maintenance',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  const revenueData = stats?.monthlyRevenue?.length > 0 ? stats.monthlyRevenue : [
    { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 }, { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 }, { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
  ];

  const pieData = [
    { name: 'Collected', value: stats?.feesCollected || 0 },
    { name: 'Pending', value: stats?.feesPending || 0 },
  ];

  const expenseBreakdown = Object.values(expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    if (!acc[cat]) acc[cat] = { name: cat, value: 0 };
    acc[cat].value += exp.amount;
    return acc;
  }, {}));

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [statsRes, expRes, salRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/expenses'),
        api.get('/admin/salaries')
      ]);
      
      if (statsRes.data) {
        setStats({
          ...statsRes.data,
          totalRevenue: (statsRes.data.totalFeesCollected || 0) + (statsRes.data.totalFeesPending || 0),
          feesCollected: statsRes.data.totalFeesCollected || 0,
          feesPending: statsRes.data.totalFeesPending || 0,
          totalExpenses: statsRes.data.totalExpenses || 0
        });
      }
      setExpenses(expRes.data || []);
      setSalaries(salRes.data || []);
    } catch (err) {
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };


  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/expenses', expenseForm);
      toast.success("Expense added successfully");
      setIsExpenseModalOpen(false);
      fetchFinanceData();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const StatCard = ({ title, value = 0, icon: Icon, colorKey = 'blue', trend, trendValue }) => {
    const colorMap = {
      blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400',   glow: 'bg-blue-500/5' },
      green:  { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', glow: 'bg-green-500/5' },
      red:    { bg: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-600 dark:text-red-400',     glow: 'bg-red-500/5' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', glow: 'bg-orange-500/5' },
    };
    const c = colorMap[colorKey] || colorMap.blue;
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-24 h-24 ${c.glow} rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className={`p-3 ${c.bg} ${c.text} rounded-2xl`}>
            <Icon size={24} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-black ${trend === 'up' ? 'text-green-500' : 'text-red-500'} bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700`}>
              {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trendValue}
            </div>
          )}
        </div>
        <p className="text-gray-500 text-xs font-black uppercase tracking-widest leading-none mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-1">
          <IndianRupee size={20} className="text-gray-400" />
          {(value || 0).toLocaleString()}
        </h3>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 anime-fade-in">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Financial Ledger...</p>
        </div>
      ) : (
      <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2 uppercase">
            FINANCE <span className="text-blue-600 dark:text-blue-400">DASHBOARD</span>
          </h1>
          <p className="text-gray-500 font-medium italic uppercase tracking-widest text-sm">
            Revenue Analytics & Expenditure Control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm uppercase"
          >
            <Plus size={20} />
            RECORD EXPENSE
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={stats.totalRevenue} icon={TrendingUp} colorKey="blue" trend="up" trendValue="+12%" />
        <StatCard title="Fees Collected" value={stats.feesCollected} icon={CreditCard} colorKey="green" trend="up" trendValue="+8%" />
        <StatCard title="Fees Pending" value={stats.feesPending} icon={AlertCircle} colorKey="red" trend="down" trendValue="-3%" />
        <StatCard title="Total Expenses" value={stats.totalExpenses} icon={TrendingDown} colorKey="orange" trend="up" trendValue="+5%" />
      </div>

      {/* Analytics Central */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
              <BarChart3 className="text-blue-500" /> MONTHLY REVENUE PROGRESS
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><Download size={18}/></button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB66" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Collection Pie */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
            <PieIcon className="text-indigo-500" /> FEE RECOVERY
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-blue-600">Recovery Rate</span>
              <span className="text-lg font-black text-blue-600">
                {stats.totalRevenue > 0 ? Math.round((stats.feesCollected / stats.totalRevenue) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
        {/* Expense Breakdown Pie */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
             <TrendingDown className="text-orange-500" /> EXPENSE ALLOCATION
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown.length > 0 ? expenseBreakdown : [{name: 'None', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <History size={18} className="text-orange-500" /> RECENT EXPENDITURES
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-[10px] font-black uppercase text-gray-400">
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Entity</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {expenses.slice(0, 5).map((exp, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{exp.title}</td>
                    <td className="px-6 py-4 text-right font-black text-red-500">-₹{exp.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Salary History */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <UserCheck size={18} className="text-green-500" /> RECENT SALARIES
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-[10px] font-black uppercase text-gray-400">
                  <th className="px-6 py-4 text-left">Faculty</th>
                  <th className="px-6 py-4 text-left">Month</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {salaries.slice(0, 5).map((sal, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{sal.user?.name}</td>
                    <td className="px-6 py-4 text-xs font-black text-gray-500 uppercase">{sal.month} {sal.year}</td>
                    <td className="px-6 py-4 text-right font-black text-green-600">₹{sal.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsExpenseModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="bg-orange-600 p-8 text-white">
                <h3 className="text-2xl font-black uppercase tracking-tighter">RECORD EXPENDITURE</h3>
                <p className="text-orange-100 text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Institutional Expense Manual Entry</p>
              </div>
              <form onSubmit={handleAddExpense} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description / Entity</label>
                  <input 
                    name="title" required
                    onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    placeholder="e.g. Lab Equipment Repair"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount (₹)</label>
                    <input 
                      type="number" required
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                    <select 
                      onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold cursor-pointer"
                    >
                      <option>Maintenance</option>
                      <option>Lab</option>
                      <option>Transport</option>
                      <option>Utilities</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 active:scale-95">
                    POST TO LEDGER
                    <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
};

export default Finance;
