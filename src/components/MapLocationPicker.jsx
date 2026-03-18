// src/components/MapLocationPicker.jsx
import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Box, Typography, CircularProgress, Alert, TextField, Paper } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

// Default center (Nairobi, Kenya)
const defaultCenter = {
  lat: -1.286389,
  lng: 36.817223,
};

const MapLocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [markerPosition, setMarkerPosition] = useState(initialLocation || defaultCenter);
  const [address, setAddress] = useState('');
  const [map, setMap] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Get user's current location on mount if no initial location
  useEffect(() => {
    if (!initialLocation && navigator.geolocation && isLoaded) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('Got user location:', pos);
          setMarkerPosition(pos);
          setGettingLocation(false);
          
          // Get address for this position
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: pos }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const formattedAddress = results[0].formatted_address;
                setAddress(formattedAddress);
                onLocationSelect({
                  address: formattedAddress,
                  latitude: pos.lat,
                  longitude: pos.lng,
                });
              }
            });
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [initialLocation, isLoaded, onLocationSelect]);

  // Debug logging
  console.log('MapLocationPicker - API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Set' : 'Missing');
  console.log('MapLocationPicker - isLoaded:', isLoaded);
  console.log('MapLocationPicker - loadError:', loadError);

  const onLoad = useCallback((map) => {
    console.log('Map loaded successfully');
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    console.log('Map unmounted');
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      console.log('Map clicked at:', lat, lng);
      setMarkerPosition({ lat, lng });

      // Reverse geocoding to get address
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          console.log('Geocoding status:', status);
          if (status === 'OK' && results[0]) {
            const formattedAddress = results[0].formatted_address;
            console.log('Address found:', formattedAddress);
            setAddress(formattedAddress);
            
            // Call parent callback with all required data
            onLocationSelect({
              address: formattedAddress,
              latitude: lat,
              longitude: lng,
            });
          } else {
            console.error('Geocoding failed:', status);
            // Fallback to coordinates
            const coordAddress = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setAddress(coordAddress);
            onLocationSelect({
              address: coordAddress,
              latitude: lat,
              longitude: lng,
            });
          }
        });
      } else {
        console.warn('Google Maps API not loaded, using coordinates');
        // If geocoding fails, just send coordinates
        const coordAddress = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(coordAddress);
        onLocationSelect({
          address: coordAddress,
          latitude: lat,
          longitude: lng,
        });
      }
    },
    [onLocationSelect]
  );

  const handleMarkerDragEnd = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      console.log('Marker dragged to:', lat, lng);
      setMarkerPosition({ lat, lng });

      // Reverse geocoding
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const formattedAddress = results[0].formatted_address;
            setAddress(formattedAddress);
            
            onLocationSelect({
              address: formattedAddress,
              latitude: lat,
              longitude: lng,
            });
          } else {
            // Fallback if geocoding fails
            const coordAddress = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setAddress(coordAddress);
            onLocationSelect({
              address: coordAddress,
              latitude: lat,
              longitude: lng,
            });
          }
        });
      } else {
        // Fallback without Google API
        const coordAddress = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(coordAddress);
        onLocationSelect({
          address: coordAddress,
          latitude: lat,
          longitude: lng,
        });
      }
    },
    [onLocationSelect]
  );

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
    onLocationSelect({
      address: event.target.value,
      latitude: markerPosition.lat,
      longitude: markerPosition.lng,
    });
  };

  if (loadError) {
    console.error('Google Maps load error:', loadError);
    
    // Check if it's a billing error
    const isBillingError = loadError.message?.includes('BillingNotEnabled') || 
                          loadError.message?.includes('billing');
    
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom fontWeight={600}>
            {isBillingError ? 'Google Maps Billing Not Enabled' : 'Failed to load Google Maps'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {isBillingError 
              ? 'You need to enable billing in Google Cloud Console to use Google Maps.'
              : `Error: ${loadError.message || 'Unknown error'}`
            }
          </Typography>
          {isBillingError && (
            <Typography variant="caption" color="text.secondary" component="div">
              Steps to fix:
              <br />1. Go to Google Cloud Console → Billing
              <br />2. Link a billing account (credit card required)
              <br />3. $200 free credit monthly - you won't be charged
              <br />4. Wait 2-5 minutes and refresh
            </Typography>
          )}
        </Alert>
        
        {/* Fallback: Manual address entry */}
        <Paper elevation={2} sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            📍 Enter Your Location Manually
          </Typography>
          <TextField
            fullWidth
            label="Service Address"
            multiline
            rows={3}
            value={address}
            onChange={(e) => {
              const addr = e.target.value;
              setAddress(addr);
              onLocationSelect({
                address: addr,
                latitude: defaultCenter.lat,
                longitude: defaultCenter.lng,
              });
            }}
            placeholder="Enter your full address (e.g., 123 Moi Avenue, Nairobi, Kenya)"
            helperText="Please provide a detailed address including building name, street, and area"
            sx={{ mt: 2 }}
          />
        </Paper>
      </Box>
    );
  }

  if (!isLoaded || gettingLocation) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          {gettingLocation ? 'Getting your location...' : 'Loading map...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationIcon fontSize="small" />
        Click on the map to pin your location or drag the marker
      </Typography>

      <Paper elevation={2} sx={{ mb: 3, overflow: 'hidden', borderRadius: 2 }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markerPosition}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            animation={window.google?.maps?.Animation?.DROP}
          />
        </GoogleMap>
      </Paper>

      <TextField
        fullWidth
        label="Selected Address"
        multiline
        rows={2}
        value={address}
        onChange={handleAddressChange}
        placeholder="Address will appear here when you select a location"
        helperText="You can edit this address if needed"
        sx={{ mt: 2 }}
      />

      {markerPosition && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Coordinates: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapLocationPicker;
