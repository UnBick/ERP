import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/Assemblies.css';

const Assemblies = () => {
  const [assemblies, setAssemblies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [selectedAssembly, setSelectedAssembly] = useState(null);

  useEffect(() => {
    const fetchAssemblies = async () => {
      try {
        const data = await ApiService.getAssemblies();
        setAssemblies(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assemblies:', error);
        setLoading(false);
      }
    };
    fetchAssemblies();
  }, []);

  const filteredAssemblies = assemblies.filter(assembly => {
    const assemblyDate = new Date(assembly.date);
    const today = new Date();
    return filter === 'upcoming' ? assemblyDate >= today : assemblyDate < today;
  });

  return (
    <motion.div 
      className="assemblies-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>School Assemblies</h1>
      
      <div className="filter-controls">
        <button 
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={filter === 'past' ? 'active' : ''}
          onClick={() => setFilter('past')}
        >
          Past
        </button>
      </div>

      <motion.div 
        className="assembly-timeline"
        layout
      >
        <AnimatePresence>
          {filteredAssemblies.map(assembly => (
            <motion.div
              key={assembly._id}
              className="assembly-card"
              layout
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedAssembly(assembly)}
            >
              {/* Enhanced assembly card content */}
              <div className="assembly-content">
                <div className="assembly-date">
                  <span className="day">{new Date(assembly.date).getDate()}</span>
                  <span className="month">{new Date(assembly.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="assembly-info">
                  <h3>{assembly.theme}</h3>
                  <p className="incharge">Led by: {assembly.incharge?.name}</p>
                  {assembly.specialNote && (
                    <div className="special-note">{assembly.specialNote}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Assembly Details Modal */}
      {selectedAssembly && (
        <motion.div 
          className="assembly-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal content */}
          <div className="modal-content">
            <button onClick={() => setSelectedAssembly(null)}>Close</button>
            <h2>{selectedAssembly.theme}</h2>
            {/* Additional assembly details */}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Assemblies;
