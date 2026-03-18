# Booking Flow Testing Guide

## Overview
This document outlines the complete customer booking flow through detailer acceptance.

## Fixed Issues

### 1. Customer Booking Flow ✅
- **File**: `src/pages/customer/Booking.jsx`
- **Changes**:
  - Added vehicle type selector (Sedan, SUV, Truck, Van, Motorcycle)
  - Added date and time pickers with validation
  - Added location/address input field
  - Added notes field for special instructions
  - Implemented actual API call to POST `/api/customer/bookings`
  - Added proper error handling and loading states
  - Fixed state passing from Home (expects `package` not `selectedPackage`)

### 2. Backend Booking Model ✅
- **File**: `backend/models/Booking.js`
- **Changes**:
  - Added `vehicleType` field to schema

### 3. Backend Customer Routes ✅
- **File**: `backend/routes/customer.js`
- **Changes**:
  - Updated POST `/api/customer/bookings` to handle `vehicleType`
  - Properly handles location object `{address, latitude, longitude}`

### 4. Backend Detailer Routes ✅
- **File**: `backend/routes/detailer.js`
- **Complete Rewrite**: Replaced mock data with MongoDB queries
- **New Endpoints**:
  - `GET /api/detailer/jobs` - All jobs (assigned or pending)
  - `GET /api/detailer/jobs/today` - Today's jobs only
  - `GET /api/detailer/jobs/:id` - Single job detail
  - `PATCH /api/detailer/jobs/:id/accept` - Accept pending job
  - `PATCH /api/detailer/jobs/:id/reject` - Reject pending job
  - `PATCH /api/detailer/jobs/:id` - Update job status
  - `GET /api/detailer/earnings` - Real earnings from completed jobs

### 5. Detailer TodaysJobs ✅
- **File**: `src/pages/detailer/TodaysJobs.jsx`
- **Status**: Already correctly calls `/api/detailer/jobs/today`
- **Backend**: Route now implemented

### 6. Customer MyBookings ✅
- **File**: `src/pages/customer/MyBookings.jsx`
- **Changes**:
  - Updated status colors to match new status enum
  - Fixed field name from `amount` to `totalPrice`
  - Added display for `vehicleType`

### 7. Detailer Earnings ✅
- **File**: `src/pages/detailer/Earnings.jsx`
- **Changes**:
  - Updated to use `/api/detailer/earnings` endpoint
  - Display `totalEarnings`, `completedJobs`, and `pendingPayment`

## Testing Steps

### Prerequisites
1. MongoDB must be running and connected
2. Backend server running on port 5000
3. Frontend dev server running on port 5173
4. At least one active package in database
5. Test users:
   - Customer account (role: 'customer')
   - Detailer account (role: 'detailer')

### Step 1: Customer Creates Booking

1. **Login as Customer**
   - Navigate to `/login`
   - Enter phone and OTP
   - Should redirect to `/` (customer home)

2. **View Available Packages**
   - Home page should display active packages
   - Each package shows name, price, duration, features, image

3. **Start Booking**
   - Click "Book Now" on any package
   - Should navigate to `/book` with package data

4. **Complete Booking Form**
   - **Step 0**: Verify package details, select vehicle type
   - **Step 1**: Select date (today or future) and time
   - **Step 2**: Enter address and optional notes
   - Click "Confirm Booking"

5. **Verify Booking Created**
   - Should see loading indicator
   - On success, redirects to `/booking-success`
   - BookingSuccess page shows booking summary
   - Click "View Booking" to go to `/bookings/:id`

6. **Check My Bookings**
   - Navigate to `/bookings`
   - New booking should appear with status "PENDING"
   - Should show package name, date/time, vehicle, location, price

### Step 2: Detailer Views and Accepts Job

1. **Login as Detailer**
   - Navigate to `/login`
   - Enter detailer phone and OTP
   - Should redirect to `/detailer/dashboard`

2. **View Today's Jobs**
   - Navigate to `/detailer/jobs/today`
   - Should see the pending booking created by customer
   - Job card shows:
     - Package name
     - Customer name and phone
     - Scheduled time
     - Location
     - Status chip "PENDING"

3. **Accept the Job**
   - Click "Accept" button on pending job
   - Should see loading/update
   - Job status changes to "ACCEPTED"
   - Buttons change to "View & Update Job"

4. **Verify Job Assignment**
   - Check backend: booking.detailer should now be set to detailer's user ID
   - Check backend: booking.status should be 'accepted'

### Step 3: Customer Sees Accepted Booking

1. **Switch Back to Customer Account**
   - Navigate to `/bookings`
   - Refresh page if needed

2. **Verify Booking Status**
   - Booking status should now show "ACCEPTED" (blue/info chip)
   - Detailer name should appear under booking details
   - Click "View Details" to see full booking info

### Step 4: Detailer Updates Job Status (Optional)

1. **As Detailer**
   - Navigate to job detail (if implemented)
   - Update status through stages:
     - `accepted` → `en_route` → `arrived` → `in_progress` → `completed`
   - Each update sends PATCH to `/api/detailer/jobs/:id`

2. **Customer Tracking (Optional)**
   - Customer can refresh bookings to see status updates
   - Status chips change color based on current status

### Step 5: Verify Earnings (After Completion)

1. **As Detailer**
   - Navigate to `/detailer/earnings`
   - Should see:
     - Total Earnings (from completed jobs)
     - Completed Jobs count
     - Pending Payment (from ongoing jobs)

## API Endpoints Summary

### Customer Endpoints
- `GET /api/customer/packages` - List active packages
- `GET /api/customer/bookings` - Customer's bookings
- `GET /api/customer/bookings/:id` - Single booking detail
- `POST /api/customer/bookings` - Create new booking
- `DELETE /api/customer/bookings/:id` - Cancel pending booking

### Detailer Endpoints
- `GET /api/detailer/jobs` - All jobs (assigned or pending)
- `GET /api/detailer/jobs/today` - Today's jobs
- `GET /api/detailer/jobs/:id` - Job detail
- `PATCH /api/detailer/jobs/:id/accept` - Accept pending job
- `PATCH /api/detailer/jobs/:id/reject` - Reject pending job
- `PATCH /api/detailer/jobs/:id` - Update job status
- `GET /api/detailer/earnings` - Earnings summary

## Common Issues & Fixes

### Issue: "No token provided" error
- **Cause**: User not logged in or token expired
- **Fix**: Re-login to get fresh JWT token

### Issue: Booking form validation fails
- **Cause**: Missing required fields
- **Fix**: Ensure vehicle type, date, time, and address are filled

### Issue: Detailer doesn't see pending jobs
- **Cause**: 
  - Booking scheduled for different day (check `/detailer/jobs` instead)
  - MongoDB connection issue
- **Fix**: Check backend logs, verify MONGO_URI

### Issue: Location shows as "—"
- **Cause**: Location sent as string instead of object
- **Fix**: Already fixed - frontend sends `{address: "..."}` object

### Issue: Detailer can't accept already accepted job
- **Cause**: Another detailer already accepted
- **Fix**: Working as intended - first come, first served

## Database Schema Reference

### Booking Schema
```javascript
{
  customer: ObjectId (ref: User),
  package: ObjectId (ref: Package),
  detailer: ObjectId (ref: User) | null,
  scheduledDate: Date,
  vehicleType: String,
  location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  notes: String,
  status: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled',
  totalPrice: Number,
  paymentStatus: 'pending' | 'completed' | 'failed',
  reviewed: Boolean,
  cancelledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Status Flow

```
pending (no detailer assigned)
   ↓
accepted (detailer assigned)
   ↓
en_route (detailer on the way)
   ↓
arrived (detailer at location)
   ↓
in_progress (work started)
   ↓
completed (job finished)
```

OR

```
pending → cancelled (by customer or rejected by detailer)
```

## Next Steps (Future Enhancements)

1. **Real-time Updates**: Implement Socket.IO for live status updates
2. **Push Notifications**: Notify customer when detailer accepts
3. **GPS Tracking**: Show detailer location when en_route
4. **Payment Integration**: M-Pesa STK Push for actual payments
5. **Multi-detailer Assignment**: Algorithm to auto-assign nearest available detailer
6. **Rating System**: Customer reviews after completion
7. **Job History**: Detailed history page for both roles

## Debugging Tips

### Backend Logs
```bash
cd backend
node server.js
# Watch for console.error messages
```

### Frontend Console
- Check browser DevTools Network tab
- Look for 400/500 errors
- Verify request payload matches API expectations

### MongoDB Queries
```javascript
// Check bookings collection
db.bookings.find().pretty()

// Find pending bookings
db.bookings.find({ status: 'pending' }).pretty()

// Find bookings by customer
db.bookings.find({ customer: ObjectId("...") }).pretty()
```

## Success Criteria

✅ Customer can browse packages  
✅ Customer can create booking with vehicle, date, time, location  
✅ Booking saves to MongoDB with status 'pending'  
✅ Detailer sees pending booking in today's jobs  
✅ Detailer can accept job  
✅ Booking status updates to 'accepted'  
✅ Booking.detailer is assigned  
✅ Customer sees updated status and detailer name  
✅ Earnings calculation works based on completed jobs  

---

**Last Updated**: February 4, 2026  
**Tested**: Pending manual testing
