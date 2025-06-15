import React, { useState } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import ImageUploader from '../../../common/ImageUploader';
import './styles/ArtIntegration.css';

const ArtIntegration = () => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    images: [],
    subject: '',
    grade: ''
  });

  const handleActivitySubmit = (e) => {
    e.preventDefault();
    const errors = validateActivity(newActivity);
    
    if (Object.keys(errors).length === 0) {
      setActivities([...activities, { ...newActivity, id: Date.now() }]);
      setNewActivity({ title: '', description: '', images: [], subject: '', grade: '' });
    }
  };

  return (
    <AdminContentLayout pageType="art-integration">
      <div className="art-integration-manager">
        <form onSubmit={handleActivitySubmit} className="activity-form">
          <h3>Add New Art Integration Activity</h3>
          {/* Activity form fields */}
          <div className="form-group">
            <input
              type="text"
              value={newActivity.title}
              onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
              placeholder="Activity Title"
            />
          </div>
          <ImageUploader
            images={newActivity.images}
            onUpdate={(images) => setNewActivity({...newActivity, images})}
            maxImages={5}
          />
          <button type="submit">Add Activity</button>
        </form>

        <div className="activities-grid">
          {activities.map(activity => (
            <div key={activity.id} className="activity-card">
              {/* Activity display */}
            </div>
          ))}
        </div>
      </div>
    </AdminContentLayout>
  );
};

export default ArtIntegration;
