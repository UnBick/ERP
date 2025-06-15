import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './styles/PrincipalMessage.css';

const PrincipalMessage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <motion.div 
      className="principal-message"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="principal-header">
        <motion.div 
          className="principal-image-container"
          whileHover={{ scale: 1.05 }}
        >
          <img 
            src="/assets/images/principal.jpg" 
            alt="Principal" 
            onClick={() => setIsVideoPlaying(true)}
          />
          <div className="play-button">
            <i className="fas fa-play"></i>
            <span>Watch Message</span>
          </div>
        </motion.div>

        <motion.div 
          className="principal-info"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>Principal's Message</h1>
          <h3>Dr. Jane Smith</h3>
          <div className="credentials">
            <span>Ph.D. in Education Leadership</span>
            <span>20+ Years in Education</span>
            <div className="social-links">
              <a href="#linkedin"><i className="fab fa-linkedin"></i></a>
              <a href="#twitter"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="message-content"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p>Welcome message from the principal...</p>
        <p>School's vision and mission statement...</p>
      </motion.div>

      {isVideoPlaying && (
        <div className="video-modal" onClick={() => setIsVideoPlaying(false)}>
          <div className="video-container" onClick={e => e.stopPropagation()}>
            <iframe 
              src="https://www.youtube.com/embed/VIDEO_ID" 
              title="Principal's Message"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PrincipalMessage;
