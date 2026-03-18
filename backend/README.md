# ADS Backend API

Node.js/Express backend for the Auto Detailing Service (ADS) application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_change_in_production
   ```

3. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The API will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token

### Customer
- `GET /api/packages` - Get all active packages
- `GET /api/packages/:id` - Get package details
- `GET /api/bookings` - Get customer's bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/:id` - Cancel booking

### Detailer
- `GET /api/detailer/jobs` - Get assigned jobs
- `GET /api/detailer/job/:id` - Get job details
- `PATCH /api/detailer/job/:id` - Update job status
- `GET /api/detailer/earnings` - Get earnings info

### Admin
- `GET /api/admin/detailers` - List all detailers
- `GET /api/admin/detailers/:id` - Get detailer details
- `GET /api/admin/detailers/:id/availability` - Get detailer availability
- `POST /api/admin/detailers` - Add new detailer
- `GET /api/admin/packages` - List packages
- `POST /api/admin/packages` - Create package
- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/reports` - Get statistics/reports

## Test OTP

For development, check the server console for the generated OTP when calling `/api/auth/send-otp`.

Example flow:
1. Send OTP: `POST /api/auth/send-otp` with `{ "phone": "0712345678" }`
2. Check console for OTP
3. Verify OTP: `POST /api/auth/verify-otp` with `{ "phone": "0712345678", "otp": "123456" }`
4. Use returned token in Authorization header: `Bearer {token}`
