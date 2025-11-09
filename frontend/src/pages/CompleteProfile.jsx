import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { UserCheck, AlertCircle } from 'lucide-react';

export const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    blood_group: '',
    emergency_contact_no: '',
    emergency_contact_relation: '',
    allergies: '',
    photo: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      photo: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // We must use FormData because we are sending a file
    const data = new FormData();
    data.append('blood_group', formData.blood_group);
    data.append('emergency_contact_no', formData.emergency_contact_no);
    data.append('emergency_contact_relation', formData.emergency_contact_relation);
    data.append('allergies', formData.allergies);
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      // Get the access token to set the header manually for this FormData request
      // (axios defaults are for 'application/json')
      const token = localStorage.getItem('accessToken');
      
      // Call the Step-2 registration endpoint
      // [cite: mini-project-123/medi-lin-q/MEDI-LIN-Q-f1f2447704983cbe580896d9edf78aec33d147ff/api/urls/patient_urls.py]
      await axios.post('/api/profile/patient/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      setLoading(false);
      alert('Profile completed successfully!');
      // Send user to the dashboard, which will now work
      navigate('/dashboard'); 

    } catch (err) {
      setLoading(false);
      setError('Failed to update profile. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '2rem 1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="text-center mb-6">
          <UserCheck size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Complete Your Profile</h2>
          <p style={{ color: '#64748b' }}>
            Welcome, {user?.email}! Please fill in the details below to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <input
                type="text"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., O+"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Allergies</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Peanuts, Pollen"
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Emergency Contact Name</label>
              <input
                type="text"
                name="emergency_contact_relation"
                value={formData.emergency_contact_relation}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Jane Doe"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact Number</label>
              <input
                type="tel"
                name="emergency_contact_no"
                value={formData.emergency_contact_no}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 9876543210"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Photo (Optional)</label>
            <input
              type="file"
              name="photo"
              onChange={handleFileChange}
              className="form-input"
              accept="image/*"
            />
          </div>

          {error && (
            <div className="error mb-4" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;