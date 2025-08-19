# Emergence Backend

A Node.js backend server built with Express, SQLite, and essential middleware for file uploads and CORS support.

## Features

- Express.js server with RESTful API endpoints
- SQLite database with automatic table initialization
- Modular database management with `database.js`
- CORS enabled for frontend integration
- File upload support with Multer
- Error handling middleware
- Health check endpoint
- Graceful shutdown handling
- Comprehensive agents management API

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   # Production
   npm start
   
   # Development (requires nodemon)
   npm run dev
   ```

3. The server will start on port 3001 (or PORT environment variable)

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
  - Body: `{ "name": "string", "email": "string" }`

### Agents
- `GET /api/agents` - Get all agents
  - Query: `?category=marketing` (optional) - Filter by category (case-sensitive)
  - Returns agents list with metadata (count, message, filtered status)
- `GET /api/agents/:id` - Get agent by ID
  - Returns agent details with success message
  - Returns 404 if agent not found
  - Validates ID parameter (must be positive number, decimals are truncated)
- `POST /api/agents` - Create a new agent with file upload (multipart form data)
  - Form fields: `file` (.zip file), `name`, `description`, `category`, `author_name`
  - All fields are required
  - File must be .zip format, max 50MB
- `PUT /api/agents/:id` - Update an agent
- `DELETE /api/agents/:id` - Delete an agent
- `POST /api/agents/:id/download` - Increment download count
- `GET /api/agents/category/:category` - Get agents by category
- `GET /api/agents/search/:term` - Search agents by name, description, or author
- `GET /api/agents/top/downloaded` - Get top downloaded agents
  - Query: `?limit=10` (optional, default: 10)

### File Upload
- `POST /api/upload` - Upload a file (.zip only, max 50MB)
  - Form data with field name: `file`
  - Accepts only .zip files
  - Maximum file size: 50MB
  - Returns file information including path and size

### Root
- `GET /` - Server status message

## Database

The server automatically creates a SQLite database file (`database.sqlite`) and initializes the following tables:

- `users` - User information (id, name, email, created_at)
- `agents` - Agent information (id, name, description, category, author_name, file_path, file_size, download_count, created_at)

## File Uploads

- **File Types**: Only .zip files are accepted
- **File Size**: Maximum 50MB per file
- **Storage**: Files are stored in the `uploads/` directory with unique timestamped filenames
- **Validation**: Comprehensive file type and size validation
- **Error Handling**: Detailed error messages for validation failures

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

## CORS Configuration

CORS is configured to allow requests from `http://localhost:3000` (typical React frontend port).

## Testing

Run the database tests to verify functionality:
```bash
npm test
```

This will test:
- Database connection
- CRUD operations for agents
- Search and filtering functionality
- Download count tracking

The agent creation endpoint returns:
```json
{
  "message": "Agent created successfully",
  "agent": {
    "id": 1,
    "name": "Agent Name",
    "description": "Agent description",
    "category": "AI",
    "author_name": "Author Name",
    "file_path": "uploads/file-1234567890-123456789.zip",
    "file_size": 1024,
    "download_count": 0,
    "created_at": "2025-08-19T03:44:48.464Z"
  },
  "file": {
    "filename": "file-1234567890-123456789.zip",
    "originalName": "original-name.zip",
    "size": 1024,
    "mimetype": "application/zip"
  }
}
```

The GET agents endpoint returns:
```json
{
  "agents": [
    {
      "id": 1,
      "name": "Agent Name",
      "description": "Agent description",
      "category": "AI",
      "author_name": "Author Name",
      "file_path": "uploads/file-1234567890-123456789.zip",
      "file_size": 1024,
      "download_count": 0,
      "created_at": "2025-08-19 03:44:48"
    }
  ],
  "count": 1,
  "message": "Found 1 agent(s)",
  "filtered": false
}
```

When filtering by category:
```json
{
  "agents": [...],
  "count": 1,
  "message": "Found 1 agent(s) in category: AI",
  "filtered": true
}
```

When no agents found:
```json
{
  "agents": [],
  "count": 0,
  "message": "No agents found in category: Marketing",
  "filtered": true
}
```

The GET single agent endpoint returns:
```json
{
  "message": "Agent retrieved successfully",
  "agent": {
    "id": 2,
    "name": "Sample Agent",
    "description": "A sample agent for testing",
    "category": "AI",
    "author_name": "John Doe",
    "file_path": "/uploads/sample-agent.json",
    "file_size": 2048,
    "download_count": 0,
    "created_at": "2025-08-19 03:31:47"
  }
}
```

When agent not found (404):
```json
{
  "error": "Agent not found",
  "message": "No agent found with ID: 999",
  "id": 999
}
```

When invalid ID (400):
```json
{
  "error": "Invalid agent ID",
  "message": "Agent ID must be a positive number"
}
```

Test file upload functionality:
```bash
npm run test:upload
```

Test agent creation with file upload:
```bash
npm run test:agent
```

Test GET agents with category filtering:
```bash
npm run test:get
```

Test GET single agent by ID:
```bash
npm run test:single
```

Manual upload testing with curl:
```bash
# Upload a zip file
curl -X POST -F "file=@your-agent.zip" http://localhost:3001/api/upload

# Try uploading invalid file type (should fail)
curl -X POST -F "file=@invalid.txt" http://localhost:3001/api/upload

# Create agent with file upload
curl -X POST -F "file=@your-agent.zip" -F "name=My Agent" -F "description=Agent description" -F "category=AI" -F "author_name=Your Name" http://localhost:3001/api/agents

# Get all agents
curl http://localhost:3001/api/agents

# Get agents by category
curl "http://localhost:3001/api/agents?category=AI"

# Get single agent by ID
curl http://localhost:3001/api/agents/2

# Get non-existent agent (returns 404)
curl http://localhost:3001/api/agents/999

# Get agent with invalid ID (returns 400)
curl http://localhost:3001/api/agents/abc
```

## Error Handling

The server includes comprehensive error handling:
- 404 for unknown routes
- 500 for server errors
- Input validation for API endpoints
- Database error handling
