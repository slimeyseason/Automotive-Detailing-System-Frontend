// src/pages/customer/Review.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Rating,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { api } from '@/services/api';

export default function Review() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/customer/bookings/${bookingId}/review`, {
        rating,
        comment: comment.trim(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom align="center" fontWeight={600}>
          How was your service?
        </Typography>

        {success ? (
          <Alert severity="success" sx={{ mt: 3 }}>
            Thank you for your feedback! Redirecting...
          </Alert>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Rating
                name="service-rating"
                value={rating}
                onChange={(_, value) => setRating(value)}
                precision={1}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your comments (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
              sx={{ mb: 4 }}
            />

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || rating === 0}
              onClick={handleSubmit}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Review'}
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}