import React, { useState, useEffect } from 'react';
import { FiPlay, FiRefreshCw, FiDownload, FiBarChart2 } from 'react-icons/fi';
import '../Modeling/ModelingModule.css';

const SimulationTemplate = ({ title, description, simulationType }) => {
  const [simData, setSimData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationParams, setSimulationParams] = useState({
    duration: 'semester',
    iterations: 1000,
  });

  useEffect(() => {
    loadSimulationData();
  }, []);

  const loadSimulationData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/simulation/${simulationType}`);
      // const result = await response.json();
      setSimData(generateMockData());
    } catch (error) {
      console.error('Error loading simulation:', error);
    }
  };

  const generateMockData = () => {
    return {
      status: 'completed',
      results: {
        avgUtilization: 62,
        peakUtilization: 88,
        conflictCount: 15,
        successRate: 94.2
      },
      timeline: [
        { day: 'Day 1', utilization: 55, conflicts: 2 },
        { day: 'Day 2', utilization: 62, conflicts: 1 },
        { day: 'Day 3', utilization: 71, conflicts: 3 },
        { day: 'Day 4', utilization: 68, conflicts: 2 },
        { day: 'Day 5', utilization: 75, conflicts: 4 },
        { day: 'Day 6', utilization: 82, conflicts: 2 },
        { day: 'Day 7', utilization: 88, conflicts: 1 },
      ]
    };
  };

  const runSimulation = async () => {
    setIsRunning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSimData(generateMockData());
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

  return (
    <div className="modeling-container">
      <div className="modeling-header">
        <div className="header-content">
          <h1>
            <FiBarChart2 /> {title}
          </h1>
          <p>{description}</p>
        </div>
      </div>

      {/* Parameters Section */}
      <div className="card">
        <div className="card-header">
          <h2>Simulation Parameters</h2>
        </div>
        <div className="params-grid">
          <div className="param-input">
            <label>Duration:</label>
            <select 
              value={simulationParams.duration}
              onChange={(e) => handleParamChange('duration', e.target.value)}
            >
              <option value="week">1 Week</option>
              <option value="month">1 Month</option>
              <option value="semester">1 Semester</option>
              <option value="year">1 Year</option>
            </select>
          </div>
          <div className="param-input">
            <label>Monte Carlo Iterations:</label>
            <input 
              type="number" 
              min="100" 
              step="100"
              value={simulationParams.iterations}
              onChange={(e) => handleParamChange('iterations', e.target.value)}
            />
          </div>
          <button 
            className="btn-run-simulation"
            onClick={runSimulation}
            disabled={isRunning}
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
              <div className="card-value">{simData.results.avgUtilization}%</div>
              <div className="card-label">Avg Utilization</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{simData.results.peakUtilization}%</div>
              <div className="card-label">Peak Utilization</div>
            </div>
            <div className="card summary-card">
              <div className="card-value">{simData.results.conflictCount}</div>
              <div className="card-label">Total Conflicts</div>
            </div>
            <div className="card summary-card optimal">
              <div className="card-value">{simData.results.successRate}%</div>
              <div className="card-label">Success Rate</div>
            </div>
          </div>

          {/* Timeline Visualization */}
          <div className="card">
            <div className="card-header">
              <h2>Simulation Timeline</h2>
              <button className="btn-export">
                <FiDownload /> Export Results
              </button>
            </div>
            <table className="timeline-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Utilization</th>
                  <th>Conflicts</th>
                  <th>Visualization</th>
                </tr>
              </thead>
              <tbody>
                {simData.timeline.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.day}</td>
                    <td className="value">{item.utilization}%</td>
                    <td className="value">{item.conflicts}</td>
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
            <h3>📊 Key Insights</h3>
            <ul>
              <li>Peak utilization occurs around {simData.timeline[simData.timeline.length - 1].day} reaching {simData.results.peakUtilization}%</li>
              <li>Average utilization across simulation period: {simData.results.avgUtilization}%</li>
              <li>Total conflicts detected: {simData.results.conflictCount}</li>
              <li>Booking success rate: {simData.results.successRate}%</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationTemplate;
