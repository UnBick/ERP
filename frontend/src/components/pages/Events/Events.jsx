import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ApiService from '../../../utils/ApiService';
import './styles/Events.css';

const Events = () => {
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await ApiService.getEvents();
        const now = new Date();
        
        const categorizedEvents = data.reduce((acc, event) => {
          const eventDate = new Date(event.date);
          if (eventDate > now) {
            acc.upcoming.push(event);
          } else {
            acc.past.push(event);
          }
          return acc;
        }, { upcoming: [], past: [] });

        setEvents(categorizedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const eventDates = events.upcoming.map(event => new Date(event.date));

  return (
    <motion.div 
      className="events-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="events-layout">
        <aside className="events-calendar">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date }) => {
              return eventDates.some(eventDate => 
                eventDate.toDateString() === date.toDateString()
              ) ? 'has-event' : null;
            }}
          />
        </aside>

        <main className="events-content">
          <motion.section 
            className="upcoming-events"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2>Upcoming Events</h2>
            <div className="events-grid">
              {events.upcoming.map(event => (
                <div key={event._id} className="event-card upcoming">
                  <div className="event-date">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  {event.registrationRequired && (
                    <button className="register-btn">Register Now</button>
                  )}
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section 
            className="past-events"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Past Events</h2>
            <div className="events-grid">
              {events.past.map(event => (
                <div key={event._id} className="event-card past">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </main>
      </div>

      {selectedEvent && (
        <motion.div 
          className="event-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Event details modal */}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Events;
