// src/pages/shared/Profile.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    profilePicture: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        profilePicture: user.profilePicture || null,
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      if (formData.profilePicture && typeof formData.profilePicture !== 'string') {
        data.append('profilePicture', formData.profilePicture);
      }

      await updateProfile(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 4 }}>
            Profile updated successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
          <Avatar
            src={
              formData.profilePicture && typeof formData.profilePicture === 'string'
                ? formData.profilePicture
                : undefined
            }
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
          >
            Upload Photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                disabled // phone usually not changeable after registration
                helperText="Phone number cannot be changed"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            {/* Role-specific fields could be added conditionally */}
            {user?.role === 'detailer' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vehicle Registration (optional)"
                  placeholder="KXX 123Y"
                  // Add if needed
                />
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 5, textAlign: 'right' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}