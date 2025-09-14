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
  - Query: `?capabilities=1,2,3` (optional) - Filter by capability IDs
  - Query: `?match_all=true` (optional) - Require all capabilities (default: false)
  - Returns agents list with metadata (count, message, filtered status)
- `GET /api/agents/:id` - Get agent by ID
  - Returns agent details with success message
  - Returns 404 if agent not found
  - Validates ID parameter (must be positive number, decimals are truncated)
- `POST /api/agents` - Create a new agent with file upload (multipart form data)
  - Form fields: `file` (.zip file), `name`, `description`, `category`, `author_name`, `capabilities` (optional)
  - Required fields: `file`, `name`, `description`, `category`, `author_name`
  - Optional: `capabilities` - JSON string array of capability IDs (e.g., `"[1,2,3]"`)
  - File must be .zip format, max 50MB
- `PUT /api/agents/:id` - Update an agent
- `DELETE /api/agents/:id` - Delete an agent
- `POST /api/agents/:id/download` - Increment download count
- `GET /api/agents/category/:category` - Get agents by category
- `GET /api/agents/search/:term` - Search agents by name, description, or author
- `GET /api/agents/top/downloaded` - Get top downloaded agents
  - Query: `?limit=10` (optional, default: 10)

### Capabilities API
- `GET /api/capabilities` - Get all available capability categories
  - Returns list of all active capabilities with IDs, names, and descriptions
- `GET /api/capabilities/:id` - Get specific capability by ID
  - Returns capability details
- `GET /api/agents/:id/capabilities` - Get capabilities for a specific agent
  - Returns agent info and associated capabilities
- `POST /api/agents/:id/capabilities` - Declare/update agent capabilities (requires authentication)
  - Body: `{ "capability_ids": [1, 2, 3] }`
  - Updates agent's capability associations
- `GET /api/agents/by-capability/:capability` - Find agents by capability name
  - Example: `/api/agents/by-capability/email`
  - Returns agents that have the specified capability
  - Shows available capabilities if capability name not found
- `GET /api/capabilities/:id/agents` - Get agents that have a specific capability (by ID)
  - Returns capability info and agents that have this capability

#### Available Capabilities
The system includes 15 predefined capabilities:
- `email` - Email Processing
- `data-processing` - Data Processing  
- `customer-support` - Customer Support
- `content-generation` - Content Generation
- `web-scraping` - Web Scraping
- `api-integration` - API Integration
- `file-processing` - File Processing
- `scheduling` - Scheduling
- `database` - Database Operations
- `monitoring` - System Monitoring
- `social-media` - Social Media
- `image-processing` - Image Processing
- `nlp` - Natural Language Processing
- `ml-prediction` - Machine Learning Prediction
- `workflow-automation` - Workflow Automation

### Agent Discovery API
Advanced agent discovery system for finding agents based on multiple criteria:

- `GET /api/agents/discover` - **Main Discovery Engine**
  - Query Parameters:
    - `capability` - Single capability name (e.g., "email", "data-processing") 
    - `capabilities` - Comma-separated capability IDs (e.g., "1,2,3")
    - `match_all` - Require all capabilities (true/false, default: false)
    - `status` - Instance status ("running", "available", "maintenance")
    - `location` - Geographic filter (city, region, coordinates)  
    - `radius` - Search radius in km (default: 50)
    - `availability` - Time-based availability ("now", "24h")
    - `load_threshold` - Maximum acceptable load percentage (default: 80)
    - `limit` - Maximum number of results (default: 10)
    - `sort_by` - Sort criteria ("last_ping", "load", "random")
  - Returns detailed agent instances with endpoints, health, availability, and location data
  - Includes discovery metrics and helpful suggestions when no agents found

- `GET /api/agents/discover/nearby` - **Geographic Discovery**  
  - Query Parameters: `lat`, `lng`, `radius`, `capability`, `status`, `limit`
  - Finds agents within specified geographic radius
  - Uses coordinate-based distance calculations
  - Example: `/api/agents/discover/nearby?lat=37.7749&lng=-122.4194&radius=25`

- `POST /api/agents/discover/batch` - **Batch Discovery**
  - Body: `{ "requests": [{"capability": "email"}, {"status": "running", "limit": 5}] }`
  - Process multiple discovery requests in a single API call  
  - Maximum 10 requests per batch
  - Returns individual results for each request with success status

#### Discovery Response Format
```json
{
  "message": "Found 2 matching agents",
  "discovery_criteria": {
    "capability": "email",
    "status": "running",
    "location": "san-francisco",
    "filters_applied": ["capability", "status", "location"]
  },
  "agents": [
    {
      "agent_id": 1,
      "agent_name": "Email Bot Pro", 
      "instance_id": 123,
      "instance_name": "email-bot-sf-1",
      "endpoint_url": "https://api.example.com/agents/123",
      "status": "running",
      "capabilities": ["email", "nlp", "customer-support"],
      "location": {
        "city": "San Francisco",
        "region": "CA", 
        "country": "US",
        "coordinates": [37.7749, -122.4194]
      },
      "availability": {
        "current_load": 25,
        "max_capacity": 100,
        "available": true,
        "queue_length": 2
      },
      "health": {
        "last_ping": "2025-08-23T22:05:00Z",
        "response_time_ms": 120,
        "uptime_percentage": 99.5,
        "status": "running"
      },
      "metadata": {
        "version": "1.2.0",
        "rate_limit": 1000
      }
    }
  ],
  "count": 2,
  "total_available": 5,
  "discovery_time_ms": 45
}
```

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
- `capability_categories` - Predefined capability types (id, name, display_name, description, is_active, created_at)
- `agent_capabilities` - Many-to-many relationship between agents and capabilities (agent_id, capability_category_id, created_at)
- `agent_instances` - Running agent instances for communication (id, agent_id, instance_name, status, endpoint_url, last_ping, metadata, created_at)

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

## Inter-Agent Messaging System

The platform includes a comprehensive messaging system that allows registered agent instances to communicate with each other reliably.

### Message Types

- **request** - Send a request to another agent for processing
- **response** - Reply to a previous request (use same correlation_id)
- **error** - Report an error or failure in processing

### Authentication

- Both sender and recipient instances must be registered and in 'running' or 'available' status
- Only authorized instances can send/receive messages
- Message access is restricted to sender and recipient

### Message Queue Features

- Reliable delivery tracking with status updates
- Priority levels (1-5, where 1 is highest priority)
- Message expiration with automatic cleanup
- Correlation IDs for request/response matching
- Delivery statistics and monitoring

### API Endpoints

#### Send Message
```bash
# Send a message from one agent to another
POST /api/agents/message

{
  "from_instance_id": 1,
  "to_instance_id": 2,
  "message_type": "request",
  "content": "Can you process this data?",
  "subject": "Data Processing Request",
  "priority": 2,
  "correlation_id": "req-123",
  "expires_at": "2025-08-24T10:00:00Z"
}
```

#### Get Messages
```bash
# Get messages for an agent instance
GET /api/agents/:instance_id/messages?message_type=request&status=pending&limit=20

# Filter parameters:
# - message_type: request, response, error
# - status: pending, delivered, read, failed, expired  
# - limit: number of messages (default: 50)
# - offset: pagination offset (default: 0)
# - include_read: true/false (default: true)
```

#### Update Message Status
```bash
# Mark a message as read (recipient only)
PUT /api/messages/:message_id/status

{
  "status": "read",
  "instance_id": 2
}
```

#### Get Message Details
```bash
# Get specific message with delivery status
GET /api/messages/:message_id?instance_id=1
```

#### Message Queue Statistics
```bash
# Get queue statistics and cleanup expired messages
GET /api/messages/stats
```

### Example Usage

```bash
# Register two agent instances
curl -X POST http://localhost:3001/api/webhook/register \
  -H "Content-Type: application/json" \
  -d '{"agent_id": 1, "instance_name": "processor-1", "endpoint_url": "http://localhost:4001"}'

curl -X POST http://localhost:3001/api/webhook/register \
  -H "Content-Type: application/json" \
  -d '{"agent_id": 2, "instance_name": "analyzer-1", "endpoint_url": "http://localhost:4002"}'

# Send a processing request
curl -X POST http://localhost:3001/api/agents/message \
  -H "Content-Type: application/json" \
  -d '{
    "from_instance_id": 1,
    "to_instance_id": 2,
    "message_type": "request",
    "content": "Please analyze this dataset",
    "subject": "Data Analysis Request",
    "priority": 1,
    "correlation_id": "analysis-001"
  }'

# Check for messages (analyzer)
curl "http://localhost:3001/api/agents/2/messages?status=delivered&include_read=false"

# Mark message as read
curl -X PUT http://localhost:3001/api/messages/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "read", "instance_id": 2}'

# Send response back
curl -X POST http://localhost:3001/api/agents/message \
  -H "Content-Type: application/json" \
  -d '{
    "from_instance_id": 2,
    "to_instance_id": 1,
    "message_type": "response",
    "content": "Analysis complete. Results attached.",
    "subject": "Re: Data Analysis Request",
    "correlation_id": "analysis-001"
  }'
```

### Message Status Flow

1. **pending** - Message created, waiting for delivery
2. **delivered** - Message successfully delivered to recipient
3. **read** - Recipient has marked message as read
4. **failed** - Delivery failed (with error details)
5. **expired** - Message expired before delivery/reading

## Agent Communication Security

The platform implements comprehensive security for inter-agent communication with API key authentication, rate limiting, and detailed logging.

### Security Features

- **Unique API Keys** - Cryptographically secure API keys for each agent instance
- **Authentication Middleware** - Validates sender/receiver in all agent-to-agent calls
- **Rate Limiting** - Prevents abuse with configurable request limits per time window
- **Communication Logging** - Complete audit trail for debugging and security monitoring
- **Key Lifecycle Management** - Generate, validate, and revoke API keys
- **Instance Authorization** - Only active agents can send/receive messages

### API Key Authentication

#### Automatic Key Generation
When registering an agent instance, an API key is automatically generated:

```bash
curl -X POST http://localhost:3001/api/webhook/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": 1,
    "instance_name": "my-agent-1",
    "endpoint_url": "http://localhost:4001"
  }'

# Response includes:
{
  "security": {
    "api_key": "ak_7f8d9e2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e",
    "key_id": 1,
    "key_name": "my-agent-1-primary-key",
    "instructions": "Store this API key securely. Include it in the X-API-Key header for inter-agent communication."
  }
}
```

#### Using API Keys
Include the API key in the `X-API-Key` header for all inter-agent requests:

```bash
# Send a message with API key authentication
curl -X POST http://localhost:3001/api/agents/message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ak_7f8d9e2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e" \
  -d '{
    "to_instance_id": 2,
    "message_type": "request",
    "content": "Process this data securely",
    "subject": "Secure Processing Request"
  }'
```

### API Key Management

#### Generate Additional Keys
```bash
# Generate a new API key for an instance
curl -X POST http://localhost:3001/api/agents/1/api-keys \
  -H "X-API-Key: your-existing-key" \
  -H "Content-Type: application/json" \
  -d '{
    "key_name": "backup-key",
    "expires_at": "2025-12-31T23:59:59Z"
  }'
```

#### List Instance Keys
```bash
# Get all API keys for your instance
curl -H "X-API-Key: your-key" \
  "http://localhost:3001/api/agents/1/api-keys?include_revoked=false"
```

#### Revoke Keys
```bash
# Revoke an API key
curl -X DELETE http://localhost:3001/api/agents/1/api-keys/2 \
  -H "X-API-Key: your-active-key"
```

### Rate Limiting

Inter-agent communication is rate-limited to prevent abuse:

- **Default Limits**: 100 requests per hour per agent instance
- **Headers**: Rate limit info included in response headers
- **Sliding Window**: Uses sliding window algorithm for accurate limiting

Rate limit headers in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1692832800000
```

When rate limit is exceeded:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Limit: 100 requests per 3600 seconds",
  "retry_after": 1234
}
```

### Security Logging & Debugging

#### Communication Logs
All inter-agent communications are logged for debugging and security audit:

```bash
# Get communication logs for your instance
curl -H "X-API-Key: your-key" \
  "http://localhost:3001/api/communication/logs?event_type=message_sent&limit=50"

# Response includes detailed event information:
{
  "logs": [
    {
      "id": 1,
      "event_type": "message_sent",
      "from_instance_id": 1,
      "to_instance_id": 2,
      "message_id": 123,
      "api_key_used": "ak_7f8d9e2a...",
      "ip_address": "192.168.1.100",
      "response_status": 201,
      "processing_time_ms": 45,
      "created_at": "2025-08-23T22:30:00Z"
    }
  ]
}
```

#### Communication Statistics
Monitor communication patterns and performance:

```bash
# Get communication statistics
curl -H "X-API-Key: your-key" \
  "http://localhost:3001/api/communication/stats?time_range=24h"

# Response includes aggregated metrics:
{
  "statistics": {
    "message_sent": {
      "count": 45,
      "avg_processing_time": 67.8
    },
    "auth_attempt": {
      "count": 12,
      "avg_processing_time": 23.4
    },
    "rate_limit_hit": {
      "count": 2,
      "avg_processing_time": 15.2
    }
  }
}
```

### Event Types Logged

- **auth_attempt** - API key validation attempts
- **message_sent** - Successful message transmissions
- **message_received** - Message retrievals by recipients
- **rate_limit_hit** - Rate limit violations
- **validation_error** - Request validation failures

### Security Best Practices

1. **Store API Keys Securely** - Never log or expose full API keys
2. **Rotate Keys Regularly** - Generate new keys and revoke old ones periodically
3. **Monitor Logs** - Watch for unusual patterns or authentication failures
4. **Rate Limit Awareness** - Implement backoff strategies for rate-limited requests
5. **Instance Status** - Ensure instances are in 'running' or 'available' status
6. **Validate Recipients** - Check recipient availability before sending messages

### Security Headers

All secure endpoints return security-related headers:
- `X-RateLimit-*` - Rate limiting information
- `X-Request-ID` - Unique request identifier for tracking
- Standard CORS and security headers

## Error Handling

The server includes comprehensive error handling:
- 404 for unknown routes
- 500 for server errors
- Input validation for API endpoints
- Database error handling
