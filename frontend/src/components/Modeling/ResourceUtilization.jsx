import React, { useEffect, useRef, useState } from 'react';
import { FiBarChart2, FiRefreshCw, FiDownload } from 'react-icons/fi';
import './styles/ModelingModule.css';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import DecisionSupportPanel from '../../features/dashboard/sections/DecisionSupportPanel';
import { exportElementToPdf } from '../../utils/pdfExport';

const ResourceUtilization = () => {
  const { user } = useAuthStore();
  const exportContainerRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedResource, setSelectedResource] = useState('rooms');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState('');

  useEffect(() => {
    fetchUtilizationData();
  }, [selectedResource, selectedDate]);

  const fetchUtilizationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const utilResponse = await api.get('/capacity/current_utilization/', { params: { date: selectedDate } });
      const roomResources = (utilResponse.data.room_utilization || []).map((room) => {
        const util = Number(room.utilization_pct || 0);
        let status = 'optimal';
        if (util < 40) {
          status = 'underutilized';
        } else if (util > 75) {
          status = 'overutilized';
        }
        return {
          id: `room-${room.room_id}`,
          name: `${room.room_name} (${room.room_type || 'N/A'})`,
          utilization: util,
          status,
          metaA: `${room.booked_slots} / ${room.total_slots} slots`,
          metaB: `Cap ${room.capacity}`,
        };
      });

      const equipmentResources = (utilResponse.data.equipment_usage || []).map((eq) => {
        const util = Number(eq.assignment_pct || 0);
        let status = 'optimal';
        if (util < 40) {
          status = 'underutilized';
        } else if (util > 75) {
          status = 'overutilized';
        }
        return {
          id: `eq-${eq.equipment_id}`,
          name: eq.equipment_name,
          utilization: util,
          status,
          metaA: `${eq.assigned_quantity} assigned / ${eq.total_quantity}`,
          metaB: `${eq.available_quantity} available`,
        };
      });

      const resources = selectedResource === 'equipment' ? equipmentResources : roomResources;
      const summary = {
        totalResources: resources.length,
        optimal: resources.filter((r) => r.status === 'optimal').length,
        underutilized: resources.filter((r) => r.status === 'underutilized').length,
        overutilized: resources.filter((r) => r.status === 'overutilized').length,
      };

      setData({
        summary,
        resources,
        overallUtilizationPct: Number(utilResponse.data?.overall_utilization_pct || 0),
        totalBookedSlots: Number(utilResponse.data?.total_booked_slots || 0),
        totalAvailableSlots: Number(utilResponse.data?.total_available_slots || 0),
      });
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load utilization data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportNotice('');
    setIsExporting(true);

    try {
      await exportElementToPdf({
        element: exportContainerRef.current,
        fileName: `resource_utilization_${selectedDate}.pdf`,
      });
      setExportNotice('Resource utilization report downloaded successfully.');
    } catch (err) {
      setExportNotice('Failed to export resource utilization report. Please try again.');
    } finally {
      setIsExporting(false);
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
    <div className="modeling-container" ref={exportContainerRef}>
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

      <div className="card">
        <div className="params-grid">
          <div className="param-input">
            <label>Data Type</label>
            <select value={selectedResource} onChange={(e) => setSelectedResource(e.target.value)}>
              <option value="rooms">Room Utilization</option>
              <option value="equipment">Equipment Allocation</option>
            </select>
          </div>
          <div className="param-input">
            <label>Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>
      </div>

      <DecisionSupportPanel userRole={user?.role} />

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {exportNotice ? (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <p style={{ margin: 0 }}>{exportNotice}</p>
        </div>
      ) : null}

      {data && (
        <div className="modeling-content">
          {selectedResource === 'rooms' && data.totalBookedSlots === 0 && (
            <div className="error-banner">
              <p>
                No approved or confirmed room bookings were found for {selectedDate}. Choose a different date or populate schedules for this day.
              </p>
            </div>
          )}
          {selectedResource === 'rooms' && data.totalBookedSlots > 0 && data.overallUtilizationPct >= 90 && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <p style={{ margin: 0, color: '#166534', fontWeight: 600 }}>
                High utilization detected on {selectedDate}: {data.totalBookedSlots} of {data.totalAvailableSlots} room-slots booked ({data.overallUtilizationPct}%).
              </p>
            </div>
          )}

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
              <button className="btn-export" onClick={handleExport} disabled={isExporting || loading}>
                <FiDownload /> {isExporting ? 'Exporting...' : 'Export Report'}
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
                      <small>{resource.metaA} • {resource.metaB}</small>
                    </td>
                  </tr>
                ))}
                {data.resources.length === 0 && (
                  <tr>
                    <td colSpan={4}>No utilization data available for the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Model Info */}
          <div className="card info-card">
            <h3>Model Methodology</h3>
            <ul>
              <li><strong>Available Slots:</strong> Active Rooms × Active Time Slots (for selected date)</li>
              <li><strong>Used Slots:</strong> Confirmed/Approved bookings on the selected date</li>
              <li><strong>Utilization Rate:</strong> (Used Slots / Available Slots) × 100%</li>
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

