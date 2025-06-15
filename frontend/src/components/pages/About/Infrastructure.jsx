import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageGallery from 'react-image-gallery';
import './styles/Infrastructure.css';

const Infrastructure = () => {
  const [selectedFacility, setSelectedFacility] = useState(null);

  const facilities = [
    {
      title: 'Classrooms',
      description: 'Modern, well-ventilated classrooms equipped with smart boards',
      icon: 'chalkboard-teacher',
      images: [/* Add image URLs */],
      features: ['Smart Boards', 'Air Conditioning', 'Modern Furniture']
    },
    // ... Add more facilities
  ];

  return (
    <motion.div 
      className="infrastructure-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="page-title">School Infrastructure</h1>
      
      <div className="facilities-grid">
        {facilities.map((facility, index) => (
          <motion.section
            key={facility.title}
            className="facility-card"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedFacility(facility)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <i className={`fas fa-${facility.icon}`}></i>
            <h2>{facility.title}</h2>
            <p>{facility.description}</p>
          </motion.section>
        ))}
      </div>

      <AnimatePresence>
        {selectedFacility && (
          <motion.div 
            className="facility-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-content">
              <ImageGallery items={selectedFacility.images} />
              <h2>{selectedFacility.title}</h2>
              <ul className="features-list">
                {selectedFacility.features.map(feature => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button onClick={() => setSelectedFacility(null)}>Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Infrastructure;
