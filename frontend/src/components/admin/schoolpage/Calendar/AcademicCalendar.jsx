import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ApiService from '../../../../utils/ApiService';
import NotificationService from '../../../../utils/NotificationService';

const AcademicCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await ApiService.getCalendarEvents();
      setEvents(data.map(event => ({
        id: event._id,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        color: getEventColor(event.type)
      })));
    } catch (error) {
      NotificationService.error('Failed to fetch events');
    }
  };

  const handleEventAdd = async (info) => {
    try {
      const newEvent = {
        title: info.event.title,
        startDate: info.event.start,
        endDate: info.event.end,
        type: 'academic'
      };
      await ApiService.createCalendarEvent(newEvent);
      NotificationService.success('Event added successfully');
    } catch (error) {
      NotificationService.error('Failed to add event');
    }
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={events}
        eventAdd={handleEventAdd}
      />
    </div>
  );
};

export default AcademicCalendar;
