// src/pages/shared/NotFound.jsx
import { Box, Typography, Button, Container } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <SentimentDissatisfied sx={{ fontSize: 120, color: 'grey.400', mb: 4 }} />

        <Typography variant="h2" fontWeight={700} color="text.primary" gutterBottom>
          404
        </Typography>

        <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Oops! Page not found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 500 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/')}
          sx={{ px: 5, py: 1.5 }}
        >
          Go Back to Home
        </Button>
      </Box>
    </Container>
  );
}