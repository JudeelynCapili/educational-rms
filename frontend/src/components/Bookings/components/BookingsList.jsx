import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import BookingVisualizationCard from './BookingVisualizationCard';

const BookingsList = ({ loading, bookings, filterStatus }) => {
  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  if (!bookings.length) {
    return (
      <div className="no-data">
        <FiAlertCircle /> No {filterStatus.toLowerCase()} bookings found
      </div>
    );
  }

  return (
    <div className="bookings-list">
      {bookings.map((booking) => (
        <BookingVisualizationCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
};

export default BookingsList;
