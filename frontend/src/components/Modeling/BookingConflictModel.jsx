import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiDownload } from 'react-icons/fi';
import './ModelingModule.css';
import api from '../../services/api';

const BookingConflictModel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConflictData();
  }, []);

  const fetchConflictData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/capacity/conflict_summary/', { params: { days: 120 } });
      const payload = response.data || {};

      setData({
        summary: {
          totalConflicts: Number(payload.summary?.total_conflicts || 0),
          highRiskSlots: Number(payload.summary?.high_risk_slots || 0),
          conflictRate: payload.summary?.conflict_rate || '0.0%',
          mostConflictedResource: payload.summary?.most_conflicted_resource || 'N/A',
        },
        conflictsByDay: payload.conflicts_by_day || [],
        timeSlots: payload.time_slots || [],
      });
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load booking conflict data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modeling-container">
      <div className="modeling-header">
        <div className="header-content">
          <h1>
            <FiAlertTriangle /> Booking Conflict Model
          </h1>
          <p>Detect and predict scheduling clashes</p>
        </div>
        <button className="btn-refresh" onClick={fetchConflictData} disabled={loading}>
          <FiRefreshCw /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {data && (
        <div className="modeling-content">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="card summary-card">
              <div className="card-value">{data.summary.totalConflicts}</div>
              <div className="card-label">Total Conflicts</div>
            </div>
            <div className="card summary-card overutilized">
              <div className="card-value">{data.summary.highRiskSlots}</div>
              <div className="card-label">High-Risk Time Slots</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{data.summary.conflictRate}</div>
              <div className="card-label">Conflict Rate</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{data.summary.mostConflictedResource}</div>
              <div className="card-label">Most Conflicted</div>
            </div>
          </div>

          {/* Conflicts by Day */}
          <div className="card">
            <div className="card-header">
              <h2>Conflicts by Day of Week</h2>
              <button className="btn-export">
                <FiDownload /> Export
              </button>
            </div>
            <table className="conflict-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Conflicts</th>
                  <th>Total Slots</th>
                  <th>Conflict Rate</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {data.conflictsByDay.map((item, idx) => (
                  <tr key={idx} className={item.rate > 10 ? 'high-severity' : ''}>
                    <td>{item.day}</td>
                    <td className="value">{item.conflicts}</td>
                    <td>{item.slots}</td>
                    <td className="rate">{item.rate}%</td>
                    <td>
                      <span className={`severity-badge ${item.rate > 10 ? 'high' : item.rate > 6 ? 'medium' : 'low'}`}>
                        {item.rate > 10 ? 'High' : item.rate > 6 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* High-Risk Time Slots */}
          <div className="card">
            <div className="card-header">
              <h2>High-Risk Time Slots During Peak Hours</h2>
            </div>
            <div className="time-slots-grid">
              {data.timeSlots.map((slot, idx) => (
                <div key={idx} className={`time-slot ${slot.probability.toLowerCase()}`}>
                  <div className="slot-time">{slot.slot}</div>
                  <div className="slot-conflicts">{slot.conflicts} conflicts</div>
                  <div className="slot-probability">{slot.probability} risk</div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Info */}
          <div className="card info-card">
            <h3>Conflict Detection Logic</h3>
            <ul>
              <li><strong>Overlap Detection:</strong> startA &lt; endB AND startB &lt; endA</li>
              <li><strong>Metrics Tracked:</strong>
                <ul>
                  <li>Conflicts per day</li>
                  <li>Conflicts per room/equipment</li>
                  <li>Conflict probability during peak hours</li>
                  <li>Time slot clustering</li>
                </ul>
              </li>
              <li><strong>Output:</strong> Conflict likelihood heatmap and high-risk identification</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConflictModel;
