import React from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';

const SimulationPlaybackCard = ({
  currentFrame,
  throughputPerHour,
  pressuredRooms,
  isPlaybackActive,
  setIsPlaybackActive,
  playbackSpeed,
  setPlaybackSpeed,
  roomFlowBranches,
  flowAgents,
  branchAgents,
  queueAgents,
  servingAgents,
  topAnimatedRooms,
  animationStateClass,
}) => {
  if (!currentFrame) {
    return null;
  }

  return (
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
  );
};

export default SimulationPlaybackCard;
