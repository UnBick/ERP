import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
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
  Notifications,
  Timer,
} from '@mui/icons-material';
import { getApiUrl } from '../../../config/apiConfig';


const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const BusTracking = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [directions, setDirections] = useState(null);
  const [nextStop, setNextStop] = useState(null);
  const [eta, setEta] = useState(null);
  const [busInfo, setBusInfo] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const mapRef = useRef(null);

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
  };

  const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629,
  };

  useEffect(() => {
    initializeTracking();
    getUserLocation();
    return () => {
      // Cleanup WebSocket connection
    };
  }, []);

  const initializeTracking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        getApiUrl('/api/v1/parent/transport/bus-location'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const { location, nextStop, eta, routeInfo, driverInfo, busInfo } = response.data.data;
        setBusLocation(location);
        setNextStop(nextStop);
        setEta(eta);
        setBusInfo({ ...busInfo, driverInfo });
        
        // Initialize WebSocket connection
        initializeWebSocket(routeInfo.busNumber);
      }
    } catch (error) {
      setError('Failed to initialize bus tracking');
    } finally {
      setLoading(false);
    }
  };

  const initializeWebSocket = (busNumber) => {
    const ws = new WebSocket(`ws://localhost:5000/ws/bus-tracking/${busNumber}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleLocationUpdate(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Lost connection to bus tracking service');
    };

    return () => {
      ws.close();
    };
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => setError('Unable to get your location')
      );
    }
  };

  const handleLocationUpdate = (data) => {
    setBusLocation(data.location);
    setNextStop(data.nextStop);
    setEta(data.eta);

    if (notificationsEnabled) {
      checkProximityAlert(data.location);
    }
  };

  const checkProximityAlert = (location) => {
    if (userLocation && calculateDistance(location, userLocation) <= 1000) { // 1km
      sendNotification('Bus is approaching your stop!');
    }
  };

  const calculateRoute = async () => {
    if (!busLocation || !userLocation) return;

    const directionsService = new window.google.maps.DirectionsService();
    try {
      const result = await directionsService.route({
        origin: busLocation,
        destination: userLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });
      setDirections(result);
    } catch (error) {
      setError('Error calculating route');
    }
  };

  const toggleNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    } catch (error) {
      setError('Error enabling notifications');
    }
  };

  const sendNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification('School Bus Alert', {
        body: message,
        icon: '/bus-icon.png'
      });
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Bus Tracking
            </Typography>
            <Button
              startIcon={<Notifications />}
              onClick={toggleNotifications}
              color={notificationsEnabled ? 'success' : 'primary'}
              sx={{ mb: 2 }}
            >
              {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <LoadScript 
              googleMapsApiKey={GOOGLE_MAPS_API_KEY}
              loadingElement={<CircularProgress />}
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={busLocation || defaultCenter}
                zoom={13}
                onLoad={map => {
                  mapRef.current = map;
                }}
              >
                {busLocation && (
                  <Marker
                    position={busLocation}
                    icon={{
                      url: '/bus-icon.png',
                      scaledSize: new window.google.maps.Size(40, 40),
                    }}
                    onClick={() => setSelectedBus(busInfo)}
                  />
                )}

                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: '/home-icon.png',
                      scaledSize: new window.google.maps.Size(30, 30),
                    }}
                  />
                )}

                {selectedBus && (
                  <InfoWindow
                    position={busLocation}
                    onCloseClick={() => setSelectedBus(null)}
                  >
                    <div>
                      <h3>Bus {selectedBus.number}</h3>
                      <p>Driver: {selectedBus.driverName}</p>
                      <p>Next Stop: {nextStop?.name}</p>
                      <p>ETA: {eta} minutes</p>
                    </div>
                  </InfoWindow>
                )}

                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </LoadScript>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bus Information
                </Typography>
                {busInfo && (
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Bus Number" 
                        secondary={busInfo.number} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Driver" 
                        secondary={busInfo.driverName} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Contact" 
                        secondary={busInfo.driverContact} 
                      />
                    </ListItem>
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Journey Status
                </Typography>
                {nextStop && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn color="primary" sx={{ mr: 1 }} />
                      <Typography>
                        Next Stop: {nextStop.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Timer color="primary" sx={{ mr: 1 }} />
                      <Typography>
                        ETA: {eta} minutes
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BusTracking;
