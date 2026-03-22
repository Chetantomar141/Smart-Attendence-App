import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
      config.headers['x-access-token'] = user.accessToken;
      config.headers['Authorization'] = `Bearer ${user.accessToken}`;
    }
  } catch (error) {
    // Silent error
  }
  return config;
});

// Helper for image/file URLs
export const getFileUrl = (filename) => {
  if (!filename) return null;
  const baseUrl = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5001/uploads';
  return `${baseUrl}/${filename}`;
};

export default api;
