import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/InterHouse.css';

const InterHouse = () => {
  const [houses, setHouses] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [view, setView] = useState('standings'); // 'standings' or 'calendar'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [housesData, competitionsData] = await Promise.all([
          ApiService.getHouses(),
          ApiService.getCompetitions()
        ]);
        setHouses(housesData);
        setCompetitions(competitionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div 
      className="inter-house"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Inter-House Competitions</h1>

      <div className="view-toggle">
        <button 
          className={view === 'standings' ? 'active' : ''} 
          onClick={() => setView('standings')}
        >
          House Standings
        </button>
        <button 
          className={view === 'calendar' ? 'active' : ''} 
          onClick={() => setView('calendar')}
        >
          Competition Calendar
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'standings' ? (
          <motion.div 
            className="house-standings"
            key="standings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {houses.map(house => (
              <div 
                key={house._id} 
                className="house-card"
                style={{ borderColor: house.color }}
              >
                <h3>{house.name}</h3>
                <div className="points">{house.points} pts</div>
                <div className="achievements">
                  <span>{house.victories} Victories</span>
                  <span>{house.participation} Participations</span>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="competition-calendar"
            key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {competitions.map(competition => (
              <div key={competition._id} className="competition-card">
                <h3>{competition.name}</h3>
                <p>{competition.description}</p>
                <div className="competition-details">
                  <span>{new Date(competition.date).toLocaleDateString()}</span>
                  <span>{competition.venue}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InterHouse;
