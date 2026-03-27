import api from './api';

export const listSimulationScenarios = async () => {
  const response = await api.get('/simulation/');
  return response.data;
};

export const createSimulationScenario = async (data) => {
  const response = await api.post('/simulation/', data);
  return response.data;
};

export const runSimulationScenario = async (id, data = {}) => {
  const response = await api.post(`/simulation/${id}/run/`, data);
  return response.data;
};

export const getSimulationResults = async (id) => {
  const response = await api.get(`/simulation/${id}/results/`);
  return response.data;
};

export const getSimulationAuditLogs = async (limit = 100, options = {}) => {
  const params = { limit };
  if (options.simulationType) {
    params.simulation_type = options.simulationType;
  }
  const response = await api.get('/simulation/audit_logs/', {
    params,
  });
  return response.data;
};

export const getSimulationHistory = async (limit = 50, options = {}) => {
  const params = { limit };
  if (options.simulationType) {
    params.simulation_type = options.simulationType;
  }
  const response = await api.get('/simulation/history/', {
    params,
  });
  return response.data;
};

export const getSimulationBackup = async (includeRaw = false, auditLimit = 5, options = {}) => {
  const params = {
    include_raw: includeRaw ? 1 : 0,
    audit_limit: auditLimit,
  };
  if (options.simulationType) {
    params.simulation_type = options.simulationType;
  }
  const response = await api.get('/simulation/backup/', {
    params,
  });
  return response.data;
};
export const getSimulationSystemSnapshot = async (startDate, endDate) => {
  const params = {};
  if (startDate && endDate) {
    params.start_date = startDate;
    params.end_date = endDate;
  }
  const response = await api.get('/simulation/system_snapshot/', { params });
  return response.data;
};
