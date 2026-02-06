import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiRefreshCw, FiDownload } from 'react-icons/fi';
import './ModelingModule.css';

const ResourceUtilization = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedResource, setSelectedResource] = useState('all');

  useEffect(() => {
    fetchUtilizationData();
  }, [selectedResource]);

  const fetchUtilizationData = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/modeling/utilization?resource=${selectedResource}`);
      // const result = await response.json();
      // setData(result);
      
      // Mock data for now
      setData({
        summary: {
          totalResources: 15,
          optimal: 8,
          underutilized: 5,
          overutilized: 2
        },
        resources: [
          { id: 1, name: 'Lab Room 1', utilization: 65, status: 'optimal' },
          { id: 2, name: 'Lab Room 2', utilization: 35, status: 'underutilized' },
          { id: 3, name: 'Computer Lab', utilization: 85, status: 'overutilized' },
          { id: 4, name: 'Meeting Room A', utilization: 45, status: 'optimal' },
          { id: 5, name: 'Meeting Room B', utilization: 25, status: 'underutilized' },
        ]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'optimal': return '#10b981';
      case 'underutilized': return '#f59e0b';
      case 'overutilized': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="modeling-container">
      <div className="modeling-header">
        <div className="header-content">
          <h1>
            <FiBarChart2 /> Resource Utilization Model
          </h1>
          <p>Measure how much each resource is used vs available</p>
        </div>
        <button className="btn-refresh" onClick={fetchUtilizationData} disabled={loading}>
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
              <div className="card-value">{data.summary.totalResources}</div>
              <div className="card-label">Total Resources</div>
            </div>
            <div className="card summary-card optimal">
              <div className="card-value">{data.summary.optimal}</div>
              <div className="card-label">Optimal (40-75%)</div>
            </div>
            <div className="card summary-card underutilized">
              <div className="card-value">{data.summary.underutilized}</div>
              <div className="card-label">Underutilized (&lt;40%)</div>
            </div>
            <div className="card summary-card overutilized">
              <div className="card-value">{data.summary.overutilized}</div>
              <div className="card-label">Overutilized (&gt;75%)</div>
            </div>
          </div>

          {/* Resource Utilization Table */}
          <div className="card">
            <div className="card-header">
              <h2>Resource Utilization Details</h2>
              <button className="btn-export">
                <FiDownload /> Export Report
              </button>
            </div>
            <table className="utilization-table">
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Utilization Rate</th>
                  <th>Status</th>
                  <th>Visualization</th>
                </tr>
              </thead>
              <tbody>
                {data.resources.map((resource) => (
                  <tr key={resource.id}>
                    <td>{resource.name}</td>
                    <td className="value">{resource.utilization}%</td>
                    <td>
                      <span className="status-badge" style={{ borderColor: getStatusColor(resource.status) }}>
                        {resource.status}
                      </span>
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${resource.utilization}%`,
                            backgroundColor: getStatusColor(resource.status)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model Info */}
          <div className="card info-card">
            <h3>Model Methodology</h3>
            <ul>
              <li><strong>Available Time:</strong> Operating Hours × Days</li>
              <li><strong>Used Time:</strong> Sum of all booking durations</li>
              <li><strong>Utilization Rate:</strong> (Used Time / Available Time) × 100%</li>
              <li><strong>Classification:</strong>
                <ul>
                  <li>Underutilized: &lt; 40%</li>
                  <li>Optimal: 40% - 75%</li>
                  <li>Overutilized: &gt; 75%</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceUtilization;
