// src/pages/detailer/Schedule.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { api } from '@/services/api';

export default function Schedule() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await api.get('/detailer/jobs');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = (filter) => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return jobs.filter((j) => new Date(j.scheduledDate) > now && j.status !== 'cancelled');
      case 'pending':
        return jobs.filter((j) => j.status === 'pending');
      case 'all':
      default:
        return jobs;
    }
  };

  const displayJobs = filterJobs(activeTab === 0 ? 'upcoming' : activeTab === 1 ? 'pending' : 'all');

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      accepted: 'primary',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <CalendarIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <div>
          <Typography variant="h4" fontWeight={700}>
            Work Schedule
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your upcoming appointments
          </Typography>
        </div>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 4 }}>
        <Tab label="Upcoming" />
        <Tab label="Pending" />
        <Tab label="All Jobs" />
      </Tabs>

      {displayJobs.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No jobs found in this category.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {displayJobs.map((job) => (
            <Grid item xs={12} md={6} key={job._id}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {job.package?.name || 'Service'}
                    </Typography>
                    <Chip label={job.status?.toUpperCase()} color={getStatusColor(job.status)} size="small" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Date:</strong>{' '}
                    {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Time:</strong>{' '}
                    {new Date(job.scheduledDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Customer:</strong> {job.customer?.name || '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
