import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User authentication APIs
export const userAPI = {
  register: (userData) => api.post('/user/register', userData),
  login: (credentials) => api.post('/user/login', credentials),
  logout: () => api.post('/user/logout'),
};

// Feedback APIs
export const feedbackAPI = {
  addFeedback: (feedbackData) => api.post('/feedback/addFeedback', feedbackData),
  updateFeedback: (feedbackData) => api.post('/feedback/updateFeedback', feedbackData),
  deleteFeedback: (feedbackId) => api.post('/feedback/deleteFeedback', { feedbackId }),
  getFeedback: (feedbackId) => api.post('/feedback/getFeedback', { feedbackId }),
  getAllFeedback: () => api.post('/feedback/getAllFeedback'),
};

export default api;
