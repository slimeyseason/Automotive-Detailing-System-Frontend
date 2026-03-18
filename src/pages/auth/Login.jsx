// Modified File: src/pages/auth/Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  alpha,
} from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Assuming we add a 'login' function in AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error('Username and password are required');
      }

      // Call the login function from context
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'linear-gradient(135deg, #f0f2f5 0%, #e5e9f2 100%)',
        px: { xs: 2, sm: 3 },
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          p: { xs: 4, sm: 5 },
          borderRadius: 5,
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.04)',
          border: '1px solid',
          borderColor: alpha('#e0e0e0', 0.6),
          overflow: 'hidden',
        }}
      >
        {/* Optional subtle background accent */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 200,
            height: 200,
            bgcolor: 'primary.main',
            opacity: 0.07,
            borderRadius: '50%',
            filter: 'blur(80px)',
            zIndex: -1,
          }}
        />

        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          align="center"
          sx={{
            mb: 1.5,
            background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome Back
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4.5 }}
        >
          Sign in to access your dashboard
        </Typography>

        {error && (
          <Alert
            severity="error"
            variant="filled"
            sx={{
              mb: 3.5,
              py: 1.2,
              px: 2.4,
              borderRadius: 2.5,
              fontSize: '0.94rem',
              bgcolor: alpha('#f44336', 0.92),
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleRoundedIcon sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: 'background.paper',
                '& fieldset': { borderColor: alpha('#000', 0.14) },
                '&:hover fieldset': { borderColor: 'primary.main' },
              },
            }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            variant="outlined"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockRoundedIcon sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: 'background.paper',
                '& fieldset': { borderColor: alpha('#000', 0.14) },
                '&:hover fieldset': { borderColor: 'primary.main' },
              },
            }}
            sx={{ mb: 3.5 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !username.trim() || !password.trim()}
            sx={{
              py: 1.8,
              borderRadius: 3,
              fontSize: '1.05rem',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.28)',
              transition: 'all 0.22s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 12px 32px rgba(25, 118, 210, 0.36)',
                background: 'linear-gradient(90deg, #1565c0 0%, #2196f3 100%)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={26} color="inherit" thickness={4.5} />
            ) : (
              'Sign In'
            )}
          </Button>

          <Button
            fullWidth
            variant="text"
            disableRipple
            sx={{
              mt: 2.5,
              color: 'text.secondary',
              fontSize: '0.94rem',
              textTransform: 'none',
              '&:hover': { bgcolor: alpha('#000', 0.04) },
            }}
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </Button>
        </form>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderColor: alpha('#1976d2', 0.5),
            color: 'primary.main',
            transition: 'all 0.22s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha('#1976d2', 0.04),
              transform: 'translateY(-1px)',
            },
          }}
          onClick={() => navigate('/')}
        >
          Back to Homepage
        </Button>

        <Typography
          variant="caption"
          color="text.disabled"
          align="center"
          component="div"
          sx={{ mt: 5, fontSize: '0.81rem' }}
        >
          By continuing, you agree to our{' '}
          <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
            Terms
          </Box>{' '}
          &{' '}
          <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
            Privacy Policy
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
}