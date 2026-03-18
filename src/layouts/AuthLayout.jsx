// src/layouts/AuthLayout.jsx
import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

export default function AuthLayout() {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Outlet />
    </Container>
  );
}