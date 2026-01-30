import React from 'react';
import './FeatureLanding.css';

const ConflictOverrideLanding = () => {
  return (
    <div className="feature-landing">
      <div className="feature-header">
        <div className="feature-title-section">
          <h1>⚠️ Conflict Override</h1>
          <p className="feature-subtitle">Override scheduling conflict rules with admin privileges</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.location.href = '/admin-scheduling?tab=bookings'}>
          Manage Bookings
        </button>
      </div>

      <div className="feature-stats">
        <div className="info-card">
          <h3>When to Use Override</h3>
          <p>The conflict override feature allows authorized administrators to bypass normal scheduling rules in exceptional circumstances, such as emergency room usage, VIP requests, or system maintenance exceptions.</p>
        </div>
      </div>

      <div className="feature-info">
        <h3>Types of Conflicts</h3>
        <div className="feature-grid">
          <div className="feature-item">
            <h4>🏢 Room Conflicts</h4>
            <p>Room already booked at the requested time</p>
          </div>
          <div className="feature-item">
            <h4>⚙️ Equipment Conflicts</h4>
            <p>Required equipment unavailable</p>
          </div>
          <div className="feature-item">
            <h4>👤 User Conflicts</h4>
            <p>User has overlapping bookings</p>
          </div>
          <div className="feature-item">
            <h4>🔒 Permission Conflicts</h4>
            <p>User lacks required permissions</p>
          </div>
        </div>
      </div>

      <div className="tips-section">
        <h3>⚠️ Override Guidelines</h3>
        <ul>
          <li><strong>Use Sparingly:</strong> Only use override in exceptional cases</li>
          <li><strong>Document Reasons:</strong> Always record why the override was necessary</li>
          <li><strong>Notify Users:</strong> Inform affected users of the override</li>
          <li><strong>Audit Trail:</strong> All overrides are logged for compliance</li>
          <li><strong>Authorization:</strong> Only admin users can perform overrides</li>
        </ul>
      </div>

      <div className="feature-example">
        <h3>Example: Emergency Lab Booking</h3>
        <div className="example-box">
          <p><strong>Scenario:</strong> A scheduled exam requires Lab A at a time when it's already booked for another class</p>
          <p><strong>Solution:</strong> Use conflict override to:</p>
          <ul>
            <li>Allow the exam booking despite the conflict</li>
            <li>Add a note: "Emergency Exam - VIP Override"</li>
            <li>Notify the affected class about the change</li>
          </ul>
          <p><strong>Result:</strong> Exam is scheduled successfully with documentation</p>
        </div>
      </div>

      <div className="warning-box">
        <h4>🔐 Important</h4>
        <p>Overrides bypass safety checks. Ensure you have proper authorization and clear justification before using this feature. All overrides are audited.</p>
      </div>

      <button className="btn btn-large btn-primary" onClick={() => window.location.href = '/admin-scheduling?tab=bookings'}>
        Go to Booking Management
      </button>
    </div>
  );
};

export default ConflictOverrideLanding;
