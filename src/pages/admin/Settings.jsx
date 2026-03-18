// src/pages/admin/Settings.jsx
import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
} from '@mui/material';

export default function Settings() {
  const [settings, setSettings] = useState({
    smsNotifications: true,
    emailNotifications: false,
    autoAssignEnabled: true,
    lowStockThreshold: 5,
    defaultCancellationFee: 500,
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setSettings({
      ...settings,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const handleSave = () => {
    // In real app: api.put('/admin/settings', settings)
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        System Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 4 }}>
          Settings saved successfully
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <Box sx={{ mb: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.smsNotifications}
                onChange={handleChange('smsNotifications')}
              />
            }
            label="Send SMS notifications to customers & detailers"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange('emailNotifications')}
              />
            }
            label="Send email confirmations & reminders"
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Assignment & Scheduling
        </Typography>
        <Box sx={{ mb: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoAssignEnabled}
                onChange={handleChange('autoAssignEnabled')}
              />
            }
            label="Enable automatic job assignment to nearest available detailer"
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Business Rules
        </Typography>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            label="Low Stock Alert Threshold"
            type="number"
            value={settings.lowStockThreshold}
            onChange={handleChange('lowStockThreshold')}
            helperText="Notify admin when inventory falls below this number"
            fullWidth
          />
          <TextField
            label="Default Cancellation Fee (KSh)"
            type="number"
            value={settings.defaultCancellationFee}
            onChange={handleChange('defaultCancellationFee')}
            fullWidth
          />
        </Box>

        <Box sx={{ mt: 5, textAlign: 'right' }}>
          <Button variant="contained" size="large" onClick={handleSave}>
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}