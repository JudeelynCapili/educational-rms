import React, { useState, useEffect } from 'react';
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '../../../services/schedulingApi';
import { getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } from '../../../services/schedulingApi';
import './ResourceSettings.css';

const ResourceSettings = () => {
  const [equipment, setEquipment] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeSection, setActiveSection] = useState('equipment');
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [modalType, setModalType] = useState('equipment');

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    description: '',
    quantity: 1,
    is_active: true
  });

  const [timeSlotForm, setTimeSlotForm] = useState({
    name: '',
    slot_type: 'HOURLY',
    start_time: '',
    end_time: '',
    is_active: true,
    days_of_week: []
  });

  const slotTypes = [
    { value: 'HOURLY', label: 'Hourly' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' }
  ];

  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipData, slotsData] = await Promise.all([
        getEquipment(),
        getTimeSlots()
      ]);
      setEquipment(Array.isArray(equipData) ? equipData : equipData.results || []);
      setTimeSlots(Array.isArray(slotsData) ? slotsData : slotsData.results || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Equipment handlers
  const openEquipmentModal = (item = null) => {
    setModalType('equipment');
    setCurrentItem(item);
    if (item) {
      setEquipmentForm({
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        is_active: item.is_active
      });
    } else {
      setEquipmentForm({
        name: '',
        description: '',
        quantity: 1,
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleEquipmentSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentItem) {
        await updateEquipment(currentItem.id, equipmentForm);
        setSuccess('Equipment updated successfully');
      } else {
        await createEquipment(equipmentForm);
        setSuccess('Equipment created successfully');
      }
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save equipment');
      console.error('Error saving equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await deleteEquipment(id);
      setSuccess('Equipment deleted');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete equipment');
      console.error('Error deleting equipment:', err);
    }
  };

  // Time Slot handlers
  const openTimeSlotModal = (item = null) => {
    setModalType('timeslot');
    setCurrentItem(item);
    if (item) {
      setTimeSlotForm({
        name: item.name,
        slot_type: item.slot_type,
        start_time: item.start_time,
        end_time: item.end_time,
        is_active: item.is_active,
        days_of_week: item.days_of_week || []
      });
    } else {
      setTimeSlotForm({
        name: '',
        slot_type: 'HOURLY',
        start_time: '',
        end_time: '',
        is_active: true,
        days_of_week: []
      });
    }
    setShowModal(true);
  };

  const handleTimeSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentItem) {
        await updateTimeSlot(currentItem.id, timeSlotForm);
        setSuccess('Time slot updated successfully');
      } else {
        await createTimeSlot(timeSlotForm);
        setSuccess('Time slot created successfully');
      }
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save time slot');
      console.error('Error saving time slot:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    try {
      await deleteTimeSlot(id);
      setSuccess('Time slot deleted');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete time slot');
      console.error('Error deleting time slot:', err);
    }
  };

  const toggleDay = (day) => {
    setTimeSlotForm(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  return (
    <div className="resource-settings">
      <div className="section-tabs">
        <button
          className={`section-tab ${activeSection === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveSection('equipment')}
        >
          Equipment
        </button>
        <button
          className={`section-tab ${activeSection === 'timeslots' ? 'active' : ''}`}
          onClick={() => setActiveSection('timeslots')}
        >
          Time Slots
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Equipment Section */}
      {activeSection === 'equipment' && (
        <div className="section-content">
          <div className="section-header">
            <h3>Equipment Management</h3>
            <button className="btn btn-primary" onClick={() => openEquipmentModal()}>
              + Add Equipment
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="items-grid">
              {equipment.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <h4>{item.name}</h4>
                    <span className={`badge ${item.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="item-description">{item.description || 'No description'}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <div className="item-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => openEquipmentModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleEquipmentDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Time Slots Section */}
      {activeSection === 'timeslots' && (
        <div className="section-content">
          <div className="section-header">
            <h3>Time Slot Management</h3>
            <button className="btn btn-primary" onClick={() => openTimeSlotModal()}>
              + Add Time Slot
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="items-grid">
              {timeSlots.map(slot => (
                <div key={slot.id} className="item-card">
                  <div className="item-header">
                    <h4>{slot.name}</h4>
                    <span className={`badge ${slot.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {slot.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p><strong>Type:</strong> {slot.slot_type}</p>
                  <p><strong>Time:</strong> {slot.start_time} - {slot.end_time}</p>
                  <div className="item-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => openTimeSlotModal(slot)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleTimeSlotDelete(slot.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'equipment'
                  ? currentItem ? 'Edit Equipment' : 'Add Equipment'
                  : currentItem ? 'Edit Time Slot' : 'Add Time Slot'
                }
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {modalType === 'equipment' ? (
              <form onSubmit={handleEquipmentSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={equipmentForm.name}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={equipmentForm.description}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                      rows="3"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      value={equipmentForm.quantity}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, quantity: parseInt(e.target.value) })}
                      min="1"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={equipmentForm.is_active}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, is_active: e.target.checked })}
                      />
                      {' '}Active
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleTimeSlotSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={timeSlotForm.name}
                      onChange={(e) => setTimeSlotForm({ ...timeSlotForm, name: e.target.value })}
                      required
                      className="form-input"
                      placeholder="e.g., Morning Slot, Period 1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      value={timeSlotForm.slot_type}
                      onChange={(e) => setTimeSlotForm({ ...timeSlotForm, slot_type: e.target.value })}
                      required
                      className="form-input"
                    >
                      {slotTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        value={timeSlotForm.start_time}
                        onChange={(e) => setTimeSlotForm({ ...timeSlotForm, start_time: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>End Time *</label>
                      <input
                        type="time"
                        value={timeSlotForm.end_time}
                        onChange={(e) => setTimeSlotForm({ ...timeSlotForm, end_time: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Available Days</label>
                    <div className="days-selector">
                      {daysOfWeek.map(day => (
                        <label key={day.value} className="day-checkbox">
                          <input
                            type="checkbox"
                            checked={timeSlotForm.days_of_week.includes(day.value)}
                            onChange={() => toggleDay(day.value)}
                          />
                          {day.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={timeSlotForm.is_active}
                        onChange={(e) => setTimeSlotForm({ ...timeSlotForm, is_active: e.target.checked })}
                      />
                      {' '}Active
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceSettings;
