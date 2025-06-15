// frontend/src/components/admin/Students/StudentTransport.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from '@react-google-maps/api';
import {
  DirectionsBus,
  LocationOn,
  Schedule,
  MyLocation,
} from '@mui/icons-material';
import { useStudent } from './context/StudentContext';
import { LocationService } from '../../../services/LocationService';
import { calculateETA, optimizeRoute } from '../../../utils/transportUtils';
import { transportNotificationService } from '../../../services/TransportNotificationService';

// Update this with your actual Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const StudentTransport = () => {
  const { currentUser } = useStudent();
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [directions, setDirections] = useState(null);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [busCapacity, setBusCapacity] = useState({});
  const [alertSettings, setAlertSettings] = useState({
    arrivalThreshold: 500, // meters
    notifyBeforeArrival: 5, // minutes
    enablePickupAlerts: true,
    enableDropAlerts: true,
    enableDepartureAlerts: true
  });
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const mapRef = useRef(null);
  const [mapsError, setMapsError] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
  };

  const defaultCenter = {
    lat: 20.5937, // Default center coordinates
    lng: 78.9629,
  };

  useEffect(() => {
    fetchTransportData();
    initializeUserLocation();
    startRealTimeTracking();
  }, []);

  useEffect(() => {
    const subscription = LocationService.getLocationUpdates()
      .subscribe(update => {
        updateBusLocation(update);
        checkProximityAlerts(update);
      });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setMapsError('Google Maps API key is not configured');
      console.error('Missing Google Maps API key');
    }
  }, []);

  const fetchTransportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const [busesResponse, stopsResponse] = await Promise.all([
        fetch('/api/v1/admin/transport/buses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/v1/admin/transport/stops', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!busesResponse.ok || !stopsResponse.ok) {
        throw new Error('Failed to fetch transport data');
      }

      const busesData = await busesResponse.json();
      const stopsData = await stopsResponse.json();

      if (busesData.success && stopsData.success) {
        setBuses(busesData.data);
        setStops(stopsData.data);
      } else {
        throw new Error('Invalid data received from server');
      }
    } catch (error) {
      console.error('Transport data fetch error:', error);
      setError(error.message || 'Failed to fetch transport data');
    } finally {
      setLoading(false);
    }
  };

  const initializeUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setError('Unable to get your location');
        }
      );
    }
  };

  const startRealTimeTracking = () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.REACT_APP_WS_HOST || window.location.hostname;
      const wsPort = process.env.REACT_APP_WS_PORT || '5000';
      const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/api/v1/transport/tracking?token=${token}`;

      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setError(null);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'locationUpdate') {
            updateBusLocation(data.busId, data.location);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Retrying...');
        // Implement reconnection logic
        setTimeout(() => startRealTimeTracking(), 5000);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        // Implement reconnection logic
        setTimeout(() => startRealTimeTracking(), 5000);
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setError('Failed to connect to tracking server');
    }
  };

  const updateBusLocation = async (busId, location) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/admin/transport/location/${busId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update bus location');
      }

      const data = await response.json();
      if (data.success) {
        setBuses(prevBuses =>
          prevBuses.map(bus =>
            bus.id === busId
              ? { ...bus, location: data.data.location }
              : bus
          )
        );
      }
    } catch (error) {
      console.error('Location update error:', error);
    }
  };

  const calculateRoute = async (origin, destination) => {
    const directionsService = new window.google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setDirections(result);
    } catch (err) {
      setError('Failed to calculate route');
    }
  };

  const checkProximityAlerts = async (busLocation) => {
    if (!alertSettings.enablePickupAlerts && !alertSettings.enableDropAlerts) return;

    stops.forEach(async (stop) => {
      const distance = calculateDistance(busLocation, stop.location);
      
      if (distance <= alertSettings.arrivalThreshold) {
        const busInfo = buses.find(b => b.id === busLocation.busId);
        const journeyType = busInfo?.journeyType; // 'pickup' or 'drop'

        if ((journeyType === 'pickup' && alertSettings.enablePickupAlerts) ||
            (journeyType === 'drop' && alertSettings.enableDropAlerts)) {
          
          await transportNotificationService.sendBusArrivalAlert(
            busLocation.busId,
            stop.id,
            journeyType
          );
        }
      }
    });
  };

  const handleBusDeparture = async (busId) => {
    if (!alertSettings.enableDepartureAlerts) return;

    await transportNotificationService.sendBusDepartureAlert(
      busId,
      currentUser.schoolId
    );
  };

  const handleAlertSettingsUpdate = async (newSettings) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/v1/admin/transport/alerts', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to update alert settings');
      }

      const data = await response.json();
      if (data.success) {
        setAlertSettings(newSettings);
        setShowAlertSettings(false);
      }
    } catch (error) {
      console.error('Settings update error:', error);
      setError('Failed to update alert settings');
    }
  };

  const fetchRouteHistory = async (busId, date) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/admin/transport/history?busId=${busId}&date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch route history');
      }

      const data = await response.json();
      if (data.success) {
        setRouteHistory(data.data);
      }
    } catch (error) {
      console.error('History fetch error:', error);
      setError('Failed to fetch route history');
    }
  };

  const BusTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bus Number</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Driver</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>ETA</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {buses.map((bus) => (
            <TableRow key={bus.id}>
              <TableCell>{bus.number}</TableCell>
              <TableCell>{bus.route}</TableCell>
              <TableCell>{bus.driver}</TableCell>
              <TableCell>
                <Chip
                  label={bus.status}
                  color={bus.status === 'On Time' ? 'success' : 'warning'}
                />
              </TableCell>
              <TableCell>{bus.eta}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setSelectedBus(bus);
                    calculateRoute(bus.location, userLocation);
                  }}
                >
                  Track
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const StopsList = () => (
    <Grid container spacing={2}>
      {stops.map((stop) => (
        <Grid item xs={12} sm={6} md={4} key={stop.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {stop.name}
              </Typography>
              <Typography color="textSecondary">
                Next Bus: {stop.nextBus}
              </Typography>
              <Typography color="textSecondary">
                ETA: {stop.eta}
              </Typography>
              <Button
                startIcon={<LocationOn />}
                onClick={() => {
                  setSelectedStop(stop);
                  mapRef.current?.panTo(stop.location);
                }}
              >
                Show on Map
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderAlertSettings = () => (
    <Dialog open={showAlertSettings} onClose={() => setShowAlertSettings(false)}>
      <DialogTitle>Alert Settings</DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={alertSettings.enablePickupAlerts}
                onChange={(e) => setAlertSettings(prev => ({
                  ...prev,
                  enablePickupAlerts: e.target.checked
                }))}
              />
            }
            label="Pickup Alerts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={alertSettings.enableDropAlerts}
                onChange={(e) => setAlertSettings(prev => ({
                  ...prev,
                  enableDropAlerts: e.target.checked
                }))}
              />
            }
            label="Drop Alerts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={alertSettings.enableDepartureAlerts}
                onChange={(e) => setAlertSettings(prev => ({
                  ...prev,
                  enableDepartureAlerts: e.target.checked
                }))}
              />
            }
            label="Departure Alerts"
          />
          {/* Add more alert settings */}
        </FormGroup>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Add Alert Settings button to the header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Transport Tracking System
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setShowAlertSettings(true)}
          >
            Alert Settings
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {mapsError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {mapsError}
          </Alert>
        ) : (
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            onError={(error) => {
              console.error('Google Maps loading error:', error);
              setMapsError('Failed to load Google Maps: Invalid API key');
            }}
            onLoad={() => {
              console.log('Google Maps loaded successfully');
              setMapsError(null);
            }}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLocation || defaultCenter}
              zoom={13}
              onLoad={map => {
                mapRef.current = map;
              }}
              options={{
                fullscreenControl: true,
                streetViewControl: false,
                mapTypeControl: true,
                zoomControl: true,
              }}
            >
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: '/images/user-location.png',
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                />
              )}

              {buses.map((bus) => (
                <Marker
                  key={bus.id}
                  position={bus.location}
                  icon={{
                    url: '/images/bus-icon.png',
                    scaledSize: new window.google.maps.Size(35, 35),
                  }}
                  onClick={() => setSelectedBus(bus)}
                />
              ))}

              {stops.map((stop) => (
                <Marker
                  key={stop.id}
                  position={stop.location}
                  icon={{
                    url: '/images/bus-stop.png',
                    scaledSize: new window.google.maps.Size(25, 25),
                  }}
                  onClick={() => setSelectedStop(stop)}
                />
              ))}

              {selectedBus && (
                <InfoWindow
                  position={selectedBus.location}
                  onCloseClick={() => setSelectedBus(null)}
                >
                  <div>
                    <h3>Bus {selectedBus.number}</h3>
                    <p>Driver: {selectedBus.driver}</p>
                    <p>Status: {selectedBus.status}</p>
                    <p>ETA: {selectedBus.eta}</p>
                  </div>
                </InfoWindow>
              )}

              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    polylineOptions: {
                      strokeColor: '#2196F3',
                      strokeWeight: 5,
                    },
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        )}

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Active Buses
            </Typography>
            <BusTable />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Bus Stops
            </Typography>
            <StopsList />
          </Grid>
        </Grid>

        {/* Real-time Updates Dialog */}
        <Dialog
          open={Boolean(selectedBus)}
          onClose={() => setSelectedBus(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Real-time Updates - Bus {selectedBus?.number}
          </DialogTitle>
          <DialogContent>
            {/* Add real-time updates content */}
          </DialogContent>
        </Dialog>

        {/* Add Alert Settings Dialog */}
        {renderAlertSettings()}
      </Paper>
    </Box>
  );
};

export default StudentTransport;