import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import EventEditor from '../../../common/EventEditor';
import './styles/InterHouse.css';

const InterHouse = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [houses, setHouses] = useState([]);

  const validationRules = {
    event: {
      required: ['title', 'date', 'type', 'participants'],
      participants: { min: 1 },
      results: { required: true }
    }
  };

  const handleEventUpdate = async (eventData) => {
    try {
      // API call to update event
      toast.success('Event updated successfully');
      setSelectedEvent(null);
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  return (
    <AdminLayout title="Inter-House Activities">
      <div className="interhouse-manager">
        <div className="house-points-summary">
          {houses.map(house => (
            <HousePointCard key={house.id} house={house} />
          ))}
        </div>

        {selectedEvent ? (
          <EventEditor
            event={selectedEvent}
            houses={houses}
            onSave={handleEventUpdate}
            onCancel={() => setSelectedEvent(null)}
            validationRules={validationRules.event}
          />
        ) : (
          <EventsList
            events={events}
            onEdit={setSelectedEvent}
            onAdd={() => setSelectedEvent({})}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default InterHouse;
