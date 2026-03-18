// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import LogoutIcon from '@mui/icons-material/Logout';
import { api } from '@/services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    revenueThisMonth: 0,
    activeDetailers: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats/overview');
        setStats(res.data ?? {
          totalBookings: 0,
          todayBookings: 0,
          revenueThisMonth: 0,
          activeDetailers: 0,
        });
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Mon', bookings: 12 },
    { name: 'Tue', bookings: 19 },
    { name: 'Wed', bookings: 15 },
    { name: 'Thu', bookings: 22 },
    { name: 'Fri', bookings: 18 },
    { name: 'Sat', bookings: 25 },
    { name: 'Sun', bookings: 14 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: alpha('#f8f9ff', 0.6), width: '100%' }}>
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
          borderBottom: `1px solid ${alpha('#fff', 0.18)}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Typography variant="h5" fontWeight={700} letterSpacing="-0.5px">
            Dashboard Overview
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            sx={{ '&:hover': { bgcolor: alpha('#fff', 0.15) } }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 5, px: { xs: 2, md: 4 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress thickness={4} size={64} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Statistic Cards */}
            {[
              {
                title: 'Total Bookings',
                value: (stats.totalBookings ?? 0).toLocaleString(),
                color: 'primary.main',
              },
              {
                title: "Today's Bookings",
                value: (stats.todayBookings ?? 0).toLocaleString(),
                color: 'success.main',
              },
              {
                title: 'Revenue This Month',
                value: `KSh ${(stats.revenueThisMonth ?? 0).toLocaleString()}`,
                color: 'warning.main',
              },
              {
                title: 'Active Detailers',
                value: (stats.activeDetailers ?? 0).toLocaleString(),
                color: 'info.main',
              },
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color={stat.color}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Weekly Performance Chart */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ p: 4, pb: 2 }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Weekly Performance
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ p: 4, pt: 3 }}>
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: 'none',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                          backgroundColor: alpha(theme.palette.background.paper, 0.96),
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 12 }} />
                      <Bar
                        dataKey="bookings"
                        fill="#1976d2"
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* You can continue adding more sections here (Recent Activity, etc.) */}
          </Grid>
        )}
      </Container>
    </Box>
  );
}