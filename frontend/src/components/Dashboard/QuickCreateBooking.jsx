import React, { useState, useEffect } from 'react';
import { getRooms, getTimeSlots, createBooking } from '../../services/schedulingApi';
import { useAuthStore } from '../../stores/authStore';
import './Dashboard.css';

const QuickCreateBooking = ({ onCreated, onClose }) => {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    room: '',
    time_slot: '',
    date: '',
    purpose: '',
    participants_count: 1,
    user: user?.id || '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({ ...prev, user: user.id }));
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [roomsRes, timeSlotsRes] = await Promise.all([
        getRooms(),
        getTimeSlots(),
      ]);
      const roomsData = Array.isArray(roomsRes) ? roomsRes : (roomsRes.results || []);
      const timeSlotsData = Array.isArray(timeSlotsRes) ? timeSlotsRes : (timeSlotsRes.results || []);
      setRooms(roomsData);
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        user: formData.user || user?.id,
        room: formData.room ? Number(formData.room) : formData.room,
        time_slot: formData.time_slot ? Number(formData.time_slot) : formData.time_slot,
        participants_count: formData.participants_count ? Number(formData.participants_count) : formData.participants_count,
      };

      await createBooking(payload);
      alert('Booking created successfully!');
      onCreated();
      onClose();
    } catch (error) {
      const responseData = error.response?.data;
      let message = 'Failed to create booking';
      if (responseData) {
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (responseData.detail) {
          message = responseData.detail;
        } else if (typeof responseData === 'object') {
          message = Object.entries(responseData)
            .map(([field, msgs]) => {
              const list = Array.isArray(msgs) ? msgs : [msgs];
              return `${field}: ${list.join(', ')}`;
            })
            .join(' | ');
        }
      }
      console.error('Failed to create booking:', responseData || error);
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Booking</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="quick-booking-form">
          <div className="form-group">
            <label>Room/Lab *</label>
            <select
              name="room"
              value={formData.room}
              onChange={handleChange}
              required
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.room_type}) - Capacity: {room.capacity}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Time Slot *</label>
            <select
              name="time_slot"
              value={formData.time_slot}
              onChange={handleChange}
              required
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.name} ({slot.start_time} - {slot.end_time})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Purpose *</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Enter booking purpose..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Number of Participants *</label>
            <input
              type="number"
              name="participants_count"
              value={formData.participants_count}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickCreateBooking;
