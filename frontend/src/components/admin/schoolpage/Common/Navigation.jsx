import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = {
    about: {
      title: 'About',
      items: [
        { title: 'About School', path: '/about' },
        { title: "Principal's Message", path: '/about/principal-message' },
        { title: 'Philosophy & Mission', path: '/about/philosophy-mission' },
        { title: 'Infrastructure', path: '/about/infrastructure' },
        { title: 'Student Council', path: '/about/student-council' },
        { title: 'Awards & Recognition', path: '/about/awards' },
        { title: 'Mandatory Disclosure', path: '/about/mandatory-disclosure' }
      ]
    },
    academics: {
      title: 'Academics',
      items: [
        { title: 'Curriculum', path: '/academics/curriculum' },
        { title: 'Faculty', path: '/academics/faculty' },
        { title: 'Syllabus', path: '/academics/syllabus' },
        { title: 'Question Papers', path: '/academics/question-papers' },
        { title: 'Scholar Badge', path: '/academics/scholar-badge' },
        { title: 'Art Integration', path: '/academics/art-integration' }
      ]
    },
    activities: {
      title: 'Activities',
      items: [
        { title: 'Clubs', path: '/activities/clubs' },
        { title: 'Workshops', path: '/activities/workshops' },
        { title: 'Inter House', path: '/activities/inter-house' },
        { title: 'Assemblies', path: '/activities/assemblies' },
        { title: 'Sports', path: '/activities/sports' },
        { title: 'Cultural', path: '/activities/cultural' }
      ]
    },
    gallery: {
      title: 'Gallery',
      items: [
        { title: 'Photo Gallery', path: '/gallery/photos' },
        { title: 'Video Gallery', path: '/gallery/videos' },
        { title: 'Events', path: '/gallery/events' },
        { title: 'News & Media', path: '/gallery/news' }
      ]
    },
    admissions: {
      title: 'Admissions',
      items: [
        { title: 'Admission Process', path: '/admissions/process' },
        { title: 'Apply Online', path: '/admissions/apply' },
        { title: 'Fee Structure', path: '/admissions/fees' },
        { title: 'FAQs', path: '/admissions/faqs' }
      ]
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src="/images/logo.png" alt="School Logo" />
        </Link>
      </div>
      <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <ul className="main-menu">
          {Object.entries(navItems).map(([key, category]) => (
            <li key={key} className="nav-item dropdown">
              <span className="nav-link">{category.title}</span>
              <div className="dropdown-content">
                <div className="dropdown-grid">
                  {category.items.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          ))}
          <li className="nav-item">
            <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </li>
          <li className="nav-item portal-access">
            <Link 
              to="/login" 
              className="login-btn"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-user"></i>
              <span>Portal Login</span>
            </Link>
          </li>
        </ul>
      </div>

      <button 
        className="nav-toggle"
        onClick={handleMenuToggle}
        aria-label="Toggle navigation"
      >
        <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </span>
      </button>
    </nav>
  );
};

export default Navigation;
