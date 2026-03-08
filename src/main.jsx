import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '@/App';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import AdminLogin from '@/pages/AdminLogin.jsx';
import Login from '@/pages/Login.jsx';
import Register from '@/pages/Register.jsx';
import Dashboard from '@/pages/Dashboard.jsx';
import CoursePlayer from '@/pages/CoursePlayer.jsx';
import CourseDetails from '@/pages/CourseDetails.jsx';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute.jsx';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/course/:courseId" element={<CourseDetails />} />
      <Route path="/course/:courseId/learn" element={<CoursePlayer />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);