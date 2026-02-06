import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
  FiBarChart2,
  FiActivity,
  FiTrendingUp,
  FiSliders,
  FiShuffle,
} from 'react-icons/fi';
import './CapacityAnalyzer.css';

const CapacityAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [dateRange, setDateRange] = useState('today'); // today, last7days, last30days, custom
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentUtil, setCurrentUtil] = useState(null);
  const [peakHours, setPeakHours] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [demandMultiplier, setDemandMultiplier] = useState(1.3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [trendDays, setTrendDays] = useState(30);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  const [comparisonScenarios, setComparisonScenarios] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleLoadData = async () => {
    if (activeTab === 'current') {
      await loadCurrentUtilization();
      await loadPeakHours();
    } else if (activeTab === 'trends') {
      await loadTrendData();
    }
  };

  useEffect(() => {
    if (activeTab === 'scenarios' || activeTab === 'comparison') {
      loadSavedScenarios();
    }
  }, [activeTab]);

  const getDateRangeDays = () => {
    switch(dateRange) {
      case 'today': return 1;
      case 'last7days': return 7;
      case 'last30days': return 30;
      default: return 1;
    }
  };

  const loadCurrentUtilization = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.get('/capacity/current_utilization/', {
        params: { date: selectedDate }
      });
      setCurrentUtil(response.data);
    } catch (err) {
      setError('Failed to load utilization data');
    } finally {
      setLoading(false);
    }
  };

  const loadPeakHours = async () => {
    try {
      const days = getDateRangeDays();
      const response = await api.get('/capacity/peak_hours/', { params: { days } });
      setPeakHours(response.data);
    } catch (err) {
      console.error('Failed to load peak hours', err);
    }
  };

  const loadTrendData = async () => {
    try {
      const response = await api.get('/capacity/trend_analysis/', {
        params: { days: trendDays }
      });
      setTrendData(response.data);
    } catch (err) {
      setError('Failed to load trend data');
    }
  };

  const loadSavedScenarios = async () => {
    try {
      const response = await api.get('/capacity/saved_scenarios/');
      setSavedScenarios(response.data);
    } catch (err) {
      console.error('Failed to load saved scenarios', err);
    }
  };

  const runScenario = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/capacity/scenario_analysis/', {
        date: selectedDate,
        demand_multiplier: demandMultiplier,
      });
      setScenario(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run scenario analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      setError('Please enter a scenario name');
      return;
    }
    try {
      await api.post('/capacity/save_scenario/', {
        name: scenarioName,
        description: `${demandMultiplier}x demand`,
        scenario_data: scenario,
      });
      setShowSaveDialog(false);
      setScenarioName('');
      loadSavedScenarios();
    } catch (err) {
      setError('Failed to save scenario');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/capacity/export_csv/', {
        params: { date: selectedDate, days: 30 }
      });
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(response.data.csv));
      element.setAttribute('download', `capacity-${selectedDate}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      setError('Failed to export CSV');
    }
  };

  const toggleScenarioComparison = (id) => {
    setComparisonScenarios(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const getUtilColor = (util) => {
    if (util >= 90) return '#e74c3c';
    if (util >= 70) return '#f39c12';
    return '#27ae60';
  };

  const getRoomStatusClass = (util) => {
    if (util >= 90) return 'high-util';
    if (util >= 70) return 'medium-util';
    return 'low-util';
  };

  return (
    <div className="capacity-container">
      <div className="capacity-header">
        <h1 className="capacity-title">
          <FiBarChart2 className="capacity-title-icon" />
          Capacity & Utilization Analysis
        </h1>
        <p>Real-time monitoring, trends, scenario planning, and resource optimization</p>
      </div>

      <div className="tab-navigation">
        {['current', 'trends', 'scenarios', 'comparison'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            <span className="tab-icon">
              {tab === 'current' && <FiActivity />}
              {tab === 'trends' && <FiTrendingUp />}
              {tab === 'scenarios' && <FiSliders />}
              {tab === 'comparison' && <FiShuffle />}
            </span>
            <span className="tab-label">
              {tab === 'current' && 'Current'}
              {tab === 'trends' && 'Trends'}
              {tab === 'scenarios' && 'Scenarios'}
              {tab === 'comparison' && 'Compare'}
            </span>
          </button>
        ))}
      </div>

      <div className="capacity-content">
        {error && <div className="alert alert-error">{error}</div>}

        {activeTab === 'current' && (
          <div className="section">
            <h2>Current Utilization</h2>
            <div className="controls">
              <div className="date-range-buttons">
                <button 
                  className={`btn ${dateRange === 'today' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDateRange('today')}
                >
                  Today
                </button>
                <button 
                  className={`btn ${dateRange === 'last7days' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDateRange('last7days')}
                >
                  Last 7 Days
                </button>
                <button 
                  className={`btn ${dateRange === 'last30days' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDateRange('last30days')}
                >
                  Last 30 Days
                </button>
              </div>
              <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setDateRange('today'); }} />
              <button className="btn btn-primary" onClick={handleLoadData} disabled={loading}>
                {loading ? '⏳ Loading...' : '▶️ Go'}
              </button>
              <button className="btn btn-secondary" onClick={handleExportCSV} disabled={loading}>📥 Export CSV</button>
            </div>

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading utilization data...</p>
              </div>
            )}

            {!loading && !currentUtil && (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <p>No data available</p>
                <small>Click the "▶️ Go" button to load utilization data</small>
              </div>
            )}

            {currentUtil && !loading && (
              <>
                <div className="util-card overall">
                  <div className="util-label">Overall Utilization</div>
                  <div className="util-value">
                    <div className="util-bar-container">
                      <div className="util-bar" style={{ width: `${currentUtil.overall_utilization_pct}%`, backgroundColor: getUtilColor(currentUtil.overall_utilization_pct) }} />
                    </div>
                    <div className="util-percentage">{currentUtil.overall_utilization_pct}%</div>
                  </div>
                  <div className="util-meta">{currentUtil.total_booked_slots} / {currentUtil.total_available_slots} slots</div>
                </div>

                <div className="rooms-section">
                  <h3>Room Utilization</h3>
                  <div className="rooms-grid">
                    {currentUtil.room_utilization.map((room) => (
                      <div key={room.room_id} className={`room-card ${getRoomStatusClass(room.utilization_pct)}`}>
                        <div className="room-name">{room.room_name}</div>
                        <div className="room-util">
                          <div className="util-bar-small">
                            <div className="util-fill" style={{ width: `${room.utilization_pct}%`, backgroundColor: getUtilColor(room.utilization_pct) }} />
                          </div>
                          <span className="util-pct">{room.utilization_pct}%</span>
                        </div>
                        <div className="room-slots">{room.booked_slots} / {room.total_slots} slots</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="equipment-section">
                  <h3>Equipment Allocation</h3>
                  <div className="equipment-table">
                    <div className="table-header">
                      <div>Equipment</div>
                      <div>Inventory</div>
                      <div>Assignment %</div>
                    </div>
                    {currentUtil.equipment_usage.map((eq) => (
                      <div key={eq.equipment_id} className="table-row">
                        <div className="eq-name">
                          <strong>{eq.equipment_name}</strong>
                          <small>{eq.room_assignments} room(s)</small>
                        </div>
                        <div className="eq-allocation">
                          <div className="inventory-row">
                            <span className="label">Total:</span>
                            <span className="total">{eq.total_quantity}</span>
                          </div>
                          <div className="inventory-row">
                            <span className="label">Assigned:</span>
                            <span className="assigned">{eq.assigned_quantity}</span>
                          </div>
                          <div className="inventory-row">
                            <span className="label">Available:</span>
                            <span className="available">{eq.available_quantity}</span>
                          </div>
                        </div>
                        <div className="eq-usage">
                          <div className="util-bar-small">
                            <div className="util-fill" style={{ width: `${eq.assignment_pct}%`, backgroundColor: getUtilColor(eq.assignment_pct) }} />
                          </div>
                          <span>{eq.assignment_pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {peakHours && (
                  <div className="peak-grid">
                    <div className="peak-column">
                      <h3>Peak Hours (Last 7 Days)</h3>
                      <div className="time-slots">
                        {peakHours.peak_slots.map((slot, idx) => (
                          <div key={idx} className="time-slot peak">
                            <div className="slot-time">{slot.time_slot}</div>
                            <div className="slot-count">{slot.booking_count} bookings</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="peak-column">
                      <h3>Underutilized Hours</h3>
                      <div className="time-slots">
                        {peakHours.underutilized_slots.map((slot, idx) => (
                          <div key={idx} className="time-slot low">
                            <div className="slot-time">{slot.time_slot}</div>
                            <div className="slot-count">{slot.booking_count} bookings</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="section">
            <h2>Trends & Patterns</h2>
            <div className="controls">
              <select value={trendDays} onChange={(e) => setTrendDays(Number(e.target.value))}>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            {trendData && (
              <>
                <div className="trend-stats">
                  <div className="stat-card">
                    <div className="stat-label">Avg Utilization</div>
                    <div className="stat-value" style={{ color: getUtilColor(trendData.avg_utilization) }}>{trendData.avg_utilization}%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Peak Utilization</div>
                    <div className="stat-value" style={{ color: getUtilColor(trendData.max_utilization) }}>{trendData.max_utilization}%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Min Utilization</div>
                    <div className="stat-value" style={{ color: getUtilColor(trendData.min_utilization) }}>{trendData.min_utilization}%</div>
                  </div>
                </div>

                <div className="trend-chart">
                  <div className="chart-title">Utilization Over Time</div>
                  <div className="simple-line-chart">
                    {trendData.trend_data.map((point, idx) => (
                      <div key={idx} className="data-point" style={{ height: `${point.utilization_pct}%`, backgroundColor: getUtilColor(point.utilization_pct) }} title={`${point.date}: ${point.utilization_pct}% (${point.bookings} bookings)`} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="section">
            <h2>Demand Scenarios</h2>
            <p>Test what happens if demand increases</p>

            <div className="scenario-form">
              <div className="form-group">
                <label>Demand Multiplier</label>
                <div className="input-group">
                  <input type="range" min="1" max="3" step="0.1" value={demandMultiplier} onChange={(e) => setDemandMultiplier(parseFloat(e.target.value))} />
                  <span className="multiplier-value">{demandMultiplier}x</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={runScenario} disabled={loading}>
                {loading ? 'Running...' : 'Run Scenario'}
              </button>
            </div>

            {scenario && (
              <>
                <div className="scenario-grid">
                  <div className="scenario-card">
                    <div className="label">Current Bookings</div>
                    <div className="value">{scenario.current_bookings}</div>
                  </div>
                  <div className="scenario-card">
                    <div className="label">Current Util</div>
                    <div className="value" style={{ color: getUtilColor(scenario.current_utilization_pct) }}>{scenario.current_utilization_pct}%</div>
                  </div>
                  <div className="scenario-card">
                    <div className="label">Projected Bookings</div>
                    <div className="value">{scenario.projected_bookings}</div>
                  </div>
                  <div className="scenario-card">
                    <div className="label">Projected Util</div>
                    <div className="value" style={{ color: getUtilColor(scenario.projected_utilization_pct) }}>{scenario.projected_utilization_pct}%</div>
                  </div>
                </div>

                <div className="scenario-recommendation">
                  <h3>Recommendations</h3>
                  {scenario.recommendations.map((rec, idx) => (
                    <div key={idx} className={`rec-box ${rec.type}`}>
                      <strong>{rec.type === 'ok' ? '✓' : rec.type === 'add_rooms' ? '⚠' : 'ℹ'}</strong>
                      <div>
                        <p>{rec.message}</p>
                        {rec.estimated_rooms && <small>Suggested: Add {rec.estimated_rooms} room(s)</small>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="action-buttons">
                  <button className="btn btn-secondary" onClick={() => setShowSaveDialog(true)}>💾 Save Scenario</button>
                </div>

                {showSaveDialog && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Save Scenario</h3>
                      <input type="text" placeholder="Scenario name" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} />
                      <div className="modal-buttons">
                        <button className="btn btn-primary" onClick={handleSaveScenario}>Save</button>
                        <button className="btn btn-secondary" onClick={() => setShowSaveDialog(false)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="section">
            <h2>Compare Scenarios</h2>
            {savedScenarios.length === 0 ? (
              <p className="empty-state">No saved scenarios yet. Run a scenario and save it.</p>
            ) : (
              <>
                <div className="scenarios-list">
                  {savedScenarios.map((s) => (
                    <div key={s.id} className={`scenario-item ${comparisonScenarios.includes(s.id) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={comparisonScenarios.includes(s.id)} onChange={() => toggleScenarioComparison(s.id)} />
                      <div className="scenario-info">
                        <div className="scenario-name">{s.name}</div>
                        <small>{s.description}</small>
                      </div>
                    </div>
                  ))}
                </div>

                {comparisonScenarios.length > 0 && (
                  <div className="comparison-results">
                    <h3>Side-by-Side Comparison</h3>
                    <div className="comparison-table">
                      <div className="table-header">
                        <div>Metric</div>
                        {savedScenarios.filter(s => comparisonScenarios.includes(s.id)).map(s => (
                          <div key={s.id}>{s.name}</div>
                        ))}
                      </div>
                      {['current_utilization_pct', 'projected_utilization_pct', 'current_bookings', 'projected_bookings'].map(metric => (
                        <div key={metric} className="table-row">
                          <div className="metric-name">{metric.replace(/_/g, ' ').toUpperCase()}</div>
                          {savedScenarios.filter(s => comparisonScenarios.includes(s.id)).map(s => (
                            <div key={s.id}>{s.data?.[metric] ?? 'N/A'}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CapacityAnalyzer;
