// src/pages/detailer/Earnings.jsx
import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { api } from '@/services/api';

export default function Earnings() {
  const [summary, setSummary] = useState({ 
    totalEarnings: 0, 
    completedJobs: 0, 
    pendingPayment: 0 
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get('/detailer/earnings');
        setSummary(res.data || { totalEarnings: 0, completedJobs: 0, pendingPayment: 0 });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

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
        Earnings Overview
      </Typography>

      {/* Main Earnings Card */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Total Earnings
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
                    KSh {summary.totalEarnings?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.85 }}>
                    from {summary.completedJobs || 0} completed jobs
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 56, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Pending Payment
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
                    KSh {summary.pendingPayment?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.85 }}>
                    from ongoing jobs
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 56, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Payments Section */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Recent Payments
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Job</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* You can fetch and map recent payouts here */}
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                Detailed payment history coming soon...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}