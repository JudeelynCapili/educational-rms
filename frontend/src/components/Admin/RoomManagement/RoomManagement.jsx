import React, { useState, useEffect } from 'react';
import {
  getRooms, createRoom, updateRoom, deleteRoom,
  getEquipment, addEquipmentToRoom, removeEquipmentFromRoom
} from '../../../services/schedulingApi';
import './RoomManagement.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    room_type: '',
    is_active: 'true'
  });

  const [formData, setFormData] = useState({
    name: '',
    room_type: 'LAB',
    capacity: '',
    floor: '',
    building: '',
    description: '',
    features: [],
    is_active: true
  });

  const [selectedEquipment, setSelectedEquipment] = useState([]);

  const roomTypes = [
    { value: 'LAB', label: 'Computer Lab' },
    { value: 'CLASSROOM', label: 'Classroom' },
    { value: 'CONFERENCE', label: 'Conference Room' },
    { value: 'AUDITORIUM', label: 'Auditorium' },
    { value: 'STUDY_ROOM', label: 'Study Room' }
  ];

  useEffect(() => {
    fetchRooms();
    fetchEquipment();
  }, [filters]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.room_type) params.room_type = filters.room_type;
      if (filters.is_active) params.is_active = filters.is_active;

      const data = await getRooms(params);
      setRooms(Array.isArray(data) ? data : data.results || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch rooms');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const data = await getEquipment({ is_active: true });
      setEquipment(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureAdd = (feature) => {
    if (feature && !formData.features.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const handleFeatureRemove = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const openCreateModal = () => {
    setCurrentRoom(null);
    setFormData({
      name: '',
      room_type: 'LAB',
      capacity: '',
      floor: '',
      building: '',
      description: '',
      features: [],
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setCurrentRoom(room);
    setFormData({
      name: room.name,
      room_type: room.room_type,
      capacity: room.capacity,
      floor: room.floor || '',
      building: room.building || '',
      description: room.description || '',
      features: room.features || [],
      is_active: room.is_active
    });
    setShowModal(true);
  };

  const openEquipmentModal = (room) => {
    setCurrentRoom(room);
    setSelectedEquipment(room.equipment?.map(e => e.id) || []);
    setShowEquipmentModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity)
      };

      if (currentRoom) {
        await updateRoom(currentRoom.id, submitData);
      } else {
        await createRoom(submitData);
      }

      setShowModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room');
      console.error('Error saving room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentSave = async () => {
    try {
      setLoading(true);
      const currentEquipmentIds = currentRoom.equipment?.map(e => e.id) || [];
      
      // Find equipment to add and remove
      const toAdd = selectedEquipment.filter(id => !currentEquipmentIds.includes(id));
      const toRemove = currentEquipmentIds.filter(id => !selectedEquipment.includes(id));

      if (toAdd.length > 0) {
        await addEquipmentToRoom(currentRoom.id, toAdd);
      }
      if (toRemove.length > 0) {
        await removeEquipmentFromRoom(currentRoom.id, toRemove);
      }

      setShowEquipmentModal(false);
      fetchRooms();
    } catch (err) {
      setError('Failed to update equipment');
      console.error('Error updating equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      setLoading(true);
      await deleteRoom(id);
      fetchRooms();
    } catch (err) {
      setError('Failed to delete room');
      console.error('Error deleting room:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEquipment = (equipmentId) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };

  return (
    <div className="room-management">
      <div className="room-management-header">
        <h2>Room & Lab Management</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add Room
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          name="search"
          placeholder="Search rooms..."
          value={filters.search}
          onChange={handleFilterChange}
          className="filter-input"
        />
        
        <select
          name="room_type"
          value={filters.room_type}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Types</option>
          {roomTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          name="is_active"
          value={filters.is_active}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
          <option value="">All Status</option>
        </select>
      </div>

      {/* Room List */}
      {loading && rooms.length === 0 ? (
        <div className="loading">Loading rooms...</div>
      ) : (
        <div className="room-grid">
          {rooms.map(room => (
            <div key={room.id} className="room-card">
              <div className="room-card-header">
                <h3>{room.name}</h3>
                <span className={`badge badge-${room.is_active ? 'success' : 'secondary'}`}>
                  {room.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="room-card-body">
                <p><strong>Type:</strong> {roomTypes.find(t => t.value === room.room_type)?.label}</p>
                <p><strong>Capacity:</strong> {room.capacity} people</p>
                {room.floor && <p><strong>Floor:</strong> {room.floor}</p>}
                {room.building && <p><strong>Building:</strong> {room.building}</p>}
                <p><strong>Equipment:</strong> {room.equipment_count || 0} items</p>
              </div>

              <div className="room-card-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => openEquipmentModal(room)}
                >
                  Manage Equipment
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => openEditModal(room)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(room.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{currentRoom ? 'Edit Room' : 'Create New Room'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Room Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Room Type *</label>
                  <select
                    name="room_type"
                    value={formData.room_type}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    {roomTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Floor</label>
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Building</label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    {' '}Active
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div className="modal-overlay" onClick={() => setShowEquipmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Equipment - {currentRoom?.name}</h3>
              <button className="modal-close" onClick={() => setShowEquipmentModal(false)}>×</button>
            </div>

            <div className="equipment-list">
              {equipment.map(item => (
                <div key={item.id} className="equipment-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedEquipment.includes(item.id)}
                      onChange={() => toggleEquipment(item.id)}
                    />
                    {' '}{item.name} ({item.quantity} available)
                  </label>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEquipmentModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEquipmentSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
