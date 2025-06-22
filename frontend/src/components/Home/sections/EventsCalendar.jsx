import React, { useState, useEffect } from 'react';
import ApiService from '../../../utils/ApiService';
import '../styles/EventsCalendar.css';

const EventsCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const fetchEvents = async () => {
    try {
      const data = await ApiService.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setEvents([]);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const hasEvent = (day) => {
    if (!Array.isArray(events)) return false;
    return events.some(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonth.getMonth() &&
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  return (
    <section className="events-calendar">
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2>{currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day day-header">{day}</div>
          ))}
          {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, index) => {
            const day = index + 1;
            return (
              <div key={day} className={`calendar-day ${hasEvent(day) ? 'has-event' : ''}`}>
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventsCalendar;
