/**
 * Equipment Configuration Component
 * 
 * Manages the linking and unlinking of equipment to/from rooms.
 * Provides a comprehensive interface for administrators to:
 * - Configure equipment for individual rooms
 * - View equipment distribution across rooms
 * - Bulk update equipment assignments
 * - Manage equipment-room relationships
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EquipmentConfig.css';

const EquipmentConfig = () => {
  // State management
  const [rooms, setRooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomEquipment, setRoomEquipment] = useState([]);
  const [unlinkedEquipment, setUnlinkedEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEquipmentToAdd, setSelectedEquipmentToAdd] = useState([]);
  const [selectedEquipmentToRemove, setSelectedEquipmentToRemove] = useState([]);
  const [activeTab, setActiveTab] = useState('by-room'); // 'by-room', 'distribution', 'matrix'
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [distribution, setDistribution] = useState([]);
  const [matrix, setMatrix] = useState(null);

  const API_BASE = 'http://localhost:8000/api/scheduling';

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/rooms/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setErrorMessage('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all equipment
  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API_BASE}/equipment/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      setErrorMessage('Failed to load equipment');
    }
  };

  // Fetch equipment for selected room
  const fetchRoomEquipment = async (roomId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/equipment-config/get_room_equipment/?room_id=${roomId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      setRoomEquipment(response.data.equipment || []);
      setSelectedEquipmentToRemove([]);
    } catch (error) {
      console.error('Failed to load room equipment:', error);
      setErrorMessage('Failed to load room equipment');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unlinked equipment for selected room
  const fetchUnlinkedEquipment = async (roomId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/equipment-config/get_unlinked_equipment/?room_id=${roomId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setUnlinkedEquipment(data);
      setSelectedEquipmentToAdd([]);
    } catch (error) {
      console.error('Failed to load unlinked equipment:', error);
      setErrorMessage('Failed to load unlinked equipment');
    }
  };

  // Fetch equipment distribution
  const fetchDistribution = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/equipment-config/equipment_distribution/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setDistribution(data);
    } catch (error) {
      console.error('Failed to load equipment distribution:', error);
      setErrorMessage('Failed to load equipment distribution');
    } finally {
      setLoading(false);
    }
  };

  // Fetch room-equipment matrix
  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/equipment-config/room_equipment_matrix/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      setMatrix(response.data);
    } catch (error) {
      console.error('Failed to load matrix:', error);
      setErrorMessage('Failed to load matrix');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRooms();
    fetchEquipment();
  }, []);

  // Load room equipment when room selected
  useEffect(() => {
    if (selectedRoom) {
      fetchRoomEquipment(selectedRoom.id);
      fetchUnlinkedEquipment(selectedRoom.id);
    }
  }, [selectedRoom]);

  // Add equipment to room
  const handleAddEquipment = async () => {
    if (selectedEquipmentToAdd.length === 0) {
      setErrorMessage('Please select equipment to add');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE}/equipment-config/configure_room_equipment/`,
        {
          room_id: selectedRoom.id,
          equipment_ids: [
            ...roomEquipment.map((e) => e.id),
            ...selectedEquipmentToAdd,
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      
      setSuccessMessage('Equipment successfully added to room');
      await fetchRoomEquipment(selectedRoom.id);
      await fetchUnlinkedEquipment(selectedRoom.id);
      setSelectedEquipmentToAdd([]);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add equipment:', error);
      setErrorMessage('Failed to add equipment: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Remove equipment from room
  const handleRemoveEquipment = async () => {
    if (selectedEquipmentToRemove.length === 0) {
      setErrorMessage('Please select equipment to remove');
      return;
    }

    try {
      setLoading(true);
      const remainingEquipment = roomEquipment
        .filter((e) => !selectedEquipmentToRemove.includes(e.id))
        .map((e) => e.id);

      await axios.post(
        `${API_BASE}/equipment-config/configure_room_equipment/`,
        {
          room_id: selectedRoom.id,
          equipment_ids: remainingEquipment,
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );

      setSuccessMessage('Equipment successfully removed from room');
      await fetchRoomEquipment(selectedRoom.id);
      await fetchUnlinkedEquipment(selectedRoom.id);
      setSelectedEquipmentToRemove([]);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to remove equipment:', error);
      setErrorMessage('Failed to remove equipment: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="equipment-config-container">
      <div className="equipment-config-header">
        <h1>Equipment Configuration</h1>
        <p>Manage equipment linked to rooms</p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
          <button
            className="alert-close"
            onClick={() => setSuccessMessage('')}
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>
          <button
            className="alert-close"
            onClick={() => setErrorMessage('')}
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="equipment-config-tabs">
        <button
          className={`tab-button ${activeTab === 'by-room' ? 'active' : ''}`}
          onClick={() => setActiveTab('by-room')}
        >
          Configure by Room
        </button>
        <button
          className={`tab-button ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('distribution');
            if (distribution.length === 0) {
              fetchDistribution();
            }
          }}
        >
          Equipment Distribution
        </button>
        <button
          className={`tab-button ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('matrix');
            if (!matrix) {
              fetchMatrix();
            }
          }}
        >
          Room-Equipment Matrix
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'by-room' && (
        <div className="equipment-config-by-room">
          <div className="config-grid">
            {/* Room Selection */}
            <div className="config-section room-selector">
              <h2>Select Room</h2>
              <div className="room-list">
                {loading && rooms.length === 0 ? (
                  <div className="loading">Loading rooms...</div>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`room-item ${
                        selectedRoom?.id === room.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="room-name">{room.name}</div>
                      <div className="room-type">{room.room_type}</div>
                      <div className="room-capacity">Cap: {room.capacity}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Equipment Management */}
            {selectedRoom && (
              <>
                {/* Current Equipment */}
                <div className="config-section equipment-section">
                  <h2>Current Equipment</h2>
                  <div className="equipment-list">
                    {roomEquipment.length === 0 ? (
                      <div className="empty-state">
                        No equipment linked to this room
                      </div>
                    ) : (
                      roomEquipment.map((eq) => (
                        <div
                          key={eq.id}
                          className={`equipment-item ${
                            selectedEquipmentToRemove.includes(eq.id)
                              ? 'selected-remove'
                              : ''
                          }`}
                          onClick={() => {
                            setSelectedEquipmentToRemove((prev) =>
                              prev.includes(eq.id)
                                ? prev.filter((id) => id !== eq.id)
                                : [...prev, eq.id]
                            );
                          }}
                        >
                          <div className="equipment-info">
                            <div className="equipment-name">{eq.name}</div>
                            <div className="equipment-quantity">
                              Qty: {eq.quantity}
                            </div>
                          </div>
                          <div className="checkbox">
                            {selectedEquipmentToRemove.includes(eq.id) && '✓'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {roomEquipment.length > 0 && (
                    <button
                      className="btn btn-danger"
                      onClick={handleRemoveEquipment}
                      disabled={selectedEquipmentToRemove.length === 0 || loading}
                    >
                      Remove Selected ({selectedEquipmentToRemove.length})
                    </button>
                  )}
                </div>

                {/* Available Equipment */}
                <div className="config-section equipment-section">
                  <h2>Available Equipment</h2>
                  <div className="equipment-list">
                    {unlinkedEquipment.length === 0 ? (
                      <div className="empty-state">
                        All equipment is linked to this room
                      </div>
                    ) : (
                      unlinkedEquipment.map((eq) => (
                        <div
                          key={eq.id}
                          className={`equipment-item ${
                            selectedEquipmentToAdd.includes(eq.id)
                              ? 'selected-add'
                              : ''
                          }`}
                          onClick={() => {
                            setSelectedEquipmentToAdd((prev) =>
                              prev.includes(eq.id)
                                ? prev.filter((id) => id !== eq.id)
                                : [...prev, eq.id]
                            );
                          }}
                        >
                          <div className="equipment-info">
                            <div className="equipment-name">{eq.name}</div>
                            <div className="equipment-quantity">
                              Qty: {eq.quantity}
                            </div>
                          </div>
                          <div className="checkbox">
                            {selectedEquipmentToAdd.includes(eq.id) && '✓'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {unlinkedEquipment.length > 0 && (
                    <button
                      className="btn btn-primary"
                      onClick={handleAddEquipment}
                      disabled={selectedEquipmentToAdd.length === 0 || loading}
                    >
                      Add Selected ({selectedEquipmentToAdd.length})
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Distribution Tab */}
      {activeTab === 'distribution' && (
        <div className="equipment-distribution-section">
          <h2>Equipment Distribution Across Rooms</h2>
          {loading ? (
            <div className="loading">Loading distribution data...</div>
          ) : (
            <div className="distribution-list">
              {distribution.map((item) => (
                <div key={item.equipment_id} className="distribution-card">
                  <div className="distribution-header">
                    <h3>{item.equipment_name}</h3>
                    <span className="badge">{item.rooms_linked} rooms</span>
                  </div>
                  <div className="distribution-details">
                    <p>
                      <strong>Total Quantity:</strong> {item.total_quantity}
                    </p>
                    {item.equipment_description && (
                      <p>
                        <strong>Description:</strong>{' '}
                        {item.equipment_description}
                      </p>
                    )}
                  </div>
                  <div className="rooms-list">
                    <strong>Linked Rooms:</strong>
                    <ul>
                      {item.rooms.length === 0 ? (
                        <li>Not linked to any rooms</li>
                      ) : (
                        item.rooms.map((room) => (
                          <li key={room.id}>
                            {room.name} ({room.room_type})
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Matrix Tab */}
      {activeTab === 'matrix' && (
        <div className="equipment-matrix-section">
          <h2>Room-Equipment Matrix</h2>
          {loading || !matrix ? (
            <div className="loading">Loading matrix data...</div>
          ) : (
            <div className="matrix-container">
              <div className="matrix-stats">
                <div className="stat-card">
                  <div className="stat-value">{matrix.total_rooms}</div>
                  <div className="stat-label">Rooms</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{matrix.total_equipment}</div>
                  <div className="stat-label">Equipment Types</div>
                </div>
              </div>

              <div className="matrix-view">
                <div className="matrix-section">
                  <h3>Rooms</h3>
                  <div className="rooms-matrix-list">
                    {matrix.rooms.map((room) => (
                      <div key={room.id} className="matrix-item">
                        <div className="matrix-item-header">
                          <strong>{room.name}</strong>
                          <span className="badge">
                            {room.equipment_count} items
                          </span>
                        </div>
                        <div className="matrix-item-details">
                          <small>{room.room_type}</small>
                          {room.building && <small>Building: {room.building}</small>}
                          <small>Capacity: {room.capacity}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="matrix-section">
                  <h3>Equipment</h3>
                  <div className="equipment-matrix-list">
                    {matrix.equipment.map((eq) => (
                      <div key={eq.id} className="matrix-item">
                        <div className="matrix-item-header">
                          <strong>{eq.name}</strong>
                          <span className="badge">
                            {eq.room_count} rooms
                          </span>
                        </div>
                        <div className="matrix-item-details">
                          <small>Qty: {eq.quantity}</small>
                          {eq.description && <small>{eq.description}</small>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentConfig;
