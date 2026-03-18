// src/pages/admin/Bookings.jsx
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
  TablePagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { api } from '@/services/api';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [page, rowsPerPage, statusFilter, searchTerm, dateFrom, dateTo]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      // Only add params if they have values
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      if (dateFrom) params.from = dateFrom.format('YYYY-MM-DD');
      if (dateTo) params.to = dateTo.format('YYYY-MM-DD');

      console.log('Fetching admin bookings with params:', params);
      const res = await api.get('/admin/bookings', { params });
      console.log('Admin bookings response:', res.data);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      accepted: 'info',
      en_route: 'primary',
      arrived: 'primary',
      in_progress: 'secondary',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        All Bookings
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            label="Search (customer / phone / booking #)"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 240 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="en_route">En Route</MenuItem>
              <MenuItem value="arrived">Arrived</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From"
              value={dateFrom}
              onChange={setDateFrom}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="To"
              value={dateTo}
              onChange={setDateTo}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>

          <IconButton color="primary" onClick={fetchBookings}>
            <Refresh />
          </IconButton>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No bookings found. {statusFilter || searchTerm || dateFrom || dateTo ? 'Try adjusting your filters.' : 'Bookings will appear here once customers make reservations.'}
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Booking #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Date / Time</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Detailer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.bookingNumber || booking._id.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>
                      {booking.customer?.name}<br/>
                      <small>{booking.customer?.phone}</small>
                    </TableCell>
                    <TableCell>{booking.package?.name}</TableCell>
                    <TableCell>
                      {new Date(booking.scheduledDate).toLocaleString('en-KE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell>KSh {booking.totalPrice?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status?.toUpperCase()}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{booking.detailer?.name || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={bookings.length} // replace with totalCount from API in real app
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}
    </Container>
  );
}