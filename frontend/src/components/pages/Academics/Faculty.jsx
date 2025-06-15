import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/Faculty.css';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const data = await ApiService.getFacultyList();
        setFaculty(data);
      } catch (error) {
        console.error('Error fetching faculty:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || member.department === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div 
      className="faculty-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Our Faculty</h1>
      
      <div className="faculty-controls">
        <input
          type="text"
          placeholder="Search faculty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="department-filter"
        >
          <option value="all">All Departments</option>
          <option value="science">Science</option>
          <option value="humanities">Humanities</option>
          {/* Add more departments */}
        </select>
      </div>

      <motion.div 
        className="faculty-grid"
        layout
      >
        <AnimatePresence>
          {filteredFaculty.map(member => (
            <motion.div
              key={member._id}
              className="faculty-card"
              layout
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedMember(member)}
            >
              <img src={member.photo} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.designation}</p>
              <p>{member.qualification}</p>
              <div className="faculty-social">
                {member.email && <a href={`mailto:${member.email}`}><i className="fas fa-envelope"></i></a>}
                {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {selectedMember && (
        <motion.div 
          className="faculty-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal content */}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Faculty;
