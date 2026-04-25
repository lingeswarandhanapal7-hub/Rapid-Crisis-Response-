# Integration Notes: Rapid Crisis Response System

These files have been generated as requested without modifying existing core files. Here is how to integrate them into your existing system:

## 1. Database Migration
Run the `migration.sql` script on your PostgreSQL database to create the new tables (`emergencies`, `emergency_events`, `emergency_notifications`).

## 2. Backend Integration
In your existing `backend/server.js`, you need to require and use the new socket handler and routes.

```javascript
// At the top with other imports:
const initializeEmergencySocket = require('./src/emergency/socketHandler');

// After your socket.io instantiation (io = new Server(...)):
const emergencySocketHandlers = initializeEmergencySocket(io);

// Store handlers if you need to access them from other controllers (e.g., vitals controller)
app.set('emergencySocket', emergencySocketHandlers);

// Down in your routes section:
app.use('/api/emergency', require('./src/routes/emergencyRoutes'));
```

### Vitals Auto-trigger
In your existing code that handles vital inserts (e.g., `vitalsController.js`), add the smart alert logic:
```javascript
const emergencySockets = req.app.get('emergencySocket');

// ... inside your vitals insert function ...
if (pulse < 50 || pulse > 120 || spo2 < 90) {
  // Call the trigger API logic internally, or just emit the event
  emergencySockets.emitVitalsBreach({
    patient_id: patientId,
    metric: pulse < 50 || pulse > 120 ? 'pulse' : 'spo2',
    value: pulse < 50 || pulse > 120 ? pulse : spo2,
    threshold: pulse < 50 ? 50 : (pulse > 120 ? 120 : 90)
  });
  
  // You would also call your internal service to create the emergency record
}
```

## 3. Frontend Integration

### Context/Socket Setup
You will need to pass your Socket.io instance to the new components. The components currently have commented-out `useSocket()` hooks, which you should uncomment and point to your actual Socket context.

### Mounting the Alert Feed
Mount the `AlertFeed` component at a high level in your application (e.g., inside `App.jsx` or your main `Layout` component) so it can display alerts globally:
```jsx
import AlertFeed from './components/emergency/AlertFeed';

// Inside your layout/main app structure:
<AlertFeed userId={currentUser.id} />
```

### Routing the Dashboard
Add a new route to your router for `/emergency`:
```jsx
import CrisisDashboard from './components/emergency/CrisisDashboard';

// Inside your Routes:
<Route path="/emergency" element={
  <ProtectedRoute allowedRoles={['chief_doctor', 'doctor']}>
    <CrisisDashboard currentUserRole={currentUser.role} currentUserId={currentUser.id} />
  </ProtectedRoute>
} />
```

### Adding the Emergency Button
Mount the `EmergencyButton` in your patient view or staff view as needed:
```jsx
import EmergencyButton from './components/emergency/EmergencyButton';

// Inside Patient Dashboard or Bedside View:
<EmergencyButton role={currentUser.role} patientId={patient.id} userId={currentUser.id} />
```
