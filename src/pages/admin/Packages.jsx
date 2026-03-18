// src/pages/admin/Packages.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Alert,
  CardMedia,
} from '@mui/material';
import { Edit, Delete, Add, Image as ImageIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    pricing: {
      sedan: '',
      suv: '',
      truck: '',
      van: '',
    },
    duration: '',
    description: '',
    type: 'Standard Services Packages',
    image: '',
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const { api: authApi } = useAuth();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  const packageTypes = [
    'Standard Services Packages',
    'Specialized & High-End Services',
    'Individual Add-On Services'
  ];

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await authApi.get('/admin/packages');
      console.log('Fetched packages:', res.data);
      setPackages(res.data || []);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupedPackages = packageTypes.reduce((acc, type) => {
    acc[type] = packages.filter((pkg) => pkg.type === type);
    return acc;
  }, {});

  const handleOpenDialog = (pkg = null) => {
    if (pkg) {
      setFormData({
        name: pkg.name || '',
        price: pkg.price || '',
        pricing: pkg.pricing || {
          sedan: pkg.price || '',
          suv: pkg.price ? pkg.price * 1.2 : '',
          truck: pkg.price ? pkg.price * 1.3 : '',
          van: pkg.price ? pkg.price * 1.25 : '',
        },
        duration: pkg.duration || '',
        description: pkg.description || '',
        type: pkg.type || 'Standard Services Packages',
        image: pkg.image || '',
        active: !!pkg.active,
      });
      setEditingId(pkg._id || pkg.packageId);
      setImagePreview(pkg.image || null);
    } else {
      setFormData({
        name: '',
        price: '',
        pricing: {
          sedan: '',
          suv: '',
          truck: '',
          van: '',
        },
        duration: '',
        description: '',
        type: 'Standard Services Packages',
        image: '',
        active: true,
      });
      setEditingId(null);
      setImagePreview(null);
    }
    setImageFile(null);
    setUploadError('');
    setOpenDialog(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploadError('');

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.duration) {
      setUploadError('Please fill in all required fields');
      return;
    }

    // Validate that at least one pricing tier is set
    const hasPricing = Object.values(formData.pricing).some(p => p && Number(p) > 0);
    if (!hasPricing && !formData.price) {
      setUploadError('Please set at least one vehicle price');
      return;
    }

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);

        const uploadRes = await authApi.post('/admin/upload/image', formDataImg, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        imageUrl = uploadRes.data.url || uploadRes.data.imageUrl || '';
      }

      const packageData = { 
        ...formData, 
        image: imageUrl, 
        price: Number(formData.price) || Number(formData.pricing.sedan) || 0,
        pricing: {
          sedan: Number(formData.pricing.sedan) || 0,
          suv: Number(formData.pricing.suv) || 0,
          truck: Number(formData.pricing.truck) || 0,
          van: Number(formData.pricing.van) || 0,
        }
      };

      if (editingId) {
        await authApi.put(`/admin/packages/${editingId}`, packageData);
      } else {
        await authApi.post('/admin/packages', packageData);
      }

      setOpenDialog(false);
      setImageFile(null);
      setImagePreview(null);
      fetchPackages();
    } catch (err) {
      console.error('Save package error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save package';
      setUploadError(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await authApi.delete(`/admin/packages/${id}`);
      fetchPackages();
    } catch (err) {
      alert('Failed to delete package');
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Service Packages
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add New Package
        </Button>
      </Box>

      {packageTypes.map((type) => {
        const typePackages = groupedPackages[type];
        if (!typePackages?.length) return null;

        return (
          <Box key={type} sx={{ mb: 5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
              {type} Packages
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Price (KSh)</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {typePackages.map((pkg) => (
                    <TableRow key={pkg._id || pkg.packageId}>
                      <TableCell>
                        <Avatar
                          src={getImageUrl(pkg.image)}
                          variant="rounded"
                          sx={{ 
                            width: 64, 
                            height: 64,
                            bgcolor: 'grey.200'
                          }}
                        >
                          <ImageIcon />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{pkg.name}</Typography>
                        {pkg.description && (
                          <Typography variant="caption" color="text.secondary">
                            {pkg.description.substring(0, 60)}
                            {pkg.description.length > 60 ? '...' : ''}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {pkg.pricing && (pkg.pricing.sedan || pkg.pricing.suv) ? (
                          <Box>
                            {pkg.pricing.sedan > 0 && (
                              <Typography variant="body2">Sedan: KSh {Number(pkg.pricing.sedan).toLocaleString()}</Typography>
                            )}
                            {pkg.pricing.suv > 0 && (
                              <Typography variant="body2">SUV: KSh {Number(pkg.pricing.suv).toLocaleString()}</Typography>
                            )}
                            {pkg.pricing.truck > 0 && (
                              <Typography variant="body2">Truck: KSh {Number(pkg.pricing.truck).toLocaleString()}</Typography>
                            )}
                            {pkg.pricing.van > 0 && (
                              <Typography variant="body2">Van: KSh {Number(pkg.pricing.van).toLocaleString()}</Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography fontWeight={600}>
                            KSh {Number(pkg.price).toLocaleString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{pkg.duration}</TableCell>
                      <TableCell>
                        <Chip
                          label={pkg.active ? 'Active' : 'Inactive'}
                          color={pkg.active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(pkg)} color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(pkg._id || pkg.packageId)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}

      {packages.length === 0 && (
        <Paper sx={{ p: 5, textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            No packages found. Click "Add New Package" to create one.
          </Typography>
        </Paper>
      )}

      {/* ────────────────────────────────────────────── */}
      {/*               Create / Edit Dialog               */}
      {/* ────────────────────────────────────────────── */}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Package' : 'New Package'}</DialogTitle>

        <DialogContent>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setUploadError('')}>
              {uploadError}
            </Alert>
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Package Type *</InputLabel>
            <Select
              value={formData.type}
              label="Package Type *"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {packageTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            required
            label="Package Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Duration"
            placeholder="e.g. 45 min, 2 hours"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            margin="normal"
          />

          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
            Pricing by Vehicle Size (KSh)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Set different prices for different vehicle sizes. At least one price is required.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Sedan / Hatchback"
              type="number"
              value={formData.pricing.sedan}
              onChange={(e) => setFormData({ 
                ...formData, 
                pricing: { ...formData.pricing, sedan: e.target.value }
              })}
              inputProps={{ min: 0 }}
              placeholder="e.g. 1500"
            />
            <TextField
              label="SUV"
              type="number"
              value={formData.pricing.suv}
              onChange={(e) => setFormData({ 
                ...formData, 
                pricing: { ...formData.pricing, suv: e.target.value }
              })}
              inputProps={{ min: 0 }}
              placeholder="e.g. 2000"
            />
            <TextField
              label="Truck / Pickup"
              type="number"
              value={formData.pricing.truck}
              onChange={(e) => setFormData({ 
                ...formData, 
                pricing: { ...formData.pricing, truck: e.target.value }
              })}
              inputProps={{ min: 0 }}
              placeholder="e.g. 2500"
            />
            <TextField
              label="Van / Minibus"
              type="number"
              value={formData.pricing.van}
              onChange={(e) => setFormData({ 
                ...formData, 
                pricing: { ...formData.pricing, van: e.target.value }
              })}
              inputProps={{ min: 0 }}
              placeholder="e.g. 2200"
            />
          </Box>

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Package Image
            </Typography>

            <Button variant="outlined" component="label" startIcon={<ImageIcon />} sx={{ mb: 2 }}>
              {imageFile ? 'Change Image' : editingId ? 'Replace Image' : 'Upload Image'}
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>

            {imagePreview && (
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <CardMedia
                  component="img"
                  image={imageFile ? imagePreview : getImageUrl(imagePreview)}
                  alt="preview"
                  sx={{
                    maxHeight: 280,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                {imageFile && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {imageFile.name}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            }
            label="Active (visible to customers)"
            sx={{ mt: 3 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}