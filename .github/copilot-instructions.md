# AI Coding Agent Instructions - ADS (Auto Detailing Service)

## Project Overview

ADS is a React 18 + Vite frontend for a mobile car detailing service marketplace. It features role-based UI (Customer, Detailer, Admin) with phone-OTP authentication, real-time location services, and booking management.

**Stack:** React 18, React Router v6, Material-UI (MUI) v6, Axios, Socket.IO, Vite

## Architecture & Data Flow

### Authentication & User Context
- **Source:** [`src/context/AuthContext.jsx`](src/context/AuthContext.jsx)
- **Key Flow:** Token stored in localStorage → JWT decoded on mount → User object in context with `{id, phone, role, name}`
- **Roles:** `customer`, `detailer`, `admin` (from JWT payload)
- **Token Management:** Axios interceptor adds `Authorization: Bearer {token}` to all requests; 401 responses trigger logout
- **OTP Flow:** `sendOtp(phone)` → navigate to `/verify-otp` → `verifyOtp(phone, otp)` → token stored → auto-redirect by role

### API Endpoint Conventions
- **Base URL:** `import.meta.env.VITE_API_URL` or fallback `http://localhost:5000/api`
- **Pattern:** All requests use shared Axios instance from AuthContext with interceptors
- **Admin endpoints:** `/admin/detailers`, `/admin/detailers/{id}/availability`, `/admin/packages`, `/admin/bookings`
- **Customer endpoints:** `/packages?active=true`, `/bookings`, `/bookings/{id}`
- **Detailer endpoints:** `/detailer/jobs`, `/detailer/earnings`

### Routing Structure
- **Layout wrapping:** All routes nest in layouts (AuthLayout, CustomerLayout, DetailerLayout, AdminLayout)
- **ProtectedRoute in App.jsx:** Checks authentication, redirects unauthenticated → `/login`, enforces role-based access (redirects mismatched roles to their home)
- **Customer home:** `/` (Home.jsx fetches active packages)
- **Admin base:** `/admin` with sub-routes: `/admin/packages`, `/admin/bookings`, `/admin/detailers`, `/admin/reports`, `/admin/settings`

## Code Patterns & Conventions

### Component State Management
- **Local state for UI:** `useState` for form inputs, loading states, data
- **useEffect for data fetching:** Always use dependency array; set loading state before fetch, clear after
- **Pattern example** ([src/pages/admin/Detailers.jsx](src/pages/admin/Detailers.jsx#L23-L45)):
  ```jsx
  const [detailers, setDetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDetailers();
  }, []);
  
  const fetchDetailers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/detailers');
      setDetailers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  ```

### UI Components
- **MUI components:** Use `@mui/material` (v6) for all UI — Container, Box, Paper, Table, TextField, Button, Card, Dialog, etc.
- **Styling:** Use `sx` prop for inline styles (emotion); prefer semantic MUI props (`variant`, `color`, `size`)
- **Icons:** From `@mui/icons-material` (e.g., `Refresh`, `PersonAdd`)
- **Loading states:** CircularProgress in center with Box `{textAlign: 'center', py: 8}`
- **Forms:** TextField with InputAdornment for icons, Alert for errors, use `onSubmit` preventDefault pattern

### Import Aliasing
- **Used:** `import { api } from '@/services/api'` (Vite alias `@` → `src/`)
- **Always use `@/` for internal imports** to keep paths clean and relocatable

### Error Handling & User Feedback
- **API errors:** Catch and log; show Alert component for user-facing errors
- **Phone validation:** Kenyan format check in Login — `/^0[17][0-9]{8}$/`
- **Form validation:** Basic client-side only currently; server validates and responds with 400/422

### Navigation Patterns
- **useNavigate hook:** `navigate('/path')` or `navigate('/path', { state: { data } })`
- **No hardcoded redirects:** Leverage ProtectedRoute role-based redirect in App.jsx
- **Success patterns:** Navigate to success page then to list (e.g., booking → BookingSuccess → `/bookings`)

## Developer Workflow

### Build & Run
- **Dev server:** `npm run dev` (Vite on http://localhost:5173)
- **Production build:** `npm run build` (outputs to `dist/`)
- **Preview build:** `npm run preview`
- **Linting:** `npm run lint` (ESLint config in .eslintrc or auto-detected)
- **Formatting:** `npm run format` (Prettier, targets src/**/*.{js,jsx,ts,tsx,css,md})

### Environment Configuration
- **File:** `.env` (not in repo; `.env.example` recommended)
- **Variables:** `VITE_API_URL=http://localhost:5000/api` (used in AuthContext)
- **Vite convention:** Prefix with `VITE_` to expose to frontend

### Testing (Not yet implemented)
- ESLint configured for React + React Hooks
- No Jest/Vitest setup yet — consider adding for unit tests

## Key Files & Responsibilities

| Path | Purpose |
|------|---------|
| [`src/context/AuthContext.jsx`](src/context/AuthContext.jsx) | Centralized auth state, token management, API interceptor |
| [`src/App.jsx`](src/App.jsx) | Route definitions, ProtectedRoute wrapper, layout nesting |
| [`src/layouts/*.jsx`](src/layouts) | Page wrappers (Container + Outlet) for consistent styling per role |
| [`src/pages/{auth,customer,detailer,admin}/*.jsx`](src/pages) | Role-specific feature pages |
| [`src/components/*.jsx`](src/components) | Reusable UI components (LoadingSpinner, ToastNotification, etc.) |
| [`src/services/api.js`](src/services/api.js) | Axios instance (currently empty — uses AuthContext instance) |
| [`public/index.html`](public/index.html) | Entry point with root div |

## Common Tasks

### Adding a New Admin Feature
1. Create page file in [`src/pages/admin/{Feature}.jsx`](src/pages/admin)
2. Import and add route to App.jsx inside `<AdminLayout>` with `allowedRoles={['admin']}`
3. Use `api.get('/admin/{endpoint}')` for data; leverage useEffect + useState pattern
4. Style with MUI Container, Box, Card, Table — never use custom CSS
5. Add error boundary or try-catch in data-fetching logic

### Adding Authentication Logic
1. Update [`AuthContext.jsx`](src/context/AuthContext.jsx) with new method (e.g., `logout`, `resetPassword`)
2. Expose from context return object for pages to call via `const { method } = useAuth()`
3. Test OTP flow: Login → VerifyOTP → Token stored → Auto-redirect to role home

### Real-Time Updates
- **Socket.IO:** [`src/services/socket.js`](src/services/socket.js) stub exists; implement connection, listeners (job updates, notifications)
- **Pattern:** Emit events from detailer actions; admin/customer listen for live updates

## Gotchas & Best Practices

- **API instance:** Always use `api` from AuthContext; never create raw axios — token + interceptors required
- **localStorage:** Only used for JWT token; clear on logout (AuthContext handles)
- **Phone format:** Validate locally (Kenyan numbers); backend also validates
- **No global state beyond auth:** Use Context for auth only; keep component state local for simplicity
- **Responsive design:** Use Grid `xs/sm/md/lg` props; MUI Container handles breakpoints
- **Images:** Use `imageUrl || placeholder` fallback to avoid broken images
- **Performance:** Components re-render on auth changes; consider useMemo for expensive computations if needed
- **TypeScript:** Not used; JSDoc comments optional but encouraged for complex functions

## Version Info

- React: 18.3.1
- React Router: 6.28.0
- MUI: 6.1.3
- Vite: 7.3.1
- Node.js: 18+ recommended
