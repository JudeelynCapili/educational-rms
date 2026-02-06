import React from 'react';
import { FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaCog, FaThumbsUp, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Dashboard.css';

const DashboardCards = ({ bookingStats, simulationStats }) => {
  return (
    <div className="stats-grid">
      <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="stat-header">
          <p className="stat-label">Total Bookings</p>
          <div className="stat-icon"><FaCalendarAlt size={24} color="#2563eb" /></div>
        </div>
        <p className="stat-value">{bookingStats.total_bookings}</p>
        <div className="stat-footer">
          <span className="stat-change neutral">—</span>
          <span className="stat-period">All time</span>
        </div>
      </motion.div>

      <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div className="stat-header">
          <p className="stat-label">Confirmed</p>
          <div className="stat-icon"><FaCheckCircle size={24} color="#059669" /></div>
        </div>
        <p className="stat-value">{bookingStats.confirmed_bookings}</p>
        <div className="stat-footer">
          <span className="stat-change positive">↑ Active</span>
          <span className="stat-period">Current</span>
        </div>
      </motion.div>

      <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <div className="stat-header">
          <p className="stat-label">Approved</p>
          <div className="stat-icon"><FaThumbsUp size={24} color="#10b981" /></div>
        </div>
        <p className="stat-value">{bookingStats.approved_bookings || 0}</p>
        <div className="stat-footer">
          <span className="stat-change positive">↑ Ready</span>
          <span className="stat-period">To Use</span>
        </div>
      </motion.div>

      <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }}>
        <div className="stat-header">
          <p className="stat-label">Pending</p>
          <div className="stat-icon"><FaHourglassHalf size={24} color="#f59e0b" /></div>
        </div>
        <p className="stat-value">{bookingStats.pending_bookings}</p>
        <div className="stat-footer">
          <span className="stat-change neutral">Awaiting</span>
          <span className="stat-period">Review</span>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardCards;
