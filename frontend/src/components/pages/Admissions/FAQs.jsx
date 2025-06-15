import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/FAQs.css';

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const data = await ApiService.getFAQs();
        setFaqs(data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'admission', label: 'Admission Process' },
    { id: 'academic', label: 'Academic' },
    { id: 'facilities', label: 'Facilities' }
  ];

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="faqs-page">
      <h1>Frequently Asked Questions</h1>

      <div className="faq-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <motion.div className="faq-list" layout>
        <AnimatePresence>
          {filteredFaqs.map(faq => (
            <motion.div
              key={faq._id}
              className="faq-item"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                className={`faq-question ${expandedId === faq._id ? 'active' : ''}`}
                onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
              >
                <span>{faq.question}</span>
                <i className={`fas fa-chevron-${expandedId === faq._id ? 'up' : 'down'}`}></i>
              </button>
              
              <AnimatePresence>
                {expandedId === faq._id && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default FAQs;
