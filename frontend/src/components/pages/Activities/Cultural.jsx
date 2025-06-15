import React, { useState, useEffect } from 'react';
import ApiService from '../../../utils/ApiService';
import './styles/Cultural.css';

const Cultural = () => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await ApiService.getCulturalEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching cultural events:', error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="cultural-page">
      <h1>Cultural Activities</h1>
      
      <div className="events-categories">
        {/* Category filters */}
      </div>

      <div className="events-grid">
        {/* Cultural events grid */}
      </div>

      <div className="gallery-section">
        <h2>Event Gallery</h2>
        {/* Photo gallery */}
      </div>
    </div>
  );
};

export default Cultural;
