import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/Videos.css';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await ApiService.getVideos();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(video =>
    filter === 'all' || video.category === filter
  );

  return (
    <motion.div 
      className="videos-gallery"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>School Videos</h1>

      <div className="video-filters">
        {['all', 'events', 'sports', 'academics'].map(category => (
          <button
            key={category}
            className={`filter-btn ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <motion.div 
        className="videos-grid"
        layout
      >
        <AnimatePresence>
          {filteredVideos.map(video => (
            <motion.div
              key={video._id}
              className="video-card"
              layout
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
                <div className="play-button">
                  <i className="fas fa-play"></i>
                </div>
              </div>
              <h3>{video.title}</h3>
              <p>{video.description}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {selectedVideo && (
        <motion.div 
          className="video-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedVideo(null)}>×</button>
            <iframe
              src={selectedVideo.url}
              title={selectedVideo.title}
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Videos;
