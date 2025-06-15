import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';

import MediaUploader from '../../../common/MediaUploader';
import { toast } from 'react-toastify';
import './styles/Clubs.css';

const Clubs = () => {
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchClubs();
    fetchTeachers();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs');
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      toast.error('Failed to load teachers list');
    }
  };

  const handleSave = async (clubData) => {
    try {
      const method = clubData.id ? 'PUT' : 'POST';
      const url = clubData.id ? `/api/clubs/${clubData.id}` : '/api/clubs';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubData)
      });

      if (!response.ok) throw new Error('Failed to save club');

      await fetchClubs();
      setSelectedClub(null);
      toast.success(`Club ${clubData.id ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error('Failed to save club');
    }
  };

  const handleDelete = async (clubId) => {
    if (!window.confirm('Are you sure you want to delete this club?')) return;

    try {
      await fetch(`/api/clubs/${clubId}`, { method: 'DELETE' });
      setClubs(clubs.filter(club => club.id !== clubId));
      toast.success('Club deleted successfully');
    } catch (error) {
      toast.error('Failed to delete club');
    }
  };

  return (
    <AdminLayout 
      title={selectedClub ? `Editing: ${selectedClub.name || 'New Club'}` : 'Clubs Management'}
      backButton={!!selectedClub}
      onBack={() => setSelectedClub(null)}
    >
      <div className="clubs-page">
        {!selectedClub && (
          <div className="action-bar">
            <button 
              className="add-club-btn"
              onClick={() => setSelectedClub({ isNew: true })}
            >
              Add New Club
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading clubs...</div>
        ) : selectedClub ? (
          <ClubEditor 
            club={selectedClub}
            teachers={teachers}
            onSave={handleSave}
            onCancel={() => setSelectedClub(null)}
            validationRules={{
              required: ['name', 'description', 'incharge'],
              description: { minLength: 100 },
              image: {
                required: true,
                dimensions: { minWidth: 800, minHeight: 400 }
              }
            }}
          />
        ) : (
          <div className="clubs-grid">
            {clubs.map(club => (
              <div key={club.id} className="club-card">
                <img src={club.image} alt={club.name} />
                <h3>{club.name}</h3>
                <p>{club.description}</p>
                <div className="club-actions">
                  <button onClick={() => setSelectedClub(club)}>Edit</button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(club.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Clubs;
