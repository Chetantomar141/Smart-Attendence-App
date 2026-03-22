import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Notices from './pages/Notices';
import Events from './pages/Events';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';
import ParentDashboard from './pages/ParentDashboard';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Finance from './pages/Finance';

function AppContent() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white min-h-screen transition-all duration-300 selection:bg-blue-500/30">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="students" element={<Students />} />
            <Route path="classes" element={<Classes />} />
            <Route path="finance" element={<Finance />} />
            <Route path="fees" element={<Finance />} />
            <Route path="notices" element={<Notices />} />
            <Route path="events" element={<Events />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<AdminDashboard />} />
          </Route>

          {/* Teacher Routes */}
          <Route 
            path="/teacher" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="students" element={<TeacherDashboard activeTabProp="students" />} />
            <Route path="attendance" element={<TeacherDashboard activeTabProp="attendance" />} />
            <Route path="classes" element={<TeacherDashboard activeTabProp="classes" />} />
            <Route path="fees" element={<TeacherDashboard activeTabProp="fees" />} />
            <Route path="notices" element={<Notices />} />
            <Route path="events" element={<Events />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<TeacherDashboard activeTabProp="settings" />} />
            <Route path="history" element={<TeacherDashboard activeTabProp="history" />} />
          </Route>

          {/* Student Routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentDashboard />} />
            <Route path="notices" element={<Notices />} />
            <Route path="events" element={<Events />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="fees" element={<StudentDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<StudentDashboard />} />
          </Route>

          {/* Parent Routes */}
          <Route 
            path="/parent" 
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="notices" element={<Notices />} />
            <Route path="events" element={<Events />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<ParentDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
