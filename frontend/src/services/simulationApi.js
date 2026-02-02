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

export const getSimulationSystemSnapshot = async (startDate, endDate) => {
  const params = {};
  if (startDate && endDate) {
    params.start_date = startDate;
    params.end_date = endDate;
  }
  const response = await api.get('/simulation/system_snapshot/', { params });
  return response.data;
};
