import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { DashboardSkeleton } from '../Skeleton/Skeleton';
import EditProfileModal from '../Profile/EditProfileModal';
import DashboardHeader from './DashboardHeader';
import WelcomeSection from './WelcomeSection';
import DashboardCards from './DashboardCards';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import AdminSchedulingStats from './AdminSchedulingStats';
import MiniCalendar from './MiniCalendar';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Inactivity timeout setup (10 minutes)
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
  const inactivityTimerRef = React.useRef(null);

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      // Logout user after 10 minutes of inactivity
      logout();
      navigate('/login');
    }, INACTIVITY_TIMEOUT);
  };

  // Setup activity listeners
  useEffect(() => {
    if (!user) return;

    // Reset timer on any user activity
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners for user activity
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keypress', handleActivity);
    document.addEventListener('click', handleActivity);
    document.addEventListener('scroll', handleActivity);

    // Initial timer
    resetInactivityTimer();

    return () => {
      // Cleanup event listeners
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      document.removeEventListener('click', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      
      // Clear timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/auth/dashboard/stats/');
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = async (updatedUser) => {
    // Refresh user data in the auth store
    try {
      const response = await api.get('/auth/users/me/');
      // Update user in store if needed
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  const refreshDashboard = async () => {
    try {
      const response = await api.get('/auth/dashboard/stats/');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="dashboard">
        <div className="error-message">
          {error || 'An unexpected error occurred'}
        </div>
      </div>
    );
  }

  const { user: userData, booking_stats, recent_bookings, simulation_stats, scheduling_stats } = dashboardData;

  // Debug: Log user role
  console.log('Dashboard userData:', userData);
  console.log('Dashboard user role:', userData?.role);

  const isAdmin = userData.role === 'ADMIN' || userData.role === 'FACULTY';

  return (
    <div className="dashboard">
      <DashboardHeader user={userData} onLogout={handleLogout} />

      <div className="dashboard-content">
        <WelcomeSection userName={userData.first_name || userData.username} />

        {isAdmin && (
          <div className="features-access-section">
            <button 
              className="features-cta-button"
              onClick={() => navigate('/features/overview')}
              title="View all 10 features with dedicated landing pages"
            >
              <span className="features-icon">⭐</span>
              <span className="features-text">View All 10 Features</span>
              <span className="features-arrow">→</span>
            </button>
          </div>
        )}
        
        <DashboardCards 
          bookingStats={booking_stats} 
          simulationStats={simulation_stats} 
        />

        {/* Admin Scheduling Stats - Only for admins/faculty */}
        {isAdmin && scheduling_stats && (
          <AdminSchedulingStats 
            schedulingStats={scheduling_stats}
            onBookingUpdate={refreshDashboard}
          />
        )}

        <div className="content-sections">
          {isAdmin ? (
            <>
              <MiniCalendar />
              <RecentActivity bookings={recent_bookings} />
            </>
          ) : (
            <RecentActivity bookings={recent_bookings} />
          )}
          
          <QuickActions 
            onEditProfile={() => setIsEditProfileOpen(true)} 
            userRole={userData.role}
            onBookingCreated={refreshDashboard}
          />
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        onUpdate={handleProfileUpdate} 
      />
    </div>
  );
};

export default Dashboard;
