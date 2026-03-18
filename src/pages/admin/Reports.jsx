// src/pages/admin/Reports.jsx
import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });

  // Placeholder data — in real app fetch from /admin/reports?from=...&to=...
  const revenueData = [
    { name: 'Jan', revenue: 420000 },
    { name: 'Feb', revenue: 580000 },
    { name: 'Mar', revenue: 650000 },
    { name: 'Apr', revenue: 720000 },
  ];

  const handleGenerate = () => {
    // Call API with dateRange.from & dateRange.to
    console.log('Generate report for:', dateRange);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Reports & Analytics
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Date Range
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From"
              value={dateRange.from}
              onChange={(val) => setDateRange({ ...dateRange, from: val })}
            />
            <DatePicker
              label="To"
              value={dateRange.to}
              onChange={(val) => setDateRange({ ...dateRange, to: val })}
            />
          </LocalizationProvider>
          <Button variant="contained" onClick={handleGenerate}>
            Generate Report
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Packages
              </Typography>
              {/* Add another chart or list here */}
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Package performance chart placeholder</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}