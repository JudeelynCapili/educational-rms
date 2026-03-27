import React from 'react';
import { FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaThumbsUp } from 'react-icons/fa';
import BookingStatCard from './DashboardCards/BookingStatCard';
import styles from './styles/DashboardCards.module.css';

const DashboardCards = ({ bookingStats }) => {
  return (
    <div className={styles.statsGrid}>
      <BookingStatCard
        label="Total Bookings"
        icon={<FaCalendarAlt size={24} color="#2563eb" />}
        value={bookingStats.total_bookings}
        change="neutral"
        period="All time"
        transition={{ duration: 0.5 }}
        styles={styles}
      />
      <BookingStatCard
        label="Confirmed"
        icon={<FaCheckCircle size={24} color="#059669" />}
        value={bookingStats.confirmed_bookings}
        change="↑ Active"
        period="Current"
        transition={{ duration: 0.7 }}
        styles={styles}
      />
      <BookingStatCard
        label="Approved"
        icon={<FaThumbsUp size={24} color="#10b981" />}
        value={bookingStats.approved_bookings || 0}
        change="↑ Ready"
        period="To Use"
        transition={{ duration: 0.9 }}
        styles={styles}
      />
      <BookingStatCard
        label="Pending"
        icon={<FaHourglassHalf size={24} color="#f59e0b" />}
        value={bookingStats.pending_bookings}
        change="Awaiting"
        period="Review"
        transition={{ duration: 1.1 }}
        styles={styles}
      />
    </div>
  );
};

export default DashboardCards;
