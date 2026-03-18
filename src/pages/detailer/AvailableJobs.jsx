// src/pages/detailer/AvailableJobs.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import { Refresh, LocationOn, CalendarToday, DirectionsCar } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { api } from '@/services/api';

export default function AvailableJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchAvailableJobs();
    
    // Auto-refresh every 30 seconds for new jobs
    const interval = setInterval(fetchAvailableJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableJobs = async () => {
    try {
      const res = await api.get('/detailer/jobs?status=pending');
      // Filter to only show jobs without assigned detailer
      const available = res.data.jobs?.filter(j => !j.detailer || j.detailer === null) || [];
      setJobs(available);
      setError(null);
    } catch (err) {
      setError('Failed to load available jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (jobId) => {
    try {
      await api.patch(`/detailer/jobs/${jobId}/accept`);
      // Refresh the list
      fetchAvailableJobs();
      // Show success message or navigate
      alert('Job accepted successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to accept job';
      alert(message);
      // Refresh anyway in case someone else took it
      fetchAvailableJobs();
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Available Jobs
        </Typography>
        <IconButton onClick={fetchAvailableJobs} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        These are all pending jobs waiting for a detailer. First to accept gets the job!
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {jobs.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 3 }}>
          No jobs available at the moment. Check back soon!
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gap: 3 }}>
          {jobs.map((job) => (
            <Card
              key={job._id}
              elevation={2}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.3s',
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {job.package?.name || 'Detailing Job'}
                    </Typography>
                    <Chip 
                      label={`KSh ${job.totalPrice?.toLocaleString()}`} 
                      color="primary" 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Chip label="NEW" color="success" size="small" />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Scheduled:</strong>{' '}
                      {new Date(job.scheduledDate).toLocaleString('en-KE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Location:</strong> {job.location?.address || '—'}
                    </Typography>
                  </Box>

                  {job.vehicleType && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCar fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Vehicle:</strong> {job.vehicleType}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Customer:</strong> {job.customer?.name || '—'}
                    </Typography>
                  </Box>

                  {job.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      Note: {job.notes}
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ px: 3, pb: 3, gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={() => handleAccept(job._id)}
                  size="large"
                >
                  Accept Job
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
