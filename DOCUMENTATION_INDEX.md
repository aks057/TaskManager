# Task Management System - Documentation Index

## 📚 Complete Documentation Guide

Welcome to the Task Management System documentation! This index will help you navigate through all available documentation.

---

## 🎯 Quick Start

**New to the project?** Start here:
1. Read the [Main README](./README.md) for project overview
2. Follow the [Setup Guide](#setup-instructions) below
3. Check [API Documentation](./backend/API_DOCUMENTATION.md) for endpoint details

---

## 📖 Documentation Structure

### 1. **Project Overview**
**File:** [README.md](./README.md)

**Contents:**
- Project overview and features
- Architecture decisions
- Complete tech stack
- Quick start guide
- Environment variables
- Database schema
- Security features
- Deployment guide
- Assumptions and design decisions

**Best for:** Understanding the overall project, getting started, deployment planning

---

### 2. **Backend Documentation**
**File:** [backend/README.md](./backend/README.md)

**Contents:**
- Backend features overview
- Tech stack details
- Installation steps
- MinIO setup (Docker)
- Project structure
- Database schema details
- Security features
- Testing guide
- Troubleshooting

**Best for:** Backend developers, API setup, server configuration

---

### 3. **API Reference (Markdown)**
**File:** [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)

**Contents:**
- Complete API endpoint reference (26 endpoints)
- Request/response examples for every endpoint
- Authentication flow
- Error handling and codes
- Rate limiting details
- Data types and validation rules
- Query parameters documentation
- File upload specifications

**Best for:** API integration, endpoint reference, request/response formats

---

### 4. **Postman Collection**
**Files:**
- [backend/postman/Task-Management-API.postman_collection.json](./backend/postman/Task-Management-API.postman_collection.json)
- [backend/postman/Task-Management-Environment.postman_environment.json](./backend/postman/Task-Management-Environment.postman_environment.json)
- [backend/postman/README.md](./backend/postman/README.md)

**Contents:**
- Interactive API documentation
- 26 pre-configured requests
- Automatic token management
- Test scripts for validation
- Environment variables setup
- Usage guide

**Best for:** API testing, interactive documentation, learning the API

---

### 5. **Frontend Documentation**
**File:** [frontend/README.md](./frontend/README.md)

**Contents:**
- Frontend features and tech stack
- Installation and setup
- Project structure
- Design system (colors, typography, spacing)
- Implementation status
- Authentication flow
- Testing guide
- Troubleshooting

**Best for:** Frontend developers, UI development, React setup

---

## 🚀 Setup Instructions

### Prerequisites
```
✅ Node.js v18+
✅ MongoDB Atlas account
✅ Docker (for MinIO)
✅ Git
```

### Step-by-Step Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd task-management-system
```

#### 2. Setup Backend
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials:
# - MongoDB connection string
# - JWT secrets
# - MinIO configuration
# - CORS settings
```

**Option A: Using Docker Compose (Recommended)**
```bash
# Start all services (MinIO + Redis)
cd ..
docker-compose up -d

# View logs
docker-compose logs -f

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

Backend runs on: http://localhost:5000

#### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env

# Edit .env:
# REACT_APP_API_URL=http://localhost:5000/api

# Start frontend
npm start
```

Frontend runs on: http://localhost:3000

#### 4. Test the Application

**Option 1: Use Pre-configured Test Account**

A test account is already set up for quick testing:

```
Email: abhinash.iiitl@gmail.com
Password: Test@123
```

1. Open http://localhost:3000
2. Click "Login" (if not already on login page)
3. Enter the test credentials above
4. You'll be logged in and can test all features

**Option 2: Create Your Own Account**

1. Open http://localhost:3000
2. Click "Register here"
3. Fill in your details (name, email, password)
4. After registration, you'll be logged in automatically
5. Start using the application

---

## 🔑 API Authentication

### How to Get Started with the API

1. **Register a User**
   ```bash
   POST /api/auth/register
   Body: { "name": "John", "email": "john@example.com", "password": "Pass123" }
   ```

2. **Receive Tokens**
   ```json
   {
     "accessToken": "eyJhbG...",
     "refreshToken": "eyJhbG..."
   }
   ```

3. **Use Access Token**
   ```bash
   GET /api/tasks
   Authorization: Bearer <accessToken>
   ```

4. **Refresh When Expired**
   ```bash
   POST /api/auth/refresh
   Body: { "refreshToken": "<refreshToken>" }
   ```

**See:** [API Documentation](./backend/API_DOCUMENTATION.md) for detailed examples

---

## 📋 API Endpoints Summary

### Authentication (7 endpoints)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get profile
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Tasks (6 endpoints)
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks (filters, search, pagination)
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (soft)
- `POST /api/tasks/bulk` - Bulk create

### Comments (4 endpoints)
- `POST /api/tasks/:id/comments` - Add comment
- `GET /api/tasks/:id/comments` - Get comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Files (4 endpoints)
- `POST /api/tasks/:id/files` - Upload files
- `GET /api/tasks/:id/files` - List files
- `GET /api/files/:id` - Download file
- `DELETE /api/files/:id` - Delete file

### Analytics (4 endpoints)
- `GET /api/analytics/overview` - Task statistics
- `GET /api/analytics/user-performance` - User metrics
- `GET /api/analytics/trends` - Trends over time
- `GET /api/analytics/export` - Export data (CSV/JSON)

### Health (1 endpoint)
- `GET /health` - Health check

**Total:** 26 endpoints

**See:** [API Documentation](./backend/API_DOCUMENTATION.md) for complete details

---

## 🏗️ Architecture Overview

### Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB (Mongoose ODM)
- MinIO (S3-compatible storage)
- JWT authentication
- Redis (caching - optional)
- Bull (job queue - optional)
- Socket.io (real-time - optional)

**Frontend:**
- React 18
- TypeScript
- React Router v6
- Context API
- Axios
- Chart.js
- date-fns
- Custom CSS

### Architecture Patterns

**Backend:**
- MVC pattern (Models, Controllers, Services)
- Repository pattern (Services layer)
- Middleware architecture
- Token-based authentication
- RESTful API design

**Frontend:**
- Component-based architecture
- Context API for state management
- Custom hooks for reusability
- Service layer for API calls
- Presentational/Container components

---

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing (10 salt rounds)
   - Password complexity validation
   - Passwords never returned in responses

2. **Authentication**
   - JWT access tokens (15 min expiry)
   - Refresh tokens (7 days expiry)
   - Token rotation on refresh
   - Stored in localStorage (frontend)
   - Refresh tokens in database (backend)

3. **API Security**
   - CORS with origin whitelist
   - Rate limiting (3 tiers)
   - Input validation (express-validator)
   - NoSQL injection prevention
   - Helmet security headers

4. **Authorization**
   - Role-based access control
   - Resource ownership validation
   - Protected routes

---

## 🧪 Testing Guide

### Backend Testing

**Using Postman:**
1. Import: `backend/postman/Task-Management-API.postman_collection.json`
2. Import: `backend/postman/Task-Management-Environment.postman_environment.json`
3. Select "Task Management - Local" environment
4. Run "Register User" or "Login User"
5. Tokens are saved automatically
6. Test all other endpoints

**Using curl:**
```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Get tasks (with token)
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <your_access_token>"
```

### Frontend Testing

1. Start backend and frontend servers
2. Open http://localhost:3000
3. Test registration flow
4. Test login flow
5. Test protected routes
6. Test logout functionality

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Error:** `MongoServerError: bad auth`

**Solution:**
1. Check MongoDB URI in `.env`
2. Verify database user credentials
3. Ensure IP whitelist includes your IP (0.0.0.0/0 for all)
4. Check network connection

---

### Issue: MinIO Connection Error

**Error:** `ECONNREFUSED`

**Solution:**
1. Check if MinIO Docker container is running: `docker ps`
2. Start MinIO: `docker start minio`
3. Verify MinIO settings in `.env`
4. Access MinIO console: http://localhost:9001

---

### Issue: CORS Error

**Error:** `Access-Control-Allow-Origin error`

**Solution:**
1. Check `CORS_ORIGIN` in backend `.env`
2. Should be: `http://localhost:3000`
3. Restart backend server
4. Clear browser cache

---

### Issue: Token Expired

**Error:** `401 Unauthorized - Token expired`

**Solution:**
- Automatic: Frontend should auto-refresh
- Manual: Logout and login again
- Check refresh token hasn't expired (7 days)

---

### Issue: File Upload Failed

**Error:** `Invalid file type` or `File too large`

**Solution:**
1. Check file type (allowed: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF)
2. Check file size (max 10MB per file)
3. Check rate limit (10 uploads per hour)
4. Verify MinIO is running

---

## 📊 Project Status

### Backend: ✅ 100% Complete

- ✅ All 26 API endpoints implemented
- ✅ Authentication with JWT + Refresh tokens
- ✅ Task CRUD with filters, search, pagination
- ✅ Comments system
- ✅ File uploads with MinIO
- ✅ Analytics with export
- ✅ Input validation
- ✅ Error handling
- ✅ Security features
- ✅ API documentation (Markdown + Postman)

### Frontend: ⚙️ 60% Complete (Core Features)

**Completed:**
- ✅ Project setup
- ✅ Type definitions
- ✅ API service layer
- ✅ Authentication (login/register)
- ✅ Common components
- ✅ CSS design system
- ✅ Protected routes

**Pending (Optional):**
- 🔨 Task management pages
- 🔨 Dashboard with charts
- 🔨 Comments UI
- 🔨 File upload UI
- 🔨 Analytics page
- 🔨 Layout (header, sidebar)

---

## 🚀 Deployment

### Backend Deployment

**Platforms:** Heroku, Railway, Render, AWS, DigitalOcean

**Steps:**
1. Push code to Git repository
2. Connect to deployment platform
3. Set environment variables
4. Configure MongoDB Atlas
5. Setup MinIO or migrate to AWS S3
6. Deploy

### Frontend Deployment

**Platforms:** Vercel, Netlify, AWS S3, GitHub Pages

**Steps:**
1. Update `REACT_APP_API_URL` to production backend
2. Build: `npm run build`
3. Deploy `build/` folder
4. Configure custom domain (optional)

---

## 📚 Additional Resources

### Official Documentation
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/docs/)
- [MinIO](https://min.io/docs/)
- [JWT](https://jwt.io/)

### Tools
- [Postman](https://www.postman.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Docker](https://www.docker.com/)

---

## 🤝 Contributing

1. Read the documentation
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Test thoroughly
6. Submit a pull request

---

## 📞 Support

For issues or questions:
1. Check this documentation index
2. Read specific documentation files
3. Test with Postman collection
4. Check troubleshooting sections
5. Open an issue on GitHub

---

## 📄 License

ISC License

---

**Documentation Version:** 1.0.0
**Last Updated:** January 2025
**Maintained by:** Task Management System Team

---

## Quick Links

- [Main README](./README.md)
- [Backend README](./backend/README.md)
- [API Documentation](./backend/API_DOCUMENTATION.md)
- [Postman Guide](./backend/postman/README.md)
- [Frontend README](./frontend/README.md)

---

**Happy Coding! 🚀**
