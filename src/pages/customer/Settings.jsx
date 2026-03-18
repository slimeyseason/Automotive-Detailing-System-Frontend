// src/pages/customer/Settings.jsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function Settings() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile settings
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/customer/profile', { name, email, phone });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/customer/settings/notifications', {
        emailNotifications,
        smsNotifications,
        pushNotifications,
      });
      setSuccess('Notification preferences updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        Account Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    mr: 2,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {user?.name || 'Customer'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer Account
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <form onSubmit={handleUpdateProfile}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.2 }}
                >
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Notification Preferences
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                }
                label="Email Notifications"
                sx={{ display: 'block', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 3 }}>
                Receive booking updates and promotions via email
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                  />
                }
                label="SMS Notifications"
                sx={{ display: 'block', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 3 }}>
                Get booking confirmations and reminders via SMS
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                }
                label="Push Notifications"
                sx={{ display: 'block', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 3 }}>
                Receive real-time updates on your device
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Button
                variant="contained"
                fullWidth
                onClick={handleUpdateNotifications}
                disabled={loading}
                sx={{ py: 1.2 }}
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Security
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage your password and security settings
              </Typography>
              <Button variant="outlined" sx={{ mr: 2 }}>
                Change Password
              </Button>
              <Button variant="outlined" color="error">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
