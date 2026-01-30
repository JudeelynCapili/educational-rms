import React, { useState } from 'react';
import RoomManagement from '../RoomManagement/RoomManagement';
import BookingManagement from '../BookingManagement/BookingManagement';
import SchedulingCalendar from '../SchedulingCalendar/SchedulingCalendar';
import ResourceSettings from '../ResourceSettings/ResourceSettings';
import './AdminScheduling.css';

const AdminScheduling = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showGuide, setShowGuide] = useState(false);

  const tabs = [
    { 
      id: 'calendar', 
      label: 'Calendar View', 
      icon: '📅',
      description: 'View, create, and manage bookings with day/week/month calendar views. Drag-and-drop to reschedule bookings.'
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: '📋',
      description: 'Manage all bookings: create, modify, cancel, approve/reject. Handle recurring bookings and override conflicts.'
    },
    { 
      id: 'rooms', 
      label: 'Rooms', 
      icon: '🏢',
      description: 'Create, edit, and delete room/lab resources. Link equipment and manage room features.'
    },
    { 
      id: 'resources', 
      label: 'Equipment & Time Slots', 
      icon: '⚙️',
      description: 'Configure equipment inventory and define time slot templates (hourly, daily, weekly).'
    }
  ];

  const features = [
    {
      category: 'Scheduling & Resource Management',
      items: [
        { icon: '🏢', title: 'Create, edit, and delete room/lab resources', tab: 'rooms', location: 'Rooms tab' },
        { icon: '⚙️', title: 'Configure equipment linked to rooms', tab: 'resources', location: 'Equipment & Time Slots tab' },
        { icon: '⏰', title: 'Manage time slot definitions (hourly, daily, weekly)', tab: 'resources', location: 'Equipment & Time Slots tab' },
        { icon: '📋', title: 'Create, modify, and cancel any booking', tab: 'bookings', location: 'Bookings tab' },
        { icon: '✅', title: 'Approve or reject booking requests', tab: 'bookings', location: 'Bookings tab - Filter by "Pending"' },
        { icon: '🔄', title: 'Manage recurring bookings', tab: 'bookings', location: 'Bookings tab - Look for "is_recurring" filter' },
        { icon: '⚠️', title: 'Override conflict detection rules when necessary', tab: 'bookings', location: 'Bookings tab - Click "Override Conflict" button' },
        { icon: '📌', title: 'Manage waitlists and prioritize requests', tab: 'bookings', location: 'Bookings tab - Waitlist section' },
        { icon: '📆', title: 'View all calendar views (day, week, month)', tab: 'calendar', location: 'Calendar View tab - Toggle view buttons' },
        { icon: '🖱️', title: 'Use drag-and-drop scheduling for all resources', tab: 'calendar', location: 'Calendar View tab - Drag events to reschedule' }
      ]
    }
  ];

  return (
    <div className="admin-scheduling">
      <div className="scheduling-header">
        <div className="header-content">
          <div>
            <h1>Scheduling & Resource Management</h1>
            <p className="subtitle">Manage rooms, equipment, bookings, and calendar views</p>
          </div>
          <button 
            className="guide-btn"
            onClick={() => setShowGuide(!showGuide)}
            title="View feature guide"
          >
            ❓ Guide
          </button>
        </div>

        {showGuide && (
          <div className="feature-guide">
            <div className="guide-header">
              <h3>📋 Feature Guide</h3>
              <button className="close-btn" onClick={() => setShowGuide(false)}>×</button>
            </div>
            <div className="guide-content">
              {features.map((section, idx) => (
                <div key={idx} className="guide-section">
                  <h4>{section.category}</h4>
                  <div className="features-list">
                    {section.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx} 
                        className="feature-item"
                        onClick={() => {
                          setActiveTab(item.tab);
                          setShowGuide(false);
                        }}
                      >
                        <span className="feature-icon">{item.icon}</span>
                        <div className="feature-info">
                          <div className="feature-title">{item.title}</div>
                          <div className="feature-location">
                            → Go to: <strong>{item.location}</strong>
                          </div>
                        </div>
                        <span className="feature-arrow">→</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="tab-navigation">
        {tabs.map(tab => (
          <div key={tab.id} className="tab-wrapper">
            <button
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.description}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
            <div className="tab-tooltip">{tab.description}</div>
          </div>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'calendar' && <SchedulingCalendar />}
        {activeTab === 'bookings' && <BookingManagement />}
        {activeTab === 'rooms' && <RoomManagement />}
        {activeTab === 'resources' && <ResourceSettings />}
      </div>
    </div>
  );
};

export default AdminScheduling;
