import React, { useMemo, useState, useEffect } from 'react';
import {
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiDownload,
  FiBarChart2,
  FiAlertTriangle,
} from 'react-icons/fi';
import '../Modeling/ModelingModule.css';
import './SimulationTemplate.css';
import {
  createSimulationScenario,
  getSimulationSystemSnapshot,
  runSimulationScenario,
} from '../../services/simulationApi';

const SimulationTemplate = ({ title, description, simulationType }) => {
  const [snapshot, setSnapshot] = useState(null);
  const [simData, setSimData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [simulationParams, setSimulationParams] = useState({
    lookbackDays: 14,
    simulationHours: 8,
    iterations: 400,
    demandMultiplier: 1.2,
    serviceDistribution: 'exponential',
    serviceRate: 1.5,
    serviceTime: 0.6,
    prng: 'mt19937',
    seed: '',
    selectedRoomId: '',
    selectedEquipmentId: '',
  });

  useEffect(() => {
    loadSystemSnapshot();
  }, []);

  const loadSystemSnapshot = async () => {
    setIsLoading(true);
    setError('');

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - Number(simulationParams.lookbackDays || 14));

      let response = await getSimulationSystemSnapshot(
        startDate.toISOString().slice(0, 10),
        endDate.toISOString().slice(0, 10)
      );

      const windowBookings = (response.booking_summary || []).reduce(
        (sum, item) => sum + Number(item.total_bookings || 0),
        0
      );

      if (windowBookings === 0) {
        // Fallback to all-time so rooms with older booking history still render realistically.
        response = await getSimulationSystemSnapshot();
      }

      setSnapshot(response);

      const totalBookings = (response.booking_summary || []).reduce(
        (sum, item) => sum + Number(item.total_bookings || 0),
        0
      );
      const totalHours = (response.booking_summary || []).reduce(
        (sum, item) => sum + Number(item.total_hours || 0),
        0
      );
      const lookbackDays = Number(simulationParams.lookbackDays || 14);
      const simHours = Number(simulationParams.simulationHours || 8);

      const estimatedArrival = totalBookings > 0
        ? totalBookings / Math.max(1, lookbackDays * simHours)
        : Math.max(0.4, Number(response.rooms?.length || 1) / 10);
      const avgServiceTime = totalBookings > 0
        ? totalHours / totalBookings
        : 0.75;

      setSimulationParams((prev) => ({
        ...prev,
        serviceRate: Number((1 / Math.max(avgServiceTime, 0.1)).toFixed(2)),
        serviceTime: Number(avgServiceTime.toFixed(2)),
        arrivalRate: Number(estimatedArrival.toFixed(3)),
      }));
    } catch (error) {
      const msg = error?.response?.data?.error || 'Failed to load system snapshot.';
      setError(msg);
      console.error('Error loading system snapshot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const adjustedArrivalRate = useMemo(() => {
    const baseArrival = Number(simulationParams.arrivalRate || 1.0);
    const multiplier = Number(simulationParams.demandMultiplier || 1.0);

    if (simulationType === 'peak-hour') {
      return baseArrival * 1.7;
    }
    if (simulationType === 'shortage') {
      return baseArrival * 1.15;
    }
    if (simulationType === 'what-if') {
      return baseArrival * multiplier;
    }

    return baseArrival * multiplier;
  }, [simulationParams.arrivalRate, simulationParams.demandMultiplier, simulationType]);

  const resolveNumServers = () => {
    const roomCount = Number(snapshot?.rooms?.length || 1);
    let servers = Number(simulationParams.numServers || roomCount || 1);

    if (simulationParams.selectedRoomId) {
      servers = 1;
    }

    if (simulationType === 'equipment-usage' && simulationParams.selectedEquipmentId) {
      const eq = (snapshot?.equipment || []).find(
        (item) => String(item.id) === String(simulationParams.selectedEquipmentId)
      );
      if (eq) {
        servers = Math.max(1, Number(eq.quantity || 1));
      }
    }

    if (simulationType === 'shortage') {
      servers = Math.max(1, Math.floor(servers * 0.65));
    }

    return Math.max(1, Math.floor(servers));
  };

  const buildRoomVisualization = (metrics, params) => {
    const rooms = snapshot?.rooms || [];
    if (!rooms.length) {
      return [];
    }

    const summaryMap = new Map(
      (snapshot?.booking_summary || []).map((item) => [item.room_id, item])
    );

    const totalHistoricalBookings = (snapshot?.booking_summary || []).reduce(
      (sum, item) => sum + Number(item.total_bookings || 0),
      0
    );
    const totalProjectedArrivals = Number(params.arrival_rate || 0) * Number(params.simulation_hours || 0);

    return rooms.map((room) => {
      const historical = summaryMap.get(room.id);
      const historicalBookings = Number(historical?.total_bookings || 0);
      const demandShare = totalHistoricalBookings > 0
        ? historicalBookings / totalHistoricalBookings
        : 1 / rooms.length;
      const projectedBookings = totalProjectedArrivals * demandShare;
      const slotCapacity = Number(params.simulation_hours || 1);
      const loadPct = Math.min(100, (projectedBookings / Math.max(slotCapacity, 1)) * 100);
      const pressure = loadPct > 95 ? 'critical' : loadPct > 75 ? 'high' : loadPct > 45 ? 'moderate' : 'low';

      return {
        roomId: room.id,
        roomName: room.name,
        roomCapacity: room.capacity,
        historicalBookings,
        projectedBookings: Number(projectedBookings.toFixed(2)),
        loadPct: Number(loadPct.toFixed(1)),
        pressure,
        utilization: Number(((metrics.server_utilization || 0) * 100).toFixed(1)),
      };
    });
  };

  const buildTimelineRows = (result) => {
    const replications = result?.raw_data?.replications || [];
    if (replications.length) {
      return replications.slice(0, 24).map((row, idx) => ({
        period: `Rep ${idx + 1}`,
        utilization: Number(((row.server_utilization || 0) * 100).toFixed(1)),
        queueLength: Number((row.avg_queue_length || 0).toFixed(2)),
        waitingTime: Number((row.avg_waiting_time || 0).toFixed(2)),
      }));
    }

    const util = Number((result?.metrics?.server_utilization || 0) * 100);
    return Array.from({ length: 12 }).map((_, idx) => {
      const factor = 0.85 + ((idx % 4) * 0.1);
      return {
        period: `Step ${idx + 1}`,
        utilization: Number(Math.min(100, util * factor).toFixed(1)),
        queueLength: Number(((result?.metrics?.avg_queue_length || 0) * factor).toFixed(2)),
        waitingTime: Number(((result?.metrics?.avg_waiting_time || 0) * factor).toFixed(2)),
      };
    });
  };

  const runSimulation = async () => {
    setError('');
    setIsRunning(true);

    try {
      const numServers = resolveNumServers();
      const payload = {
        name: `${title} ${new Date().toISOString()}`,
        description: `Auto-generated ${simulationType} scenario from real system snapshot.`,
        num_replications: Number(simulationParams.iterations || 400),
        parameters: {
          arrival_model: 'poisson',
          arrival_rate: Number(adjustedArrivalRate.toFixed(4)),
          service_distribution: simulationParams.serviceDistribution,
          service_rate: Number(simulationParams.serviceRate),
          service_time: Number(simulationParams.serviceTime),
          num_servers: numServers,
          simulation_hours: Number(simulationParams.simulationHours || 8),
          prng: simulationParams.prng,
          seed: simulationParams.seed === '' ? null : Number(simulationParams.seed),
          room_id: simulationParams.selectedRoomId ? Number(simulationParams.selectedRoomId) : null,
          equipment_id: simulationParams.selectedEquipmentId ? Number(simulationParams.selectedEquipmentId) : null,
        },
      };

      if (payload.parameters.service_distribution === 'fixed') {
        payload.parameters.service_rate = null;
      }

      const createdScenario = await createSimulationScenario(payload);
      const result = await runSimulationScenario(createdScenario.id, {
        mode: 'simulate',
        num_replications: Number(simulationParams.iterations || 400),
      });

      const timeline = buildTimelineRows(result);
      const roomLoad = buildRoomVisualization(result.metrics || {}, payload.parameters);

      setSimData({
        scenario: createdScenario,
        result,
        timeline,
        roomLoad,
      });
    } catch (error) {
      const msg = error?.response?.data?.error || 'Simulation run failed. Please review your parameters.';
      setError(msg);
      console.error('Simulation run error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleParamChange = (key, value) => {
    setSimulationParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportResults = () => {
    if (!simData) {
      return;
    }
    const blob = new Blob([JSON.stringify(simData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `simulation-${simulationType}-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const rooms = snapshot?.rooms || [];
  const equipment = snapshot?.equipment || [];
  const metrics = simData?.result?.metrics || {};

  useEffect(() => {
    if (!simData?.timeline?.length) {
      return;
    }
    setPlaybackIndex(0);
    setIsPlaybackActive(true);
  }, [simData]);

  useEffect(() => {
    if (!isPlaybackActive || !simData?.timeline?.length) {
      return;
    }

    const intervalMs = Math.max(220, 900 / playbackSpeed);
    const timer = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= simData.timeline.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaybackActive, playbackSpeed, simData]);

  const currentFrame = simData?.timeline?.[playbackIndex] || null;
  const queueAgents = Math.max(1, Math.min(12, Math.round((currentFrame?.queueLength || 0) * 2)));
  const servingAgents = Math.max(1, Math.min(12, Math.round((currentFrame?.utilization || 0) / 9)));
  const topAnimatedRooms = (simData?.roomLoad || []).slice(0, 8);

  const animationStateClass = (util) => {
    if (util >= 80) {
      return 'anim-state-critical';
    }
    if (util >= 55) {
      return 'anim-state-busy';
    }
    return 'anim-state-calm';
  };

  return (
    <div className="modeling-container">
      <div className="modeling-header">
        <div className="header-content">
          <h1>
            <FiBarChart2 /> {title}
          </h1>
          <p>{description}</p>
        </div>
        <button className="btn-refresh" onClick={loadSystemSnapshot} disabled={isLoading || isRunning}>
          <FiRefreshCw /> {isLoading ? 'Refreshing...' : 'Refresh Snapshot'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!rooms.length && !isLoading && (
        <div className="card simulation-warning">
          <FiAlertTriangle />
          <div>
            <h3>No active rooms found</h3>
            <p>
              Add rooms in scheduling first. Once rooms are present, this page will render room-level
              simulation visualization automatically.
            </p>
          </div>
        </div>
      )}

      {/* Parameters Section */}
      <div className="card">
        <div className="card-header">
          <h2>Simulation Parameters</h2>
        </div>
        <div className="params-grid">
          <div className="param-input">
            <label>History Window (days)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={simulationParams.lookbackDays}
              onChange={(e) => handleParamChange('lookbackDays', Number(e.target.value))}
            />
          </div>
          <div className="param-input">
            <label>Simulation Hours</label>
            <input
              type="number"
              min="1"
              max="24"
              value={simulationParams.simulationHours}
              onChange={(e) => handleParamChange('simulationHours', Number(e.target.value))}
            />
          </div>
          <div className="param-input">
            <label>Demand Multiplier</label>
            <input
              type="number"
              min="0.5"
              max="4"
              step="0.05"
              value={simulationParams.demandMultiplier}
              onChange={(e) => handleParamChange('demandMultiplier', Number(e.target.value))}
            />
          </div>
          <div className="param-input">
            <label>Service Distribution</label>
            <select
              value={simulationParams.serviceDistribution}
              onChange={(e) => handleParamChange('serviceDistribution', e.target.value)}
            >
              <option value="exponential">Exponential</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div className="param-input">
            <label>Monte Carlo Iterations</label>
            <input
              type="number"
              min="100"
              step="100"
              value={simulationParams.iterations}
              onChange={(e) => handleParamChange('iterations', Number(e.target.value))}
            />
          </div>
          {simulationParams.serviceDistribution === 'exponential' ? (
            <div className="param-input">
              <label>Service Rate (/hour)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={simulationParams.serviceRate}
                onChange={(e) => handleParamChange('serviceRate', Number(e.target.value))}
              />
            </div>
          ) : (
            <div className="param-input">
              <label>Fixed Service Time (hours)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={simulationParams.serviceTime}
                onChange={(e) => handleParamChange('serviceTime', Number(e.target.value))}
              />
            </div>
          )}
          <div className="param-input">
            <label>Room Scope</label>
            <select
              value={simulationParams.selectedRoomId}
              onChange={(e) => handleParamChange('selectedRoomId', e.target.value)}
            >
              <option value="">All Rooms</option>
              {rooms.map((room) => (
                <option value={room.id} key={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div className="param-input">
            <label>Equipment Scope</label>
            <select
              value={simulationParams.selectedEquipmentId}
              onChange={(e) => handleParamChange('selectedEquipmentId', e.target.value)}
            >
              <option value="">All Equipment</option>
              {equipment.map((eq) => (
                <option value={eq.id} key={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-run-simulation"
            onClick={runSimulation}
            disabled={isRunning || isLoading}
          >
            <FiPlay /> {isRunning ? 'Running...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {simData && (
        <div className="modeling-content">
          {/* Results Summary */}
          <div className="summary-cards">
            <div className="card summary-card">
              <div className="card-value">{((metrics.server_utilization || 0) * 100).toFixed(1)}%</div>
              <div className="card-label">Server Utilization</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{Number(metrics.avg_queue_length || 0).toFixed(2)}</div>
              <div className="card-label">Average Queue Length</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{Number(metrics.avg_waiting_time || 0).toFixed(2)}h</div>
              <div className="card-label">Average Waiting Time</div>
            </div>
            <div className="card summary-card optimal">
              <div className="card-value">{Number(metrics.served_count_avg || 0).toFixed(0)}</div>
              <div className="card-label">Avg Served Jobs</div>
            </div>
          </div>

          {currentFrame && (
            <div className="card">
              <div className="card-header">
                <h2>Cartoon Simulation Playback</h2>
                <div className="cartoon-controls">
                  <button
                    className="btn-export"
                    onClick={() => setIsPlaybackActive((prev) => !prev)}
                    type="button"
                  >
                    {isPlaybackActive ? <FiPause /> : <FiPlay />} {isPlaybackActive ? 'Pause' : 'Play'}
                  </button>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="cartoon-speed-select"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>

              <div className="cartoon-stage">
                <div className="cartoon-stage-header">
                  <span>{currentFrame.period}</span>
                  <span>{currentFrame.utilization}% utilization</span>
                  <span>{currentFrame.queueLength} queue</span>
                  <span>{currentFrame.waitingTime}h wait</span>
                </div>

                <div className="cartoon-lanes">
                  <div className="cartoon-lane">
                    <h4>Queue Lane</h4>
                    <div className="agent-row">
                      {Array.from({ length: queueAgents }).map((_, idx) => (
                        <span key={`q-${idx}`} className="agent-dot queue-dot" />
                      ))}
                    </div>
                  </div>

                  <div className="cartoon-lane">
                    <h4>Service Lane</h4>
                    <div className="agent-row">
                      {Array.from({ length: servingAgents }).map((_, idx) => (
                        <span
                          key={`s-${idx}`}
                          className={`agent-dot serving-dot ${animationStateClass(currentFrame.utilization)}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="cartoon-room-strip">
                  {topAnimatedRooms.map((room) => (
                    <div key={room.roomId} className="cartoon-room">
                      <div className="cartoon-room-title">{room.roomName}</div>
                      <div className="cartoon-room-bar">
                        <div
                          className={`cartoon-room-fill ${animationStateClass(room.loadPct)}`}
                          style={{ width: `${Math.max(2, room.loadPct)}%` }}
                        />
                      </div>
                      <div className="cartoon-room-meta">{room.loadPct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {simData.roomLoad.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2>Room Simulation Load Map</h2>
              </div>
              <div className="room-sim-grid">
                {simData.roomLoad.map((room) => (
                  <div key={room.roomId} className="room-sim-card">
                    <div className="room-sim-header">
                      <h3>{room.roomName}</h3>
                      <span className={`room-pressure room-pressure-${room.pressure}`}>{room.pressure}</span>
                    </div>
                    <div className="room-metrics">
                      <span>Capacity: {room.roomCapacity}</span>
                      <span>History bookings: {room.historicalBookings}</span>
                      <span>Projected bookings: {room.projectedBookings}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${room.loadPct}%`,
                          backgroundColor: room.loadPct > 90 ? '#ef4444' : room.loadPct > 70 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                    <div className="room-load-value">{room.loadPct}% projected slot load</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Visualization */}
          <div className="card">
            <div className="card-header">
              <h2>Simulation Replication Timeline</h2>
              <button className="btn-export" onClick={exportResults}>
                <FiDownload /> Export Results
              </button>
            </div>
            <table className="timeline-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Utilization</th>
                  <th>Avg Queue</th>
                  <th>Avg Wait</th>
                  <th>Visualization</th>
                </tr>
              </thead>
              <tbody>
                {simData.timeline.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.period}</td>
                    <td className="value">{item.utilization}%</td>
                    <td className="value">{item.queueLength}</td>
                    <td className="value">{item.waitingTime}h</td>
                    <td>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${item.utilization}%`,
                            backgroundColor: item.utilization > 75 ? '#ef4444' : item.utilization > 40 ? '#10b981' : '#f59e0b'
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Insights */}
          <div className="card info-card">
            <h3>Key Insights</h3>
            <ul>
              <li>Estimated arrival rate: {adjustedArrivalRate.toFixed(2)} requests/hour based on real bookings and scenario multipliers.</li>
              <li>Average waiting time is {Number(metrics.avg_waiting_time || 0).toFixed(2)} hours for this scenario.</li>
              <li>Average queue length is {Number(metrics.avg_queue_length || 0).toFixed(2)} with peak queue {Number(metrics.max_queue_length || 0)}.</li>
              <li>The simulator used {Number(metrics.num_replications || simulationParams.iterations)} Monte Carlo replications for confidence.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationTemplate;
