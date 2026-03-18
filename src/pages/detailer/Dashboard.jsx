// src/pages/detailer/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function DetailerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earnings, setEarnings] = useState({ totalEarnings: 0, completedJobs: 0, pendingPayment: 0 });
  const [pendingCount, setPendingCount] = useState(0);

  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchEarnings();
    fetchTodayJobs();
    fetchPendingCount();
    
    // Poll for new pending jobs every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodayJobs = async () => {
    try {
      const res = await api.get('/detailer/jobs/today');
      setJobs(res.data.jobs || []);
    } catch (err) {
      setError('Failed to load today\'s jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/detailer/earnings');
      setEarnings(res.data || { totalEarnings: 0, completedJobs: 0, pendingPayment: 0 });
    } catch (err) {
      console.error('Failed to load earnings:', err);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/detailer/jobs?status=pending');
      const pending = res.data.jobs?.filter(j => !j.detailer || j.detailer === null) || [];
      setPendingCount(pending.length);
    } catch (err) {
      console.error('Failed to load pending count:', err);
    }
  };

  const handleAccept = async (jobId) => {
    try {
      await api.patch(`/detailer/jobs/${jobId}/accept`);
      fetchTodayJobs();
    } catch (err) {
      alert('Failed to accept job');
      console.error('Accept error:', err.response?.data);
    }
  };

  const handleReject = async (jobId) => {
    if (!window.confirm('Reject this job?')) return;
    try {
      await api.patch(`/detailer/jobs/${jobId}/reject`, { reason: 'Unavailable' });
      fetchTodayJobs();
    } catch (err) {
      alert('Failed to reject job');
      console.error('Reject error:', err.response?.data);
    }
  };

  const getStatusChip = (status) => {
    const map = {
      pending:    { label: 'Pending',    color: 'warning' },
      accepted:   { label: 'Accepted',   color: 'primary' },
      en_route:   { label: 'En Route',   color: 'info' },
      arrived:    { label: 'Arrived',    color: 'success' },
      in_progress:{ label: 'In Progress',color: 'secondary' },
      completed:  { label: 'Completed',  color: 'success' },
      cancelled:  { label: 'Cancelled',  color: 'error' },
    };
    const info = map[status] || { label: status, color: 'default' };
    return <Chip label={info.label} color={info.color} size="small" variant="outlined" />;
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
        Dashboard
      </Typography>

      {/* ─── NEW JOBS ALERT ─────────────────────────────────────────── */}
      {pendingCount > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => navigate('/detailer/jobs/available')}
            >
              View Jobs
            </Button>
          }
        >
          <strong>{pendingCount} new job{pendingCount > 1 ? 's' : ''} available</strong> to accept!
        </Alert>
      )}

      {/* ─── EARNINGS SECTION ─────────────────────────────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 6 }}>
        {/* Earnings Card */}
        <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Earnings
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    KSh {earnings.totalEarnings?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
                    {earnings.completedJobs || 0} completed jobs
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.6 }} />
              </Box>
            </CardContent>
            <CardActions sx={{ px: 3, pb: 2, pt: 0 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/detailer/earnings')}
                sx={{ fontWeight: 600 }}
              >
                View Detailed Earnings →
              </Button>
            </CardActions>
          </Card>

          {/* Today's Summary Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Today's Jobs
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {jobs.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
                  {jobs.filter(j => j.status === 'pending').length} pending • {jobs.filter(j => j.status === 'completed').length} completed
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ px: 3, pb: 2, pt: 0 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/detailer/jobs/today')}
                sx={{ fontWeight: 600 }}
              >
                View Today's Jobs →
              </Button>
            </CardActions>
          </Card>
        </Box>

        {/* ─── JOBS SECTION ─────────────────────────────────────────── */}
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            mb: 4,
          }}
        >
          Today's Jobs
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {jobs.length === 0 ? (
          <Alert severity="info" variant="outlined" sx={{ borderRadius: 3, py: 3 }}>
            No jobs assigned for today. Check back later!
          </Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(380px, 1fr))' }, gap: 3 }}>
            {jobs.map((job) => (
              <Card
                key={job._id}
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  transition: 'all 0.28s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
                    borderColor: 'primary.light',
                  },
                }}
              >
                <Box sx={{ height: 6, bgcolor: 'primary.main' }} />

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <div>
                      <Typography variant="h6" fontWeight={600}>
                        {job.booking?.package?.name || 'Detailing Job'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {new Date(job.booking?.scheduledDate).toLocaleString('en-KE', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </Typography>
                    </div>
                    {getStatusChip(job.status)}
                  </Box>

                  <Divider sx={{ my: 2.5 }} />

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Customer
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {job.booking?.customer?.name || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {job.booking?.customer?.phone || '—'}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 2, fontWeight: 500 }}>
                    <strong>Location:</strong> {job.booking?.location?.address?.substring(0, 80) || '—'}
                  </Typography>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5, flexWrap: 'wrap' }}>
                  {job.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        size="large"
                        onClick={() => handleAccept(job._id)}
                        sx={{ borderRadius: 3, py: 1.4, fontWeight: 600 }}
                      >
                        Accept Job
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        size="large"
                        onClick={() => handleReject(job._id)}
                        sx={{ borderRadius: 3, py: 1.4, fontWeight: 600 }}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {['accepted', 'en_route', 'arrived', 'in_progress'].includes(job.status) && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => navigate(`/detailer/job/${job._id}`)}
                      sx={{ borderRadius: 3, py: 1.4, fontWeight: 600 }}
                    >
                      View & Update Job
                    </Button>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
    </>
  );
}