// src/pages/customer/Booking.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import MapLocationPicker from '@/components/MapLocationPicker';

const steps = ['Select Package', 'Vehicle & Time', 'Location'];

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle'];

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { api } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(state?.package || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [vehicleType, setVehicleType] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null); // For lat/lng
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!selectedPackage) {
      navigate('/', { replace: true });
    }
  }, [selectedPackage, navigate]);

  const handleLocationSelect = (locationData) => {
    setLocation(locationData);
    setAddress(locationData.address);
  };

  const handleNext = () => {
    setError(null);
    
    // Validate step 0 (Package already set)
    if (activeStep === 0 && !vehicleType) {
      setError('Please select a vehicle type');
      return;
    }
    
    // Validate step 1 (Date & Time)
    if (activeStep === 1 && (!scheduledDate || !scheduledTime)) {
      setError('Please select date and time');
      return;
    }
    
    // Validate step 2 (Location)
    if (activeStep === 2) {
      if (!location || !location.latitude || !location.longitude) {
        setError('Please select your location on the map');
        console.log('Validation failed - location:', location);
        return;
      }
      if (!address || address.trim() === '') {
        setError('Please ensure an address is provided');
        console.log('Validation failed - address:', address);
        return;
      }
    }
    
    console.log('Step', activeStep, 'validated successfully');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        packageId: selectedPackage._id,
        scheduledDate: `${scheduledDate}T${scheduledTime}:00`,
        location: {
          address: address.trim(),
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
        vehicleType,
        notes: notes.trim(),
      };

      console.log('Sending booking data:', bookingData);

      const res = await api.post('/customer/bookings', bookingData);
      
      if (res.data.success) {
        navigate('/booking-success', { 
          state: { booking: res.data.booking },
          replace: true 
        });
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Book Your Detailing Service
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Step 0: Package Details */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selected Package
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              {selectedPackage?.name}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              KSh {selectedPackage?.price?.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Duration: {selectedPackage?.duration} minutes
            </Typography>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                label="Vehicle Type"
              >
                {VEHICLE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Step 1: Date & Time */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Schedule Your Service
            </Typography>
            
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              sx={{ mt: 2 }}
            />

            <TextField
              fullWidth
              label="Time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 3 }}
            />
          </Box>
        )}

        {/* Step 2: Location */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Service Location
            </Typography>
            
            <MapLocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={location ? { lat: location.latitude, lng: location.longitude } : null}
            />

            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or vehicle details"
              sx={{ mt: 3 }}
            />

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Booking Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Package:</strong> {selectedPackage?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Vehicle:</strong> {vehicleType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Date:</strong> {scheduledDate} at {scheduledTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Location:</strong> {address || 'Not selected'}
              </Typography>
              {location && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Coordinates: {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                </Typography>
              )}
              <Typography variant="h6" sx={{ mt: 2 }} color="primary">
                Total: KSh {selectedPackage?.price?.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleCreateBooking : handleNext}
            size="large"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading 
              ? 'Creating...' 
              : activeStep === steps.length - 1 
                ? 'Confirm Booking' 
                : 'Continue'
            }
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}