import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Hero.css';
import Admissions from '../sections/Admissions';

const Hero = () => {
  const navigate = useNavigate();

  const handleAdmissionClick = (e) => {
    e.preventDefault();
    navigate('/admissions');
  };

  return (
    <section className="hero">
      <video className="hero-video" autoPlay muted loop>
        <source src="/assets/school-life.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay"></div>
      <div className="hero-content" data-aos="fade-up">
        <h1>Welcome to Our School</h1>
        <p>Nurturing Minds, Building Futures</p>
        <div className="cta-buttons">
          <Link 
            to="/admissions" 
            className="cta-btn"
            onClick={handleAdmissionClick}
          >
            Apply Now
          </Link>
          <Link to="/virtual-tour" className="cta-btn secondary">
            Take Virtual Tour
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;