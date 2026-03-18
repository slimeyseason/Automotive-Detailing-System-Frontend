// src/pages/customer/Reviews.jsx
import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Rating,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { api } from '@/services/api';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/customer/reviews');
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <>
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          mb: 4,
          background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        My Reviews
      </Typography>

      {reviews.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No reviews yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete a booking to leave your first review
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.map((review) => (
            <Card
              key={review._id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 48,
                        height: 48,
                      }}
                    >
                      {review.detailer?.name?.charAt(0)?.toUpperCase() || 'D'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {review.detailer?.name || 'Detailer'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {review.booking?.package?.name || 'Service'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={new Date(review.createdAt).toLocaleDateString()}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Rating value={review.rating} readOnly sx={{ mb: 1 }} />

                <Typography variant="body1" sx={{ mt: 2, color: 'text.primary' }}>
                  {review.comment || 'No comment provided'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary">
                  Booking ID: {review.booking?._id?.slice(-8) || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </>
  );
}
