import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/auth/components/Login';
import Register from '../features/auth/components/Register';
import Dashboard from '../components/Dashboard/Dashboard';
import AdminScheduling from '../components/Admin/AdminScheduling/AdminScheduling';
import EquipmentConfig from '../components/Admin/EquipmentConfig';
import MainLayout from '../components/Layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../stores/authStore';

const AppRoutes = () => {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes with Sidebar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-scheduling"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <AdminScheduling />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/equipment-config"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <EquipmentConfig />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Feature Landing Pages */}
        <Route
          path="/features/*"
          element={
            <ProtectedRoute>
              <MainLayout userRole={user?.role}>
                <AdminScheduling />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
