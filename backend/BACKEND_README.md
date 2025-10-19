# Task Management System - Backend API

A comprehensive RESTful API for task management with authentication, file uploads, comments, and analytics.

## 📚 Documentation

- **[API Documentation (Markdown)](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints
- **[Postman Collection](./postman/)** - Interactive API testing and documentation
- **[Project README](../README.md)** - Main project documentation

## 🚀 Features

- **User Authentication**
  - JWT + Refresh Token authentication
  - Secure password hashing with bcrypt
  - Token rotation on refresh

- **Task Management**
  - CRUD operations with soft delete
  - Filtering by status, priority, assignee, creator, tags
  - Full-text search on title and description
  - Sorting and pagination
  - Bulk task creation

- **Comments System**
  - Add, update, delete comments on tasks
  - User-specific authorization (only owner can edit/delete)
  - Pagination support

- **File Management**
  - Upload multiple files per task (using MinIO)
  - Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF
  - Max file size: 10MB per file
  - Download and delete functionality

- **Analytics**
  - Task overview statistics (counts by status, priority)
  - User performance metrics (completion rate, avg time)
  - Task trends over time (daily/weekly/monthly)
  - Export data to CSV or JSON

- **Security**
  - CORS protection
  - Rate limiting (global + endpoint-specific)
  - Input validation and sanitization
  - NoSQL injection prevention
  - Helmet security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas + Mongoose ODM
- **File Storage**: MinIO (S3-compatible)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, express-mongo-sanitize, express-rate-limit

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- MinIO server (Docker recommended)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management?retryWrites=true&w=majority

# JWT secrets (generate strong random strings)
JWT_ACCESS_SECRET=your_super_secret_access_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# MinIO configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=task-files
MINIO_USE_SSL=false

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Setup Services (Docker)

**Option A: Using Docker Compose (Recommended)**

```bash
# From project root directory
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
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
```

**Access Points:**
- MinIO Console: http://localhost:9001
- MinIO API: http://localhost:9000
- Redis: localhost:6379

### 5. Build and Run

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/logout` | Logout user | No |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tasks` | Create new task | Yes |
| GET | `/api/tasks` | Get all tasks (with filters) | Yes |
| GET | `/api/tasks/:id` | Get single task by ID | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Soft delete task | Yes |
| POST | `/api/tasks/bulk` | Bulk create tasks | Yes |

**Query Parameters for GET /api/tasks:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (todo, in_progress, completed)
- `priority` (string): Filter by priority (low, medium, high, critical)
- `assigned_to` (string): Filter by assigned user ID
- `created_by` (string): Filter by creator user ID
- `tags` (string): Filter by tags (comma-separated)
- `search` (string): Full-text search on title and description
- `sort` (string): Sort field (default: -createdAt)

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tasks/:id/comments` | Add comment to task | Yes |
| GET | `/api/tasks/:id/comments` | Get all comments for task | Yes |
| PUT | `/api/comments/:id` | Update comment | Yes |
| DELETE | `/api/comments/:id` | Delete comment | Yes |

### Files

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tasks/:id/files` | Upload files to task | Yes |
| GET | `/api/files/:id` | Download file | Yes |
| DELETE | `/api/files/:id` | Delete file | Yes |

**File Upload Notes:**
- Use `multipart/form-data` encoding
- Field name: `files` (supports multiple files)
- Max 10 files per request
- Max 10MB per file

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/overview` | Get task statistics | Yes |
| GET | `/api/analytics/user-performance` | Get user performance metrics | Yes |
| GET | `/api/analytics/trends` | Get task trends over time | Yes |
| GET | `/api/analytics/export` | Export tasks data | Yes |

**Query Parameters for Analytics:**
- `/trends`: `period` (day/week/month), `start_date`, `end_date`
- `/export`: `format` (csv/json), `status`, `priority`, `start_date`, `end_date`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication with a refresh token mechanism.

### How it works:

1. **Register or Login** → Receive `accessToken` (15 min) and `refreshToken` (7 days)
2. **Use Access Token** → Include in Authorization header: `Bearer <accessToken>`
3. **Token Expires** → Use refresh token to get new access token
4. **Logout** → Delete refresh token from database

### Example:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
}
```

**Authenticated Request:**
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <accessToken>"
```

## 🗄️ Database Schema

### User
```typescript
{
  name: string,
  email: string (unique),
  password: string (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```typescript
{
  title: string (required),
  description: string,
  status: 'todo' | 'in_progress' | 'completed',
  priority: 'low' | 'medium' | 'high' | 'critical',
  due_date: Date,
  tags: string[],
  assigned_to: ObjectId (User),
  created_by: ObjectId (User),
  is_deleted: boolean,
  deleted_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment
```typescript
{
  task_id: ObjectId (Task),
  user_id: ObjectId (User),
  content: string,
  createdAt: Date,
  updatedAt: Date
}
```

### File
```typescript
{
  task_id: ObjectId (Task),
  filename: string,
  original_name: string,
  mime_type: string,
  size: number,
  minio_path: string,
  uploaded_by: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### RefreshToken
```typescript
{
  user_id: ObjectId (User),
  token: string,
  expires_at: Date (TTL index),
  createdAt: Date
}
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   ├── minio.ts     # MinIO client setup
│   │   └── env.ts       # Environment variables
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Task.ts
│   │   ├── Comment.ts
│   │   ├── File.ts
│   │   └── RefreshToken.ts
│   ├── controllers/     # Request handlers
│   │   ├── authController.ts
│   │   ├── taskController.ts
│   │   ├── commentController.ts
│   │   ├── fileController.ts
│   │   └── analyticsController.ts
│   ├── routes/          # Route definitions
│   │   ├── authRoutes.ts
│   │   ├── taskRoutes.ts
│   │   ├── commentRoutes.ts
│   │   ├── fileRoutes.ts
│   │   └── analyticsRoutes.ts
│   ├── middlewares/     # Express middlewares
│   │   ├── authMiddleware.ts
│   │   ├── validationMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── fileUpload.ts
│   ├── services/        # Business logic
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   ├── fileService.ts
│   │   └── analyticsService.ts
│   ├── utils/           # Helper functions
│   │   ├── errorTypes.ts
│   │   ├── responseHandler.ts
│   │   ├── validators.ts
│   │   └── sanitizer.ts
│   ├── types/           # TypeScript types
│   │   ├── index.ts
│   │   └── express.d.ts
│   └── app.ts           # Express app setup
├── postman/             # Postman collection
├── .env.example         # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Features

1. **Password Security**: Bcrypt hashing with salt rounds
2. **JWT Authentication**: Short-lived access tokens (15 min)
3. **Refresh Tokens**: Stored in database, can be revoked
4. **Rate Limiting**:
   - Global: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
   - File uploads: 10 requests per hour
5. **Input Validation**: express-validator on all endpoints
6. **NoSQL Injection Prevention**: express-mongo-sanitize
7. **Security Headers**: Helmet middleware
8. **CORS**: Configurable origin whitelist

## 🚦 Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

**HTTP Status Codes:**
- `200 OK`: Successful GET/PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication error
- `403 Forbidden`: Authorization error
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `422 Unprocessable Entity`: Semantic error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## 🧪 Testing the API

### Test Credentials

A pre-configured test account is available for quick testing:

```
Email: abhinash.iiitl@gmail.com
Password: Test@123
```

Use these credentials to test the API without registering a new account.

### Using Postman:

1. Import the Postman collection from `postman/Task-Management-API.postman_collection.json`
2. Import the environment from `postman/Task-Management-Environment.postman_environment.json`
3. Select the "Task Management - Local" environment in Postman
4. Start with the "Login User" request using the test credentials above
5. Tokens will be automatically saved to environment variables and used in subsequent requests

The collection includes:
- 26 comprehensive API endpoints
- Pre-request and test scripts for automation
- Automatic token management
- Example request bodies with realistic data
- Complete API documentation for each endpoint

### Using curl:

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test1234"}'
```

**Create Task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Task description","priority":"high"}'
```

## 🏛️ Architecture Decisions

### Why MongoDB?
- Flexible schema for evolving requirements
- Easy horizontal scaling
- Native support for arrays (tags) and references
- Good performance with proper indexing

### Why JWT + Refresh Tokens?
- Stateless authentication (no session storage)
- Scalable (no server-side session management)
- Secure with short-lived access tokens
- Refresh tokens allow token rotation and revocation

### Why MinIO?
- S3-compatible (easy migration to AWS S3)
- Self-hosted (no cloud vendor lock-in)
- High performance
- Easy to deploy with Docker

### Why Soft Delete?
- Data recovery possible
- Maintain referential integrity
- Audit trail preservation
- Can be permanently deleted later

## 📝 Assumptions

1. **Single Tenant**: No multi-tenancy or workspace isolation
2. **User Visibility**: Users can see all tasks but only modify their own
3. **File Storage**: Files stored in MinIO (not database)
4. **Token Expiry**: Access token: 15 min, Refresh token: 7 days
5. **Rate Limiting**: Applied per IP address
6. **Pagination**: Default 10 items per page, max 100
7. **Search**: Full-text search on title and description only
8. **Time Zone**: All dates stored in UTC

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: MongoServerError: bad auth
```
**Solution**: Check MongoDB Atlas connection string and ensure database user is created with correct permissions.

### MinIO Connection Error
```
Error: ECONNREFUSED
```
**Solution**: Ensure MinIO is running (`docker ps`) and MINIO_ENDPOINT/PORT are correct.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in .env or kill the process using that port.

### JWT Verification Failed
```
Error: invalid token
```
**Solution**: Ensure access token is valid and not expired. Use refresh endpoint to get new token.

## 📞 Support

For issues and questions:
1. Check this README
2. Review API documentation in Postman
3. Check error messages and logs
4. Open an issue on GitHub

## 📄 License

ISC

---

Built with ❤️ using Node.js, Express, TypeScript, and MongoDB
