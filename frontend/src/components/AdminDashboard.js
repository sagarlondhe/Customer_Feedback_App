import React, { useState, useEffect } from 'react';
import { feedbackAPI, userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalFeedbacks: 0, totalUsers: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchAllFeedbacks();
    fetchStats();
  }, [navigate]);

  const fetchAllFeedbacks = async () => {
    try {
      const response = await feedbackAPI.getAllFeedback();
      setFeedbacks(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch feedbacks');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await feedbackAPI.getAllFeedback();
      const feedbacks = response.data.data || [];
      const uniqueUsers = [...new Set(feedbacks.map(f => f.userId))].length;
      setStats({
        totalFeedbacks: feedbacks.length,
        totalUsers: uniqueUsers
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleView = async (feedbackId) => {
    try {
      const response = await feedbackAPI.getFeedback(feedbackId);
      setSelectedFeedback(response.data.data);
    } catch (err) {
      setError('Failed to fetch feedback details');
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback);
    setSelectedFeedback(null);
  };

  const handleDelete = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackAPI.deleteFeedback(feedbackId);
        fetchAllFeedbacks();
        setSelectedFeedback(null);
      } catch (err) {
        setError('Failed to delete feedback');
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await feedbackAPI.updateFeedback({
        feedbackId: editingFeedback._id,
        username: editingFeedback.username,
        feedback: editingFeedback.feedback
      });
      setEditingFeedback(null);
      fetchAllFeedbacks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditingFeedback({
      ...editingFeedback,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = async () => {
    try {
      await userAPI.logout();
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const closeModal = () => {
    setSelectedFeedback(null);
    setEditingFeedback(null);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>Admin Feedback Dashboard</h2>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        <div className="feedback-table-container">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Feedback</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">No feedbacks available</td>
                </tr>
              ) : (
                feedbacks.map((feedback, index) => (
                  <tr key={feedback._id}>
                    <td>{index + 1}</td>
                    <td className="feedback-text-cell">
                      {feedback.feedback.length > 50 
                        ? `${feedback.feedback.substring(0, 50)}...` 
                        : feedback.feedback}
                    </td>
                    <td>{feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => handleView(feedback._id)} 
                        className="view-btn"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEdit(feedback)} 
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(feedback._id)} 
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selectedFeedback && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Feedback Details</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>ID:</strong> {selectedFeedback._id}</p>
              <p><strong>Username:</strong> {selectedFeedback.username}</p>
              <p><strong>Date:</strong> {new Date(selectedFeedback.created_at).toLocaleDateString()}</p>
              <p><strong>Feedback:</strong></p>
              <p className="feedback-full-text">{selectedFeedback.feedback}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingFeedback && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Feedback</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={editingFeedback.username}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="feedback">Feedback:</label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={editingFeedback.feedback}
                  onChange={handleEditChange}
                  rows="4"
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
