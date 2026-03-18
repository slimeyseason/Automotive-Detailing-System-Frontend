# Booking Assignment Strategy

## Current Implementation Status

✅ Customer creates booking with `status: 'pending'` and `detailer: null`  
✅ Detailers can see pending jobs in TodaysJobs  
✅ Detailers can accept jobs (assigns them & changes status to `accepted`)  
✅ Backend prevents double-assignment  

## Recommended Approach: Enhanced Marketplace Model

### Flow

```
Customer Books → Pending Job → Detailers See It → First to Accept Gets It → Customer Notified
```

### Implementation Steps

#### 1. Add Detailer Dashboard Notifications (Priority: HIGH)

**File:** `src/pages/detailer/Dashboard.jsx`

Add a "New Jobs Available" banner showing count of pending jobs:

```jsx
const [pendingCount, setPendingCount] = useState(0);

useEffect(() => {
  fetchPendingCount();
  // Poll every 30 seconds for new jobs
  const interval = setInterval(fetchPendingCount, 30000);
  return () => clearInterval(interval);
}, []);

const fetchPendingCount = async () => {
  const res = await api.get('/detailer/jobs?status=pending');
  setPendingCount(res.data.jobs.filter(j => !j.detailer).length);
};
```

#### 2. Update TodaysJobs to Show ALL Pending Jobs (Not Just Today)

**File:** `src/pages/detailer/TodaysJobs.jsx`

Change to show:
- **Section 1:** Pending jobs available to accept (any date)
- **Section 2:** Your accepted jobs for today
- **Section 3:** Your upcoming jobs

#### 3. Add Real-time Notifications (Optional but Recommended)

**When to notify detailers:**
- New booking created → Notify all available detailers
- Job accepted by someone else → Remove from other detailers' view

**Implementation:**
- Use Socket.IO (already stubbed in `src/services/socket.js`)
- Server emits `new-booking` event when customer books
- Detailers listen and refresh their job list

#### 4. Prevent Double Acceptance (Already Implemented ✅)

Backend already checks:
```javascript
if (job.detailer && job.detailer.toString() !== req.user.id) {
  return res.status(400).json({
    message: 'Job already assigned to another detailer'
  });
}
```

#### 5. Add Filters for Detailers

**In TodaysJobs or new "Available Jobs" page:**

```jsx
Filters:
- Distance from current location (requires GPS)
- Vehicle type (Sedan, SUV, etc.)
- Time slot
- Price range
- Customer rating
```

---

## Alternative Option 2: Smart Auto-Assignment

**How it works:**
1. Customer creates booking
2. System automatically assigns to best detailer based on:
   - Proximity to job location
   - Current availability
   - Rating
   - Workload balance
3. Detailer gets notification
4. Detailer can decline (system reassigns)

**Pros:**
- Faster for customers
- Optimal matching
- Fair workload distribution

**Cons:**
- Requires GPS location from detailers
- More complex algorithm
- Detailers have less control

**Implementation:**

### Add to `backend/routes/customer.js` - POST booking:

```javascript
// After booking is created
const assignedDetailer = await autoAssignDetailer(booking);
if (assignedDetailer) {
  booking.detailer = assignedDetailer._id;
  booking.status = 'assigned'; // or keep as 'pending'
  await booking.save();
  
  // Send notification to detailer
  notifyDetailer(assignedDetailer._id, booking._id);
}
```

### Create assignment algorithm:

```javascript
// backend/services/assignmentService.js
async function autoAssignDetailer(booking) {
  const availableDetailers = await User.find({
    role: 'detailer',
    isAvailable: true,
    status: 'active'
  });

  // Get each detailer's current workload
  const detailersWithLoad = await Promise.all(
    availableDetailers.map(async (detailer) => {
      const activeJobs = await Booking.countDocuments({
        detailer: detailer._id,
        status: { $in: ['pending', 'accepted', 'en_route', 'in_progress'] }
      });
      
      return {
        detailer,
        activeJobs,
        // Add distance calculation here if GPS available
      };
    })
  );

  // Sort by: 1) least workload, 2) highest rating
  detailersWithLoad.sort((a, b) => {
    if (a.activeJobs !== b.activeJobs) {
      return a.activeJobs - b.activeJobs;
    }
    return (b.detailer.rating || 0) - (a.detailer.rating || 0);
  });

  return detailersWithLoad[0]?.detailer;
}
```

---

## Alternative Option 3: Admin Manual Assignment

**How it works:**
1. Customer creates booking → Status: `pending`
2. Admin reviews and assigns to specific detailer
3. Detailer gets notification

**Pros:**
- Full control
- Can match based on special requirements
- Handle edge cases

**Cons:**
- Requires admin intervention
- Slower response time
- Doesn't scale well

**Implementation:**

Already partially possible via admin bookings page. Just add:

```javascript
// backend/routes/admin.js
router.patch('/bookings/:id/assign', verifyAdmin, async (req, res) => {
  const { detailerId } = req.body;
  
  const booking = await Booking.findById(req.params.id);
  booking.detailer = detailerId;
  booking.status = 'accepted';
  await booking.save();
  
  res.json({ success: true, booking });
});
```

---

## Recommended Hybrid Approach

Combine the best of all:

### Default: Marketplace (Detailers Accept)
- Most jobs work this way
- Fast and self-managing

### Fallback: Auto-Assignment After Timeout
- If no detailer accepts within 15 minutes
- System auto-assigns to best available

### Manual: Admin Override
- Admin can always manually assign
- For special cases or problem bookings

### Implementation Priority:

1. ✅ **Marketplace** (Already 80% done) - Finish it first
2. 📊 **Add detailer notifications/dashboard**
3. 🔔 **Socket.IO real-time updates**
4. 🤖 **Auto-assignment fallback** (after 15 min timeout)
5. 🗺️ **GPS-based matching** (future enhancement)

---

## Quick Wins to Implement Now

### 1. Update Detailer Dashboard to Show Pending Count

```jsx
// src/pages/detailer/Dashboard.jsx
<Alert severity="info" action={
  <Button onClick={() => navigate('/detailer/jobs/available')}>
    View Jobs
  </Button>
}>
  {pendingCount} new jobs available to accept!
</Alert>
```

### 2. Create "Available Jobs" Page

New route: `/detailer/jobs/available`

Shows all pending jobs (not just today) that detailer can accept.

### 3. Add Job Expiry

```javascript
// backend - scheduled job or check on query
const OLD_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

// Auto-cancel bookings pending too long
const expiredBookings = await Booking.find({
  status: 'pending',
  detailer: null,
  createdAt: { $lt: new Date(Date.now() - OLD_THRESHOLD) }
});

for (const booking of expiredBookings) {
  booking.status = 'cancelled';
  booking.notes = 'No detailer available';
  await booking.save();
  // Notify customer
}
```

### 4. Add Customer Booking Status Updates

Show customer real-time status:
- "Finding detailer..." (pending)
- "Detailer assigned!" (accepted)
- "Detailer on the way" (en_route)

---

## Metrics to Track

Once implemented, monitor:
- Average time from booking to acceptance
- % of jobs auto-assigned vs manually accepted
- Detailer utilization rate
- Customer satisfaction by assignment method

---

## Next Steps

Would you like me to implement:
1. **Enhanced marketplace** (add pending count, available jobs page)
2. **Socket.IO real-time** (notify detailers of new jobs instantly)
3. **Auto-assignment fallback** (assign after timeout)
4. All of the above?
