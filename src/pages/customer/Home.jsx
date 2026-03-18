// src/pages/customer/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { api } from '@/services/api';

export default function CustomerHome() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get('/customer/packages');
      setPackages(res.data.packages || []);
    } catch (err) {
      console.error('Failed to load packages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (pkg) => {
    navigate('/book', { state: { package: pkg } });
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
        Available Packages
      </Typography>

      {packages.length === 0 ? (
        <Alert severity="info">No packages available at the moment.</Alert>
      ) : (
        <Grid container spacing={3}>
          {packages.map((pkg) => (
            <Grid item xs={12} sm={6} md={4} key={pkg._id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                {pkg.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(pkg.image)}
                    alt={pkg.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {pkg.name}
                    </Typography>
                    <Chip
                      label={pkg.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {pkg.description}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
                    KSh {pkg.price?.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                    <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      {pkg.rating || '5.0'} • {pkg.duration || '2 hours'}
                    </Typography>
                  </Box>
                  {pkg.features && pkg.features.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {pkg.features.slice(0, 3).map((feature, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => handleBookNow(pkg)}
                    sx={{ py: 1.2 }}
                  >
                    Book Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
