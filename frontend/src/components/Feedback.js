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
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
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
      const userFeedbacks = response.data.data;
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
      fetchUserFeedbacks();
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
        fetchUserFeedbacks();
      } catch (err) {
        setError('Failed to delete feedback');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = feedbacks.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(feedbacks.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
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

        <div className="feedback-list-section">
          <h3>Feedback List</h3>
          {feedbacks.length === 0 ? (
            <p className="no-feedback">No feedback available. Be the first to share your thoughts!</p>
          ) : (
            <div className="feedback-table-container">
              <table className="feedback-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Feedback</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((feedback) => (
                    <tr key={feedback._id}>
                      <td className="table-username">{feedback.username}</td>
                      <td className="table-feedback">{feedback.feedback}</td>
                      <td className="table-date">{formatDate(feedback.created_at)}</td>
                      <td className="table-actions">
                        <button 
                          onClick={() => handleEdit(feedback)} 
                          className="action-btn edit-btn"
                          title="Edit feedback"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(feedback._id)} 
                          className="action-btn delete-btn"
                          title="Delete feedback"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    onClick={handlePreviousPage} 
                    disabled={currentPage === 1}
                    className="pagination-btn prev-btn"
                  >
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`pagination-btn page-btn ${currentPage === pageNumber ? 'active' : ''}`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn next-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
