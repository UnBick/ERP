import { Subject } from 'rxjs';

const locationSubject = new Subject();

export const LocationService = {
  startTracking: (busId) => {
    // WebSocket connection for real-time tracking
    const ws = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      locationSubject.next(data);
    };

    return () => ws.close();
  },

  getLocationUpdates: () => locationSubject.asObservable(),
};
