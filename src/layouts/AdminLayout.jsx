// src/layouts/AdminLayout.jsx

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Box,
  Container,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Typography,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/context/AuthContext';


function AdminSidebar({ mobileOpen, setMobileOpen, onLogoutClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', path: '/admin' },
    { text: 'Bookings',  path: '/admin/bookings' },
    { text: 'Detailers', path: '/admin/detailers' },
    { text: 'Packages',  path: '/admin/packages' },
    { text: 'Reports',   path: '/admin/reports' },
    { text: 'Settings',  path: '/admin/settings' },
  ];

  const drawerContent = (
    <Box
      sx={{
        width: 260,
        height: '100%',
        bgcolor: 'background.default',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          ADS Admin
        </Typography>
      </Box>

      <Divider sx={{ opacity: 0.6 }} />

      <Box sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <Box
            key={item.path}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              px: 3,
              py: 1.8,
              cursor: 'pointer',
              bgcolor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
              borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              fontWeight: location.pathname === item.path ? 600 : 500,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
              transition: 'all 0.2s ease',
            }}
          >
            {item.text}
          </Box>
        ))}
      </Box>

      <Divider sx={{ opacity: 0.6 }} />

      <Tooltip title="Logout" placement="right">
        <Box
          onClick={onLogoutClick}
          sx={{
            px: 3,
            py: 1.8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'error.main',
            fontWeight: 500,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08),
            },
            transition: 'all 0.2s ease',
          }}
        >
          <LogoutIcon fontSize="small" />
          Logout
        </Box>
      </Tooltip>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          onClick={() => setMobileOpen(true)}
          sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1300, bgcolor: 'background.paper', boxShadow: 3 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: 260,
            flexShrink: 0,
            height: '100vh',
            position: 'fixed',
            overflowY: 'auto',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          {drawerContent}
        </Box>
      )}

      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: 260 } }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout } = useAuth();

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setLogoutConfirmOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogoutClick={handleLogoutClick} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: !isMobile ? '260px' : 0,
          width: '100%',
          transition: 'margin 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutConfirmOpen}
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 360,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out of your admin account?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleLogoutCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} variant="contained" color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}