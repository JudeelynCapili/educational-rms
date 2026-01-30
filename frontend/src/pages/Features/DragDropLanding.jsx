import React from 'react';
import './FeatureLanding.css';

const DragDropLanding = () => {
  return (
    <div className="feature-landing">
      <div className="feature-header">
        <div className="feature-title-section">
          <h1>🖱️ Drag & Drop Scheduler</h1>
          <p className="feature-subtitle">Interactive scheduling with click and drag functionality</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.location.href = '/admin-scheduling?tab=calendar'}>
          Open Interactive Calendar
        </button>
      </div>

      <div className="feature-stats">
        <div className="info-card">
          <h3>What is Drag & Drop Scheduling?</h3>
          <p>The drag and drop scheduler allows you to quickly reschedule bookings by clicking and dragging events on the calendar interface. This intuitive interface makes it easy to manage room and resource scheduling without navigating through forms.</p>
        </div>
      </div>

      <div className="feature-info">
        <h3>Drag & Drop Features</h3>
        <div className="feature-grid">
          <div className="feature-item">
            <h4>📍 Click & Drag</h4>
            <p>Click on a booking and drag it to a new time slot</p>
          </div>
          <div className="feature-item">
            <h4>✏️ Resize Events</h4>
            <p>Drag the edges of events to adjust duration</p>
          </div>
          <div className="feature-item">
            <h4>⚡ Instant Update</h4>
            <p>Changes are saved immediately</p>
          </div>
          <div className="feature-item">
            <h4>🔄 Conflict Detection</h4>
            <p>System prevents overlapping bookings</p>
          </div>
        </div>
      </div>

      <div className="tips-section">
        <h3>💡 How to Use</h3>
        <ul>
          <li><strong>View Bookings:</strong> Open the calendar view to see all bookings</li>
          <li><strong>Select Event:</strong> Click on a booking to select it</li>
          <li><strong>Drag to New Time:</strong> Click and hold, then drag to the desired time</li>
          <li><strong>Adjust Duration:</strong> Drag the bottom edge to make events longer or shorter</li>
          <li><strong>Multi-day Drag:</strong> Drag events across days to reschedule to a different date</li>
          <li><strong>Instant Save:</strong> Changes are automatically saved</li>
        </ul>
      </div>

      <div className="feature-example">
        <h3>Example: Quick Rescheduling</h3>
        <div className="example-box">
          <p><strong>Scenario:</strong> A lab class is scheduled for 10 AM - 12 PM but needs to be moved to 2 PM - 4 PM the same day</p>
          <p><strong>Solution:</strong> Instead of opening a form:</p>
          <ul>
            <li>Find the booking on the calendar at 10 AM</li>
            <li>Click and hold the event</li>
            <li>Drag it down to the 2 PM time slot</li>
            <li>Release to confirm</li>
          </ul>
          <p><strong>Result:</strong> Booking is instantly rescheduled with a single drag action!</p>
        </div>
      </div>

      <div className="warning-box">
        <h4>🛡️ Conflict Prevention</h4>
        <p>The system automatically prevents you from dragging events to conflicting time slots. If a conflict is detected, the event will snap back to its original position or show a warning.</p>
      </div>

      <div className="keyboard-shortcuts">
        <h3>⌨️ Keyboard Shortcuts</h3>
        <ul>
          <li><code>Ctrl + Z</code> - Undo last drag operation</li>
          <li><code>Ctrl + Y</code> - Redo last undone operation</li>
          <li><code>ESC</code> - Cancel drag in progress</li>
          <li><code>Double Click</code> - Open booking details for editing</li>
        </ul>
      </div>

      <button className="btn btn-large btn-primary" onClick={() => window.location.href = '/admin-scheduling?tab=calendar'}>
        Go to Calendar View
      </button>
    </div>
  );
};

export default DragDropLanding;
