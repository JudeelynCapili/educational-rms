import React, { useMemo, useState, useEffect } from 'react';
import {
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiDownload,
  FiBarChart2,
  FiAlertTriangle,
} from 'react-icons/fi';
import '../Modeling/styles/ModelingModule.css';
import './styles/SimulationTemplate.css';
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
    lookbackDays: 120,
    simulationHours: 12,
    iterations: 1500,
    demandMultiplier: 3,
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
      setSimulationParams((prev) => ({
        ...prev,
        // Keep user/preset defaults stable; only refresh derived arrival rate from live data.
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

    const baseRows = rooms.map((room) => {
      const historical = summaryMap.get(room.id);
      const historicalBookings = Number(historical?.total_bookings || 0);
      const demandShare = totalHistoricalBookings > 0
        ? historicalBookings / totalHistoricalBookings
        : 1 / rooms.length;
      const projectedBookings = totalProjectedArrivals * demandShare;
      const slotCapacity = Number(params.simulation_hours || 1);
      const loadPct = Math.min(100, (projectedBookings / Math.max(slotCapacity, 1)) * 100);

      return {
        roomId: room.id,
        roomName: room.name,
        roomCapacity: room.capacity,
        historicalBookings,
        projectedBookings: Number(projectedBookings.toFixed(2)),
        loadPct: Number(loadPct.toFixed(1)),
        utilization: Number(((metrics.server_utilization || 0) * 100).toFixed(1)),
      };
    });

    const maxLoad = baseRows.reduce((max, row) => Math.max(max, row.loadPct), 0);

    return baseRows.map((row) => {
      const relativePressure = maxLoad > 0 ? (row.loadPct / maxLoad) * 100 : 0;
      let pressure = 'low';

      if (row.loadPct >= 85) {
        pressure = 'critical';
      } else if (row.loadPct >= 65 || relativePressure >= 90) {
        pressure = 'high';
      } else if (row.loadPct >= 35 || relativePressure >= 70) {
        pressure = 'moderate';
      }

      return {
        ...row,
        pressure,
        relativePressure: Number(relativePressure.toFixed(1)),
      };
    });
  };

  const buildTimelineRows = (result) => {
    const replications = result?.raw_data?.replications || [];
    if (replications.length) {
      return replications.slice(0, 24).map((row, idx) => ({
        period: `Rep ${idx + 1}`,
        utilization: Number(((row.server_utilization || 0) * 100).toFixed(1)),
      }));
    }

    const util = Number((result?.metrics?.server_utilization || 0) * 100);
    return Array.from({ length: 12 }).map((_, idx) => {
      const factor = 0.85 + ((idx % 4) * 0.1);
      return {
        period: `Step ${idx + 1}`,
        utilization: Number(Math.min(100, util * factor).toFixed(1)),
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
  const queueAgents = Math.max(
    2,
    Math.min(
      14,
      Math.round(((currentFrame?.utilization || 0) / 10) + Number(simulationParams.demandMultiplier || 1) * 1.5)
    )
  );
  const servingAgents = Math.max(1, Math.min(12, Math.round((currentFrame?.utilization || 0) / 9)));
  const topAnimatedRooms = (simData?.roomLoad || []).slice(0, 8);
  const pressuredRooms = (simData?.roomLoad || []).filter((room) => room.loadPct >= 75).length;
  const throughputPerHour = Number(metrics.served_count_avg || 0) / Math.max(1, Number(simulationParams.simulationHours || 1));
  const roomFlowBranches = useMemo(() => {
    const branchRooms = topAnimatedRooms.slice(0, 4);
    if (!branchRooms.length) {
      return [];
    }

    const anchors = [20, 38, 62, 80];
    const totalLoad = branchRooms.reduce((sum, room) => sum + Math.max(1, Number(room.loadPct || 0)), 0);
    const dispatchTotal = Math.max(
      5,
      Math.min(26, Math.round(((currentFrame?.utilization || 0) / 5.2) + branchRooms.length * 2))
    );

    return branchRooms.map((room, idx) => {
      const weight = Math.max(1, Number(room.loadPct || 0)) / Math.max(1, totalLoad);
      const roomDispatch = Math.max(1, Math.round(dispatchTotal * weight));
      return {
        roomId: room.roomId,
        roomName: room.roomName,
        loadPct: room.loadPct,
        pressure: room.pressure,
        targetY: anchors[idx] || Math.min(84, 20 + idx * 16),
        agentCount: roomDispatch,
      };
    });
  }, [topAnimatedRooms, currentFrame]);

  const branchAgents = useMemo(() => {
    return roomFlowBranches.flatMap((branch, branchIdx) => {
      return Array.from({ length: branch.agentCount }).map((_, idx) => ({
        id: `br-${branch.roomId}-${idx}`,
        targetY: branch.targetY,
        loadPct: branch.loadPct,
        delay: ((idx * 0.17) + (branchIdx * 0.31)) % 2.8,
        duration: Math.max(1.4, 3.25 - (currentFrame?.utilization || 0) / 130 + (100 - branch.loadPct) / 260),
      }));
    });
  }, [roomFlowBranches, currentFrame]);

  const flowAgents = useMemo(() => {
    if (!currentFrame) {
      return { intake: [], service: [] };
    }

    const intakeCount = Math.max(
      6,
      Math.min(
        26,
        Math.round((currentFrame.utilization / 4.8) + Number(simulationParams.demandMultiplier || 1) * 2)
      )
    );
    const serviceCount = Math.max(4, Math.min(18, Math.round(currentFrame.utilization / 6)));

    const intake = Array.from({ length: intakeCount }).map((_, idx) => {
      const lane = idx % 3;
      return {
        id: `in-${idx}`,
        lane,
        delay: (idx * 0.23) % 2.8,
        duration: Math.max(1.8, 3.9 - (currentFrame.utilization / 100) * 1.35 + lane * 0.2),
      };
    });

    const service = Array.from({ length: serviceCount }).map((_, idx) => {
      const lane = idx % 3;
      return {
        id: `sv-${idx}`,
        lane,
        delay: (idx * 0.18) % 2.2,
        duration: Math.max(1.5, 3.1 - (currentFrame.utilization / 100) * 1.1 + lane * 0.18),
      };
    });

    return { intake, service };
  }, [currentFrame, simulationParams.demandMultiplier]);

  const timelineBars = useMemo(() => {
    const rows = simData?.timeline || [];
    return rows.map((row) => {
      const utilization = Number(row?.utilization || 0);
      return {
        period: row.period,
        utilization,
        normalized: Math.min(100, Math.max(5, utilization)),
      };
    });
  }, [simData]);

  const getTimelineBarColor = (value) => {
    if (value > 75) {
      return '#ef4444';
    }
    if (value > 40) {
      return '#10b981';
    }
    return '#f59e0b';
  };

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
              <div className="card-value">{Number(metrics.served_count_avg || 0).toFixed(0)}</div>
              <div className="card-label">Avg Served Jobs</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{throughputPerHour.toFixed(1)}/h</div>
              <div className="card-label">Throughput</div>
            </div>
            <div className="card summary-card optimal">
              <div className="card-value">{pressuredRooms}</div>
              <div className="card-label">High-Load Rooms</div>
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
                  <span>{throughputPerHour.toFixed(1)} jobs/hour</span>
                  <span>{pressuredRooms} high-load rooms</span>
                </div>

                <div className="flow-sim-map" role="img" aria-label="Animated simulation flow of people through intake, service, and exit">
                  <div className="flow-node node-entry">Entry</div>
                  <div className="flow-node node-service">Service</div>
                  <div className="flow-node node-exit">Exit</div>
                  <div className="flow-route route-a" />
                  <div className="flow-route route-b" />
                  <div className="flow-branch-trunk" />

                  {roomFlowBranches.map((branch) => (
                    <React.Fragment key={`branch-${branch.roomId}`}>
                      <div
                        className="flow-route-room"
                        style={{
                          top: `${branch.targetY}%`,
                          opacity: `${0.35 + Math.min(0.5, branch.loadPct / 200)}`,
                        }}
                      />
                      <div
                        className={`flow-room-node room-pressure-${branch.pressure}`}
                        style={{ top: `${branch.targetY}%` }}
                      >
                        <span className="flow-room-name">{branch.roomName}</span>
                        <span className="flow-room-load">{branch.loadPct}%</span>
                      </div>
                    </React.Fragment>
                  ))}

                  {flowAgents.intake.map((agent) => (
                    <span
                      key={agent.id}
                      className={`flow-agent intake lane-${agent.lane}`}
                      style={{
                        animationDelay: `${agent.delay}s`,
                        animationDuration: `${agent.duration}s`,
                      }}
                    />
                  ))}

                  {flowAgents.service.map((agent) => (
                    <span
                      key={agent.id}
                      className={`flow-agent service lane-${agent.lane}`}
                      style={{
                        animationDelay: `${agent.delay}s`,
                        animationDuration: `${agent.duration}s`,
                      }}
                    />
                  ))}

                  {branchAgents.map((agent) => (
                    <span
                      key={agent.id}
                      className="flow-agent branch"
                      style={{
                        '--target-y': `${agent.targetY}%`,
                        animationDelay: `${agent.delay}s`,
                        animationDuration: `${agent.duration}s`,
                        opacity: Math.max(0.58, Math.min(1, agent.loadPct / 100)),
                      }}
                    />
                  ))}
                </div>

                <div className="cartoon-lanes">
                  <div className="cartoon-lane">
                    <h4>Intake Pulse</h4>
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
                          className={`cartoon-room-fill ${animationStateClass(room.relativePressure || room.loadPct)}`}
                          style={{ width: `${Math.max(2, Number(room.relativePressure || room.loadPct || 0))}%` }}
                        />
                      </div>
                      <div className="cartoon-room-meta">{Number(room.relativePressure || 0).toFixed(1)}% relative</div>
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
                      <span>Relative pressure: {room.relativePressure}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.max(2, Number(room.relativePressure || room.loadPct || 0))}%`,
                          backgroundColor: (room.relativePressure || 0) > 90 ? '#ef4444' : (room.relativePressure || 0) > 70 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                    <div className="room-load-value">
                      {room.loadPct}% projected slot load • {room.relativePressure}% relative pressure
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Visualization */}
          <div className="card">
            <div className="card-header">
              <h2>Simulation Process Bar Graph</h2>
              <button className="btn-export" onClick={exportResults}>
                <FiDownload /> Export Results
              </button>
            </div>
            <div className="sim-process-chart-wrap">
              <div className="sim-process-axis-label">Utilization (%)</div>
              <div className="sim-process-chart">
                <div className="sim-process-grid">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                <div className="sim-process-bars">
                  {timelineBars.map((bar, idx) => (
                    <div key={`${bar.period}-${idx}`} className="sim-process-bar-item">
                      <div
                        className={`sim-process-bar ${idx === playbackIndex ? 'active' : ''}`}
                        title={`${bar.period}: ${bar.utilization.toFixed(1)}%`}
                        style={{
                          height: `${Math.max(6, bar.normalized)}%`,
                          backgroundColor: getTimelineBarColor(bar.utilization),
                          animationDelay: `${idx * 0.05}s`,
                        }}
                      />
                      <span className="sim-process-label">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sim-process-meta">
                <span>Metric: Utilization</span>
                <span>Average throughput: {throughputPerHour.toFixed(1)} jobs/hour</span>
                <span>Highlighted: {currentFrame?.period || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="card info-card">
            <h3>Key Insights</h3>
            <ul>
              <li>Estimated arrival rate: {adjustedArrivalRate.toFixed(2)} requests/hour based on real bookings and scenario multipliers.</li>
              <li>Average throughput is {throughputPerHour.toFixed(1)} jobs/hour across {Number(simulationParams.simulationHours || 0)} simulated hours.</li>
              <li>{pressuredRooms} room(s) are currently in high-load pressure zones and may need balancing.</li>
              <li>The simulator used {Number(metrics.num_replications || simulationParams.iterations)} Monte Carlo replications for confidence.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationTemplate;

