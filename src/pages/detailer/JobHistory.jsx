// src/pages/detailer/JobHistory.jsx
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { 
  History as HistoryIcon, 
  CheckCircle as CheckIcon, 
  PhotoLibrary as PhotoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { api } from '@/services/api';

export default function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0 });
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedJobImages, setSelectedJobImages] = useState({ before: [], after: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      console.log('Fetching job history...');
      const res = await api.get('/detailer/jobs/history');
      console.log('Job history response:', res.data);
      const jobData = res.data.jobs || [];
      setJobs(jobData);

      // Calculate stats
      const total = jobData.length;
      const completed = jobData.filter((j) => j.status === 'completed').length;
      const cancelled = jobData.filter((j) => j.status === 'cancelled').length;
      setStats({ total, completed, cancelled });
      setError(null);
    } catch (err) {
      console.error('Failed to load job history:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load job history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const handleViewImages = (job) => {
    setSelectedJobImages({
      before: job.images?.before || [],
      after: job.images?.after || [],
    });
    setImageDialogOpen(true);
  };

  const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Loading job history...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={fetchHistory}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <HistoryIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <div>
          <Typography variant="h4" fontWeight={700}>
            Job History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your completed and past jobs
          </Typography>
        </div>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Jobs
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ borderRadius: 3, bgcolor: 'success.light' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} color="success.dark">
              {stats.completed}
            </Typography>
            <Typography variant="body2" color="success.dark">
              Completed
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ borderRadius: 3, bgcolor: 'error.light' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} color="error.dark">
              {stats.cancelled}
            </Typography>
            <Typography variant="body2" color="error.dark">
              Cancelled
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Jobs Table */}
      {jobs.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No job history available yet.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Service</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Photos</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job._id} hover>
                  <TableCell>
                    {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{job.package?.name || '—'}</TableCell>
                  <TableCell>{job.customer?.name || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={job.status?.toUpperCase()}
                      color={getStatusColor(job.status)}
                      size="small"
                      icon={job.status === 'completed' ? <CheckIcon /> : undefined}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {(job.images?.before?.length > 0 || job.images?.after?.length > 0) ? (
                      <Tooltip title="View Photos">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewImages(job)}
                        >
                          <PhotoIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <strong>KSh {job.totalPrice?.toLocaleString() || '0'}</strong>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Image View Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Job Photos</span>
          <IconButton onClick={() => setImageDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Before Photos */}
          {selectedJobImages.before.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Before Photos ({selectedJobImages.before.length})
              </Typography>
              <ImageList cols={3} gap={8}>
                {selectedJobImages.before.map((imgPath, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={`${apiUrl}${imgPath}`}
                      alt={`Before ${index + 1}`}
                      loading="lazy"
                      style={{ height: 200, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {/* After Photos */}
          {selectedJobImages.after.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                After Photos ({selectedJobImages.after.length})
              </Typography>
              <ImageList cols={3} gap={8}>
                {selectedJobImages.after.map((imgPath, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={`${apiUrl}${imgPath}`}
                      alt={`After ${index + 1}`}
                      loading="lazy"
                      style={{ height: 200, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {selectedJobImages.before.length === 0 && selectedJobImages.after.length === 0 && (
            <Alert severity="info">No photos available for this job.</Alert>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
