const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { db, dbHelpers, testConnection } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

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
  try {
    const { category } = req.query;
    
    let agents;
    if (category) {
      // Filter by category if provided
      agents = await dbHelpers.getAgentsByCategory(category);
    } else {
      // Get all agents if no category filter
      agents = await dbHelpers.getAllAgents();
    }
    
    // Handle empty results
    if (!agents || agents.length === 0) {
      const message = category 
        ? `No agents found in category: ${category}`
        : 'No agents found';
      
      return res.json({
        agents: [],
        count: 0,
        message: message,
        filtered: !!category
      });
    }
    
    // Return successful response with metadata
    res.json({
      agents: agents,
      count: agents.length,
      message: `Found ${agents.length} agent(s)${category ? ` in category: ${category}` : ''}`,
      filtered: !!category
    });
    
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ 
      error: 'Failed to fetch agents',
      message: err.message 
    });
  }
});

app.get('/api/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
    
    // Return agent details with success message
    res.json({
      message: 'Agent retrieved successfully',
      agent: agent
    });
    
  } catch (err) {
    console.error('Error fetching agent by ID:', err);
    res.status(500).json({ 
      error: 'Failed to fetch agent',
      message: err.message 
    });
  }
});

app.post('/api/agents', (req, res) => {
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
      const { name, description, category, author_name } = req.body;
      
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

      // Create agent data with file information
      const agentData = {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        author_name: author_name.trim(),
        file_path: req.file.path,
        file_size: req.file.size
      };

      // Save to database
      const agent = await dbHelpers.createAgent(agentData);
      
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
          download_count: 0,
          created_at: new Date().toISOString()
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
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/top/downloaded', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const agents = await dbHelpers.getTopDownloadedAgents(limit);
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

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
});
