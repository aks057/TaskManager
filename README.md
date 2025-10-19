# Task Management System

A full-stack task management application with user authentication, task operations, file attachments, comments, and analytics.

## 📚 Documentation

- **[📖 Documentation Index](./DOCUMENTATION_INDEX.md)** - Complete guide to all documentation
- **[🔌 API Documentation](./backend/API_DOCUMENTATION.md)** - Complete API reference (26 endpoints)
- **[📬 Postman Collection](./backend/postman/)** - Interactive API testing and documentation
- **[⚙️ Backend README](./backend/README.md)** - Backend setup and configuration
- **[💻 Frontend README](./frontend/README.md)** - Frontend setup and development

## 🎯 Project Overview

This is a comprehensive task management system that allows users to:
- **Authenticate** securely with JWT + Refresh tokens
- **Manage tasks** with CRUD operations, filtering, searching, and sorting
- **Collaborate** through comments on tasks
- **Attach files** to tasks with validation
- **Track analytics** with statistics, trends, and data export

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **RESTful API** with 26 endpoints
- **Authentication**: JWT + Refresh tokens with bcrypt
- **Database**: MongoDB Atlas with Mongoose ODM
- **File Storage**: MinIO (S3-compatible)
- **Security**: CORS, rate limiting, input validation, sanitization
- **Documentation**: Postman Collection + API Docs (Markdown)

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **State Management**: Context API + useReducer
- **Routing**: React Router v6
- **Styling**: Custom CSS (no frameworks)
- **HTTP Client**: Axios with auto token refresh
- **Charts**: Chart.js for analytics

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **File Storage**: MinIO
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, express-mongo-sanitize, express-rate-limit

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router v6
- **State**: Context API + Hooks
- **HTTP**: Axios
- **Charts**: Chart.js + react-chartjs-2
- **Dates**: date-fns
- **Styling**: Custom CSS

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- MinIO (Docker recommended)
- npm or yarn

### 1. Clone Repository

```bash
cd task-management-system
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and settings
```

**Option A: Using Docker Compose (Recommended)**

```bash
# Start all services (MinIO + Redis)
cd ..
docker-compose up -d

# Start backend
cd backend
npm run dev
```

**Option B: Using Individual Docker Commands**

```bash
# Start MinIO (Required - for file storage)
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name task-manager-minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"

# Start Redis (Optional - for caching)
docker run -d \
  -p 6379:6379 \
  --name task-manager-redis \
  redis:7-alpine

# Start backend
npm run dev
```

Backend will run on http://localhost:5000

### 3. Setup Frontend

```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:5000/api

# Start frontend
npm start
```

Frontend will run on http://localhost:3000

### 4. Test the Application

**Option 1: Use Pre-configured Test Account**

A test account is already set up for quick testing:

```
Email: abhinash.iiitl@gmail.com
Password: Test@123
```

1. Open http://localhost:3000
2. Click "Login" (if not already on login page)
3. Enter the test credentials above
4. You'll be logged in and see the dashboard

**Option 2: Create Your Own Account**

1. Open http://localhost:3000
2. Click "Register here" to create a new account
3. Fill in name, email, and password
4. After registration, you'll be logged in automatically
5. You'll see the dashboard (placeholder)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks (with filters, search, sort, pagination)
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (soft delete)
- `POST /api/tasks/bulk` - Bulk create tasks

### Comments
- `POST /api/tasks/:id/comments` - Add comment to task
- `GET /api/tasks/:id/comments` - Get all comments for task
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Files
- `POST /api/tasks/:id/files` - Upload files to task
- `GET /api/files/:id` - Download file
- `DELETE /api/files/:id` - Delete file

### Analytics
- `GET /api/analytics/overview` - Get task statistics
- `GET /api/analytics/user-performance` - Get user metrics
- `GET /api/analytics/trends` - Get task trends over time
- `GET /api/analytics/export` - Export tasks data (CSV/JSON)

## 🗂️ Project Structure

```
task-management-system/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── models/            # Mongoose models
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # Route definitions
│   │   ├── middlewares/       # Express middlewares
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helper functions
│   │   ├── types/             # TypeScript types
│   │   └── app.ts             # Express app setup
│   ├── postman/               # API documentation
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/                   # React + TypeScript app
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # Context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── styles/            # CSS files
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
└── README.md                   # This file
```

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=task-files
MINIO_USE_SSL=false
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## ✨ Key Features Implemented

### Backend
- ✅ User authentication with JWT + Refresh tokens
- ✅ Password hashing with bcrypt
- ✅ All task operations (CRUD, filtering, sorting, pagination, bulk)
- ✅ Comments system
- ✅ File uploads with MinIO
- ✅ Analytics (overview, performance, trends, export)
- ✅ Input validation on all endpoints
- ✅ Comprehensive error handling
- ✅ Security (CORS, rate limiting, sanitization, helmet)
- ✅ Database with proper indexes
- ✅ Soft delete for tasks
- ✅ Complete API documentation (Postman Collection + Markdown docs)

### Frontend
- ✅ Project setup with React + TypeScript
- ✅ All type definitions
- ✅ Complete API service layer with auto token refresh
- ✅ AuthContext with state management
- ✅ Custom hooks (useAuth, useDebounce, useLocalStorage)
- ✅ CSS design system (variables, reset, global, animations, responsive)
- ✅ Common components (Button, Input, Card, Badge, Loader, ErrorMessage, EmptyState)
- ✅ Authentication pages (Login, Register)
- ✅ Protected routes
- ✅ Main App with routing
- 🔨 Task management pages (ready to implement)
- 🔨 Dashboard with charts (ready to implement)
- 🔨 Comments UI (ready to implement)
- 🔨 File upload with drag-and-drop (ready to implement)
- 🔨 Analytics page (ready to implement)

## 🏛️ Architecture Decisions

### Why MongoDB?
- Flexible schema for evolving requirements
- Easy horizontal scaling
- Native support for arrays and nested documents
- Good performance with proper indexing

### Why JWT + Refresh Tokens?
- Stateless authentication (scalable)
- Short-lived access tokens (15 min) for security
- Long-lived refresh tokens (7 days) for UX
- Token rotation prevents token theft

### Why MinIO?
- S3-compatible (easy migration to AWS S3)
- Self-hosted (no vendor lock-in)
- High performance
- Easy deployment with Docker

### Why Context API (not Redux)?
- Sufficient for app size
- Less boilerplate
- Native React solution
- Good performance with proper optimization

### Why Custom CSS?
- Full control over styling
- No framework bloat
- Learning experience
- Faster load times
- Complete customization

## 🔒 Security Features

1. **Password Security**: Bcrypt hashing with salt rounds
2. **JWT Authentication**: Short-lived access tokens
3. **Refresh Tokens**: Stored in database, revocable
4. **Rate Limiting**:
   - Global: 100 req/15min
   - Auth: 5 req/15min
   - Files: 10 req/hour
5. **Input Validation**: express-validator on all endpoints
6. **NoSQL Injection Prevention**: express-mongo-sanitize
7. **Security Headers**: Helmet middleware
8. **CORS**: Configurable origin whitelist

## 📊 Database Schema

### User
- name, email (unique), password (hashed), timestamps

### Task
- title, description, status, priority, due_date, tags, assigned_to, created_by, is_deleted, timestamps
- **Indexes**: status, priority, created_by, assigned_to, text search

### Comment
- task_id, user_id, content, timestamps
- **Indexes**: task_id, user_id

### File
- task_id, filename, original_name, mime_type, size, minio_path, uploaded_by, timestamps
- **Indexes**: task_id, uploaded_by

### RefreshToken
- user_id, token, expires_at, createdAt
- **Indexes**: user_id, token, TTL on expires_at

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run dev

# Test with curl
curl http://localhost:5000/health

# Or use Postman
# Import: backend/postman/Task-Management-API.postman_collection.json
```

### Frontend Testing
```bash
cd frontend
npm start

# Open: http://localhost:3000
# Test: Register → Login → Dashboard
```

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Push code to Git repository
2. Connect to deployment platform
3. Set environment variables
4. Deploy backend
5. Use MongoDB Atlas (already cloud-based)
6. Use MinIO cloud or migrate to AWS S3

### Frontend Deployment (Vercel/Netlify)
1. Push code to Git repository
2. Connect to deployment platform
3. Set REACT_APP_API_URL to production backend URL
4. Deploy frontend

## 📝 Assumptions

1. **Single Tenant**: No multi-tenancy support
2. **User Visibility**: Users can see all tasks but only modify their own
3. **Soft Delete**: Tasks are soft-deleted, not permanently removed
4. **File Size**: Max 10MB per file (configurable)
5. **Token Expiry**: Access: 15min, Refresh: 7 days
6. **Rate Limiting**: Applied per IP address
7. **Pagination**: Default 10 items/page, max 100

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

ISC

## 👥 Contact

For questions or support, please open an issue on GitHub.

---

**Status**: Backend | Frontend

**Next Steps**: Implement remaining frontend features (Task pages, Dashboard, Analytics)

Built with ❤️ using Node.js, React, TypeScript, MongoDB, and MinIO
