// src/pages/detailer/CurrentJobs.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  IconButton,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  PhotoCamera as CameraIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

const CurrentJobs = () => {
  const { api } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageType, setImageType] = useState('before'); // 'before' or 'after'
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchCurrentJobs();
    const interval = setInterval(fetchCurrentJobs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentJobs = async () => {
    try {
      const res = await api.get('/detailer/jobs');
      // Filter for current jobs (accepted but not completed/cancelled)
      const allJobs = res.data.jobs || res.data || [];
      const currentJobs = allJobs.filter(
        job => ['accepted', 'en_route', 'arrived', 'in_progress'].includes(job.status)
      );
      console.log('Current jobs fetched:', currentJobs);
      setJobs(currentJobs);
      setError('');
    } catch (err) {
      console.error('Error fetching current jobs:', err);
      setError(err.response?.data?.message || 'Failed to load current jobs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      accepted: 'primary',
      en_route: 'info',
      arrived: 'warning',
      in_progress: 'secondary',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      accepted: 'Accepted',
      en_route: 'En Route',
      arrived: 'Arrived',
      in_progress: 'In Progress',
    };
    return labels[status] || status;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      accepted: 'en_route',
      en_route: 'arrived',
      arrived: 'in_progress',
      in_progress: 'completed',
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      accepted: 'Mark as En Route',
      en_route: 'Mark as Arrived',
      arrived: 'Start Job',
      in_progress: 'Complete Job',
    };
    return labels[currentStatus] || 'Update Status';
  };

  const handleUpdateStatus = async () => {
    if (!selectedJob) return;

    setUpdating(true);
    try {
      const nextStatus = getNextStatus(selectedJob.status);
      console.log('Updating job status:', { jobId: selectedJob._id, from: selectedJob.status, to: nextStatus });
      
      const res = await api.patch(`/detailer/jobs/${selectedJob._id}`, {
        status: nextStatus,
      });
      
      console.log('Status updated successfully:', res.data);
      setStatusDialogOpen(false);
      setSelectedJob(null);
      fetchCurrentJobs();
      setError('');
    } catch (err) {
      console.error('Error updating job status:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update job status');
    } finally {
      setUpdating(false);
    }
  };

  const openStatusDialog = (job) => {
    setSelectedJob(job);
    setStatusDialogOpen(true);
  };

  const openImageDialog = (job, type) => {
    setSelectedJob(job);
    setImageType(type);
    setSelectedImages([]);
    setImagePreviews([]);
    setImageDialogOpen(true);
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke the removed preview URL
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleUploadImages = async () => {
    if (!selectedJob || selectedImages.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setUploadingImages(true);
    try {
      const formData = new FormData();
      selectedImages.forEach(image => {
        formData.append('images', image);
      });
      formData.append('type', imageType);

      const res = await api.post(`/detailer/jobs/${selectedJob._id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Images uploaded:', res.data);
      
      // Clean up previews
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      
      setImageDialogOpen(false);
      setSelectedImages([]);
      setImagePreviews([]);
      fetchCurrentJobs();
      setError('');
      
      // Show success message
      alert(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} images uploaded successfully!`);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading current jobs...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Current Jobs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your active job assignments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {jobs.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No Current Jobs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You don't have any active jobs at the moment. Check Available Jobs to accept new assignments.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} key={job._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {job.package?.name || 'Package Service'}
                      </Typography>
                      <Chip
                        label={getStatusLabel(job.status)}
                        color={getStatusColor(job.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      KSh {job.package?.price?.toLocaleString() || '0'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Customer
                            </Typography>
                            <Typography variant="body2">
                              {job.customer?.name || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {job.customer?.phone || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Vehicle Type
                            </Typography>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {job.vehicleType || 'Not specified'}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Scheduled Date
                            </Typography>
                            <Typography variant="body2">
                              {new Date(job.scheduledDate).toLocaleDateString('en-KE', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Time Slot
                            </Typography>
                            <Typography variant="body2">
                              {job.scheduledTime || new Date(job.scheduledDate).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Location
                          </Typography>
                          <Typography variant="body2">
                            {job.location?.address || 'Location not provided'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {job.package?.description && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Package Details
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {job.package.description}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Photo Upload Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CameraIcon />}
                        onClick={() => openImageDialog(job, 'before')}
                        disabled={job.status === 'completed'}
                      >
                        Before Photos ({job.images?.before?.length || 0})
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CameraIcon />}
                        onClick={() => openImageDialog(job, 'after')}
                        disabled={job.status !== 'in_progress' && job.status !== 'completed'}
                      >
                        After Photos ({job.images?.after?.length || 0})
                      </Button>
                    </Box>

                    {/* Status Update Button */}
                    <Button
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={() => openStatusDialog(job)}
                      fullWidth
                    >
                      {getNextStatusLabel(job.status)}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => !updating && setStatusDialogOpen(false)}>
        <DialogTitle>Update Job Status</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update this job to <strong>{getStatusLabel(getNextStatus(selectedJob?.status))}</strong>?
          </Typography>
          {selectedJob && getNextStatus(selectedJob.status) === 'completed' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Completing this job will mark it as finished and update your earnings.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={updating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updating}
            startIcon={updating ? <CircularProgress size={16} /> : null}
          >
            {updating ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog 
        open={imageDialogOpen} 
        onClose={() => !uploadingImages && setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Upload {imageType === 'before' ? 'Before' : 'After'} Photos
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload-input"
              multiple
              type="file"
              onChange={handleImageSelect}
            />
            <label htmlFor="image-upload-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CameraIcon />}
                fullWidth
                disabled={uploadingImages}
              >
                Select Images
              </Button>
            </label>

            {imagePreviews.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Images ({imagePreviews.length})
                </Typography>
                <ImageList cols={3} gap={8} sx={{ maxHeight: 400 }}>
                  {imagePreviews.map((preview, index) => (
                    <ImageListItem key={index} sx={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        loading="lazy"
                        style={{ height: 150, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        }}
                        onClick={() => handleRemoveImage(index)}
                        disabled={uploadingImages}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                • Upload clear photos of the vehicle<br />
                • Multiple angles recommended<br />
                • Max 5MB per image<br />
                • Formats: JPG, PNG, WEBP
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setImageDialogOpen(false)} 
            disabled={uploadingImages}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadImages}
            variant="contained"
            disabled={uploadingImages || selectedImages.length === 0}
            startIcon={uploadingImages ? <CircularProgress size={16} /> : <CameraIcon />}
          >
            {uploadingImages ? 'Uploading...' : `Upload ${selectedImages.length} Image${selectedImages.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CurrentJobs;
