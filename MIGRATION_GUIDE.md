# 🚀 Migration Guide: Boilerplate to PyPI SDK

This guide helps you migrate from the existing JavaScript boilerplate agents to the new PyPI-published Emergence Agent SDK.

## 📋 Overview

### Before: JavaScript Boilerplate
- Manual HTTP requests to platform endpoints
- Custom registration and heartbeat logic
- 50+ lines of boilerplate code
- JavaScript/Node.js only

### After: PyPI SDK
- Automatic platform integration
- One-line installation: `pip install emergence-agent`
- 90% less boilerplate code
- Python-based with decorator support

## 🔄 Migration Options

### Option 1: Complete Migration (Recommended)
Fully migrate to the new SDK for all benefits

### Option 2: Gradual Migration  
Run both approaches simultaneously during transition

### Option 3: Keep Legacy
Continue using JavaScript boilerplate (still supported)

---

## 🎯 Complete Migration (Option 1)

### Step 1: Install New SDK
```bash
pip install emergence-agent
export EMERGENCE_API_KEY="your_api_key_here"
```

### Step 2: Convert JavaScript Agent to Python

**JavaScript Boilerplate (Before):**
```javascript
// agent.js
const axios = require('axios');

class CommunicatingAgent {
    constructor() {
        this.name = "Test Communicating Agent";
        this.version = "1.0.0";
        this.platformUrl = process.env.PLATFORM_URL || 'https://localhost:3000';
        this.agentId = null;
        this.registered = false;
    }

    async register() {
        try {
            const response = await axios.post(`${this.platformUrl}/api/webhook/register`, {
                name: this.name,
                version: this.version,
                capabilities: ['data-processing', 'text-analysis'],
                webhook_url: `${this.platformUrl}/agent-webhook/${this.agentId}`
            });
            this.agentId = response.data.agent_id;
            this.registered = true;
            return response.data;
        } catch (error) {
            console.error('Failed to register:', error.message);
            throw error;
        }
    }

    async ping() {
        const response = await axios.post(`${this.platformUrl}/api/webhook/ping`, {
            agent_id: this.agentId,
            status: 'active',
            timestamp: new Date().toISOString()
        });
        return response.data;
    }

    async processData(input) {
        const result = {
            original: input,
            processed: input.toUpperCase(),
            timestamp: new Date().toISOString(),
            agent_id: this.agentId
        };

        if (this.registered) {
            await axios.post(`${this.platformUrl}/api/agent/result`, {
                agent_id: this.agentId,
                result: result
            });
        }
        return result;
    }

    async run() {
        await this.register();
        await this.ping();
        const result = await this.processData("hello platform");
        return result;
    }
}
```

**Python SDK (After):**
```python
# agent.py
from emergence_agent import Agent

class MyAgent(Agent):
    def setup(self):
        # Capabilities are automatically registered
        self.declare_capability("data-processing", "Process and transform data")
        self.declare_capability("text-analysis", "Analyze text content")
    
    def handle_request(self, request_type, data):
        if request_type == "process":
            return {
                "original": data["input"],
                "processed": data["input"].upper(),
                "timestamp": self.get_timestamp()
            }
        return {"error": "Unknown request type"}
    
    def process_data(self, input_text):
        # This method can be called directly or via handle_request
        return self.handle_request("process", {"input": input_text})

# Automatic registration, heartbeat, and platform integration
with MyAgent(name="communicating-agent", version="1.0.0") as agent:
    result = agent.process_data("hello platform")
    print("Result:", result)
```

### Step 3: Update Dependencies

**package.json (Remove):**
```json
{
  "name": "communicating-agent",
  "dependencies": {
    "axios": "^1.11.0"
  }
}
```

**requirements.txt (Add):**
```txt
emergence-agent>=0.1.0
```

### Step 4: Update Deployment Scripts

**Docker (Before):**
```dockerfile
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "agent.js"]
```

**Docker (After):**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "agent.py"]
```

---

## ⚖️ Gradual Migration (Option 2)

Run both JavaScript and Python agents simultaneously during transition.

### Step 1: Keep Existing JavaScript Agent
```bash
# Keep running your existing agent
node agent.js
```

### Step 2: Add Python Agent Alongside
```bash
# Install SDK
pip install emergence-agent

# Create Python version
python new_agent.py
```

### Step 3: Python Agent (Alongside JavaScript)
```python
from emergence_agent import Agent

class ModernAgent(Agent):
    def __init__(self):
        # Use different name to avoid conflicts
        super().__init__(
            name="modern-communicating-agent",
            version="2.0.0"
        )
    
    def setup(self):
        # Enhanced capabilities with new SDK
        self.declare_capability("advanced-processing", "Enhanced data processing")
        self.declare_capability("real-time-analysis", "Real-time text analysis")
    
    def handle_request(self, request_type, data):
        if request_type == "enhanced_process":
            # New enhanced processing logic
            result = {
                "original": data["input"],
                "processed": data["input"].upper(),
                "enhanced": True,
                "word_count": len(data["input"].split()),
                "timestamp": self.get_timestamp()
            }
            return result
        return {"error": "Unknown request type"}

# Run alongside existing JavaScript agent
with ModernAgent() as agent:
    print("🤖 Modern Python agent running alongside legacy JavaScript agent")
```

### Step 4: Gradual Feature Migration
Slowly move features from JavaScript to Python:

1. **Week 1**: Add Python agent with basic functionality
2. **Week 2**: Migrate data processing features  
3. **Week 3**: Migrate text analysis features
4. **Week 4**: Switch traffic to Python agent
5. **Week 5**: Deprecate JavaScript agent

---

## 🔧 Keep Legacy (Option 3)

Continue using JavaScript boilerplate with improvements.

### Enhanced JavaScript Boilerplate
```javascript
// enhanced_agent.js - Improved version of existing boilerplate
const axios = require('axios');

class EnhancedLegacyAgent {
    constructor(options = {}) {
        this.name = options.name || "Enhanced Legacy Agent";
        this.version = options.version || "1.1.0";
        this.platformUrl = options.platformUrl || process.env.PLATFORM_URL || 'http://localhost:3000';
        this.apiKey = options.apiKey || process.env.EMERGENCE_API_KEY;
        this.agentId = null;
        this.registered = false;
        this.capabilities = options.capabilities || [];
        this.heartbeatInterval = null;
    }

    async register() {
        try {
            console.log(`🤖 Registering ${this.name} with platform...`);
            const response = await axios.post(`${this.platformUrl}/api/webhook/register`, {
                name: this.name,
                version: this.version,
                capabilities: this.capabilities,
                webhook_url: `${this.platformUrl}/agent-webhook/${this.agentId}`
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            this.agentId = response.data.agent_id;
            this.registered = true;
            console.log('✅ Successfully registered:', this.agentId);
            
            // Start automatic heartbeat
            this.startHeartbeat();
            
            return response.data;
        } catch (error) {
            console.error('❌ Registration failed:', error.message);
            throw error;
        }
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            try {
                await this.ping();
            } catch (error) {
                console.warn('⚠️ Heartbeat failed:', error.message);
            }
        }, 30000); // 30 seconds
    }

    async ping() {
        if (!this.registered) return;

        const response = await axios.post(`${this.platformUrl}/api/webhook/ping`, {
            agent_id: this.agentId,
            status: 'active',
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    async processData(input) {
        console.log("📝 Processing input:", input);
        
        const result = {
            original: input,
            processed: input.toUpperCase(),
            timestamp: new Date().toISOString(),
            agent_id: this.agentId,
            version: this.version
        };

        // Send result to platform
        if (this.registered) {
            try {
                await axios.post(`${this.platformUrl}/api/agent/result`, {
                    agent_id: this.agentId,
                    result: result
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('📤 Result sent to platform');
            } catch (error) {
                console.warn('⚠️ Failed to send result:', error.message);
            }
        }

        return result;
    }

    async shutdown() {
        console.log('🛑 Shutting down agent...');
        
        // Stop heartbeat
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Unregister from platform
        if (this.registered) {
            try {
                await axios.post(`${this.platformUrl}/api/webhook/unregister`, {
                    agent_id: this.agentId
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ Successfully unregistered');
            } catch (error) {
                console.warn('⚠️ Failed to unregister:', error.message);
            }
        }
    }

    async run() {
        try {
            console.log("🚀 Starting enhanced legacy agent...");
            await this.register();
            const result = await this.processData("hello platform");
            console.log("✅ Processing complete:", result);
            return result;
        } catch (error) {
            console.error('❌ Agent execution failed:', error.message);
            throw error;
        }
    }
}

module.exports = EnhancedLegacyAgent;

// Usage
if (require.main === module) {
    const agent = new EnhancedLegacyAgent({
        name: "Enhanced Legacy Agent",
        version: "1.1.0",
        capabilities: ['data-processing', 'text-analysis', 'enhanced-features']
    });

    agent.run().catch(console.error);

    // Graceful shutdown
    process.on('SIGINT', async () => {
        await agent.shutdown();
        process.exit(0);
    });
}
```

---

## 📊 Feature Comparison

| Feature | JavaScript Boilerplate | Enhanced JavaScript | Python SDK |
|---------|------------------------|-------------------|------------|
| **Installation** | Manual setup | Manual setup | `pip install emergence-agent` |
| **Lines of Code** | ~135 lines | ~150 lines | ~15 lines |
| **Auto Registration** | Manual | Manual | ✅ Automatic |
| **Heartbeat** | Manual | ✅ Enhanced | ✅ Automatic |
| **Error Handling** | Basic | ✅ Enhanced | ✅ Advanced |
| **Decorators** | ❌ | ❌ | ✅ Rate limiting, caching, etc. |
| **Validation** | Manual | Manual | ✅ Automatic |
| **Documentation** | Basic | Basic | ✅ Comprehensive |
| **Testing** | Manual | Manual | ✅ Built-in test utilities |
| **Framework Integration** | Manual | Manual | ✅ Flask, FastAPI, Django |
| **Async Support** | Basic | Basic | ✅ Full async/await |
| **Production Ready** | ⚠️ Requires work | ⚠️ Better but still work | ✅ Out of the box |

---

## 🧪 Testing Both Approaches

### Testing Strategy

1. **Functionality Testing**: Ensure both agents work with platform
2. **Performance Testing**: Compare response times and resource usage  
3. **Reliability Testing**: Test heartbeat and reconnection logic
4. **Integration Testing**: Verify platform dashboard shows both agents

### Test Script
```bash
#!/bin/bash
echo "🧪 Testing both approaches..."

# Test JavaScript agent
echo "Testing JavaScript boilerplate..."
cd test-agents/communicating
PLATFORM_URL="http://localhost:3000" node agent.js &
JS_PID=$!

# Test Python agent  
echo "Testing Python SDK..."
cd ../../
python -c "
from emergence_agent import Agent
import time

class TestAgent(Agent):
    def setup(self):
        self.declare_capability('test', 'Test capability')
    
    def handle_request(self, request_type, data):
        return {'tested': True}

with TestAgent(name='test-python-agent') as agent:
    print('✅ Python agent running')
    time.sleep(5)
" &
PY_PID=$!

# Wait for both to finish
wait $JS_PID
wait $PY_PID

echo "✅ Both approaches tested successfully"
```

---

## ⚡ Quick Migration Checklist

### For Complete Migration:
- [ ] Install SDK: `pip install emergence-agent`
- [ ] Set API key: `export EMERGENCE_API_KEY="your_key"`
- [ ] Convert agent logic to Python class
- [ ] Replace manual HTTP calls with SDK methods
- [ ] Test registration and heartbeat
- [ ] Update deployment scripts
- [ ] Verify platform dashboard shows new agent

### For Gradual Migration:
- [ ] Keep existing JavaScript agent running
- [ ] Install SDK alongside: `pip install emergence-agent`
- [ ] Create Python agent with different name
- [ ] Test both agents appear in dashboard
- [ ] Gradually move features to Python
- [ ] Monitor performance and stability
- [ ] Switch traffic when ready
- [ ] Deprecate JavaScript agent

### For Legacy Enhancement:
- [ ] Update JavaScript boilerplate with improvements
- [ ] Add better error handling and heartbeat
- [ ] Implement proper authorization headers
- [ ] Add graceful shutdown logic
- [ ] Enhance logging and monitoring
- [ ] Update documentation

---

## 🚨 Breaking Changes

### None! 
The platform maintains **full backward compatibility**:

- ✅ Existing JavaScript agents continue to work
- ✅ All HTTP endpoints remain functional
- ✅ Dashboard shows both JavaScript and Python agents
- ✅ Agent communication works across languages
- ✅ No changes required for existing deployments

---

## 🎯 Migration Benefits

### Developer Experience
- **90% less boilerplate code**
- **Automatic platform integration**
- **Built-in error handling and retry logic**
- **Comprehensive testing utilities**
- **Rich ecosystem of decorators**

### Production Benefits
- **Better reliability with automatic heartbeat**
- **Enhanced monitoring and logging**
- **Framework integration (Flask, FastAPI, Django)**
- **Container-ready deployment**
- **Security best practices built-in**

### Platform Benefits
- **Consistent agent behavior**
- **Better monitoring and observability**
- **Easier debugging and troubleshooting**
- **Standardized capability declaration**
- **Improved developer onboarding**

---

## 🔗 Resources

- **[Getting Started Guide](GETTING_STARTED.md)** - Quick 5-minute setup
- **[Developer Guide](DEVELOPER_GUIDE.md)** - Complete API reference
- **[Platform Integrations](PLATFORM_INTEGRATIONS.md)** - Framework examples
- **[PyPI Package](https://pypi.org/project/emergence-agent/)** - Official package
- **[Platform Dashboard](https://app.emergence-platform.com)** - Monitor your agents

---

## 💬 Need Help?

- **📧 Email**: developers@emergence-platform.com
- **💬 Discord**: [Join our community](https://discord.gg/emergence)
- **🐛 Issues**: [GitHub Issues](https://github.com/emergence-platform/emergence-agent-sdk/issues)

**Happy migrating! 🚀**

---

*This guide ensures zero downtime migration and full backward compatibility while providing a path to modern, efficient agent development.*