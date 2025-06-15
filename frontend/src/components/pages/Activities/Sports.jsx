import React, { useState, useEffect } from 'react';
import ApiService from '../../../utils/ApiService';
import './styles/Sports.css';

const Sports = () => {
  const [sports, setSports] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const data = await ApiService.getSportsActivities();
        setSports(data);
      } catch (error) {
        console.error('Error fetching sports activities:', error);
      }
    };
    fetchSports();
  }, []);

  return (
    <div className="sports-page">
      <h1>Sports & Physical Education</h1>
      <div className="sports-grid">
        {/* Sports activities grid */}
      </div>
      
      <div className="facilities-section">
        <h2>Sports Facilities</h2>
        {/* Facilities list */}
      </div>

      <div className="achievements-section">
        <h2>Sports Achievements</h2>
        {/* Achievements list */}
      </div>
    </div>
  );
};

export default Sports;
