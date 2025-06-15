import { Subject } from 'rxjs';

class TransportNotificationService {
  notifications$ = new Subject();
  
  sendNotification(type, message, recipients) {
    return fetch('/api/notifications/transport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        type,
        message,
        recipients,
        channel: ['push', 'sms', 'email']
      })
    });
  }

  sendBusArrivalAlert(busId, stopId, type) {
    return this.sendNotification(
      'BUS_ARRIVAL',
      `Bus ${busId} has arrived at stop ${stopId}`,
      { stopId, type }
    );
  }

  sendBusDepartureAlert(busId, schoolId) {
    return this.sendNotification(
      'BUS_DEPARTURE',
      `Bus ${busId} has departed from school`,
      { schoolId }
    );
  }
}

export const transportNotificationService = new TransportNotificationService();
