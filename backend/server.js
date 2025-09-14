const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// In-memory agent registry
let agentRegistry = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agents_count: agentRegistry.size,
    platform: 'Emergence Agent Platform'
  });
});

// Agent registration endpoint
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

// Agent discovery endpoint
app.get('/api/agents/discover', (req, res) => {
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

// Get specific agent
app.get('/api/agents/:id', (req, res) => {
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

// Update agent status/heartbeat
app.put('/api/agents/:id/heartbeat', (req, res) => {
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

// Deregister agent
app.delete('/api/agents/:id', (req, res) => {
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

// Platform statistics
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

// Start server
app.listen(PORT, () => {
  console.log('=' * 50);
  console.log(`🚀 Emergence Agent Platform Backend`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔗 API Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/agents/register`);
  console.log(`   GET  /api/agents/discover`);
  console.log(`   GET  /api/agents/:id`);
  console.log(`   PUT  /api/agents/:id/heartbeat`);
  console.log(`   DELETE /api/agents/:id`);
  console.log(`   GET  /api/platform/stats`);
  console.log('=' * 50);
});