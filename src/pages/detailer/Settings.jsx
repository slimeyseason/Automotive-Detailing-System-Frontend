// src/pages/detailer/Settings.jsx
import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notifications, setNotifications] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = () => {
    // TODO: Implement profile update API call
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChange = () => {
    // TODO: Implement password change
    alert('Password change functionality coming soon!');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <div>
          <Typography variant="h4" fontWeight={700}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account preferences
          </Typography>
        </div>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      {/* Profile Settings */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Profile Information
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'D'}
            </Avatar>
            <Button variant="outlined" size="small">
              Change Photo
            </Button>
          </Box>

          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Button
            variant="contained"
            onClick={handleSaveProfile}
            sx={{ mt: 2 }}
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            }
            label="Enable job notifications"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            Receive alerts for new jobs and updates
          </Typography>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SecurityIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Security
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Keep your account secure by using a strong password
          </Typography>

          <Button variant="outlined" onClick={handlePasswordChange}>
            Change Password
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
