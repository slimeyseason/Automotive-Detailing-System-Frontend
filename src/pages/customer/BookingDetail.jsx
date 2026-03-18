// src/pages/customer/BookingDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  Button,
  Alert,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'; // npm install --save @react-google-maps/api
import { api } from '@/services/api';

const mapContainerStyle = { width: '100%', height: '400px' };

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/customer/bookings/${id}`);
        setBooking(res.data);
      } catch (err) {
        setError('Could not load booking details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error || !booking) return <Alert severity="error">{error || 'Booking not found'}</Alert>;

  const canReview = booking.status === 'completed' && !booking.review;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Booking #{booking.bookingNumber || id.slice(-6).toUpperCase()}
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{booking.package?.name}</Typography>
          <Chip label={booking.status?.toUpperCase()} color="primary" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <div>
            <Typography variant="subtitle2" color="text.secondary">Scheduled</Typography>
            <Typography>
              {new Date(booking.scheduledDate).toLocaleString('en-KE')}
            </Typography>
          </div>
          <div>
            <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
            <Typography fontWeight={600}>KSh {booking.amount?.toLocaleString()}</Typography>
          </div>
          <div>
            <Typography variant="subtitle2" color="text.secondary">Location</Typography>
            <Typography>{booking.location?.address || '—'}</Typography>
          </div>
          <div>
            <Typography variant="subtitle2" color="text.secondary">Detailer</Typography>
            <Typography>{booking.detailer?.name || 'Not assigned yet'}</Typography>
          </div>
        </Box>
      </Paper>

      {booking.status === 'in-progress' || booking.status === 'en-route' ? (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Live Tracking
          </Typography>
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={booking.detailer?.currentLocation || { lat: -1.286389, lng: 36.817223 }}
              zoom={15}
            >
              {booking.detailer?.currentLocation && (
                <Marker position={booking.detailer.currentLocation} />
              )}
            </GoogleMap>
          </LoadScript>
        </Paper>
      ) : null}

      {canReview && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(`/review/${id}`)}
          >
            Rate & Review Service
          </Button>
        </Box>
      )}
    </Container>
  );
}