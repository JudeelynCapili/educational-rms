import React, { useState, useEffect } from 'react';
import { FiTool, FiRefreshCw, FiDownload } from 'react-icons/fi';
import './ModelingModule.css';

const EquipmentUsageModel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  const fetchEquipmentData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setData({
        summary: {
          totalEquipment: 42,
          idle: 8,
          optimal: 28,
          overused: 6
        },
        equipment: [
          { id: 1, name: 'Projector A', checkouts: 45, avgUsagePerDay: 3.2, stress: 65, status: 'optimal' },
          { id: 2, name: 'Projector B', checkouts: 12, avgUsagePerDay: 0.9, stress: 30, status: 'idle' },
          { id: 3, name: 'Microscope 1', checkouts: 78, avgUsagePerDay: 5.6, stress: 88, status: 'overused' },
          { id: 4, name: 'Microscope 2', checkouts: 34, avgUsagePerDay: 2.4, stress: 55, status: 'optimal' },
          { id: 5, name: 'Oscilloscope', checkouts: 92, avgUsagePerDay: 6.6, stress: 95, status: 'overused' },
          { id: 6, name: 'Multimeter Set', checkouts: 156, avgUsagePerDay: 11.1, stress: 78, status: 'optimal' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (stress) => {
    if (stress > 75) return '#ef4444';
    if (stress > 50) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="modeling-container">
      <div className="modeling-header">
        <div className="header-content">
          <h1>
            <FiTool /> Equipment Usage Model
          </h1>
          <p>Analyze equipment wear, demand, and shortages</p>
        </div>
        <button className="btn-refresh" onClick={fetchEquipmentData} disabled={loading}>
          <FiRefreshCw /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {data && (
        <div className="modeling-content">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="card summary-card">
              <div className="card-value">{data.summary.totalEquipment}</div>
              <div className="card-label">Total Equipment</div>
            </div>
            <div className="card summary-card underutilized">
              <div className="card-value">{data.summary.idle}</div>
              <div className="card-label">Idle Equipment</div>
            </div>
            <div className="card summary-card optimal">
              <div className="card-value">{data.summary.optimal}</div>
              <div className="card-label">Optimal Usage</div>
            </div>
            <div className="card summary-card overutilized">
              <div className="card-value">{data.summary.overused}</div>
              <div className="card-label">Overused</div>
            </div>
          </div>

          {/* Equipment Table */}
          <div className="card">
            <div className="card-header">
              <h2>Equipment Status & Usage</h2>
              <button className="btn-export">
                <FiDownload /> Export Report
              </button>
            </div>
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Equipment Name</th>
                  <th>Total Checkouts</th>
                  <th>Avg Usage/Day</th>
                  <th>Stress Index</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.equipment.map((item) => (
                  <tr key={item.id} className={item.status}>
                    <td>{item.name}</td>
                    <td className="value">{item.checkouts}</td>
                    <td className="value">{item.avgUsagePerDay.toFixed(1)} hrs</td>
                    <td>
                      <div className="stress-indicator">
                        <div className="stress-bar">
                          <div
                            className="stress-fill"
                            style={{
                              width: `${item.stress}%`,
                              backgroundColor: getStressColor(item.stress)
                            }}
                          />
                        </div>
                        <span>{item.stress}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="card recommendations-card">
            <h3>📊 Recommendations</h3>
            <div className="recommendation-items">
              <div className="rec-item high-priority">
                <strong>🔴 High Priority:</strong> Oscilloscope is at 95% stress. Consider maintenance or additional units.
              </div>
              <div className="rec-item high-priority">
                <strong>🔴 High Priority:</strong> Microscope 1 is overused. Schedule preventive maintenance.
              </div>
              <div className="rec-item medium-priority">
                <strong>🟡 Medium Priority:</strong> Projector B is idle. Reassign or remove from inventory.
              </div>
              <div className="rec-item low-priority">
                <strong>🟢 Low Priority:</strong> Multimeter set has balanced usage - optimal resource.
              </div>
            </div>
          </div>

          {/* Model Info */}
          <div className="card info-card">
            <h3>Equipment Usage Metrics</h3>
            <ul>
              <li><strong>Checkout Frequency:</strong> Total number of times equipment was used</li>
              <li><strong>Average Usage/Day:</strong> Hours of daily usage averaged over period</li>
              <li><strong>Equipment Stress Index:</strong> Combination of usage frequency and duration
                <ul>
                  <li>&lt; 50%: Idle or optimal</li>
                  <li>50% - 75%: Balanced usage</li>
                  <li>&gt; 75%: High stress, maintenance needed</li>
                </ul>
              </li>
              <li><strong>Degradation Tracking:</strong> Monitor wear patterns for predictive maintenance</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentUsageModel;
