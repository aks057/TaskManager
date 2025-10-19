# Task Management API - Postman Documentation

This folder contains the Postman collection and environment for testing the Task Management API.

## 📦 Files

- **Task-Management-API.postman_collection.json** - Complete API collection with all endpoints
- **Task-Management-Environment.postman_environment.json** - Environment variables template
- **README.md** - This file

## 🚀 Getting Started

### Step 1: Import Collection and Environment

1. Open Postman
2. Click "Import" button in the top left
3. Select both JSON files from this folder:
   - `Task-Management-API.postman_collection.json`
   - `Task-Management-Environment.postman_environment.json`
4. Click "Import"

### Step 2: Select Environment

1. In the top right corner of Postman, click the environment dropdown
2. Select "Task Management - Local"
3. Verify the `base_url` is set to `http://localhost:5000` (or your server URL)

### Step 3: Start Testing

1. Ensure your backend server is running on `http://localhost:5000`
2. Navigate to the "Authentication" folder in the collection
3. Run the "Register User" or "Login User" request
4. The access token and refresh token will be automatically saved to environment variables
5. All subsequent requests will use the saved token automatically

## 📋 Collection Structure

### 1. Authentication (7 endpoints)
- **Register User** - Create a new user account
- **Login User** - Login with email and password
- **Refresh Access Token** - Get new tokens using refresh token
- **Get Current User Profile** - Get authenticated user info
- **Logout User** - Logout and invalidate refresh token
- **Update Profile** - Update user name and email
- **Change Password** - Change user password

### 2. Tasks (6 endpoints)
- **Create Task** - Create a new task with all properties
- **Get All Tasks** - List tasks with filtering, searching, sorting, pagination
- **Get Task by ID** - Get single task details
- **Update Task** - Update task properties
- **Delete Task (Soft Delete)** - Mark task as deleted
- **Bulk Create Tasks** - Create multiple tasks at once

### 3. Comments (4 endpoints)
- **Add Comment to Task** - Add a comment to a task
- **Get Task Comments** - Get all comments for a task (paginated)
- **Update Comment** - Update your own comment
- **Delete Comment** - Delete your own comment

### 4. Files (4 endpoints)
- **Upload Files to Task** - Upload multiple files (max 10MB each)
- **Get Files for Task** - List all files for a task
- **Download File** - Download a file by ID
- **Delete File** - Delete a file

### 5. Analytics (4 endpoints)
- **Task Overview Statistics** - Get task counts by status and priority
- **User Performance Metrics** - Get completion rate and metrics
- **Task Trends Over Time** - Get trends by day/week/month
- **Export Tasks Data** - Export to CSV or JSON

### 6. Health Check (1 endpoint)
- **Health Check** - Verify server is running

## 🔑 Environment Variables

The environment includes these variables (automatically populated):

| Variable | Description | Auto-populated |
|----------|-------------|----------------|
| `base_url` | API base URL (default: http://localhost:5000) | No - Set manually |
| `access_token` | JWT access token (15 min expiry) | Yes - From login/register |
| `refresh_token` | JWT refresh token (7 days expiry) | Yes - From login/register |
| `user_id` | Current user ID | Yes - From login/register |
| `task_id` | Last created task ID | Yes - From create task |
| `comment_id` | Last created comment ID | Yes - From create comment |
| `file_id` | Last uploaded file ID | Yes - From upload files |

## 🔄 Automated Features

### Pre-request Scripts
- Logs request URL to console for debugging
- All requests use environment variables automatically

### Test Scripts
- Validate response status codes
- Validate response structure
- Auto-save tokens from login/register to environment
- Auto-save IDs (task, comment, file) for subsequent requests
- Verify response times are under 5 seconds
- Validate JSON response format

### Example Workflow

1. **Register/Login** → Tokens saved automatically
2. **Create Task** → Task ID saved to `{{task_id}}`
3. **Add Comment** → Uses `{{task_id}}`, saves `{{comment_id}}`
4. **Upload Files** → Uses `{{task_id}}`, saves `{{file_id}}`
5. **Get Analytics** → Uses saved `{{access_token}}`

## 📝 Request Examples

### Authentication
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

### Create Task
```http
POST /api/tasks
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication",
  "status": "todo",
  "priority": "high",
  "due_date": "2025-12-31T23:59:59.000Z",
  "tags": ["backend", "security"],
  "assigned_to": null
}
```

### Filter Tasks
```http
GET /api/tasks?page=1&limit=10&status=in_progress&priority=high&search=authentication
Authorization: Bearer {{access_token}}
```

### Upload Files
```http
POST /api/tasks/{{task_id}}/files
Authorization: Bearer {{access_token}}
Content-Type: multipart/form-data

files: [Select files from file system]
```

## 🛠️ Tips

### Customizing the Base URL
1. Click the eye icon next to the environment dropdown
2. Click "Edit" on "Task Management - Local"
3. Change the `base_url` value to your server URL
4. Save changes

### Running Multiple Requests
1. Right-click on a folder (e.g., "Authentication")
2. Select "Run folder"
3. Click "Run Task Management API" to execute all requests in sequence

### Exporting Test Results
1. After running requests, click "View Results"
2. Click "Export Results" to save test outcomes

### Creating Additional Environments
1. Duplicate the "Task Management - Local" environment
2. Rename it (e.g., "Task Management - Production")
3. Update the `base_url` to your production URL
4. Switch between environments as needed

## 🔍 Debugging

### Common Issues

**401 Unauthorized Error:**
- Token expired (15 min expiry)
- Use "Refresh Access Token" request to get new token
- Or login again

**429 Too Many Requests:**
- Rate limit exceeded
- Wait for the time window to reset:
  - Auth endpoints: 5 requests per 15 minutes
  - File uploads: 10 requests per hour
  - Global: 100 requests per 15 minutes

**404 Not Found:**
- Verify the resource ID exists
- Check if `{{task_id}}`, `{{comment_id}}`, or `{{file_id}}` is set in environment

**Validation Error (400):**
- Check request body format
- Verify required fields are provided
- Check field length and format constraints

### Viewing Console Logs
1. Open Postman Console (View → Show Postman Console)
2. See detailed request/response data
3. View test script logs

## 📊 Response Format

All successful responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

Error responses:

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

## 🔒 Security Notes

- Never commit environment files with real tokens to version control
- Tokens are stored as "secret" type in environment (hidden by default)
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Use HTTPS in production environments

## 📚 Additional Resources

- [Backend README](../README.md) - Full backend documentation
- [API Endpoints Documentation](../README.md#-api-endpoints) - Detailed endpoint descriptions
- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/) - Official Postman guides

## 🤝 Support

If you encounter issues:
1. Check the Postman Console for detailed error messages
2. Verify your environment variables are set correctly
3. Ensure the backend server is running
4. Check the backend server logs for errors
5. Refer to the main README for troubleshooting

---

**Happy Testing! 🚀**
