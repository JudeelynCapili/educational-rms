import React from 'react';
import './Dashboard.css';

const WelcomeSection = ({ userName }) => {
  return (
    <div className="welcome-section">
      <h2>Welcome back, {userName}!</h2>
      <p>Here's what's happening with your resources today.</p>
    </div>
  );
};

export default WelcomeSection;
