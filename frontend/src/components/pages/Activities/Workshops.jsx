import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/Workshops.css';

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [registrationWorkshop, setRegistrationWorkshop] = useState(null);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const data = await ApiService.getWorkshops();
        setWorkshops(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workshops:', error);
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  const handleRegistration = async (workshopId) => {
    try {
      await ApiService.registerForWorkshop(workshopId);
      // Update UI accordingly
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const filteredWorkshops = workshops.filter(workshop =>
    selectedCategory === 'all' || workshop.category === selectedCategory
  );

  return (
    <motion.div 
      className="workshops-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Skill Development Workshops</h1>

      <div className="category-filter">
        {['all', 'technology', 'arts', 'science', 'sports'].map(category => (
          <button
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <motion.div 
        className="workshops-grid"
        layout
      >
        {filteredWorkshops.map(workshop => (
          <motion.div
            key={workshop._id}
            className="workshop-card"
            whileHover={{ scale: 1.05 }}
          >
            <div className="workshop-image">
              <img src={workshop.image} alt={workshop.title} />
              {workshop.status === 'ongoing' && (
                <div className="status-badge">Ongoing</div>
              )}
            </div>
            <div className="workshop-content">
              <h3>{workshop.title}</h3>
              <p>{workshop.description}</p>
              <div className="workshop-meta">
                <span><i className="far fa-calendar"></i> {new Date(workshop.date).toLocaleDateString()}</span>
                <span><i className="far fa-clock"></i> {workshop.duration}</span>
                <span><i className="far fa-user"></i> {workshop.instructor}</span>
              </div>
              <button 
                className="register-btn"
                onClick={() => setRegistrationWorkshop(workshop)}
                disabled={workshop.capacity <= workshop.registered}
              >
                {workshop.capacity <= workshop.registered ? 'Full' : 'Register Now'}
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Registration Modal */}
      {registrationWorkshop && (
        <div className="registration-modal">
          {/* Modal content */}
        </div>
      )}
    </motion.div>
  );
};

export default Workshops;
