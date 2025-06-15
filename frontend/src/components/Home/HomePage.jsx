import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Update import to include useNavigate
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';  // Add this import
import { faUser, faBell } from '@fortawesome/free-solid-svg-icons';  // Add this import
import Navigation from "../admin/schoolpage/Common/Navigation";
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import Footer from './sections/Footer';

// Initialize dayjs plugins
dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.locale('en');

import "./styles/HomePage.css";

export default function AnimatedSchoolSite() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [backgroundClass, setBackgroundClass] = useState("background-white");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [areButtonsVisible, setAreButtonsVisible] = useState(true);
  const [isNoticeVisible, setIsNoticeVisible] = useState(false);
  const noticeTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const achievements = [
    { id: 1, number: "98%", title: "Academic Excellence", description: "Board Exam Success Rate" },
    { id: 2, number: "50+", title: "Sports Championships", description: "National & State Trophies" },
    { id: 3, number: "25+", title: "Research Projects", description: "International Collaborations" },
    { id: 4, number: "100+", title: "Cultural Awards", description: "Competition Victories" }
  ];

  const notices = [
    {
      id: 1,
      title: "New admission dates announced for 2024-25",
      link: "/admissions/dates",
      date: "Dec 10, 2023",
      type: "Admission"
    },
    {
      id: 2,
      title: "Annual Sports Day on December 15th",
      link: "/events/sports-day",
      date: "Dec 8, 2023",
      type: "Event"
    },
    {
      id: 3,
      title: "Parent-Teacher Meeting scheduled for next week",
      link: "/events/ptm",
      date: "Dec 7, 2023",
      type: "Meeting"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, rotateX: -25, scale: 0.9 },
    visible: {
      opacity: 1,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 100,
      rotateY: -45,
      rotateX: 45,
      scale: 0.8
    },
    visible: { 
      opacity: 1,
      y: 0,
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        mass: 1
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x - 0.5);
      mouseY.set(y - 0.5);
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setIsContentVisible(true);
      setBackgroundClass("background-transition");
    }, 1500);
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      if (isTransitioning) return;

      if (e.deltaY > 0) { // Scrolling down
        setCurrentSection(prev => {
          if (prev >= 5) return 5; // Updated max section to 5
          return prev + 1;
        });
        setIsTransitioning(true);
      } else if (e.deltaY < 0) { // Scrolling up
        setCurrentSection(prev => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
        setIsTransitioning(true);
      }
      
      // Reset transition lock after animation
      setTimeout(() => setIsTransitioning(false), 500);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isTransitioning]);

  // 3D effect for the logo
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  const handleMouseMoveLogo = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const xPos = e.clientX - left - width / 2;
    const yPos = e.clientY - top - height / 2;
    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeaveLogo = () => {
    x.set(0);
    y.set(0);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(true);
    setAreButtonsVisible(false); // Hide buttons when menu opens
  };

  const handleNavigationLeave = () => {
    setIsMenuOpen(false);
    // Show buttons after a slight delay for smooth transition
    setTimeout(() => setAreButtonsVisible(true), 300);
  };

  const handleAdmissionClick = () => {
    setIsMenuOpen(false);
    navigate('/admissions');
  };

  const handleNoticeClick = () => {
    setIsNoticeVisible(true);
    // Clear any existing timeout
    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }
    // Set new timeout
    noticeTimeoutRef.current = setTimeout(() => {
      setIsNoticeVisible(false);
    }, 2000);
  };

  const handleNoticeHover = () => {
    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }
  };

  const handleNoticeLeave = () => {
    noticeTimeoutRef.current = setTimeout(() => {
      setIsNoticeVisible(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  // Update logo animation for better section integration
  const logoAnimation = {
    x: 0,
    y: 0,
    scale: currentSection === 0 ? 1 :
           currentSection === 5 ? 0.4 : 0.24,
    opacity: 1,
    transition: { 
      duration: 0.5,
      ease: "easeInOut"
    }
  };

  return (
    <div className="homepage-wrapper">
      <div className={`homepage-container section-${currentSection}`}>
        {/* Navigation Overlay - Updated Animation */}
        {isMenuOpen && (
          <motion.div
            className="navigation-overlay"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            onMouseLeave={handleNavigationLeave}
          >
            <Navigation />
          </motion.div>
        )}

        {/* Background Image Container */}
        <motion.div 
          className="background-image"
          animate={{
            scale: currentSection === 1 ? 0.7 : 1,
            x: currentSection === 1 ? '-30%' : '0%',
            y: currentSection === 2 ? '-100vh' : 0,
            opacity: currentSection === 2 ? 0 : 1,
            filter: `blur(${currentSection === 1 ? 0 : 8}px)`
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Updated Logo with 3D Effect */}
        <motion.img
          src="/assets/images/school-logo.png"
          alt="School Logo"
          className="school-logo"
          style={{ rotateX, rotateY }}
          animate={logoAnimation}
          transition={{ duration: 0.5 }}
        />

        {/* Main Content */}
        <motion.div
          className="main-content"
          animate={{
            y: currentSection ? '-100vh' : '0',
            opacity: currentSection ? 0 : 1
          }}
          transition={{ 
            duration: 0.3, // Reduced from 0.6
            ease: "easeOut",
            type: "tween"
          }}
        >
          {/* Updated Buttons Section */}
{isContentVisible && !isMenuOpen && (
  <motion.div
    className="header-buttons"
    initial={{ y: -50, opacity: 0 }}
    animate={{
      y: scrollProgress ? scrollProgress * 20 : 0,
      scale: scrollProgress ? 1 + scrollProgress * 0.1 : 1,
      opacity: 1
    }}
    transition={{ duration: 1 }}
            >
              <motion.button
                className="animated-button menu-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMenuToggle}
              >
                Menu
              </motion.button>
              <Link 
                to="/login" 
                className="animated-button portal-button"
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span>Portal Login</span>
              </Link>
            </motion.div>
          )}

          {/* Content Appears After Delay */}
          {isContentVisible && (
            <motion.div className="content-container">
              {/* School Name Styled Like "WELCOME" */}
              <motion.div
                className="school-name"
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <h1 data-content="DELHI PUBLIC SCHOOL">DELHI PUBLIC SCHOOL</h1>
              </motion.div>

              {/* Welcome Message */}
              <motion.div
                className="welcome-section"
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <p>Welcome to our school! Your journey to excellence starts here.</p>
                <Link 
                  to="/admissions" 
                  className="animated-button cta-btn"
                  onClick={handleAdmissionClick}
                >
                  Apply Now
                </Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* About Section */}
        <motion.div 
          className="about-content"
          initial={{ opacity: 0, y: "100vh" }}
          animate={{
            opacity: currentSection === 1 ? 1 : 0,
            y: currentSection === 2 ? "-200vh" : currentSection === 1 ? "-60%" : "100vh"
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="about-header">
            <h2>About Our School</h2>
          </div>
          <p>Welcome to [School Name], a place where academic excellence meets holistic development. We are committed to providing a nurturing and inspiring environment that fosters curiosity, creativity, and character. Our dedicated faculty, modern facilities, and well-rounded curriculum ensure that students receive a high-quality education tailored to their individual strengths. Beyond academics, we emphasize values, leadership, and extracurricular activities to prepare students for a successful future. At [School Name], we believe in shaping confident, responsible, and lifelong learners. We invite you to be a part of our vibrant learning community!</p>
        </motion.div>

        {/* Principal's Section */}
        <motion.div 
          className="principal-content"
          initial={{ opacity: 0, y: "100vh" }}
          animate={{
            opacity: currentSection === 2 ? 1 : 0,
            y: currentSection === 2 ? "0%" : "100vh"
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="principal-message">
            <h2>Principal's Message</h2>
            <p>Dear Parents and Students,</p>
            <p>Welcome to our school community. As the Principal, I am committed to fostering an environment where every student can thrive academically and personally. Our focus is on holistic development, combining academic excellence with character building.</p>
            <p>We believe in nurturing not just minds, but hearts and spirits too. Our dedicated faculty works tirelessly to ensure each student discovers their unique potential and develops the skills needed for future success.</p>
            <span className="principal-signature">Dr. Jane Smith</span>
            <span className="principal-designation">Principal</span>
          </div>
          
          <div className="principal-header">
            <motion.img
              src="/assets/images/principal.jpg"
              alt="Principal"
              className="principal-photo"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: currentSection === 2 ? 1 : 0.9,
                opacity: currentSection === 2 ? 1 : 0
              }}
              transition={{ delay: 0.2 }}
            />
          </div>
        </motion.div>

        {/* Renamed Library to Gallery Section */}
        <motion.div 
          className="gallery-grid-section"
          initial={{ opacity: 0, y: "100vh" }}
          animate={{
            opacity: currentSection === 3 ? 1 : 0,
            y: currentSection === 3 ? "0%" : "100vh"
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="gallery-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <motion.div 
                key={index}
                className={`gallery-box box${index}`}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ 
                  scale: currentSection === 3 ? 1 : 0,
                  rotate: 0
                }}
                transition={{ 
                  delay: 0.1 * index,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <img 
                  src={`/assets/images/gallery/image-${index}.jpg`} 
                  alt={`Gallery Image ${index}`} 
                />
              </motion.div>
            ))}

            <motion.div 
              className="gallery-title"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: currentSection === 3 ? 1 : 0,
                scale: currentSection === 3 ? 1 : 0.5
              }}
              transition={{ delay: 0.8 }}
            >
              <h2>School Gallery</h2>
              <p>Capturing Moments, Creating Memories</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Updated Library Section */}
        <motion.div 
          className="library-section"
          initial={{ opacity: 0, y: "100vh" }}
          animate={{
            opacity: currentSection === 4 ? 1 : 0,
            y: currentSection === 4 ? "0%" : "100vh"
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="library-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <motion.div 
                key={index}
                className={`library-box box${index}`}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ 
                  scale: currentSection === 4 ? 1 : 0,
                  rotate: 0
                }}
                transition={{ 
                  delay: 0.1 * index,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <img 
                  src={`/assets/images/library/book-${index}.jpg`} 
                  alt={`Library Section ${index}`} 
                />
              </motion.div>
            ))}

            <motion.div 
              className="library-title"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: currentSection === 4 ? 1 : 0,
                scale: currentSection === 4 ? 1 : 0.5
              }}
              transition={{ delay: 0.8 }}
            >
              <h2>School Library</h2>
              <p>A Gateway to Knowledge and Discovery</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Achievements Section */}
        <motion.div 
          ref={containerRef}
          className="achievements-section"
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: "100vh" }}
          animate={{
            opacity: currentSection === 4 ? 1 : 0,
            y: currentSection === 4 ? "0%" : "100vh"
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="achievements-container">
            <motion.h2 
              className="achievements-title"
              initial={{ opacity: 0, y: -100 }}
              animate={{ 
                opacity: currentSection === 4 ? 1 : 0,
                y: currentSection === 4 ? 0 : -100
              }}
              transition={{ type: "spring", stiffness: 70, damping: 20 }}
            >
              Our Achievements
            </motion.h2>

            <motion.div 
              className="achievements-grid"
              variants={containerVariants}
              initial="hidden"
              animate={currentSection === 4 ? "visible" : "hidden"}
            >
              {achievements.map(({ id, number, title, description }, index) => {
                const springConfig = { damping: 15, stiffness: 300 };
                const rotateXSpring = useSpring(0, springConfig);
                const rotateYSpring = useSpring(0, springConfig);

                useEffect(() => {
                  if (currentSection === 4) {
                    const unsubscribeX = mouseX.onChange(latest => rotateYSpring.set(latest * 45));
                    const unsubscribeY = mouseY.onChange(latest => rotateXSpring.set(latest * -45));
                    return () => {
                      unsubscribeX();
                      unsubscribeY();
                    };
                  }
                }, [currentSection]);

                return (
                  <motion.div
                    key={id}
                    className="achievement-card"
                    variants={cardVariants}
                    custom={index}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 15,
                      rotateX: -15,
                      z: 50
                    }}
                    style={{
                      rotateX: rotateXSpring,
                      rotateY: rotateYSpring,
                      z: 0
                    }}
                  >
                    <motion.div
                      className="card-content"
                      animate={floatingAnimation}
                    >
                      <motion.div className="achievement-stat">{number}</motion.div>
                      <motion.h3>{title}</motion.h3>
                      <motion.p>{description}</motion.p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Add Footer Section after Achievements */}
        <motion.div 
          className="footer-section-wrapper"
          initial={{ opacity: 0, y: "100vh" }}
          animate={{
            opacity: currentSection === 5 ? 1 : 0,
            y: currentSection === 5 ? "0%" : "100vh"
          }}
          transition={{ duration: 0.5 }}
        >
          <Footer />
        </motion.div>

        {/* Single Header Buttons Section */}
        {areButtonsVisible && (
          <motion.div
            className="header-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className="animated-button menu-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMenuToggle}
            >
              Menu
            </motion.button>
            <Link 
              to="/login" 
              className="animated-button portal-button"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              <span>Portal Login</span>
            </Link>
            <motion.button
              className="animated-button notice-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNoticeClick}
            >
              <FontAwesomeIcon icon={faBell} className="mr-2" />
              <span>Notices</span>
            </motion.button>
          </motion.div>
        )}

        {/* Updated Notice Dialog */}
        <AnimatePresence>
          {isNoticeVisible && (
            <motion.div
              className="notice-dialog"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              onMouseEnter={handleNoticeHover}
              onMouseLeave={handleNoticeLeave}
            >
              <div className="notice-title">
                <i className="fas fa-bell"></i>
                Latest Notices
              </div>
              <div className="notice-content">
                {notices.map(notice => (
                  <div key={notice.id} className="notice-item">
                    <i className="fas fa-circle-dot"></i>
                    <div>
                      <Link to={notice.link} className="notice-link">
                        {notice.title}
                      </Link>
                      <div className="notice-meta">
                        {notice.date} • {notice.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
