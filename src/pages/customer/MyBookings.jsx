// src/pages/customer/MyBookings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { api } from '@/services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log('Fetching customer bookings...');
        const res = await api.get('/customer/bookings');
        console.log('Customer bookings response:', res.data);
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':    return 'warning';
      case 'accepted':   return 'info';
      case 'en_route':   return 'primary';
      case 'arrived':    return 'primary';
      case 'in_progress':return 'secondary';
      case 'completed':  return 'success';
      case 'cancelled':  return 'error';
      default:           return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        My Bookings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {bookings.length === 0 ? (
        <Alert severity="info">
          You don't have any bookings yet. 
          <Button color="inherit" onClick={() => navigate('/')} sx={{ ml: 1 }}>
            Book a service now
          </Button>
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {bookings.map((booking) => (
            <Card key={booking._id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Typography variant="h6" gutterBottom>
                      {booking.package?.name || 'Detailing Service'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {new Date(booking.scheduledDate).toLocaleString('en-KE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </Typography>
                  </div>
                  <Chip
                    label={booking.status?.toUpperCase() || 'PENDING'}
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2">
                  <strong>Amount:</strong> KSh {booking.totalPrice?.toLocaleString() || '—'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Location:</strong> {booking.location?.address || '—'}
                </Typography>
                {booking.vehicleType && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Vehicle:</strong> {booking.vehicleType}
                  </Typography>
                )}

                {booking.detailer && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Detailer:</strong> {booking.detailer.name || 'Assigned'}
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <Button
                  size="small"
                  onClick={() => navigate(`/bookings/${booking._id}`)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}