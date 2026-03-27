import React, { useState, useEffect } from 'react';
import { FiCalendar, FiRefreshCw, FiDownload, FiAlertCircle } from 'react-icons/fi';
import { getBookings } from '../../services/schedulingApi';
import {
  BookingsList,
  BookingsStatusFilter,
  BookingsSummaryStats,
} from './components';
import { normalizeBookingsResponse } from './utils/bookingViewUtils';
import './styles/BookingsVisualization.css';

const BookingsVisualization = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const response = await getBookings(params);

      setBookings(normalizeBookingsResponse(response));
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bookings-visualization">
      <div className="viz-header">
        <div className="header-content">
          <h1>
            <FiCalendar /> Bookings Overview
          </h1>
          <p>View and manage all resource bookings</p>
        </div>
        <button className="btn-refresh" onClick={fetchBookings} disabled={loading}>
          <FiRefreshCw /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <FiAlertCircle /> {error}
        </div>
      )}

      <BookingsStatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

      <BookingsSummaryStats bookings={bookings} />

      <BookingsList loading={loading} bookings={bookings} filterStatus={filterStatus} />

      {/* Export Button */}
      <div className="export-section">
        <button className="btn-export">
          <FiDownload /> Export Bookings Report
        </button>
      </div>
    </div>
  );
};

export default BookingsVisualization;

