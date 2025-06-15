import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedNews, setSelectedNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await ApiService.getNews();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const years = [...new Set(news.map(item => 
    new Date(item.date).getFullYear()
  ))].sort((a, b) => b - a);

  const filteredNews = news.filter(item => 
    new Date(item.date).getFullYear() === selectedYear
  );

  return (
    <motion.div 
      className="news-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>News & Media Coverage</h1>

      <div className="year-filter">
        {years.map(year => (
          <button
            key={year}
            className={`year-btn ${selectedYear === year ? 'active' : ''}`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      <motion.div 
        className="news-grid"
        layout
      >
        {filteredNews.map(item => (
          <motion.article
            key={item._id}
            className="news-card"
            layout
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedNews(item)}
          >
            {item.image && (
              <div className="news-image">
                <img src={item.image} alt={item.title} />
              </div>
            )}
            <div className="news-content">
              <span className="news-date">
                {new Date(item.date).toLocaleDateString()}
              </span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="news-source">
                {item.source && (
                  <span>
                    <i className="fas fa-newspaper"></i> {item.source}
                  </span>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>

      {selectedNews && (
        <motion.div 
          className="news-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedNews(null)}>
              <i className="fas fa-times"></i>
            </button>
            {/* Full news content */}
            <h2>{selectedNews.title}</h2>
            <div className="news-details" dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default News;
