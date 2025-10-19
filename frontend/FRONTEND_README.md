# Task Management System - Frontend

A modern React + TypeScript frontend application for task management with authentication, real-time updates, and analytics.

## 📚 Documentation

- **[Project README](../README.md)** - Main project documentation with full setup guide
- **[Backend README](../backend/README.md)** - Backend API documentation
- **[API Documentation](../backend/API_DOCUMENTATION.md)** - Complete API reference

## 🚀 Features

- **User Authentication**
  - Login and registration with JWT tokens
  - Auto token refresh
  - Protected routes
  - Persistent sessions

- **Task Management** (Placeholder - Ready for implementation)
  - Create, read, update, delete tasks
  - Filter by status, priority, assignee
  - Full-text search
  - Sort and pagination
  - Bulk operations

- **Comments System** (Ready for implementation)
  - Add, edit, delete comments
  - Real-time updates

- **File Management** (Ready for implementation)
  - Upload multiple files with drag-and-drop
  - Download files
  - File type and size validation

- **Analytics Dashboard** (Ready for implementation)
  - Task statistics
  - Performance metrics
  - Trend visualizations
  - Export to CSV/JSON

- **UI/UX**
  - Responsive design (mobile, tablet, desktop)
  - Custom CSS (no frameworks)
  - Loading, error, and empty states
  - Smooth animations

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router v6
- **State Management**: Context API + useReducer
- **HTTP Client**: Axios with interceptors
- **Charts**: Chart.js + react-chartjs-2
- **Date Handling**: date-fns
- **Styling**: Custom CSS (no frameworks)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Running backend API (see backend README)

## 🔧 Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start development server

```bash
npm start
```

The app will open at http://localhost:3000

### 4. Build for production

```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/           # Auth components
│   │   │   └── PrivateRoute.tsx
│   │   └── common/         # Reusable components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Loader.tsx
│   │       ├── ErrorMessage.tsx
│   │       └── EmptyState.tsx
│   ├── context/
│   │   └── AuthContext.tsx # Authentication state
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── pages/
│   │   └── Auth/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   ├── services/
│   │   ├── api.ts          # Axios instance
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   ├── commentService.ts
│   │   ├── fileService.ts
│   │   └── analyticsService.ts
│   ├── styles/
│   │   ├── variables.css   # CSS custom properties
│   │   ├── reset.css       # CSS reset
│   │   ├── global.css      # Global styles
│   │   ├── animations.css  # Animations
│   │   └── responsive.css  # Media queries
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── task.types.ts
│   │   ├── comment.types.ts
│   │   ├── file.types.ts
│   │   └── analytics.types.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   └── validation.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Design System

### Colors
- Primary: #0d6efd (Blue)
- Success: #198754 (Green)
- Danger: #dc3545 (Red)
- Warning: #ffc107 (Yellow)
- Info: #0dcaf0 (Cyan)

### Typography
- Font: System fonts (San Francisco, Segoe UI, Roboto)
- Base size: 16px
- Scale: 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px

### Spacing
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Components
- Border Radius: 4px (small), 8px (medium), 12px (large)
- Shadows: Subtle elevation system
- Transitions: 0.2s ease

## 📝 Current Implementation Status

### ✅ Completed (40+ files)

**Project Setup:**
- ✅ Package.json with all dependencies
- ✅ TypeScript configuration
- ✅ Environment setup

**Type Definitions:**
- ✅ Auth types
- ✅ Task types
- ✅ Comment types
- ✅ File types
- ✅ Analytics types

**API Services:**
- ✅ Axios setup with auto token refresh
- ✅ Auth service (login, register, refresh, getMe)
- ✅ Task service (CRUD, filters, pagination)
- ✅ Comment service
- ✅ File service (upload, download, delete)
- ✅ Analytics service (stats, trends, export)

**Context & Hooks:**
- ✅ AuthContext with login/register/logout
- ✅ useAuth hook
- ✅ useDebounce hook
- ✅ useLocalStorage hook

**Common Components:**
- ✅ Button (variants, sizes, loading)
- ✅ Input (with label, error)
- ✅ Card
- ✅ Badge (status, priority)
- ✅ Loader
- ✅ ErrorMessage
- ✅ EmptyState

**Authentication:**
- ✅ Login page (fully functional)
- ✅ Register page (fully functional)
- ✅ PrivateRoute component

**CSS Design System:**
- ✅ CSS variables
- ✅ Reset styles
- ✅ Global styles
- ✅ Animations
- ✅ Responsive breakpoints

**Main App:**
- ✅ App.tsx with routing
- ✅ index.tsx entry point
- ✅ Basic structure

### 🔨 To Be Implemented (Optional Enhancements)

**Task Management:**
- TaskList component
- TaskCard component
- TaskDetail component
- TaskForm (create/edit)
- TaskFilters
- TaskSearch

**Dashboard:**
- Statistics cards
- Charts (status, priority, trends)
- Recent tasks

**Comments:**
- CommentList
- CommentItem
- CommentForm

**Files:**
- FileUpload with drag-and-drop
- FileList
- FileItem

**Analytics:**
- Analytics page with charts
- Export functionality UI

**Layout:**
- Header
- Sidebar navigation
- Full layout wrapper

## 🧪 Testing the App

### 1. Start Backend

Make sure the backend is running on http://localhost:5000

### 2. Start Frontend

```bash
npm start
```

### 3. Test Authentication

1. Go to http://localhost:3000
2. You'll be redirected to login
3. Click "Register here" to create an account
4. Fill in the form (name, email, password)
5. After registration, you'll be logged in automatically
6. You'll see a placeholder dashboard

### 4. Test Login/Logout

1. Logout (you'll need to implement logout button in header)
2. Go to /login
3. Login with your credentials
4. You should be authenticated and see the dashboard

## 🔐 Authentication Flow

1. **Register**:
   - User fills registration form
   - POST /api/auth/register
   - Receives accessToken + refreshToken
   - Tokens saved to localStorage
   - Redirected to dashboard

2. **Login**:
   - User fills login form
   - POST /api/auth/login
   - Receives accessToken + refreshToken
   - Tokens saved to localStorage
   - Redirected to dashboard

3. **Auto Token Refresh**:
   - When API returns 401
   - POST /api/auth/refresh with refreshToken
   - Receives new tokens
   - Retries original request
   - If refresh fails, redirect to login

4. **Protected Routes**:
   - PrivateRoute checks isAuthenticated
   - Shows loader while checking
   - Redirects to /login if not authenticated

## 🚀 Next Steps

### To Complete Full Implementation:

1. **Task Management Pages**:
   - Create TaskList, TaskCard, TaskDetail components
   - Add filtering, searching, sorting
   - Implement create/edit forms

2. **Dashboard**:
   - Add statistics display
   - Integrate Chart.js for visualizations
   - Show recent tasks

3. **Comments & Files**:
   - Build comment components
   - Implement file upload with drag-and-drop
   - Add file preview/download

4. **Layout**:
   - Create Header with user menu
   - Add Sidebar navigation
   - Build responsive mobile menu

5. **Analytics**:
   - Create charts for trends
   - Add export functionality
   - Build performance metrics

## 📊 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (not recommended)
npm run eject
```

## 🐛 Troubleshooting

### Backend Connection Error

**Error**: Network error or CORS error

**Solution**:
1. Ensure backend is running on http://localhost:5000
2. Check REACT_APP_API_URL in .env
3. Verify backend CORS_ORIGIN includes http://localhost:3000

### Login Not Working

**Error**: Invalid credentials or authentication error

**Solution**:
1. Check backend logs for errors
2. Verify MongoDB connection
3. Test API endpoints with Postman
4. Clear browser localStorage and try again

### Token Expired

**Error**: 401 Unauthorized

**Solution**:
- Automatic token refresh should handle this
- If refresh fails, logout and login again
- Check refreshToken expiry in backend

## 📄 License

ISC

---

Built with ❤️ using React, TypeScript, and Custom CSS
