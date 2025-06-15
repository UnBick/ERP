import React, { useState, useEffect } from 'react';
import ApiService from '../../../utils/ApiService';
import '../styles/GallerySlider.css';

const GallerySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images] = useState([
    { url: 'https://via.placeholder.com/800x400?text=School+Event+1', alt: 'School Event 1' },
    { url: 'https://via.placeholder.com/800x400?text=School+Event+2', alt: 'School Event 2' },
    { url: 'https://via.placeholder.com/800x400?text=School+Event+3', alt: 'School Event 3' },
    { url: 'https://via.placeholder.com/800x400?text=School+Event+4', alt: 'School Event 4' },
  ]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className="gallery-slider">
      <h2 data-aos="fade-up">School Life</h2>
      <div className="slider-container">
        <button className="slider-btn prev-btn" onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <div 
          className="slider" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={image.alt}
            />
          ))}
        </div>
        <button className="slider-btn next-btn" onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>
  );
};

export default GallerySlider;
