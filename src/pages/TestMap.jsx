// Test page for Google Maps API - can be accessed at /test-map
import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import MapLocationPicker from '@/components/MapLocationPicker';
import { useState } from 'react';

export default function TestMap() {
  const [location, setLocation] = useState(null);

  const handleLocationSelect = (locationData) => {
    console.log('Location selected:', locationData);
    setLocation(locationData);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Google Maps API Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>API Key Status:</strong> {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✓ Set' : '✗ Missing'}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Check browser console for detailed logs
        </Typography>
      </Alert>

      <Paper sx={{ p: 3 }}>
        <MapLocationPicker
          onLocationSelect={handleLocationSelect}
        />
      </Paper>

      {location && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'success.light' }}>
          <Typography variant="h6" gutterBottom>
            Selected Location Data:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(location, null, 2)}
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
