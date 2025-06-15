import React, { useEffect, useState, useCallback } from 'react';
import ApiService from '../../../utils/ApiService';
import '../styles/NoticeBoard.css';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [topPosition, setTopPosition] = useState(100);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight; 
    
    // Calculate new position based on scroll
    const newTop = Math.max(
      100,
      Math.min(windowHeight - 400, scrollY * 0.5 + 100)
    );
    
    setTopPosition(newTop);

    // Hide notice board near footer
    if (scrollY + windowHeight > documentHeight - 200) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await ApiService.getNotices();
        setNotices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error:', error);
        setNotices([]);
      }
    };
    fetchNotices();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (!Array.isArray(notices) || notices.length === 0) {
    return null; // or return a placeholder
  }

  return (
    <div 
      className={`notice-board floating ${!isVisible ? 'hidden' : ''}`}
      style={{ top: `${topPosition}px` }}
    >
      <div className="notice-header">
        <h3>Latest Notices</h3>
      </div>
      <div className="notice-content">
        <marquee direction="up" scrollamount="2" onMouseOver={(e) => e.target.stop()} onMouseOut={(e) => e.target.start()}>
          {notices.map(notice => (
            <p key={notice._id}>📢 {notice.title}</p>
          ))}
        </marquee>
      </div>
    </div>
  );
};

export default NoticeBoard;
