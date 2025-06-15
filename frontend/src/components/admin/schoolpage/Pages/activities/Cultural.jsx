import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import ActivityEditor from '../../../common/ActivityEditor';
import './styles/Cultural.css';

const Cultural = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [categories] = useState([
    'Dance', 'Music', 'Drama', 'Art', 'Literature'
  ]);

  const validationRules = {
    activity: {
      required: ['title', 'category', 'date', 'participants'],
      images: { min: 2, max: 10 },
      description: { minLength: 100 }
    }
  };

  const handleSave = async (activityData) => {
    try {
      // API call to save activity
      toast.success('Activity saved successfully');
      setSelectedActivity(null);
    } catch (error) {
      toast.error('Failed to save activity');
    }
  };

  return (
    <AdminLayout title="Cultural Activities">
      <div className="cultural-manager">
        {selectedActivity ? (
          <ActivityEditor
            activity={selectedActivity}
            categories={categories}
            onSave={handleSave}
            onCancel={() => setSelectedActivity(null)}
            validationRules={validationRules.activity}
          />
        ) : (
          <div className="activities-grid">
            {categories.map(category => (
              <CategorySection
                key={category}
                category={category}
                activities={activities.filter(a => a.category === category)}
                onEdit={setSelectedActivity}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Cultural;
