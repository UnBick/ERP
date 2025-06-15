import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import ApiService from '../../../utils/ApiService';
import './styles/Photos.css';

const Photos = () => {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await ApiService.getPhotoAlbums();
        setAlbums(data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };
    fetchAlbums();
  }, []);

  const filteredAlbums = albums.filter(album =>
    filter === 'all' || album.category === filter
  );

  const slides = selectedAlbum?.photos.map(photo => ({
    src: photo.url,
    alt: photo.caption
  })) || [];

  return (
    <motion.div 
      className="photo-gallery"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>School Gallery</h1>

      <div className="gallery-filters">
        {['all', 'events', 'sports', 'cultural', 'academic'].map(category => (
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
        className="albums-grid"
        layout
      >
        <AnimatePresence>
          {filteredAlbums.map(album => (
            <motion.div
              key={album._id}
              className="album-card"
              layout
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedAlbum(album)}
            >
              <img src={album.coverImage} alt={album.title} />
              <h3>{album.title}</h3>
              <p>{album.description}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {selectedAlbum && (
        <Lightbox
          open={lightboxIndex >= 0}
          index={lightboxIndex}
          close={() => setLightboxIndex(-1)}
          slides={slides}
        />
      )}
    </motion.div>
  );
};

export default Photos;
