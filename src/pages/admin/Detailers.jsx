// src/pages/admin/Detailers.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Refresh, PersonAdd } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

export default function Detailers() {
  const { api } = useAuth();
  const [detailers, setDetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: '',
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchDetailers();
  }, []);

  const fetchDetailers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/detailers');
      setDetailers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch detailers:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/detailers/${id}/availability`, {
        isAvailable: !currentStatus,
      });
      fetchDetailers();
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const handleOpen = () => {
    setForm({ username: '', name: '', phone: '', email: '', password: '' });
    setFormError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddDetailer = async () => {
    setFormError('');

    // Validation
    if (!form.username || !form.name || !form.phone || !form.email || !form.password) {
      setFormError('All fields are required');
      return;
    }

    if (form.username.length < 3) {
      setFormError('Username must be at least 3 characters');
      return;
    }

    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setFormLoading(true);

    try {
      console.log('Adding detailer:', { ...form, password: '***' });
      const res = await api.post('/admin/detailers', {
        username: form.username.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'detailer',
      });

      console.log('Detailer added successfully:', res.data);
      setOpen(false);
      fetchDetailers();
    } catch (err) {
      console.error('Error adding detailer:', err);
      console.error('Error response:', err.response?.data);
      setFormError(err.response?.data?.message || err.message || 'Failed to add detailer');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Manage Detailers
        </Typography>
        <Box>
          <Button variant="outlined" startIcon={<PersonAdd />} sx={{ mr: 2 }} onClick={handleOpen}>
            Add Detailer
          </Button>
          <IconButton color="primary" onClick={fetchDetailers}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Add Detailer Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Detailer</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <TextField
            autoFocus
            margin="dense"
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            required
            helperText="Used for login (3+ characters)"
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            type="email"
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            type="password"
            helperText="At least 6 characters"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddDetailer}
            variant="contained"
            disabled={formLoading}
            sx={{ minWidth: 120 }}
          >
            {formLoading ? 'Adding...' : 'Add Detailer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detailers Table */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Availability</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detailers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No detailers found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  detailers.map((detailer) => (
                    <TableRow key={detailer._id} hover>
                      <TableCell>{detailer.name || '-'}</TableCell>
                      <TableCell>{detailer.username || '-'}</TableCell>
                      <TableCell>{detailer.phone || '-'}</TableCell>
                      <TableCell>{detailer.email || '-'}</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={detailer.isAvailable ?? false}
                              onChange={() => toggleAvailability(detailer._id, detailer.isAvailable)}
                              color="success"
                            />
                          }
                          label={detailer.isAvailable ? 'Available' : 'Busy'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" color="primary">
                          Assign Job
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
}