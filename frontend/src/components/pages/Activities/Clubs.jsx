import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/Clubs.css';

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [registrationClub, setRegistrationClub] = useState(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await ApiService.getClubs();
        setClubs(data);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      }
    };
    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRegistration = async (clubId) => {
    try {
      await ApiService.registerForClub(clubId);
      // Update UI accordingly
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <motion.div 
      className="clubs-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Student Clubs</h1>

      <div className="clubs-controls">
        <input
          type="text"
          placeholder="Search clubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="academic">Academic</option>
          <option value="cultural">Cultural</option>
          <option value="sports">Sports</option>
        </select>
      </div>

      <motion.div 
        className="clubs-grid"
        layout
      >
        {filteredClubs.map(club => (
          <motion.div
            key={club._id}
            className="club-card"
            whileHover={{ scale: 1.05 }}
          >
            <div className="club-image">
              <img src={club.image} alt={club.name} />
            </div>
            <div className="club-content">
              <h3>{club.name}</h3>
              <p>{club.description}</p>
              <div className="club-stats">
                <span>{club.memberCount} members</span>
                <span>{club.meetingDay}</span>
              </div>
              <button 
                className="join-btn"
                onClick={() => setRegistrationClub(club)}
              >
                Join Club
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Registration Modal */}
      {registrationClub && (
        <div className="registration-modal">
          {/* Modal content */}
        </div>
      )}
    </motion.div>
  );
};

export default Clubs;
