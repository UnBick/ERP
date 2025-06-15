import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import DocumentViewer from '../../common/DocumentViewer';
import './styles/QuestionPapers.css';

const QuestionPapers = () => {
  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    year: '',
    term: ''
  });
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getQuestionPapers(filters);
      setPapers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching papers:', error);
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter(paper => 
    paper.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      className="question-papers"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Previous Year Question Papers</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search papers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="advanced-filters">
        <select onChange={(e) => setFilters({ ...filters, class: e.target.value })}>
          <option value="">Select Class</option>
          <option value="10">Class X</option>
          <option value="12">Class XII</option>
        </select>
        <select onChange={(e) => setFilters({ ...filters, subject: e.target.value })}>
          <option value="">Select Subject</option>
          <option value="mathematics">Mathematics</option>
          <option value="science">Science</option>
        </select>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
        >
          Search
        </motion.button>
      </div>

      <div className="papers-list">
        {filteredPapers.map(paper => (
          <div key={paper._id} className="paper-item">
            <DocumentViewer 
              url={paper.fileUrl}
              title={paper.title}
            />
            <div className="paper-info">
              <p>Year: {paper.year}</p>
              <p>Subject: {paper.subject}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuestionPapers;
