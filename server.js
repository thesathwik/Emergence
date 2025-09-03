const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { db, dbHelpers, testConnection, initializeDatabase } = require('./database');
const CodeScanner = require('./utils/codeScanner');

// Import auth routes
const authRoutes = require('./routes/auth');

// Import auth middleware
const { verifyToken, requireVerifiedEmail, JWT_SECRET } = require('./auth');

// ============================================================================
// SECURITY MIDDLEWARE FOR INTER-AGENT COMMUNICATION
// ============================================================================

// API Key validation middleware
const validateApiKey = async (req, res, next) => {
  const startTime = Date.now();
  let logData = {
    event_type: 'auth_attempt',
    ip_address: req.ip || req.connection.remoteAddress,
    user_agent: req.get('User-Agent'),
    request_data: {
      url: req.originalUrl,
      method: req.method
    }
  };

  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      logData.error_message = 'Missing API key';
      logData.response_status = 401;
      logData.processing_time_ms = Date.now() - startTime;
      
      await dbHelpers.logCommunicationEvent(logData);
      
      return res.status(401).json({
        error: 'Authentication required',
        message: 'API key must be provided in X-API-Key header or Authorization header'
      });
    }

    // Validate the API key
    const keyInfo = await dbHelpers.validateApiKey(apiKey);
    
    if (!keyInfo) {
      logData.api_key_used = apiKey;
      logData.error_message = 'Invalid API key';
      logData.response_status = 401;
      logData.processing_time_ms = Date.now() - startTime;
      
      await dbHelpers.logCommunicationEvent(logData);
      
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid or expired'
      });
    }

    // Check if instance is active
    if (keyInfo.instance_status !== 'running' && keyInfo.instance_status !== 'available') {
      logData.api_key_used = apiKey;
      logData.from_instance_id = keyInfo.instance_id;
      logData.error_message = `Instance status: ${keyInfo.instance_status}`;
      logData.response_status = 403;
      logData.processing_time_ms = Date.now() - startTime;
      
      await dbHelpers.logCommunicationEvent(logData);
      
      return res.status(403).json({
        error: 'Instance not active',
        message: 'Agent instance must be in running or available status'
      });
    }

    // Attach instance info to request for use in endpoints
    req.agentAuth = {
      instanceId: keyInfo.instance_id,
      agentId: keyInfo.agent_id,
      instanceName: keyInfo.instance_name,
      apiKeyId: keyInfo.id,
      apiKey: apiKey
    };

    next();
    
  } catch (error) {
    logData.error_message = error.message;
    logData.response_status = 500;
    logData.processing_time_ms = Date.now() - startTime;
    
    await dbHelpers.logCommunicationEvent(logData);
    
    res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to validate API key'
    });
  }
};

// Rate limiting middleware for inter-agent communication
const rateLimitInterAgent = (maxRequests = 100, windowSeconds = 3600) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    try {
      if (!req.agentAuth) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'API key validation must be performed first'
        });
      }

      const bucketKey = `agent_${req.agentAuth.instanceId}`;
      const rateLimitResult = await dbHelpers.checkRateLimit(bucketKey, maxRequests, windowSeconds);

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.reset_time).getTime().toString()
      });

      if (!rateLimitResult.allowed) {
        // Log rate limit hit
        await dbHelpers.logCommunicationEvent({
          event_type: 'rate_limit_hit',
          from_instance_id: req.agentAuth.instanceId,
          api_key_used: req.agentAuth.apiKey,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent'),
          rate_limit_bucket: bucketKey,
          response_status: 429,
          processing_time_ms: Date.now() - startTime
        });

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${maxRequests} requests per ${windowSeconds} seconds`,
          retry_after: Math.ceil((new Date(rateLimitResult.reset_time) - new Date()) / 1000)
        });
      }

      next();
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Don't block the request if rate limiting fails
      next();
    }
  };
};

// Message logging middleware
const logCommunication = (eventType) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(body) {
      // Log the communication event
      const logData = {
        event_type: eventType,
        from_instance_id: req.agentAuth?.instanceId,
        to_instance_id: req.body?.to_instance_id,
        message_id: body?.messageId || body?.message_id,
        api_key_used: req.agentAuth?.apiKey,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent'),
        request_data: {
          url: req.originalUrl,
          method: req.method,
          body: req.body
        },
        response_status: res.statusCode,
        processing_time_ms: Date.now() - startTime
      };

      // Don't await this to avoid blocking the response
      dbHelpers.logCommunicationEvent(logData).catch(err => {
        console.error('Failed to log communication event:', err);
      });

      // Call original json method
      originalJson.call(this, body);
    };

    next();
  };
};

const app = express();
const PORT = process.env.PORT || 3001;



// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));
}

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only .zip files
const fileFilter = (req, file, cb) => {
  // Check file extension
  const allowedExtensions = ['.zip'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only .zip files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: fileFilter
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };

    // If detailed health check is requested
    if (req.query.detailed === 'true') {
      try {
        const dbHealth = await dbHelpers.checkDatabaseHealth();
        health.database = dbHealth;
      } catch (dbError) {
        console.error('Database health check failed:', dbError);
        health.database = {
          status: 'unhealthy',
          error: dbError.message
        };
        health.status = 'DEGRADED';
      }
    }

    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);

// Example API routes
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, email });
  });
});

// File upload route with comprehensive error handling
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File too large', 
          message: 'File size must be less than 50MB' 
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          error: 'Too many files', 
          message: 'Only one file can be uploaded at a time' 
        });
      }
      return res.status(400).json({ 
        error: 'Upload error', 
        message: err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        error: 'Invalid file', 
        message: err.message 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please select a .zip file to upload'
      });
    }
    
    res.json({ 
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        mimetype: req.file.mimetype
      }
    });
  });
});

// Agents API routes
app.get('/api/agents', async (req, res) => {
  console.log('API /api/agents called with query:', req.query);
  try {
    const { category, capabilities } = req.query;
    
    let agents;
    
    if (capabilities) {
      // Filter by capabilities if provided
      const capabilityIds = capabilities.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (capabilityIds.length > 0) {
        const matchAll = req.query.match_all === 'true';
        agents = await dbHelpers.searchAgentsByCapabilities(capabilityIds, matchAll);
      } else {
        agents = [];
      }
    } else if (category) {
      // Filter by category if provided
      agents = await dbHelpers.getAgentsByCategory(category);
    } else {
      // Get all agents if no category filter
      agents = await dbHelpers.getAllAgents();
    }
    
    // Handle empty results
    if (!agents || agents.length === 0) {
      let message = 'No agents found';
      if (capabilities) {
        message = 'No agents found with specified capabilities';
      } else if (category) {
        message = `No agents found in category: ${category}`;
      }
      
      return res.json({
        agents: [],
        count: 0,
        message: message,
        filtered: !!(category || capabilities)
      });
    }
    
    // Return successful response with metadata
    console.log('Returning agents:', agents);
    res.json({
      agents: agents,
      count: agents.length,
      message: `Found ${agents.length} agent(s)${category ? ` in category: ${category}` : ''}${capabilities ? ' with specified capabilities' : ''}`,
      filtered: !!(category || capabilities)
    });
    
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ 
      error: 'Failed to fetch agents',
      message: err.message 
    });
  }
});

// Agent Discovery Engine - Must come before :id routes
app.get('/api/agents/discover', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Parse query parameters
    const {
      capability,
      capabilities,
      match_all,
      status,
      location,
      radius,
      availability,
      load_threshold,
      limit,
      sort_by
    } = req.query;

    // Build filters object
    const filters = {};
    
    if (capability) filters.capability = capability;
    if (capabilities) {
      // Parse capabilities as comma-separated IDs
      const capabilityIds = capabilities.split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      if (capabilityIds.length > 0) {
        filters.capabilities = capabilityIds;
      }
    }
    if (match_all !== undefined) filters.match_all = match_all === 'true';
    if (status) filters.status = status;
    if (location) filters.location = location;
    if (radius) filters.radius = parseInt(radius) || 50;
    if (availability) filters.availability = availability;
    if (load_threshold) filters.load_threshold = parseInt(load_threshold) || 80;
    if (limit) filters.limit = parseInt(limit) || 10;
    if (sort_by) filters.sort_by = sort_by;

    // Execute discovery
    const agents = await dbHelpers.discoverRankedAgents(filters);
    
    // Apply additional location filtering if specified
    let filteredAgents = agents;
    if (location && agents.length > 0) {
      const locationAgents = await dbHelpers.getAgentsByLocation(location, filters.radius);
      const locationInstanceIds = new Set(locationAgents.map(a => a.instance_id));
      filteredAgents = agents.filter(agent => 
        !location || locationInstanceIds.has(agent.instance_id) || !agent.location.city
      );
    }

    // Calculate discovery metrics
    const discoveryTime = Date.now() - startTime;
    const totalAvailable = await dbHelpers.getAvailableAgentInstances({ status: status || 'running' });

    // Build response
    const response = {
      message: `Found ${filteredAgents.length} matching agents`,
      discovery_criteria: {
        capability: capability || null,
        capabilities: filters.capabilities || null,
        match_all: filters.match_all || false,
        status: status || 'running',
        location: location || null,
        radius: filters.radius,
        availability: availability || 'now',
        load_threshold: filters.load_threshold,
        sort_by: sort_by || 'last_ping',
        filters_applied: Object.keys(filters)
      },
      agents: filteredAgents,
      count: filteredAgents.length,
      total_available: totalAvailable.length,
      discovery_time_ms: discoveryTime
    };

    // Add helpful suggestions if no agents found
    if (filteredAgents.length === 0) {
      const allAgents = await dbHelpers.getAllAgentInstances();
      const runningAgents = allAgents.filter(a => a.status === 'running');
      
      response.suggestions = {
        total_agents: allAgents.length,
        running_agents: runningAgents.length,
        message: runningAgents.length > 0 
          ? 'Try removing some filters or check different capabilities' 
          : 'No agents are currently running'
      };

      if (capability || capabilities) {
        const availableCapabilities = await dbHelpers.getAllCapabilities();
        response.suggestions.available_capabilities = availableCapabilities.slice(0, 5).map(c => ({
          name: c.name,
          display_name: c.display_name
        }));
      }
    }

    res.json(response);
    
  } catch (error) {
    console.error('Error in agent discovery:', error);
    res.status(500).json({
      error: 'Discovery failed',
      message: error.message,
      discovery_time_ms: Date.now() - (req.query.startTime || Date.now())
    });
  }
});

// Nearby agents discovery endpoint
app.get('/api/agents/discover/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 50, capability, status = 'running', limit = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Both lat and lng parameters are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'lat and lng must be valid numbers'
      });
    }

    // For this implementation, we'll use a simplified location search
    // In production, you'd use proper geographic distance calculations
    const agents = await dbHelpers.discoverRankedAgents({
      capability: capability,
      status: status,
      limit: parseInt(limit)
    });

    // Filter by proximity (simplified - would use proper geo calculations in production)
    const nearbyAgents = agents.filter(agent => {
      const agentLocation = agent.location;
      if (!agentLocation.coordinates || agentLocation.coordinates.length !== 2) {
        return false;
      }
      
      // Simplified distance calculation (not accurate for production)
      const [agentLat, agentLng] = agentLocation.coordinates;
      const latDiff = Math.abs(latitude - agentLat);
      const lngDiff = Math.abs(longitude - agentLng);
      const approximateDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // rough km conversion
      
      return approximateDistance <= parseInt(radius);
    });

    res.json({
      message: `Found ${nearbyAgents.length} agents within ${radius}km`,
      search_criteria: {
        coordinates: [latitude, longitude],
        radius: parseInt(radius),
        capability: capability || null,
        status: status
      },
      agents: nearbyAgents,
      count: nearbyAgents.length
    });
    
  } catch (error) {
    console.error('Error in nearby agent discovery:', error);
    res.status(500).json({
      error: 'Nearby discovery failed',
      message: error.message
    });
  }
});

app.get('/api/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { include_capabilities } = req.query;
    
    // Validate ID parameter
    const agentId = parseInt(id);
    if (!id || isNaN(agentId) || agentId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid agent ID',
        message: 'Agent ID must be a positive number'
      });
    }
    
    const agent = await dbHelpers.getAgentById(agentId);
    
    if (!agent) {
      return res.status(404).json({ 
        error: 'Agent not found',
        message: `No agent found with ID: ${agentId}`,
        id: agentId
      });
    }
    
    // Include capabilities if requested
    let capabilities = [];
    if (include_capabilities === 'true') {
      capabilities = await dbHelpers.getAgentCapabilities(agentId);
    }
    
    // Return agent details with success message
    res.json({
      message: 'Agent retrieved successfully',
      agent: {
        ...agent,
        ...(include_capabilities === 'true' && { capabilities })
      }
    });
    
  } catch (err) {
    console.error('Error fetching agent by ID:', err);
    res.status(500).json({ 
      error: 'Failed to fetch agent',
      message: err.message 
    });
  }
});

app.post('/api/agents', verifyToken, requireVerifiedEmail, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            error: 'File too large', 
            message: 'File size must be less than 50MB' 
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ 
            error: 'Too many files', 
            message: 'Only one file can be uploaded at a time' 
          });
        }
        return res.status(400).json({ 
          error: 'Upload error', 
          message: err.message 
        });
      } else if (err) {
        return res.status(400).json({ 
          error: 'Invalid file', 
          message: err.message 
        });
      }

      // Extract agent information from form data
      const { name, description, category, author_name, capabilities } = req.body;
      
      // Validate required fields
      const requiredFields = ['name', 'description', 'category', 'author_name'];
      const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === '');
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          message: `Required fields missing: ${missingFields.join(', ')}`,
          missingFields
        });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file uploaded',
          message: 'Please select a .zip file to upload'
        });
      }

      // Parse capabilities (can be JSON string or comma-separated IDs)
      let capabilityIds = [];
      if (capabilities) {
        try {
          if (typeof capabilities === 'string') {
            // Try to parse as JSON first, then fall back to comma-separated
            if (capabilities.startsWith('[') || capabilities.startsWith('{')) {
              capabilityIds = JSON.parse(capabilities);
            } else {
              capabilityIds = capabilities.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            }
          } else if (Array.isArray(capabilities)) {
            capabilityIds = capabilities.map(id => parseInt(id)).filter(id => !isNaN(id));
          }
        } catch (parseError) {
          return res.status(400).json({
            error: 'Invalid capabilities format',
            message: 'Capabilities must be a JSON array or comma-separated list of capability IDs'
          });
        }
      }

      // Scan uploaded file for security issues
      console.log(`🔍 Scanning uploaded file: ${req.file.filename}`);
      const scanner = new CodeScanner();
      
      // Initialize agent data with basic information
      let scanResultsJson = null;
      
      try {
        const scanResults = await scanner.scanZipFile(req.file.path);
        
        // Log scan results
        console.log(`📊 Scan completed - Risk: ${scanResults.summary.riskLevel}, Findings: ${scanResults.securityFindings.length}`);
        
        // Check if upload should be blocked based on risk level
        if (scanResults.summary.riskLevel === 'critical') {
          // Delete uploaded file
          fs.unlinkSync(req.file.path);
          
          return res.status(400).json({
            error: 'Security scan failed',
            message: 'File contains critical security risks and cannot be uploaded',
            scanResults: {
              riskLevel: scanResults.summary.riskLevel,
              findingsCount: scanResults.securityFindings.length,
              warnings: scanResults.summary.warnings,
              errors: scanResults.summary.errors
            }
          });
        }

        // Extract actual file content for platform scoring
        let combinedContent = '';
        
        // Use the real content from analyzed files
        for (const file of scanResults.files) {
          if (file.isCodeFile && file.content) {
            combinedContent += `\n// File: ${file.fileName}\n`;
            combinedContent += file.content + '\n';
          }
        }

        // If we don't have direct content, extract from the zip file again
        if (combinedContent.length < 50) {
          try {
            const additionalContent = await scanner.extractContentFromZip(req.file.path);
            combinedContent = additionalContent;
          } catch (extractError) {
            console.warn('⚠️  Could not extract content for scoring, using minimal content');
            combinedContent = 'function defaultAgent() { return "basic agent"; }';
          }
        }

        // Calculate platform communication score using real content
        const platformScore = scanner.calculatePlatformScore(combinedContent);
        
        // Store scan results for database
        scanResultsJson = JSON.stringify({
          riskLevel: scanResults.summary.riskLevel,
          findingsCount: scanResults.securityFindings.length,
          scannedAt: new Date().toISOString(),
          safe: scanResults.summary.safe,
          platformScore: platformScore.score,
          category: platformScore.category
        });
        
        console.log(`✅ Security scan passed - Score: ${platformScore.score}/100 (${platformScore.category})`);
        
      } catch (scanError) {
        console.error('❌ Security scan error:', scanError.message);
        
        // For now, allow upload but log the error
        // In production, you might want to block uploads on scan errors
        console.log('⚠️  Proceeding with upload despite scan error');
        
        scanResultsJson = JSON.stringify({ 
          error: scanError.message, 
          scannedAt: new Date().toISOString() 
        });
      }

      // Parse platform scoring from scan results
      let communicationScore = 0;
      let complianceLevel = 'Unlikely';
      
      try {
        if (scanResultsJson) {
          const scanData = JSON.parse(scanResultsJson);
          communicationScore = scanData.platformScore || 0;
          complianceLevel = scanData.category || 'Unlikely';
        }
      } catch (error) {
        console.log('⚠️ Error parsing scan results for scoring:', error.message);
      }

      // Create agent data with file information and user association
      const agentData = {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        author_name: author_name.trim(),
        file_path: req.file.path,
        file_size: req.file.size,
        user_id: req.user.userId, // Associate with authenticated user
        scan_results: scanResultsJson, // Store scan summary
        communication_score: communicationScore, // Store platform score
        compliance_level: complianceLevel // Store verification category
      };

      // Save agent to database
      const agent = await dbHelpers.createAgent(agentData);
      
      // Add capabilities if provided
      if (capabilityIds.length > 0) {
        await dbHelpers.setAgentCapabilities(agent.id, capabilityIds);
      }
      
      // Get agent capabilities for response
      const agentCapabilities = await dbHelpers.getAgentCapabilities(agent.id);
      
      res.status(201).json({
        message: 'Agent created successfully',
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          category: agent.category,
          author_name: agent.author_name,
          file_path: agent.file_path,
          file_size: agent.file_size,
          user_id: agent.user_id,
          download_count: 0,
          created_at: new Date().toISOString(),
          scan_results: agent.scan_results,
          communication_score: agent.communication_score,
          compliance_level: agent.compliance_level,
          capabilities: agentCapabilities
        },
        user: {
          id: req.user.userId,
          name: req.user.name,
          email: req.user.email
        },
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });

    } catch (error) {
      console.error('Error creating agent:', error);
      res.status(500).json({ 
        error: 'Failed to create agent',
        message: error.message 
      });
    }
  });
});

app.put('/api/agents/:id', async (req, res) => {
  try {
    const { name, description, category, author_name, file_path, file_size } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const agent = await dbHelpers.updateAgent(req.params.id, {
      name,
      description,
      category,
      author_name,
      file_path,
      file_size
    });
    
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/agents/:id', async (req, res) => {
  try {
    const result = await dbHelpers.deleteAgent(req.params.id);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents/:id/download', async (req, res) => {
  try {
    const result = await dbHelpers.incrementDownloadCount(req.params.id);
    if (!result.updated) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({ message: 'Download count incremented' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/:id/download', async (req, res) => {
  try {
    // Get agent details to find the file path
    const agent = await dbHelpers.getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Check if file exists
    const filePath = agent.file_path;
    if (!filePath) {
      return res.status(404).json({ error: 'Agent file not found' });
    }

    // Resolve the full file path
    const fullPath = path.resolve(filePath.startsWith('/') ? filePath : path.join(__dirname, filePath));
    
    // Check if file exists on filesystem
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Agent file not found on server' });
    }

    // Increment download count
    await dbHelpers.incrementDownloadCount(req.params.id);

    // Set headers for file download
    const fileName = path.basename(fullPath);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
    
  } catch (err) {
    console.error('Error downloading agent file:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/category/:category', async (req, res) => {
  try {
    const agents = await dbHelpers.getAgentsByCategory(req.params.category);
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/search/:term', async (req, res) => {
  try {
    const agents = await dbHelpers.searchAgents(req.params.term);
    res.json({ agents, message: 'Agents retrieved successfully', count: agents.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/top/downloaded', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const agents = await dbHelpers.getTopDownloadedAgents(limit);
    res.json({ agents, message: 'Top agents retrieved successfully', count: agents.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Capabilities API routes
app.get('/api/capabilities', async (req, res) => {
  try {
    const capabilities = await dbHelpers.getAllCapabilities();
    res.json({
      message: `Found ${capabilities.length} capability categories`,
      capabilities: capabilities,
      count: capabilities.length
    });
  } catch (err) {
    console.error('Error fetching capabilities:', err);
    res.status(500).json({ 
      error: 'Failed to fetch capabilities',
      message: err.message 
    });
  }
});

app.get('/api/capabilities/:id', async (req, res) => {
  try {
    const capability = await dbHelpers.getCapabilityById(req.params.id);
    if (!capability) {
      return res.status(404).json({ 
        error: 'Capability not found',
        message: `No capability found with ID: ${req.params.id}`
      });
    }
    res.json({
      message: 'Capability retrieved successfully',
      capability: capability
    });
  } catch (err) {
    console.error('Error fetching capability:', err);
    res.status(500).json({ 
      error: 'Failed to fetch capability',
      message: err.message 
    });
  }
});

app.get('/api/agents/:id/capabilities', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate agent ID
    const agentId = parseInt(id);
    if (!id || isNaN(agentId) || agentId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid agent ID',
        message: 'Agent ID must be a positive number'
      });
    }
    
    // Check if agent exists
    const agent = await dbHelpers.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ 
        error: 'Agent not found',
        message: `No agent found with ID: ${agentId}`
      });
    }
    
    const capabilities = await dbHelpers.getAgentCapabilities(agentId);
    res.json({
      message: `Found ${capabilities.length} capabilities for agent: ${agent.name}`,
      agent: {
        id: agent.id,
        name: agent.name
      },
      capabilities: capabilities,
      count: capabilities.length
    });
  } catch (err) {
    console.error('Error fetching agent capabilities:', err);
    res.status(500).json({ 
      error: 'Failed to fetch agent capabilities',
      message: err.message 
    });
  }
});

app.post('/api/agents/:id/capabilities', verifyToken, requireVerifiedEmail, async (req, res) => {
  try {
    const { id } = req.params;
    const { capability_ids } = req.body;
    
    // Validate agent ID
    const agentId = parseInt(id);
    if (!id || isNaN(agentId) || agentId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid agent ID',
        message: 'Agent ID must be a positive number'
      });
    }
    
    // Validate capability_ids
    if (!capability_ids || !Array.isArray(capability_ids)) {
      return res.status(400).json({ 
        error: 'Invalid capabilities',
        message: 'capability_ids must be an array of capability IDs'
      });
    }
    
    const capabilityIds = capability_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    // Check if agent exists
    const agent = await dbHelpers.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ 
        error: 'Agent not found',
        message: `No agent found with ID: ${agentId}`
      });
    }
    
    // Update agent capabilities
    await dbHelpers.setAgentCapabilities(agentId, capabilityIds);
    
    // Get updated capabilities
    const updatedCapabilities = await dbHelpers.getAgentCapabilities(agentId);
    
    res.json({
      message: `Successfully updated capabilities for agent: ${agent.name}`,
      agent: {
        id: agent.id,
        name: agent.name
      },
      capabilities: updatedCapabilities,
      count: updatedCapabilities.length
    });
  } catch (err) {
    console.error('Error updating agent capabilities:', err);
    res.status(500).json({ 
      error: 'Failed to update agent capabilities',
      message: err.message 
    });
  }
});

app.get('/api/capabilities/:id/agents', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate capability ID
    const capabilityId = parseInt(id);
    if (!id || isNaN(capabilityId) || capabilityId <= 0) {
      return res.status(400).json({ 
        error: 'Invalid capability ID',
        message: 'Capability ID must be a positive number'
      });
    }
    
    // Check if capability exists
    const capability = await dbHelpers.getCapabilityById(capabilityId);
    if (!capability) {
      return res.status(404).json({ 
        error: 'Capability not found',
        message: `No capability found with ID: ${capabilityId}`
      });
    }
    
    const agents = await dbHelpers.getAgentsByCapability(capabilityId);
    res.json({
      message: `Found ${agents.length} agents with capability: ${capability.display_name}`,
      capability: {
        id: capability.id,
        name: capability.name,
        display_name: capability.display_name,
        description: capability.description
      },
      agents: agents,
      count: agents.length
    });
  } catch (err) {
    console.error('Error fetching agents by capability:', err);
    res.status(500).json({ 
      error: 'Failed to fetch agents by capability',
      message: err.message 
    });
  }
});

// Batch discovery endpoint for multiple requests
app.post('/api/agents/discover/batch', async (req, res) => {
  try {
    const { requests } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        error: 'Invalid batch request',
        message: 'requests must be a non-empty array of discovery criteria'
      });
    }

    if (requests.length > 10) {
      return res.status(400).json({
        error: 'Too many requests',
        message: 'Maximum 10 requests allowed per batch'
      });
    }

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      try {
        const agents = await dbHelpers.discoverRankedAgents(request);
        results.push({
          request_id: i,
          success: true,
          agents: agents,
          count: agents.length,
          criteria: request
        });
      } catch (error) {
        results.push({
          request_id: i,
          success: false,
          error: error.message,
          agents: [],
          count: 0,
          criteria: request
        });
      }
    }

    const discoveryTime = Date.now() - startTime;
    const totalFound = results.reduce((sum, result) => sum + result.count, 0);

    res.json({
      message: `Processed ${requests.length} discovery requests, found ${totalFound} total agents`,
      batch_results: results,
      total_requests: requests.length,
      successful_requests: results.filter(r => r.success).length,
      total_agents_found: totalFound,
      batch_discovery_time_ms: discoveryTime
    });
    
  } catch (error) {
    console.error('Error in batch discovery:', error);
    res.status(500).json({
      error: 'Batch discovery failed',
      message: error.message
    });
  }
});

// Alternative endpoint for finding agents by capability name
app.get('/api/agents/by-capability/:capability', async (req, res) => {
  try {
    const { capability } = req.params;
    
    // Find capability by name (case-insensitive)
    const capabilityRecord = await dbHelpers.getCapabilityByName(capability.toLowerCase());
    if (!capabilityRecord) {
      return res.status(404).json({ 
        error: 'Capability not found',
        message: `No capability found with name: ${capability}`,
        available_capabilities: await dbHelpers.getAllCapabilities()
      });
    }
    
    const agents = await dbHelpers.getAgentsByCapability(capabilityRecord.id);
    res.json({
      message: `Found ${agents.length} agents with capability: ${capabilityRecord.display_name}`,
      capability: {
        id: capabilityRecord.id,
        name: capabilityRecord.name,
        display_name: capabilityRecord.display_name,
        description: capabilityRecord.description
      },
      agents: agents,
      count: agents.length
    });
  } catch (err) {
    console.error('Error fetching agents by capability name:', err);
    res.status(500).json({ 
      error: 'Failed to fetch agents by capability',
      message: err.message 
    });
  }
});

// ============================================================================
// COMMUNICATION API ENDPOINTS
// ============================================================================

// POST /api/webhook/register - Agent registration endpoint
app.post('/api/webhook/register', async (req, res) => {
  try {
    const { agent_id, instance_name, endpoint_url, metadata } = req.body;
    
    // Validate required fields
    if (!agent_id || !instance_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'agent_id and instance_name are required',
        required: ['agent_id', 'instance_name'],
        received: Object.keys(req.body)
      });
    }
    
    // Validate agent_id is a positive integer
    const agentId = parseInt(agent_id);
    if (isNaN(agentId) || agentId <= 0) {
      return res.status(400).json({
        error: 'Invalid agent_id',
        message: 'agent_id must be a positive number'
      });
    }
    
    // Validate instance_name is not empty
    if (typeof instance_name !== 'string' || instance_name.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid instance_name',
        message: 'instance_name must be a non-empty string'
      });
    }
    
    // Check if agent exists
    const agent = await dbHelpers.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        message: `No agent found with ID: ${agentId}`
      });
    }
    
    // Validate endpoint_url if provided
    if (endpoint_url && typeof endpoint_url !== 'string') {
      return res.status(400).json({
        error: 'Invalid endpoint_url',
        message: 'endpoint_url must be a string'
      });
    }
    
    // Validate metadata if provided
    if (metadata && typeof metadata !== 'object') {
      return res.status(400).json({
        error: 'Invalid metadata',
        message: 'metadata must be an object'
      });
    }
    
    // Create agent instance
    const instanceData = {
      agent_id: agentId,
      instance_name: instance_name.trim(),
      status: 'running',
      endpoint_url: endpoint_url ? endpoint_url.trim() : null,
      metadata: metadata || null
    };
    
    const instance = await dbHelpers.createAgentInstance(instanceData);
    
    // Generate API key for the new instance
    const apiKeyResult = await dbHelpers.generateApiKey(
      instance.id,
      `${instance.instance_name}-primary-key`
    );
    
    // Return success response
    res.status(201).json({
      message: 'Agent instance registered successfully',
      instance: {
        id: instance.id,
        agent_id: instance.agent_id,
        instance_name: instance.instance_name,
        status: instance.status,
        endpoint_url: instance.endpoint_url,
        metadata: instance.metadata,
        created_at: instance.created_at
      },
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        category: agent.category
      },
      security: {
        api_key: apiKeyResult.api_key,
        key_id: apiKeyResult.id,
        key_name: apiKeyResult.key_name,
        instructions: 'Store this API key securely. Include it in the X-API-Key header for inter-agent communication.'
      }
    });
    
  } catch (error) {
    console.error('Error registering agent instance:', error);
    res.status(500).json({
      error: 'Failed to register agent instance',
      message: error.message
    });
  }
});

// POST /api/webhook/ping - Agent health check endpoint
app.post('/api/webhook/ping', async (req, res) => {
  try {
    const { instance_id, status, metadata, metrics } = req.body;
    
    // Validate required fields
    if (!instance_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'instance_id is required',
        required: ['instance_id'],
        received: Object.keys(req.body)
      });
    }
    
    // Validate instance_id is a positive integer
    const instanceId = parseInt(instance_id);
    if (isNaN(instanceId) || instanceId <= 0) {
      return res.status(400).json({
        error: 'Invalid instance_id',
        message: 'instance_id must be a positive number'
      });
    }
    
    // Validate status if provided
    const validStatuses = ['running', 'stopped', 'maintenance', 'error'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        validStatuses
      });
    }
    
    // Validate metadata if provided
    if (metadata && typeof metadata !== 'object') {
      return res.status(400).json({
        error: 'Invalid metadata',
        message: 'metadata must be an object'
      });
    }
    
    // Validate metrics if provided
    if (metrics && typeof metrics !== 'object') {
      return res.status(400).json({
        error: 'Invalid metrics',
        message: 'metrics must be an object'
      });
    }
    
    // Check if instance exists
    const existingInstance = await dbHelpers.getAgentInstanceById(instanceId);
    if (!existingInstance) {
      return res.status(404).json({
        error: 'Instance not found',
        message: `No instance found with ID: ${instanceId}`
      });
    }
    
    // Update last ping time
    await dbHelpers.updateLastPing(instanceId);
    
    // Update status if provided
    if (status) {
      await dbHelpers.updateAgentInstanceStatus(instanceId, status);
    }
    
    // Update performance metrics if provided
    if (metrics) {
      await dbHelpers.updateInstanceMetrics(instanceId, metrics);
    }
    
    // Update metadata if provided
    if (metadata) {
      const updatedMetadata = {
        ...existingInstance.metadata,
        ...metadata,
        last_ping: new Date().toISOString()
      };
      
      await dbHelpers.updateAgentInstance(instanceId, {
        instance_name: existingInstance.instance_name,
        status: status || existingInstance.status,
        endpoint_url: existingInstance.endpoint_url,
        metadata: updatedMetadata
      });
    }
    
    // Get updated instance
    const updatedInstance = await dbHelpers.getAgentInstanceById(instanceId);
    
    // Return success response
    res.json({
      message: 'Health check received successfully',
      instance: {
        id: updatedInstance.id,
        agent_id: updatedInstance.agent_id,
        instance_name: updatedInstance.instance_name,
        status: updatedInstance.status,
        endpoint_url: updatedInstance.endpoint_url,
        last_ping: updatedInstance.last_ping,
        metadata: updatedInstance.metadata
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing health check:', error);
    res.status(500).json({
      error: 'Failed to process health check',
      message: error.message
    });
  }
});

// GET /api/agents/:id/instances - List running instances for an agent
app.get('/api/agents/:id/instances', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    // Validate agent ID
    const agentId = parseInt(id);
    if (!id || isNaN(agentId) || agentId <= 0) {
      return res.status(400).json({
        error: 'Invalid agent ID',
        message: 'Agent ID must be a positive number'
      });
    }
    
    // Check if agent exists
    const agent = await dbHelpers.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        message: `No agent found with ID: ${agentId}`
      });
    }
    
    // Get instances for the agent
    let instances;
    if (status) {
      // Filter by status if provided
      const allInstances = await dbHelpers.getAgentInstancesByAgentId(agentId);
      instances = allInstances.filter(instance => instance.status === status);
    } else {
      // Get all instances
      instances = await dbHelpers.getAgentInstancesByAgentId(agentId);
    }
    
    // Return response
    res.json({
      message: `Found ${instances.length} instance(s) for agent: ${agent.name}`,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        category: agent.category
      },
      instances: instances.map(instance => ({
        id: instance.id,
        instance_name: instance.instance_name,
        status: instance.status,
        endpoint_url: instance.endpoint_url,
        last_ping: instance.last_ping,
        metadata: instance.metadata,
        created_at: instance.created_at
      })),
      count: instances.length,
      filtered: !!status
    });
    
  } catch (error) {
    console.error('Error fetching agent instances:', error);
    res.status(500).json({
      error: 'Failed to fetch agent instances',
      message: error.message
    });
  }
});

// GET /api/instances - List all agent instances (with optional filtering)
app.get('/api/instances', async (req, res) => {
  try {
    const { status, agent_id } = req.query;
    
    let instances;
    
    if (agent_id) {
      // Filter by agent ID
      const agentId = parseInt(agent_id);
      if (isNaN(agentId) || agentId <= 0) {
        return res.status(400).json({
          error: 'Invalid agent_id',
          message: 'agent_id must be a positive number'
        });
      }
      
      instances = await dbHelpers.getAgentInstancesByAgentId(agentId);
      
      if (status) {
        instances = instances.filter(instance => instance.status === status);
      }
    } else if (status) {
      // Filter by status only
      instances = await dbHelpers.getInstancesByStatus(status);
    } else {
      // Get all instances
      instances = await dbHelpers.getAllAgentInstances();
    }
    
    // Return response
    res.json({
      message: `Found ${instances.length} agent instance(s)`,
      instances: instances.map(instance => ({
        id: instance.id,
        agent_id: instance.agent_id,
        agent_name: instance.agent_name,
        instance_name: instance.instance_name,
        status: instance.status,
        endpoint_url: instance.endpoint_url,
        last_ping: instance.last_ping,
        metadata: instance.metadata,
        created_at: instance.created_at
      })),
      count: instances.length,
      filters: {
        status: status || null,
        agent_id: agent_id || null
      }
    });
    
  } catch (error) {
    console.error('Error fetching agent instances:', error);
    res.status(500).json({
      error: 'Failed to fetch agent instances',
      message: error.message
    });
  }
});

// GET /api/instances/stale - Get instances that haven't pinged recently
app.get('/api/instances/stale', async (req, res) => {
  try {
    const { minutes = 5 } = req.query;
    
    // Validate minutes parameter
    const staleMinutes = parseInt(minutes);
    if (isNaN(staleMinutes) || staleMinutes <= 0) {
      return res.status(400).json({
        error: 'Invalid minutes parameter',
        message: 'minutes must be a positive number'
      });
    }
    
    const staleInstances = await dbHelpers.getStaleInstances(staleMinutes);
    
    res.json({
      message: `Found ${staleInstances.length} stale instance(s) (no ping in ${staleMinutes} minutes)`,
      instances: staleInstances.map(instance => ({
        id: instance.id,
        agent_id: instance.agent_id,
        agent_name: instance.agent_name,
        instance_name: instance.instance_name,
        status: instance.status,
        endpoint_url: instance.endpoint_url,
        last_ping: instance.last_ping,
        metadata: instance.metadata,
        created_at: instance.created_at
      })),
      count: staleInstances.length,
      stale_threshold_minutes: staleMinutes
    });
    
  } catch (error) {
    console.error('Error fetching stale instances:', error);
    res.status(500).json({
      error: 'Failed to fetch stale instances',
      message: error.message
    });
  }
});

// ============================================================================
// INTER-AGENT MESSAGING API ENDPOINTS
// ============================================================================

// POST /api/agents/message - Send message from one agent to another
app.post('/api/agents/message', 
  validateApiKey, 
  rateLimitInterAgent(100, 3600), // 100 requests per hour
  logCommunication('message_sent'),
  async (req, res) => {
  try {
    const {
      to_instance_id,
      message_type,
      content,
      subject,
      priority = 3,
      correlation_id,
      expires_at
    } = req.body;

    // Use authenticated instance as sender
    const from_instance_id = req.agentAuth.instanceId;

    // Validate required fields
    if (!to_instance_id || !message_type || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'to_instance_id, message_type, and content are required',
        required: ['to_instance_id', 'message_type', 'content'],
        received: Object.keys(req.body)
      });
    }

    // Validate message_type
    const validMessageTypes = ['request', 'response', 'error'];
    if (!validMessageTypes.includes(message_type)) {
      return res.status(400).json({
        error: 'Invalid message_type',
        message: `message_type must be one of: ${validMessageTypes.join(', ')}`,
        validTypes: validMessageTypes
      });
    }

    // Validate instance IDs are positive integers
    const fromInstanceId = from_instance_id;
    const toInstanceId = parseInt(to_instance_id);
    
    if (isNaN(toInstanceId) || toInstanceId <= 0) {
      return res.status(400).json({
        error: 'Invalid to_instance_id',
        message: 'to_instance_id must be a positive number'
      });
    }

    // Validate priority if provided
    if (priority !== undefined) {
      const priorityNum = parseInt(priority);
      if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 5) {
        return res.status(400).json({
          error: 'Invalid priority',
          message: 'priority must be a number between 1 and 5'
        });
      }
    }

    // Check if recipient instance exists and is available
    const toInstance = await dbHelpers.getAgentInstanceById(toInstanceId);
    if (!toInstance) {
      return res.status(404).json({
        error: 'Recipient instance not found',
        message: `No agent instance found with ID: ${toInstanceId}`
      });
    }

    if (toInstance.status !== 'running' && toInstance.status !== 'available') {
      return res.status(403).json({
        error: 'Recipient not available',
        message: 'Recipient agent instance must be in running or available status to receive messages'
      });
    }

    // Get sender instance info from authentication
    const fromInstance = {
      id: req.agentAuth.instanceId,
      instance_name: req.agentAuth.instanceName,
      agent_id: req.agentAuth.agentId
    };

    // Validate expiration date if provided
    let expirationDate = null;
    if (expires_at) {
      expirationDate = new Date(expires_at);
      if (isNaN(expirationDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid expires_at',
          message: 'expires_at must be a valid ISO datetime string'
        });
      }
      if (expirationDate <= new Date()) {
        return res.status(400).json({
          error: 'Invalid expires_at',
          message: 'expires_at must be in the future'
        });
      }
      expirationDate = expirationDate.toISOString();
    }

    // Send the message
    const messageResult = await dbHelpers.sendMessage(
      fromInstanceId,
      toInstanceId,
      message_type,
      content,
      {
        subject,
        priority: parseInt(priority),
        correlationId: correlation_id,
        expiresAt: expirationDate
      }
    );

    // Update delivery status to delivered (since we're using HTTP for now)
    await dbHelpers.updateMessageStatus(messageResult.message_id, 'delivered');

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: messageResult.message_id,
      from: {
        instance_id: fromInstance.id,
        instance_name: fromInstance.instance_name,
        agent_id: fromInstance.agent_id
      },
      to: {
        instance_id: toInstance.id,
        instance_name: toInstance.instance_name,
        agent_id: toInstance.agent_id
      },
      message_details: {
        type: message_type,
        subject: subject || null,
        content_length: content.length,
        priority,
        correlation_id: correlation_id || null,
        expires_at: expirationDate,
        created_at: messageResult.created_at
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
});

// GET /api/agents/:instance_id/messages - Get messages for an agent instance
app.get('/api/agents/:instance_id/messages', 
  validateApiKey,
  logCommunication('message_received'),
  async (req, res) => {
  try {
    const { instance_id } = req.params;
    const { 
      message_type, 
      status, 
      limit = 50, 
      offset = 0, 
      include_read = 'true' 
    } = req.query;

    // Validate instance_id
    const instanceId = parseInt(instance_id);
    if (isNaN(instanceId) || instanceId <= 0) {
      return res.status(400).json({
        error: 'Invalid instance_id',
        message: 'instance_id must be a positive number'
      });
    }

    // Only allow agents to access their own messages
    if (req.agentAuth.instanceId !== instanceId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only access messages for your own instance'
      });
    }

    // Check if instance exists
    const instance = await dbHelpers.getAgentInstanceById(instanceId);
    if (!instance) {
      return res.status(404).json({
        error: 'Instance not found',
        message: `No agent instance found with ID: ${instanceId}`
      });
    }

    // Get messages with filtering options
    const messages = await dbHelpers.getMessages(instanceId, {
      messageType: message_type,
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
      includeRead: include_read === 'true'
    });

    res.json({
      message: `Found ${messages.length} message(s) for instance: ${instance.instance_name}`,
      instance: {
        id: instance.id,
        name: instance.instance_name,
        agent_id: instance.agent_id
      },
      messages: messages.map(msg => ({
        id: msg.id,
        from: {
          instance_id: msg.from_instance_id,
          instance_name: msg.from_instance_name
        },
        to: {
          instance_id: msg.to_instance_id,
          instance_name: msg.to_instance_name
        },
        type: msg.message_type,
        subject: msg.subject,
        content: msg.content,
        priority: msg.priority,
        correlation_id: msg.correlation_id,
        status: msg.status,
        expires_at: msg.expires_at,
        created_at: msg.created_at,
        delivered_at: msg.delivered_at,
        read_at: msg.read_at
      })),
      count: messages.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      },
      filters: {
        message_type: message_type || null,
        status: status || null,
        include_read: include_read === 'true'
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      message: error.message
    });
  }
});

// PUT /api/messages/:message_id/status - Update message status (mark as read, etc.)
app.put('/api/messages/:message_id/status', validateApiKey, async (req, res) => {
  try {
    const { message_id } = req.params;
    const { status } = req.body;

    // Validate message_id
    const messageId = parseInt(message_id);
    if (isNaN(messageId) || messageId <= 0) {
      return res.status(400).json({
        error: 'Invalid message_id',
        message: 'message_id must be a positive number'
      });
    }

    // Validate required fields
    if (!status) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'status is required',
        required: ['status']
      });
    }
    
    // Use authenticated instance
    const instanceId = req.agentAuth.instanceId;

    // Validate status
    const validStatuses = ['delivered', 'read', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `status must be one of: ${validStatuses.join(', ')}`,
        validStatuses
      });
    }

    // Check if message exists
    const message = await dbHelpers.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        message: `No message found with ID: ${messageId}`
      });
    }

    // Validate that the instanceId matches the recipient
    if (message.to_instance_id !== instanceId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only the recipient can update message status'
      });
    }

    // Update message status
    const updateResult = await dbHelpers.updateMessageStatus(messageId, status);

    res.json({
      message: `Message status updated to: ${status}`,
      message_id: messageId,
      previous_status: message.status,
      new_status: status,
      updated_at: updateResult.updated_at
    });

  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      error: 'Failed to update message status',
      message: error.message
    });
  }
});

// GET /api/messages/:message_id - Get specific message details
app.get('/api/messages/:message_id', async (req, res) => {
  try {
    const { message_id } = req.params;
    const { instance_id } = req.query;

    // Validate message_id
    const messageId = parseInt(message_id);
    if (isNaN(messageId) || messageId <= 0) {
      return res.status(400).json({
        error: 'Invalid message_id',
        message: 'message_id must be a positive number'
      });
    }

    // Get message details
    const message = await dbHelpers.getMessageById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        message: `No message found with ID: ${messageId}`
      });
    }

    // If instance_id is provided, verify authorization
    if (instance_id) {
      const instanceId = parseInt(instance_id);
      if (message.from_instance_id !== instanceId && message.to_instance_id !== instanceId) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'You can only view messages you sent or received'
        });
      }
    }

    res.json({
      message: 'Message retrieved successfully',
      message_details: {
        id: message.id,
        from: {
          instance_id: message.from_instance_id,
          instance_name: message.from_instance_name
        },
        to: {
          instance_id: message.to_instance_id,
          instance_name: message.to_instance_name
        },
        type: message.message_type,
        subject: message.subject,
        content: message.content,
        priority: message.priority,
        correlation_id: message.correlation_id,
        expires_at: message.expires_at,
        created_at: message.created_at,
        delivery_status: {
          status: message.status,
          attempts: message.attempts,
          delivered_at: message.delivered_at,
          read_at: message.read_at,
          error_message: message.error_message
        }
      }
    });

  } catch (error) {
    console.error('Error fetching message details:', error);
    res.status(500).json({
      error: 'Failed to fetch message details',
      message: error.message
    });
  }
});

// GET /api/messages/stats - Get message queue statistics
app.get('/api/messages/stats', async (req, res) => {
  try {
    const stats = await dbHelpers.getMessageQueueStats();
    
    // Clean up expired messages
    const cleanupResult = await dbHelpers.cleanupExpiredMessages();

    res.json({
      message: 'Message queue statistics retrieved successfully',
      statistics: stats,
      cleanup: {
        expired_messages_updated: cleanupResult.expired_count
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({
      error: 'Failed to fetch message statistics',
      message: error.message
    });
  }
});

// ============================================================================
// SECURITY & API KEY MANAGEMENT ENDPOINTS
// ============================================================================

// GET /api/agents/:instance_id/api-keys - Get API keys for an instance
app.get('/api/agents/:instance_id/api-keys', validateApiKey, async (req, res) => {
  try {
    const { instance_id } = req.params;
    const { include_revoked = 'false' } = req.query;
    
    const instanceId = parseInt(instance_id);
    if (isNaN(instanceId) || instanceId <= 0) {
      return res.status(400).json({
        error: 'Invalid instance_id',
        message: 'instance_id must be a positive number'
      });
    }

    // Only allow agents to view their own API keys
    if (req.agentAuth.instanceId !== instanceId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only view API keys for your own instance'
      });
    }

    const apiKeys = await dbHelpers.getInstanceApiKeys(instanceId, include_revoked === 'true');

    res.json({
      message: `Found ${apiKeys.length} API key(s) for instance: ${req.agentAuth.instanceName}`,
      instance_id: instanceId,
      api_keys: apiKeys,
      count: apiKeys.length
    });

  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      error: 'Failed to fetch API keys',
      message: error.message
    });
  }
});

// POST /api/agents/:instance_id/api-keys - Generate new API key
app.post('/api/agents/:instance_id/api-keys', validateApiKey, async (req, res) => {
  try {
    const { instance_id } = req.params;
    const { key_name, expires_at } = req.body;
    
    const instanceId = parseInt(instance_id);
    if (isNaN(instanceId) || instanceId <= 0) {
      return res.status(400).json({
        error: 'Invalid instance_id',
        message: 'instance_id must be a positive number'
      });
    }

    // Only allow agents to generate API keys for their own instance
    if (req.agentAuth.instanceId !== instanceId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only generate API keys for your own instance'
      });
    }

    // Validate expires_at if provided
    let expirationDate = null;
    if (expires_at) {
      expirationDate = new Date(expires_at);
      if (isNaN(expirationDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid expires_at',
          message: 'expires_at must be a valid ISO datetime string'
        });
      }
      if (expirationDate <= new Date()) {
        return res.status(400).json({
          error: 'Invalid expires_at',
          message: 'expires_at must be in the future'
        });
      }
      expirationDate = expirationDate.toISOString();
    }

    const apiKeyResult = await dbHelpers.generateApiKey(
      instanceId,
      key_name || `${req.agentAuth.instanceName}-${Date.now()}`,
      expirationDate
    );

    res.status(201).json({
      message: 'API key generated successfully',
      api_key_details: {
        id: apiKeyResult.id,
        api_key: apiKeyResult.api_key,
        key_name: apiKeyResult.key_name,
        expires_at: apiKeyResult.expires_at,
        created_at: apiKeyResult.created_at
      },
      security_note: 'Store this API key securely. It will not be shown again.'
    });

  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({
      error: 'Failed to generate API key',
      message: error.message
    });
  }
});

// DELETE /api/agents/:instance_id/api-keys/:key_id - Revoke API key
app.delete('/api/agents/:instance_id/api-keys/:key_id', validateApiKey, async (req, res) => {
  try {
    const { instance_id, key_id } = req.params;
    
    const instanceId = parseInt(instance_id);
    const keyId = parseInt(key_id);
    
    if (isNaN(instanceId) || instanceId <= 0 || isNaN(keyId) || keyId <= 0) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: 'instance_id and key_id must be positive numbers'
      });
    }

    // Only allow agents to revoke their own API keys
    if (req.agentAuth.instanceId !== instanceId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only revoke API keys for your own instance'
      });
    }

    const result = await dbHelpers.revokeApiKey(keyId, instanceId);

    if (!result.success) {
      return res.status(404).json({
        error: 'API key not found',
        message: 'No API key found with the specified ID for your instance'
      });
    }

    res.json({
      message: 'API key revoked successfully',
      key_id: keyId,
      revoked_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({
      error: 'Failed to revoke API key',
      message: error.message
    });
  }
});

// GET /api/communication/logs - Get communication logs (for debugging)
app.get('/api/communication/logs', validateApiKey, async (req, res) => {
  try {
    const {
      event_type,
      limit = 50,
      offset = 0,
      since
    } = req.query;

    // Only allow agents to see logs involving their instance
    const logs = await dbHelpers.getCommunicationLogs({
      event_type,
      from_instance_id: req.agentAuth.instanceId,
      to_instance_id: req.agentAuth.instanceId,
      limit: parseInt(limit),
      offset: parseInt(offset),
      since
    });

    // Filter logs to only include those involving this instance
    const filteredLogs = logs.filter(log => 
      log.from_instance_id === req.agentAuth.instanceId || 
      log.to_instance_id === req.agentAuth.instanceId
    );

    res.json({
      message: `Found ${filteredLogs.length} communication log(s)`,
      instance_id: req.agentAuth.instanceId,
      logs: filteredLogs,
      count: filteredLogs.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching communication logs:', error);
    res.status(500).json({
      error: 'Failed to fetch communication logs',
      message: error.message
    });
  }
});

// GET /api/communication/stats - Get communication statistics
app.get('/api/communication/stats', validateApiKey, async (req, res) => {
  try {
    const { time_range = '24h' } = req.query;
    
    const stats = await dbHelpers.getCommunicationStats(time_range);

    res.json({
      message: 'Communication statistics retrieved successfully',
      time_range,
      statistics: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching communication stats:', error);
    res.status(500).json({
      error: 'Failed to fetch communication statistics',
      message: error.message
    });
  }
});

// ============================================================================
// USER API KEY MANAGEMENT ENDPOINTS - For User Dashboard
// ============================================================================

// GET /api/user/api-keys - Get user's API keys
app.get('/api/user/api-keys', async (req, res) => {
  console.log('📋 GET API Keys Request received');
  console.log('Headers:', req.headers);
  
  try {
    // Extract user info from JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('Extracted token:', token ? 'Token present' : 'No token');
    
    if (!token) {
      console.log('❌ No token provided for GET request');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required'
      });
    }

    // Verify JWT token (assuming you have JWT verification middleware)
    // For now, we'll get user ID from the token - you may need to adjust this
    // based on your existing auth implementation
    let userId;
    try {
      // This is a placeholder - adjust based on your JWT implementation
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId || decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token is invalid'
      });
    }

    // Get user's agent instances
    const userInstances = await dbHelpers.getUserAgentInstances(userId);
    
    // Get API keys for all user's instances
    let allApiKeys = [];
    for (const instance of userInstances) {
      const instanceKeys = await dbHelpers.getInstanceApiKeys(instance.id, true);
      allApiKeys = allApiKeys.concat(instanceKeys.map(key => ({
        ...key,
        instance_name: instance.instance_name,
        agent_id: instance.agent_id
      })));
    }

    res.json({
      message: `Found ${allApiKeys.length} API key(s)`,
      api_keys: allApiKeys,
      count: allApiKeys.length
    });

  } catch (error) {
    console.error('Error fetching user API keys:', error);
    res.status(500).json({
      error: 'Failed to fetch API keys',
      message: error.message
    });
  }
});

// POST /api/user/api-keys - Generate new API key for user's default instance
app.post('/api/user/api-keys', async (req, res) => {
  console.log('🔑 API Key Generation Request received');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  try {
    // Extract user info from JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('Extracted token:', token ? 'Token present' : 'No token');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required'
      });
    }

    let userId;
    try {
      const jwt = require('jsonwebtoken');
      console.log('🔐 Using JWT secret:', JWT_SECRET);
      console.log('🎫 Token to verify:', token.substring(0, 50) + '...');
      
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verified successfully. Decoded:', decoded);
      userId = decoded.userId || decoded.id;
      console.log('👤 User ID extracted:', userId);
    } catch (jwtError) {
      console.log('❌ JWT Verification Error:', jwtError.message);
      console.log('🔍 Error details:', jwtError);
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token is invalid'
      });
    }

    const { key_name } = req.body;

    // Get or create user's default agent instance
    let userInstance = await dbHelpers.getUserDefaultInstance(userId);
    if (!userInstance) {
      // Create a default instance for the user
      userInstance = await dbHelpers.createUserDefaultInstance(userId);
    }

    // Generate API key for the instance
    const apiKeyResult = await dbHelpers.generateApiKey(
      userInstance.id,
      key_name || 'Default API Key',
      null // No expiration
    );

    res.status(201).json({
      message: 'API key generated successfully',
      api_key_details: {
        id: apiKeyResult.id,
        api_key: apiKeyResult.api_key,
        key_name: apiKeyResult.key_name,
        expires_at: apiKeyResult.expires_at,
        created_at: apiKeyResult.created_at,
        instance_name: userInstance.instance_name
      }
    });

  } catch (error) {
    console.error('Error generating user API key:', error);
    res.status(500).json({
      error: 'Failed to generate API key',
      message: error.message
    });
  }
});

// DELETE /api/user/api-keys/:key_id - Revoke user's API key
app.delete('/api/user/api-keys/:key_id', async (req, res) => {
  try {
    // Extract user info from JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required'
      });
    }

    let userId;
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId || decoded.id;
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token is invalid'
      });
    }

    const { key_id } = req.params;
    const keyId = parseInt(key_id);
    
    if (isNaN(keyId) || keyId <= 0) {
      return res.status(400).json({
        error: 'Invalid key_id',
        message: 'key_id must be a positive number'
      });
    }

    // Verify user owns this API key
    const userInstances = await dbHelpers.getUserAgentInstances(userId);
    const userInstanceIds = userInstances.map(instance => instance.id);
    
    const apiKey = await dbHelpers.getApiKeyById(keyId);
    if (!apiKey || !userInstanceIds.includes(apiKey.instance_id)) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only revoke your own API keys'
      });
    }

    // Revoke the API key
    const result = await dbHelpers.revokeApiKey(keyId, apiKey.instance_id);

    res.json({
      message: 'API key revoked successfully',
      revoked_key_id: keyId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error revoking user API key:', error);
    res.status(500).json({
      error: 'Failed to revoke API key',
      message: error.message
    });
  }
});

// ============================================================================
// AGENT PLATFORM ENDPOINTS - For Live Agent Registration & Discovery
// ============================================================================

// In-memory agent registry for live agents (separate from uploaded agents)
let agentRegistry = new Map();

// Agent registration endpoint for live agents
app.post('/api/agents/register', (req, res) => {
  try {
    const { id, name, capabilities, endpoint, description } = req.body;
    
    // Validate required fields
    if (!id || !name || !endpoint) {
      return res.status(400).json({
        error: 'Missing required fields: id, name, and endpoint are required'
      });
    }
    
    // Register the agent
    const agentData = {
      id,
      name,
      capabilities: capabilities || [],
      endpoint,
      description: description || '',
      registered_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      status: 'active'
    };
    
    agentRegistry.set(id, agentData);
    
    console.log(`[Platform] ✅ Agent registered: ${name} (${id}) at ${endpoint}`);
    
    res.status(200).json({
      message: 'Agent registered successfully',
      agent_id: id,
      registered_at: agentData.registered_at
    });
    
  } catch (error) {
    console.error('[Platform] Registration error:', error);
    res.status(500).json({
      error: 'Internal server error during registration'
    });
  }
});

// Agent discovery endpoint for live agents (different from existing discover endpoint)
app.get('/api/agents/discover/live', (req, res) => {
  try {
    const { capability } = req.query;
    
    let agents = Array.from(agentRegistry.values());
    
    // Filter by capability if specified
    if (capability) {
      agents = agents.filter(agent => 
        agent.capabilities && agent.capabilities.includes(capability)
      );
    }
    
    console.log(`[Platform] 🔍 Discovery request: found ${agents.length} agents`);
    
    res.json({
      agents: agents,
      total: agents.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Platform] Discovery error:', error);
    res.status(500).json({
      error: 'Internal server error during discovery'
    });
  }
});

// Get specific live agent
app.get('/api/agents/live/:id', (req, res) => {
  try {
    const { id } = req.params;
    const agent = agentRegistry.get(id);
    
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found'
      });
    }
    
    res.json({
      agent: agent
    });
    
  } catch (error) {
    console.error('[Platform] Get agent error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Update agent status/heartbeat for live agents
app.put('/api/agents/live/:id/heartbeat', (req, res) => {
  try {
    const { id } = req.params;
    const agent = agentRegistry.get(id);
    
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found'
      });
    }
    
    agent.last_seen = new Date().toISOString();
    agent.status = 'active';
    agentRegistry.set(id, agent);
    
    res.json({
      message: 'Heartbeat recorded',
      last_seen: agent.last_seen
    });
    
  } catch (error) {
    console.error('[Platform] Heartbeat error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Deregister live agent
app.delete('/api/agents/live/:id', (req, res) => {
  try {
    const { id } = req.params;
    const agent = agentRegistry.get(id);
    
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found'
      });
    }
    
    agentRegistry.delete(id);
    console.log(`[Platform] 🗑️ Agent deregistered: ${agent.name} (${id})`);
    
    res.json({
      message: 'Agent deregistered successfully'
    });
    
  } catch (error) {
    console.error('[Platform] Deregistration error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Platform statistics for live agents
app.get('/api/platform/stats', (req, res) => {
  try {
    const agents = Array.from(agentRegistry.values());
    const now = new Date();
    
    const stats = {
      total_agents: agents.length,
      active_agents: agents.filter(a => {
        const lastSeen = new Date(a.last_seen);
        const diffMinutes = (now - lastSeen) / (1000 * 60);
        return diffMinutes < 5; // Active if seen in last 5 minutes
      }).length,
      capabilities: [...new Set(agents.flatMap(a => a.capabilities || []))],
      platform_uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('[Platform] Stats error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Cleanup inactive agents (run every 5 minutes)
setInterval(() => {
  const now = new Date();
  let cleanedUp = 0;
  
  for (const [id, agent] of agentRegistry.entries()) {
    const lastSeen = new Date(agent.last_seen);
    const diffMinutes = (now - lastSeen) / (1000 * 60);
    
    // Remove agents not seen for 30 minutes
    if (diffMinutes > 30) {
      agentRegistry.delete(id);
      cleanedUp++;
      console.log(`[Platform] 🧹 Cleaned up inactive agent: ${agent.name} (${id})`);
    }
  }
  
  if (cleanedUp > 0) {
    console.log(`[Platform] 🧹 Cleaned up ${cleanedUp} inactive agents`);
  }
}, 5 * 60 * 1000);

// Serve React app for client-side routing in production
if (process.env.NODE_ENV === 'production') {
  // Handle all non-API routes by serving the React app
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await require('./database').closeDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Error closing database:', err.message);
    process.exit(1);
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`🚀 Agent Platform endpoints:`)
  console.log(`   POST /api/agents/register`)
  console.log(`   GET  /api/agents/discover/live`)
  console.log(`   GET  /api/platform/stats`)
});
