import { useEffect, useState } from 'react';
import api from '../services/api';

const useDashboardData = (user, navigate) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
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
    fetchDashboardData();
  }, [user, navigate]);

  const refreshDashboard = async () => {
    try {
      const response = await api.get('/auth/dashboard/stats/');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
    }
  };

  return { dashboardData, loading, error, refreshDashboard };
};

export default useDashboardData;
