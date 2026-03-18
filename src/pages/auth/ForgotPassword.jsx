// src/pages/auth/ForgotPassword.jsx
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
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { useAuth } from '@/context/AuthContext'; // adjust path to your auth context

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { sendOtp, loading: authLoading } = useAuth();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const cleanedPhone = phone.trim().replace(/\s+/g, '');

    // Basic Kenyan phone validation
    if (!/^0[17][0-9]{8}$/.test(cleanedPhone)) {
      setError('Please enter a valid Kenyan phone number (07xxxxxxxx)');
      return;
    }

    try {
      // We reuse the same sendOtp function as login
      await sendOtp(cleanedPhone, { purpose: 'reset' }); // optional purpose flag if your backend differentiates

      setSuccess(true);
      // Auto-redirect to OTP verification after short delay
      setTimeout(() => {
        navigate('/verify-otp', {
          state: {
            phone: cleanedPhone,
            mode: 'reset', // tell VerifyOTP this is for password reset
          },
        });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to send reset code. Please try again later.'
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/login')}
            sx={{ textTransform: 'none' }}
          >
            Back to Login
          </Button>
        </Box>

        <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight={600}>
          Reset Access
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Enter your phone number and we'll send you a verification code to reset your access.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Verification code sent! Redirecting to verification...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            required
            label="Phone Number"
            placeholder="0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneAndroidIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 4 }}
            autoFocus
            inputMode="tel"
            disabled={success || authLoading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={authLoading || success || !phone.trim()}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              textTransform: 'none',
            }}
          >
            {authLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : success ? (
              'Code Sent!'
            ) : (
              'Send Reset Code'
            )}
          </Button>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Remember your credentials?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              underline="hover"
            >
              Back to Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}