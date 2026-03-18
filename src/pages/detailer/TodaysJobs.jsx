// src/pages/detailer/TodaysJobs.jsx
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
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { api } from '@/services/api';

export default function TodaysJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchTodayJobs();
  }, []);

  const fetchTodayJobs = async () => {
    try {
      const res = await api.get('/detailer/jobs/today');
      setJobs(res.data.jobs || []);
    } catch (err) {
      setError('Failed to load today\'s jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (jobId) => {
    try {
      await api.patch(`/detailer/jobs/${jobId}/accept`);
      fetchTodayJobs();
    } catch (err) {
      alert('Failed to accept job');
    }
  };

  const handleReject = async (jobId) => {
    if (!window.confirm('Reject this job?')) return;
    try {
      await api.patch(`/detailer/jobs/${jobId}/reject`);
      fetchTodayJobs();
    } catch (err) {
      alert('Failed to reject job');
    }
  };

  const getStatusChip = (status) => {
    const map = {
      pending: { label: 'Pending', color: 'warning' },
      accepted: { label: 'Accepted', color: 'primary' },
      en_route: { label: 'En Route', color: 'info' },
      arrived: { label: 'Arrived', color: 'success' },
      in_progress: { label: 'In Progress', color: 'secondary' },
      completed: { label: 'Completed', color: 'success' },
      cancelled: { label: 'Cancelled', color: 'error' },
    };
    const info = map[status] || { label: status, color: 'default' };
    return <Chip label={info.label} color={info.color} size="small" />;
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
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Today's Jobs
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {jobs.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No jobs scheduled for today. Enjoy your day!
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
                '&:hover': { boxShadow: 6 },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {job.package?.name || 'Detailing Job'}
                  </Typography>
                  {getStatusChip(job.status)}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Customer:</strong> {job.customer?.name || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Phone:</strong> {job.customer?.phone || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Time:</strong>{' '}
                  {new Date(job.scheduledDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Location:</strong> {job.location?.address || '—'}
                </Typography>
              </CardContent>

              <CardActions sx={{ px: 3, pb: 3, gap: 2 }}>
                {job.status === 'pending' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleAccept(job._id)}
                      sx={{ flex: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(job._id)}
                      sx={{ flex: 1 }}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {['accepted', 'en_route', 'arrived', 'in_progress'].includes(job.status) && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/detailer/job/${job._id}`)}
                  >
                    View & Update Job
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
