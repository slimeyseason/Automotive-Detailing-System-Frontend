// src/pages/customer/BookingSuccess.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const booking = state?.booking; // expected from payment callback redirect

  useEffect(() => {
    if (!booking) {
      navigate('/bookings', { replace: true });
    }
  }, [booking, navigate]);

  if (!booking) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          bgcolor: 'success.light',
          color: 'success.contrastText',
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 80, mb: 2, color: 'success.main' }} />

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Booking Confirmed!
        </Typography>

        <Typography variant="h6" sx={{ mb: 4 }}>
          Your detailing service is scheduled
        </Typography>

        <Divider sx={{ my: 3, bgcolor: 'success.dark' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {booking.package?.name || 'Service'}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mt: 2 }}>
            <Chip
              icon={<CalendarTodayIcon />}
              label={new Date(booking.scheduledDate).toLocaleDateString('en-KE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<AccessTimeIcon />}
              label={booking.timeSlot || 'Time slot'}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <LocationOnIcon fontSize="small" />
            <Typography variant="body1">
              {booking.location?.address || 'Location set'}
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
          Your detailer will be assigned soon. You can track progress in "My Bookings".
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={() => navigate(`/bookings/${booking._id}`)}
          >
            Track Your Booking
          </Button>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => navigate('/bookings')}
          >
            View All Bookings
          </Button>

          <Button
            variant="text"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}