# Task Management API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Tasks](#tasks-endpoints)
   - [Comments](#comments-endpoints)
   - [Files](#files-endpoints)
   - [Analytics](#analytics-endpoints)
   - [Health Check](#health-check-endpoint)

---

## Overview

The Task Management API is a RESTful API built with Node.js, Express, and MongoDB. It provides comprehensive task management functionality including user authentication, task CRUD operations, comments, file uploads, and analytics.

**Version:** 1.0.0
**Protocol:** HTTP/HTTPS
**Data Format:** JSON (except file uploads/downloads)

---

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

All endpoints are prefixed with `/api` unless otherwise specified.

---

## Authentication

The API uses **JWT (JSON Web Token)** authentication with a refresh token mechanism.

### Token Types

1. **Access Token**
   - Short-lived (15 minutes)
   - Used for API requests
   - Sent in Authorization header

2. **Refresh Token**
   - Long-lived (7 days)
   - Stored in database
   - Used to obtain new access tokens

### How to Authenticate

1. **Register or Login** to receive tokens
2. **Include Access Token** in requests:
   ```
   Authorization: Bearer <access_token>
   ```
3. **Refresh Token** when access token expires:
   ```
   POST /api/auth/refresh
   Body: { "refreshToken": "<refresh_token>" }
   ```

### Protected Endpoints

Most endpoints require authentication. Public endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /health`

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Success Response with Pagination

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}  // Optional
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning |
|------------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input/validation error |
| 401 | Unauthorized - Authentication failed/token invalid |
| 403 | Forbidden - Not authorized to access resource |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource (e.g., email exists) |
| 422 | Unprocessable Entity - Semantic error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Common Error Codes

| Error Code | Description |
|-----------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Not authorized for this action |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_KEY` | Resource already exists |
| `INVALID_TOKEN` | JWT token is invalid |
| `TOKEN_EXPIRED` | JWT token has expired |
| `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## Rate Limiting

Rate limits are applied per IP address:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Global (all endpoints) | 100 requests | 15 minutes |
| Auth endpoints (register, login) | 5 requests | 15 minutes |
| File uploads | 10 requests | 1 hour |

When rate limit is exceeded, you'll receive:
```json
{
  "success": false,
  "error": {
    "message": "Too many requests from this IP, please try again later.",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

## API Endpoints

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`
**Authentication:** Not required
**Rate Limit:** 5 requests per 15 minutes

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

#### Request Body Parameters

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 2-50 characters |
| email | string | Yes | Valid email format, unique |
| password | string | Yes | Min 8 chars, must contain uppercase, lowercase, and number |

#### Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

```json
// 400 - Validation Error
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "password",
        "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      }
    ]
  }
}

// 409 - Email Already Exists
{
  "success": false,
  "error": {
    "message": "email already exists",
    "code": "DUPLICATE_KEY"
  }
}
```

---

### Login User

Authenticate and receive tokens.

**Endpoint:** `POST /api/auth/login`
**Authentication:** Not required
**Rate Limit:** 5 requests per 15 minutes

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Test Account (Pre-configured):**
```json
{
  "email": "abhinash.iiitl@gmail.com",
  "password": "Test@123"
}
```

#### Request Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

```json
// 401 - Invalid Credentials
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "AUTHENTICATION_ERROR"
  }
}
```

---

### Refresh Access Token

Get new access and refresh tokens using a valid refresh token.

**Endpoint:** `POST /api/auth/refresh`
**Authentication:** Not required

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** The old refresh token is deleted and a new one is issued (token rotation).

---

### Get Current User Profile

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /api/auth/me`
**Authentication:** Required

#### Request Headers

```
Authorization: Bearer <access_token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### Logout User

Logout by invalidating the refresh token.

**Endpoint:** `POST /api/auth/logout`
**Authentication:** Not required (but requires valid refresh token)

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### Update Profile

Update user's name and email.

**Endpoint:** `PUT /api/auth/profile`
**Authentication:** Required

#### Request Body

```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### Change Password

Change the user's password.

**Endpoint:** `PUT /api/auth/password`
**Authentication:** Required

#### Request Body

```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**Note:** All refresh tokens are invalidated after password change.

---

## Tasks Endpoints

### Create Task

Create a new task.

**Endpoint:** `POST /api/tasks`
**Authentication:** Required

#### Request Body

```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with refresh tokens",
  "status": "todo",
  "priority": "high",
  "due_date": "2025-12-31T23:59:59.000Z",
  "tags": ["backend", "security", "authentication"],
  "assigned_to": "507f1f77bcf86cd799439012"
}
```

#### Request Body Parameters

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | 3-200 characters |
| description | string | No | Max 2000 characters |
| status | string | No | 'todo', 'in_progress', 'completed' (default: 'todo') |
| priority | string | No | 'low', 'medium', 'high', 'critical' (default: 'medium') |
| due_date | string | No | ISO8601 date format |
| tags | array | No | Array of strings (each 1-50 chars) |
| assigned_to | string | No | Valid user ID (MongoDB ObjectId) |

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with refresh tokens",
    "status": "todo",
    "priority": "high",
    "due_date": "2025-12-31T23:59:59.000Z",
    "tags": ["backend", "security", "authentication"],
    "assigned_to": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "created_by": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "is_deleted": false,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### Get All Tasks

Retrieve tasks with filtering, searching, sorting, and pagination.

**Endpoint:** `GET /api/tasks`
**Authentication:** Required

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| page | number | Page number (default: 1) | `page=1` |
| limit | number | Items per page (1-100, default: 10) | `limit=20` |
| status | string | Filter by status | `status=in_progress` |
| priority | string | Filter by priority | `priority=high` |
| assigned_to | string | Filter by assigned user ID | `assigned_to=507f1f77bcf86cd799439012` |
| created_by | string | Filter by creator user ID | `created_by=507f1f77bcf86cd799439011` |
| tags | string | Filter by tags (comma-separated) | `tags=backend,security` |
| search | string | Full-text search on title/description | `search=authentication` |
| sort | string | Sort field (prefix - for descending) | `sort=-createdAt` |

#### Example Request

```
GET /api/tasks?page=1&limit=10&status=in_progress&priority=high&search=auth&sort=-createdAt
Authorization: Bearer <access_token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2025-12-31T23:59:59.000Z",
      "tags": ["backend", "security"],
      "assigned_to": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Doe"
      },
      "created_by": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### Get Task by ID

Retrieve a single task by its ID.

**Endpoint:** `GET /api/tasks/:id`
**Authentication:** Required

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Task ID (MongoDB ObjectId) |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with refresh tokens",
    "status": "todo",
    "priority": "high",
    "due_date": "2025-12-31T23:59:59.000Z",
    "tags": ["backend", "security", "authentication"],
    "assigned_to": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "created_by": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "is_deleted": false,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### Update Task

Update an existing task.

**Endpoint:** `PUT /api/tasks/:id`
**Authentication:** Required
**Authorization:** Only task creator or assigned user can update

#### Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "status": "in_progress",
  "priority": "critical",
  "description": "Updated description with more details"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Implement user authentication",
    "description": "Updated description with more details",
    "status": "in_progress",
    "priority": "critical",
    // ... other fields
    "updatedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

---

### Delete Task (Soft Delete)

Soft delete a task (marks as deleted but doesn't remove from database).

**Endpoint:** `DELETE /api/tasks/:id`
**Authentication:** Required
**Authorization:** Only task creator can delete

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

**Note:** This is a soft delete. The task is marked with `is_deleted: true` and `deleted_at` timestamp.

---

### Bulk Create Tasks

Create multiple tasks at once.

**Endpoint:** `POST /api/tasks/bulk`
**Authentication:** Required

#### Request Body

```json
{
  "tasks": [
    {
      "title": "Design database schema",
      "description": "Create MongoDB schema for all collections",
      "priority": "high",
      "tags": ["database", "planning"]
    },
    {
      "title": "Setup API routes",
      "description": "Implement REST API routes",
      "priority": "medium",
      "tags": ["backend", "api"]
    },
    {
      "title": "Write unit tests",
      "priority": "medium",
      "tags": ["testing"]
    }
  ]
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Tasks created successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Design database schema",
      // ... full task object
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Setup API routes",
      // ... full task object
    },
    {
      "_id": "507f1f77bcf86cd799439016",
      "title": "Write unit tests",
      // ... full task object
    }
  ]
}
```

---

## Comments Endpoints

### Add Comment to Task

Add a comment to a task.

**Endpoint:** `POST /api/tasks/:id/comments`
**Authentication:** Required

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Task ID (MongoDB ObjectId) |

#### Request Body

```json
{
  "content": "This task is now in progress. I've started working on the authentication module."
}
```

#### Request Body Parameters

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| content | string | Yes | 1-1000 characters |

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "task_id": "507f1f77bcf86cd799439013",
    "user_id": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "content": "This task is now in progress. I've started working on the authentication module.",
    "createdAt": "2025-01-15T13:00:00.000Z",
    "updatedAt": "2025-01-15T13:00:00.000Z"
  }
}
```

---

### Get Task Comments

Retrieve all comments for a specific task.

**Endpoint:** `GET /api/tasks/:id/comments`
**Authentication:** Required

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Task ID |

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page | 10 |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "task_id": "507f1f77bcf86cd799439013",
      "user_id": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "content": "This task is now in progress.",
      "createdAt": "2025-01-15T13:00:00.000Z",
      "updatedAt": "2025-01-15T13:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### Update Comment

Update an existing comment.

**Endpoint:** `PUT /api/comments/:id`
**Authentication:** Required
**Authorization:** Only comment author can update

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Comment ID |

#### Request Body

```json
{
  "content": "Updated comment: The authentication module is now complete and tested."
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "content": "Updated comment: The authentication module is now complete and tested.",
    "updatedAt": "2025-01-15T14:00:00.000Z"
    // ... other fields
  }
}
```

---

### Delete Comment

Delete a comment.

**Endpoint:** `DELETE /api/comments/:id`
**Authentication:** Required
**Authorization:** Only comment author can delete

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "data": null
}
```

---

## Files Endpoints

### Upload Files to Task

Upload one or more files to a task.

**Endpoint:** `POST /api/tasks/:id/files`
**Authentication:** Required
**Rate Limit:** 10 uploads per hour

#### Request

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `files`: File(s) to upload (field name must be "files")

#### File Restrictions

- Max file size: 10MB per file
- Max files per request: 10
- Allowed types:
  - Documents: PDF, DOC, DOCX, TXT
  - Images: JPG, JPEG, PNG, GIF

#### Example (using curl)

```bash
curl -X POST http://localhost:5000/api/tasks/507f1f77bcf86cd799439013/files \
  -H "Authorization: Bearer <token>" \
  -F "files=@document.pdf" \
  -F "files=@image.jpg"
```

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "task_id": "507f1f77bcf86cd799439013",
      "filename": "a1b2c3d4-e5f6-7890-document.pdf",
      "original_name": "document.pdf",
      "mime_type": "application/pdf",
      "size": 1048576,
      "minio_path": "tasks/507f1f77bcf86cd799439013/a1b2c3d4-e5f6-7890-document.pdf",
      "uploaded_by": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "createdAt": "2025-01-15T15:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439031",
      "task_id": "507f1f77bcf86cd799439013",
      "filename": "b2c3d4e5-f6a7-8901-image.jpg",
      "original_name": "image.jpg",
      "mime_type": "image/jpeg",
      "size": 524288,
      "minio_path": "tasks/507f1f77bcf86cd799439013/b2c3d4e5-f6a7-8901-image.jpg",
      "uploaded_by": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "createdAt": "2025-01-15T15:00:00.000Z"
    }
  ]
}
```

---

### Get Files for Task

Retrieve all files associated with a task.

**Endpoint:** `GET /api/tasks/:id/files`
**Authentication:** Required

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "task_id": "507f1f77bcf86cd799439013",
      "filename": "a1b2c3d4-e5f6-7890-document.pdf",
      "original_name": "document.pdf",
      "mime_type": "application/pdf",
      "size": 1048576,
      "uploaded_by": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "createdAt": "2025-01-15T15:00:00.000Z"
    }
  ]
}
```

---

### Download File

Download a file by its ID.

**Endpoint:** `GET /api/files/:id`
**Authentication:** Required

#### Response

**Content-Type:** Original file MIME type
**Content-Disposition:** `attachment; filename="<original_filename>"`
**Content-Length:** File size in bytes

**Body:** File content as binary stream

---

### Delete File

Delete a file.

**Endpoint:** `DELETE /api/files/:id`
**Authentication:** Required
**Authorization:** Only file uploader or task creator can delete

#### Response (200 OK)

```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": null
}
```

**Note:** File is deleted from both MinIO storage and database.

---

## Analytics Endpoints

### Task Overview Statistics

Get task statistics for the current user.

**Endpoint:** `GET /api/analytics/overview`
**Authentication:** Required

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 45,
    "byStatus": {
      "todo": 15,
      "in_progress": 20,
      "completed": 10
    },
    "byPriority": {
      "low": 10,
      "medium": 20,
      "high": 12,
      "critical": 3
    },
    "completed": 10,
    "overdue": 5
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| total | number | Total number of tasks (created or assigned to user) |
| byStatus | object | Count of tasks grouped by status |
| byPriority | object | Count of tasks grouped by priority |
| completed | number | Number of completed tasks |
| overdue | number | Number of tasks past their due date |

---

### User Performance Metrics

Get performance metrics for the current user.

**Endpoint:** `GET /api/analytics/user-performance`
**Authentication:** Required

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "tasksCreated": 30,
    "tasksAssigned": 25,
    "tasksCompleted": 18,
    "completionRate": 72.0,
    "averageCompletionTime": 4.5,
    "tasksByPriority": {
      "low": 8,
      "medium": 12,
      "high": 5,
      "critical": 0
    }
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| tasksCreated | number | Number of tasks created by user |
| tasksAssigned | number | Number of tasks assigned to user |
| tasksCompleted | number | Number of tasks completed |
| completionRate | number | Percentage of completed tasks (0-100) |
| averageCompletionTime | number | Average days to complete tasks |
| tasksByPriority | object | Distribution of tasks by priority |

---

### Task Trends Over Time

Get task creation and completion trends over time.

**Endpoint:** `GET /api/analytics/trends`
**Authentication:** Required

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| period | string | 'day', 'week', or 'month' | 'week' |
| start_date | string | Start date (ISO8601 format) | 30 days ago |
| end_date | string | End date (ISO8601 format) | Today |

#### Example Request

```
GET /api/analytics/trends?period=week&start_date=2025-01-01T00:00:00.000Z&end_date=2025-12-31T23:59:59.000Z
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "date": "2025-W01",
      "created": 12,
      "completed": 8
    },
    {
      "date": "2025-W02",
      "created": 15,
      "completed": 10
    },
    {
      "date": "2025-W03",
      "created": 10,
      "completed": 12
    }
  ]
}
```

#### Response Format by Period

- **day**: `date` format is "YYYY-MM-DD"
- **week**: `date` format is "YYYY-Www" (e.g., "2025-W01")
- **month**: `date` format is "YYYY-MM"

---

### Export Tasks Data

Export tasks data in CSV or JSON format.

**Endpoint:** `GET /api/analytics/export`
**Authentication:** Required

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| format | string | 'csv' or 'json' | 'json' |
| status | string | Filter by status (optional) | - |
| priority | string | Filter by priority (optional) | - |
| start_date | string | Filter by start date (optional) | - |
| end_date | string | Filter by end date (optional) | - |

#### Example Request

```
GET /api/analytics/export?format=csv&status=completed&priority=high
```

#### Response (CSV format)

**Content-Type:** `text/csv`
**Content-Disposition:** `attachment; filename="tasks-export-<timestamp>.csv"`

```csv
Title,Description,Status,Priority,Due Date,Tags,Assigned To,Created By,Created At
"Implement authentication","Add JWT auth","completed","high","2025-12-31","backend,security","Jane Doe","John Doe","2025-01-15T10:30:00.000Z"
```

#### Response (JSON format)

**Content-Type:** `application/json`
**Content-Disposition:** `attachment; filename="tasks-export-<timestamp>.json"`

```json
{
  "success": true,
  "data": [
    {
      "title": "Implement authentication",
      "description": "Add JWT auth",
      "status": "completed",
      "priority": "high",
      "due_date": "2025-12-31T23:59:59.000Z",
      "tags": ["backend", "security"],
      "assigned_to": "Jane Doe",
      "created_by": "John Doe",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Health Check Endpoint

### Health Check

Check if the server is running and healthy.

**Endpoint:** `GET /health`
**Authentication:** Not required

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Additional Information

### Data Types

#### Task Status Enum
- `todo`
- `in_progress`
- `completed`

#### Task Priority Enum
- `low`
- `medium`
- `high`
- `critical`

### MongoDB ObjectId Format

MongoDB ObjectIds are 24-character hexadecimal strings:
```
507f1f77bcf86cd799439011
```

### ISO8601 Date Format

Dates should be in ISO8601 format with timezone:
```
2025-12-31T23:59:59.000Z
```

### Pagination

All paginated endpoints follow this pattern:
- Use `page` and `limit` query parameters
- Response includes `pagination` object with metadata
- Default: page=1, limit=10
- Maximum limit: 100

---

## Testing the API

### Using Postman

Import the Postman collection from `postman/Task-Management-API.postman_collection.json` for a complete interactive API documentation.

### Using curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'

# Get tasks (with token)
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <your_access_token>"
```

---

## Support

For questions, issues, or feature requests:
1. Check this documentation
2. Review the Postman collection
3. Check the backend README
4. Open an issue on GitHub

---

**API Version:** 1.0.0
**Last Updated:** January 2025
**Maintained by:** Task Management System Team
