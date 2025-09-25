import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for large file uploads
});

// API functions
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('csvFile', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const generateSampleData = async (count = 10000) => {
  const response = await api.get(`/generate-sample?count=${count}`);
  return response.data;
};

export const getData = async (sessionId) => {
  const response = await api.get(`/data/${sessionId}`);
  return response.data;
};

export const updateData = async (sessionId, data) => {
  const response = await api.put(`/data/${sessionId}`, { data });
  return response.data;
};

export const resetData = async (sessionId) => {
  const response = await api.post(`/reset/${sessionId}`);
  return response.data;
};

export const downloadCSV = (sessionId, filename) => {
  // Create download link
  const url = `${API_BASE_URL}/download/${sessionId}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'edited-data.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
);

export default api;
