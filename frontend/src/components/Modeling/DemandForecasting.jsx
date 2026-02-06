import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiRefreshCw, FiDownload } from 'react-icons/fi';
import './ModelingModule.css';

const DemandForecasting = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('semester');

  useEffect(() => {
    fetchForecastData();
  }, [timeframe]);

  const fetchForecastData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/modeling/demand-forecast?timeframe=${timeframe}`);
      // const result = await response.json();
      // setData(result);

      setData({
        summary: {
          avgBookingsPerDay: 42,
          peakDayBookings: 68,
          forecastedGrowth: '12%',
          confidenceLevel: 'Medium'
        },
        forecast: [
          { week: 'Week 1', forecast: 35, confidence: [28, 42] },
          { week: 'Week 2', forecast: 40, confidence: [32, 48] },
          { week: 'Week 3', forecast: 45, confidence: [36, 54] },
          { week: 'Week 4', forecast: 50, confidence: [40, 60] },
          { week: 'Week 5', forecast: 42, confidence: [33, 51] },
          { week: 'Week 6', forecast: 48, confidence: [38, 58] },
        ],
        seasonalPatterns: [
          { season: 'Fall Semester', growth: 0 },
          { season: 'Spring Semester', growth: 8 },
          { season: 'Summer', growth: -25 },
          { season: 'Winter Break', growth: -40 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modeling-container">
      <div className="modeling-header">
        <div className="header-content">
          <h1>
            <FiTrendingUp /> Demand Forecasting Model
          </h1>
          <p>Predict future booking demand based on historical patterns</p>
        </div>
        <button className="btn-refresh" onClick={fetchForecastData} disabled={loading}>
          <FiRefreshCw /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {data && (
        <div className="modeling-content">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="card summary-card">
              <div className="card-value">{data.summary.avgBookingsPerDay}</div>
              <div className="card-label">Avg Bookings/Day</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{data.summary.peakDayBookings}</div>
              <div className="card-label">Peak Day Bookings</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{data.summary.forecastedGrowth}</div>
              <div className="card-label">Forecasted Growth</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{data.summary.confidenceLevel}</div>
              <div className="card-label">Confidence Level</div>
            </div>
          </div>

          {/* Forecast Controls */}
          <div className="card">
            <div className="card-header">
              <h2>Forecast Settings</h2>
            </div>
            <div className="control-group">
              <label>Timeframe:</label>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="week">Weekly</option>
                <option value="semester">Semester</option>
                <option value="year">Annual</option>
              </select>
            </div>
          </div>

          {/* Forecast Table */}
          <div className="card">
            <div className="card-header">
              <h2>Weekly Demand Forecast</h2>
              <button className="btn-export">
                <FiDownload /> Export
              </button>
            </div>
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Forecast</th>
                  <th>Confidence Range</th>
                  <th>Visualization</th>
                </tr>
              </thead>
              <tbody>
                {data.forecast.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.week}</td>
                    <td className="value">{item.forecast} bookings</td>
                    <td className="range">{item.confidence[0]} - {item.confidence[1]}</td>
                    <td>
                      <div className="bar-chart">
                        <div className="bar-item">
                          <div className="bar-low" style={{ height: `${(item.confidence[0] / 60) * 100}%` }}></div>
                        </div>
                        <div className="bar-item">
                          <div className="bar-mid" style={{ height: `${(item.forecast / 60) * 100}%` }}></div>
                        </div>
                        <div className="bar-item">
                          <div className="bar-high" style={{ height: `${(item.confidence[1] / 60) * 100}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seasonal Patterns */}
          <div className="card">
            <div className="card-header">
              <h2>Seasonal Patterns</h2>
            </div>
            <div className="pattern-grid">
              {data.seasonalPatterns.map((pattern, idx) => (
                <div key={idx} className="pattern-item">
                  <div className="pattern-name">{pattern.season}</div>
                  <div className={`pattern-value ${pattern.growth >= 0 ? 'positive' : 'negative'}`}>
                    {pattern.growth >= 0 ? '+' : ''}{pattern.growth}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Info */}
          <div className="card info-card">
            <h3>Forecasting Methods</h3>
            <ul>
              <li><strong>Moving Average:</strong> Smooths out short-term fluctuations</li>
              <li><strong>Linear Trend:</strong> Identifies long-term growth patterns</li>
              <li><strong>Seasonal Adjustment:</strong> Accounts for semester-based variations</li>
              <li><strong>Factors Considered:</strong>
                <ul>
                  <li>Exam weeks (increased demand)</li>
                  <li>Enrollment size</li>
                  <li>Previous semester growth rate</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecasting;
