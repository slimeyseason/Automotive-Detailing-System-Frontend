// src/layouts/DetailerLayout.jsx
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Today as TodayIcon,
  WorkOutline as WorkIcon,
  AssignmentTurnedIn as CurrentJobIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useAuth } from '@/context/AuthContext';

const drawerWidth = 240;

export default function DetailerLayout() {
  const { logout: logoutAuth } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    logoutAuth();
  };

  const sidebarItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/detailer/dashboard', tooltip: 'View your main dashboard' },
    { text: 'Available Jobs', icon: <WorkIcon />, path: '/detailer/jobs/available', tooltip: 'View all pending jobs you can accept' },
    { text: 'Current Jobs', icon: <CurrentJobIcon />, path: '/detailer/jobs/current', tooltip: 'View your active job assignments' },
    { text: 'Today\'s Jobs', icon: <TodayIcon />, path: '/detailer/jobs/today', tooltip: 'View jobs scheduled for today' },
    { text: 'Schedule', icon: <ScheduleIcon />, path: '/detailer/schedule', tooltip: 'Manage your work schedule' },
    { text: 'Job History', icon: <HistoryIcon />, path: '/detailer/history', tooltip: 'View past completed jobs' },
    { text: 'Earnings', icon: <MoneyIcon />, path: '/detailer/earnings', tooltip: 'View your earnings and payments' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/detailer/settings', tooltip: 'Manage account settings' },
    { text: 'Logout', icon: <LogoutIcon />, action: () => setLogoutConfirmOpen(true), color: 'error', tooltip: 'Sign out of your account' },
  ];

  const drawerContent = (
    <Box sx={{ width: drawerWidth, height: '100%', bgcolor: 'background.paper', borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
      <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          Detailer Panel
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {sidebarItems.map((item) => (
          <Tooltip key={item.text} title={item.tooltip} placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.path) navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    transform: 'scale(1.04)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 44, color: item.color ? `${item.color}.main` : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar – permanent on desktop, drawer on mobile */}
      {isMobile ? (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1200, bgcolor: 'background.paper', boxShadow: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
              boxShadow: '0 0 28px rgba(0,0,0,0.04)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          pt: { xs: 8, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Outlet />
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to log out? You'll need to sign in again to access your dashboard.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setLogoutConfirmOpen(false)}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}