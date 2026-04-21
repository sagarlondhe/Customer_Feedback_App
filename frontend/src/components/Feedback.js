import React, { useState, useEffect } from 'react';
import { feedbackAPI, userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Feedback.css';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    feedback: ''
  });
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchUserFeedbacks(parsedUser._id);
  }, [navigate]);

  const fetchUserFeedbacks = async () => {
    try {
      const response = await feedbackAPI.getAllFeedback();
      const userFeedbacks = response.data.data; //?.filter(f => f._id === user._id) || [];
      setFeedbacks(userFeedbacks);
    } catch (err) {
      setError('Failed to fetch feedbacks');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingFeedback) {
        await feedbackAPI.updateFeedback({
          feedbackId: editingFeedback._id,
          username: user.username,
          feedback: formData.feedback
        });
        setEditingFeedback(null);
      } else {
        await feedbackAPI.addFeedback({
          username: user.username,
          feedback: formData.feedback,
        });
      }
      
      setFormData({ feedback: '' });
      fetchUserFeedbacks(user._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      feedback: feedback.feedback
    });
  };

  const handleCancelEdit = () => {
    setEditingFeedback(null);
    setFormData({ feedback: '' });
  };

  const handleDelete = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackAPI.deleteFeedback(feedbackId);
        fetchUserFeedbacks(user._id);
      } catch (err) {
        setError('Failed to delete feedback');
      }
    }
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

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <div className="header-content">
          <h2>My Feedback</h2>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      
      <div className="feedback-content">
        <div className="feedback-form-section">
          <h3>{editingFeedback ? 'Edit Feedback' : 'Add Feedback'}</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label htmlFor="feedback">Your Feedback:</label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                rows="4"
                placeholder="Share your thoughts and feedback..."
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Saving...' : (editingFeedback ? 'Update' : 'Submit')}
              </button>
              {editingFeedback && (
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Feedback;
