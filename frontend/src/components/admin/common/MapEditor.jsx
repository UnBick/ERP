import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import './styles/MapEditor.css';

const MapEditor = ({ location, onLocationChange }) => {
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [address, setAddress] = useState('');
  const [center, setCenter] = useState(location || { lat: 28.6139, lng: 77.2090 }); // Default to Delhi

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const handlePlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry) return;

      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      setCenter(newLocation);
      onLocationChange(newLocation);
      setAddress(place.formatted_address);
    }
  };

  const handleMapClick = (event) => {
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    setCenter(newLocation);
    onLocationChange(newLocation);

    // Reverse geocoding to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: newLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
      }
    });
  };

  return (
    <div className="map-editor">
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={['places']}
      >
        <div className="search-box-container">
          <StandaloneSearchBox
            onLoad={box => setSearchBox(box)}
            onPlacesChanged={handlePlacesChanged}
          >
            <input
              type="text"
              placeholder="Search location"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="location-search"
            />
          </StandaloneSearchBox>
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          onLoad={map => setMap(map)}
          onClick={handleMapClick}
        >
          <Marker
            position={center}
            draggable={true}
            onDragEnd={(e) => {
              const newLocation = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              onLocationChange(newLocation);
            }}
          />
        </GoogleMap>
      </LoadScript>

      <div className="coordinates-display">
        <p>Latitude: {center.lat.toFixed(6)}</p>
        <p>Longitude: {center.lng.toFixed(6)}</p>
      </div>
    </div>
  );
};

export default MapEditor;
