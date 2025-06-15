// frontend/src/components/admin/Staff/StaffTransport.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { DirectionsBus, LocationOn } from '@mui/icons-material';

const StaffTransport = () => {
  const [selectedRoute, setSelectedRoute] = useState('');
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [directions, setDirections] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = {
    lat: 20.5937, // Default center (can be changed based on school location)
    lng: 78.9629
  };

  useEffect(() => {
    fetchRoutes();
    initializeRealTimeTracking();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL || '';
      const url = `${baseUrl}/api/v1/admin/staff/transport/routes`;
      
      console.log('Fetching routes from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Response:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`Failed to fetch routes: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Invalid response format');
      }

      if (data.success) {
        setRoutes(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch routes');
      }
    } catch (error) {
      console.error('Error in fetchRoutes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteChange = async (routeId) => {
    setSelectedRoute(routeId);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const stopsResponse = await fetch(`/api/v1/admin/staff/transport/routes/${routeId}/stops`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!stopsResponse.ok) {
        throw new Error('Failed to fetch route stops');
      }

      const stopsData = await stopsResponse.json();
      if (stopsData.success) {
        // Ensure each stop has a unique ID
        const stopsWithIds = stopsData.data.map((stop, index) => ({
          ...stop,
          id: stop.id || `stop_${index}`
        }));
        setStops(stopsWithIds);
        
        // Only calculate route if Google Maps is loaded
        if (window.google && window.google.maps) {
          calculateRoute(stopsWithIds);
        }
      }
    } catch (error) {
      setError('Error loading route details');
    } finally {
      setLoading(false);
    }
  };

  const initializeRealTimeTracking = () => {
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/transport`);
    
    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'BUS_LOCATION_UPDATE' && data.routeId === selectedRoute) {
          setBusLocation({
            lat: data.latitude,
            lng: data.longitude
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    return () => {
      ws.close();
    };
  };

  const calculateRoute = async (stopsData) => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      if (stopsData.length < 2) {
        console.error('At least 2 stops are required for a route');
        return;
      }

      const waypoints = stopsData.slice(1, -1).map(stop => ({
        location: { lat: stop.latitude, lng: stop.longitude },
        stopover: true
      }));

      const result = await directionsService.route({
        origin: { lat: stopsData[0].latitude, lng: stopsData[0].longitude },
        destination: { 
          lat: stopsData[stopsData.length - 1].latitude, 
          lng: stopsData[stopsData.length - 1].longitude 
        },
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING
      });

      setDirections(result);
    } catch (error) {
      console.error('Error calculating route:', error);
      setError('Failed to calculate route');
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Transport Management
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Route</InputLabel>
              <Select
                value={selectedRoute}
                onChange={(e) => handleRouteChange(e.target.value)}
              >
                {routes.map((route) => (
                  <MenuItem key={route.id} value={route.id}>
                    {route.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedRoute && (
            <Grid item xs={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Stop Name</TableCell>
                      <TableCell>Arrival Time</TableCell>
                      <TableCell>Departure Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stops.map((stop) => (
                      <TableRow key={stop.id || `stop_${stop.name}_${stop.sequence}`}>
                        <TableCell>{stop.name}</TableCell>
                        <TableCell>{stop.arrivalTime}</TableCell>
                        <TableCell>{stop.departureTime}</TableCell>
                        <TableCell>{stop.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {directions && (
            <Grid item xs={12}>
              <LoadScript 
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                onLoad={() => console.log('Google Maps script loaded')}
                onError={(error) => console.error('Error loading Google Maps:', error)}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={13}
                >
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#1976d2'
                      }
                    }}
                  />
                  {stops.map((stop) => (
                    <Marker
                      key={stop.id}
                      position={{ lat: stop.latitude, lng: stop.longitude }}
                      title={stop.name}
                    />
                  ))}
                  {busLocation && (
                    <Marker
                      position={busLocation}
                      icon={{
                        url: '/bus-icon.png',
                        scaledSize: new google.maps.Size(40, 40)
                      }}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            </Grid>
          )}
        </Grid>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
          >
            <Alert onClose={() => setError(null)} severity="error">
              {error}
            </Alert>
          </Snackbar>
        )}

        {success && (
          <Snackbar
            open={true}
            autoHideDuration={6000}
            onClose={() => setSuccess(null)}
          >
            <Alert onClose={() => setSuccess(null)} severity="success">
              {success}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default StaffTransport;