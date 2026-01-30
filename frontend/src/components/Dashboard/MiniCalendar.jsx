import React, { useState, useEffect } from 'react';
import { getCalendarEvents } from '../../services/schedulingApi';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const MiniCalendar = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchTodayEvents();
  }, []);

  const fetchTodayEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await getCalendarEvents('day', today);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      APPROVED: '#3b82f6',
      CONFIRMED: '#10b981',
      CANCELLED: '#6b7280',
      REJECTED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="mini-calendar-widget">
      <div className="widget-header">
        <h3>Today's Schedule</h3>
        <button 
          className="view-full-btn"
          onClick={() => navigate('/admin-scheduling', { state: { tab: 'calendar' } })}
        >
          Full Calendar
        </button>
      </div>

      <div className="today-date">
        <div className="date-icon">📅</div>
        <div className="date-info">
          <p className="date-day">{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
          <p className="date-full">{selectedDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}</p>
        </div>
      </div>

      {loading ? (
        <div className="calendar-loading">Loading events...</div>
      ) : events.length > 0 ? (
        <div className="events-timeline">
          {events.map((event) => (
            <div key={event.id} className="timeline-event">
              <div 
                className="event-indicator"
                style={{ backgroundColor: getStatusColor(event.status) }}
              />
              <div className="event-content">
                <div className="event-time">{event.time}</div>
                <div className="event-details">
                  <p className="event-room">{event.room_name}</p>
                  <p className="event-user">{event.user_name}</p>
                </div>
                <span 
                  className="event-status-badge"
                  style={{ 
                    backgroundColor: getStatusColor(event.status),
                    color: 'white'
                  }}
                >
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-events">
          <div className="no-events-icon">🎉</div>
          <p>No bookings scheduled for today</p>
        </div>
      )}
    </div>
  );
};

export default MiniCalendar;
