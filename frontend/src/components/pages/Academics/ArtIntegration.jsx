import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/ArtIntegration.css';

const ArtIntegration = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await ApiService.getArtActivities();
        setActivities(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching art activities:', error);
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.category === filter
  );

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <motion.div 
      className="art-integration"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="page-title">Art Integrated Learning</h1>
      
      <div className="filter-controls">
        {['all', 'visual', 'performing', 'literary'].map(category => (
          <button
            key={category}
            className={`filter-btn ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)} Arts
          </button>
        ))}
      </div>

      <motion.div 
        className="activities-grid"
        layout
      >
        {filteredActivities.map(activity => (
          <motion.div
            key={activity._id}
            className="activity-card"
            layout
            whileHover={{ scale: 1.05 }}
          >
            <img src={activity.image} alt={activity.title} />
            <div className="activity-content">
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
              <div className="subjects-integrated">
                <h4>Subjects Integrated:</h4>
                <ul>
                  {activity.subjects.map(subject => (
                    <li key={subject}>{subject}</li>
                  ))}
                </ul>
              </div>
              <div className="activity-actions">
                <button onClick={() => window.open(activity.resourceUrl, '_blank')}>
                  View Resources
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ArtIntegration;
