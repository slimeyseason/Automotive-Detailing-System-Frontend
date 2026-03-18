// src/pages/Landing.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Button, 
  Box,
  CardActionArea,
  Chip,
  Divider,
  CircularProgress,
  Stack
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

function Landing() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${baseUrl}/customer/packages?active=true`);
        const packageList = Array.isArray(res.data?.packages)
          ? res.data.packages
          : Array.isArray(res.data)
            ? res.data
            : [];
        setPackages(packageList.slice(0, 6)); // Limit to 6 packages for landing page
      } catch (err) {
        console.error('Failed to fetch packages:', err);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Hero Section with Customer Login */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.95), rgba(139, 92, 246, 0.9)), url("https://i0.wp.com/vipercardetailing.com/wp-content/uploads/2025/10/DSC02465-Enhanced-NR.webp?fit=800%2C450&ssl=1") center/cover no-repeat',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h1" 
            component="h1"
            sx={{ 
              fontWeight: 900, 
              mb: 2,
              fontSize: { xs: '3.5rem', md: '6rem' },
              lineHeight: 1,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              letterSpacing: '-0.02em'
            }}
          >
            ADS
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3, 
              opacity: 0.98,
              fontSize: { xs: '1.4rem', md: '2rem' },
              fontWeight: 600,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            Auto Detailing Service at Your Doorstep
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 6, 
              opacity: 0.95,
              maxWidth: '680px',
              margin: '0 auto 4rem',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              lineHeight: 1.6,
              textShadow: '0 1px 4px rgba(0,0,0,0.2)'
            }}
          >
            Professional car detailing services delivered directly to your location in Nairobi.
          </Typography>

          {/* Prominent Customer Card */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <Card 
              elevation={12}
              sx={{ 
                borderRadius: 5,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: '3px solid rgba(255,255,255,0.3)',
                '&:hover': { 
                  transform: 'scale(1.02)',
                  boxShadow: '0 24px 56px rgba(0,0,0,0.3)'
                }
              }}
            >
              <CardActionArea 
                onClick={() => navigate('/login?role=customer')}
                sx={{ p: 0 }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image="https://i0.wp.com/vipercardetailing.com/wp-content/uploads/2025/10/DSC02465-Enhanced-NR.webp?fit=800%2C450&ssl=1"
                    alt="Customer"
                    sx={{ filter: 'brightness(0.9)' }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: '#4f46e5',
                    color: 'white',
                    px: 2.5,
                    py: 0.8,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    MOST POPULAR
                  </Box>
                </Box>
                <CardContent sx={{ p: 5, textAlign: 'center', bgcolor: 'white' }}>
                  <Box sx={{ 
                    bgcolor: '#4f46e5', 
                    color: 'white',
                    borderRadius: '50%',
                    width: 90,
                    height: 90,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                  }}>
                    <PersonIcon sx={{ fontSize: 48 }} />
                  </Box>
                  
                  <Typography variant="h4" component="div" sx={{ fontWeight: 800, mb: 2, color: '#1e293b' }}>
                    Book as Customer
                  </Typography>
                  
                  <Chip 
                    label="For Vehicle Owners" 
                    sx={{ mb: 3, bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 600, fontSize: '0.95rem', py: 2.5 }}
                  />
                  
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.15rem', mb: 4, lineHeight: 1.7 }}>
                    Book detailing services, manage appointments, and view your car history
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: '#4f46e5',
                      px: 5,
                      py: 1.8,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      '&:hover': {
                        bgcolor: '#4338ca',
                      }
                    }}
                  >
                    Get Started Now
                  </Button>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>

          <Button
            variant="text"
            onClick={() => navigate('/register')}
            sx={{ 
              color: 'white',
              fontSize: '1rem',
              textDecoration: 'underline',
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Don't have an account? Register here
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Typography 
          variant="h3" 
          component="h2"
          sx={{ 
            textAlign: 'center', 
            mb: 10, 
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '2rem', md: '2.8rem' }
          }}
        >
          Why Choose ADS?
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 4, 
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
              transition: 'all 0.3s ease', 
              '&:hover': { 
                transform: 'translateY(-8px)', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)' 
              } 
            }}>
              <CardMedia component="img" height="200" image="https://www.totalpackagedetailing.com/wp-content/uploads/2025/01/gtechniq-crystal-serum-ultra-b-1024x710.jpg" alt="Professional detailing" />
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <DirectionsCarIcon sx={{ fontSize: 56, color: '#4f46e5', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Professional Service</Typography>
                <Typography variant="body1" color="text.secondary">Experienced detailers using premium products.</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 4, 
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
              transition: 'all 0.3s ease', 
              '&:hover': { 
                transform: 'translateY(-8px)', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)' 
              } 
            }}>
              <CardMedia component="img" height="200" image="https://i0.wp.com/vipercardetailing.com/wp-content/uploads/2025/10/DSC02465-Enhanced-NR.webp?fit=800%2C450&ssl=1" alt="Mobile service" />
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <LocationOnIcon sx={{ fontSize: 56, color: '#4f46e5', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Door-to-Door</Typography>
                <Typography variant="body1" color="text.secondary">We come to your location — saving you time.</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 4, 
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
              transition: 'all 0.3s ease', 
              '&:hover': { 
                transform: 'translateY(-8px)', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)' 
              } 
            }}>
              <CardMedia component="img" height="200" image="https://lirp.cdn-website.com/5e0c622a/dms3rep/multi/opt/PPF+installation+in+York-+PA-1920w.jpg" alt="Quality result" />
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <StarIcon sx={{ fontSize: 56, color: '#4f46e5', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Quality Guaranteed</Typography>
                <Typography variant="body1" color="text.secondary">100% satisfaction promise.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Packages Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 } }}>
        <Typography 
          variant="h3" 
          component="h2"
          sx={{ 
            textAlign: 'center', 
            mb: 2, 
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '2rem', md: '2.8rem' }
          }}
        >
          Our Detailing Packages
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: 'center', 
            mb: 8, 
            color: 'text.secondary',
            fontSize: '1.15rem',
            maxWidth: '700px',
            mx: 'auto'
          }}
        >
          Choose from our range of professional detailing services tailored to your needs
        </Typography>

        {loadingPackages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} thickness={4} />
          </Box>
        ) : packages.length > 0 ? (
          <>
            <Grid container spacing={4}>
              {packages.map((pkg) => (
                <Grid item xs={12} sm={6} md={4} key={pkg._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      border: '2px solid transparent',
                      '&:hover': { 
                        transform: 'translateY(-12px)',
                        boxShadow: '0 24px 48px rgba(79, 70, 229, 0.2)',
                        borderColor: '#4f46e5'
                      }
                    }}
                  >
                    {pkg.image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={pkg.image.startsWith('http') 
                          ? pkg.image 
                          : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${pkg.image}`
                        }
                        alt={pkg.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    
                    <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Chip 
                        label={pkg.type || 'Service'} 
                        size="small"
                        sx={{ 
                          mb: 2, 
                          bgcolor: '#eef2ff', 
                          color: '#4f46e5', 
                          fontWeight: 600,
                          alignSelf: 'flex-start'
                        }} 
                      />
                      
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 1.5,
                          color: '#1e293b'
                        }}
                      >
                        {pkg.name}
                      </Typography>

                      {pkg.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 2.5, lineHeight: 1.7 }}
                        >
                          {pkg.description}
                        </Typography>
                      )}

                      {pkg.features && pkg.features.length > 0 && (
                        <Stack spacing={1} sx={{ mb: 3 }}>
                          {pkg.features.slice(0, 3).map((feature, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                              <Typography variant="body2" color="text.secondary">
                                {feature}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}

                      <Box sx={{ mt: 'auto' }}>
                        <Divider sx={{ mb: 2.5 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {pkg.duration || 'Varies'}
                            </Typography>
                          </Box>
                          
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              fontWeight: 800, 
                              color: '#4f46e5'
                            }}
                          >
                            KSh {pkg.price?.toLocaleString() || (pkg.pricing?.sedan || 0).toLocaleString()}
                          </Typography>
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => navigate('/login?role=customer')}
                          sx={{
                            bgcolor: '#4f46e5',
                            py: 1.5,
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            borderRadius: 2.5,
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: '#4338ca',
                            }
                          }}
                        >
                          Book Now
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login?role=customer')}
                sx={{
                  px: 5,
                  py: 1.8,
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  borderColor: '#4f46e5',
                  color: '#4f46e5',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#4338ca',
                    bgcolor: 'rgba(79, 70, 229, 0.04)',
                  }
                }}
              >
                View All Services
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No packages available at the moment.
          </Typography>
        )}
      </Container>

      {/* Staff Login Section */}
      <Box sx={{ bgcolor: '#f1f5f9', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Divider sx={{ mb: 6 }}>
            <Chip label="Staff Access" sx={{ bgcolor: 'white', px: 2, py: 0.5, fontWeight: 600 }} />
          </Divider>

          <Typography 
            variant="h5" 
            sx={{ 
              textAlign: 'center', 
              mb: 5, 
              fontWeight: 600,
              color: '#475569'
            }}
          >
            Service Providers & Administration
          </Typography>

          <Grid container spacing={3}>
            {/* Detailer Login */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => navigate('/login?role=detailer')}
                  sx={{ height: '100%', p: 4 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ 
                      bgcolor: '#0ea5e9', 
                      color: 'white',
                      borderRadius: '50%',
                      width: 70,
                      height: 70,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <BuildIcon sx={{ fontSize: 36 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Detailer Login
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage jobs, schedule & earnings
                      </Typography>
                    </Box>
                    <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Admin Login */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => navigate('/login?role=admin')}
                  sx={{ height: '100%', p: 4 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ 
                      bgcolor: '#dc2626', 
                      color: 'white',
                      borderRadius: '50%',
                      width: 70,
                      height: 70,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <AdminPanelSettingsIcon sx={{ fontSize: 36 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Admin Login
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Platform management & analytics
                      </Typography>
                    </Box>
                    <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer"
        sx={{
          mt: 'auto',
          py: 6,
          backgroundColor: '#0f172a',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            ADS – Auto Detailing Service
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.85 }}>
            Premium mobile car detailing delivered to your doorstep across Nairobi.
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.8, opacity: 0.85 }}>
              Phone: +254 700 123 456 | Email: info@adsdetailingservices.co.ke<br />
              Service Areas: Nairobi, Kiambu, Kajiado & more
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} ADS Auto Detailing Service. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Landing;