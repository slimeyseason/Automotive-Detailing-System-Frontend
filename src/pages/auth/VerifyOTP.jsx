// src/pages/auth/VerifyOTP.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Link,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MuiOtpInput } from 'mui-one-time-password-input'; // ← install: npm install mui-one-time-password-input
import { useAuth } from '@/context/AuthContext'; // adjust path

export default function VerifyOTP() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, loading: authLoading } = useAuth();

  const phone = state?.phone || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!phone) {
      navigate('/login', { replace: true });
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleChange = (newValue) => {
    setOtp(newValue);
    setError('');
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    try {
      await verifyOtp(phone, otp);
      // On success, AuthContext handles role-based redirect
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendCountdown(60);
    setError('');
    setOtp('');

    try {
      await useAuth().sendOtp(phone); // reuse sendOtp from context
      // Optional success toast
    } catch (err) {
      setError('Failed to resend OTP. Try again later.');
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
            Back
          </Button>
        </Box>

        <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight={600}>
          Verify Phone Number
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Enter the 6-digit code sent to{' '}
          <strong>{phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</strong>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <MuiOtpInput
            value={otp}
            onChange={handleChange}
            length={6}
            autoFocus
            gap={1.5}
            sx={{
              '& .MuiOtpInput-InputBase': {
                fontSize: '1.6rem',
                fontWeight: 600,
                height: 64,
                width: 56,
              },
            }}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={otp.length !== 6 || authLoading}
          onClick={handleVerify}
          sx={{ py: 1.5, mb: 3 }}
        >
          {authLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Didn't receive code?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={handleResend}
              disabled={!canResend}
              underline="hover"
            >
              Resend {canResend ? '' : `(${resendCountdown}s)`}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}