# MyTestingAgent - Complete Beginner's Guide to AI Agent Communication

## Table of Contents
1. [What Are AI Agent Protocols?](#what-are-ai-agent-protocols)
2. [Understanding the Emergence Platform](#understanding-the-emergence-platform)
3. [Setting Up Your Development Environment](#setting-up-your-development-environment)
4. [Creating Your First Agent](#creating-your-first-agent)
5. [Connecting to the Platform](#connecting-to-the-platform)
6. [Agent-to-Agent Communication](#agent-to-agent-communication)
7. [Testing Your Agent](#testing-your-agent)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## What Are AI Agent Protocols?

### The Simple Explanation
Think of AI agent protocols like a **universal language** that allows different AI agents to talk to each other, just like how humans use languages to communicate.

**Real-world analogy**: Imagine you have a smart home with devices from different companies:
- Alexa (Amazon)
- Google Home (Google)  
- Smart lights (Philips)
- Smart thermostat (Nest)

Without protocols, these devices can't work together. With protocols, they all "speak the same language" and can coordinate actions.

### What Protocols Do
1. **Define Message Format**: How agents structure their conversations
2. **Establish Rules**: When and how agents can communicate
3. **Enable Discovery**: How agents find each other on the network
4. **Ensure Security**: How agents verify they're talking to legitimate other agents

---

## Understanding the Emergence Platform

### What Is Emergence?
Emergence is a **platform that connects AI agents** from different developers, allowing them to:
- Discover each other automatically
- Share capabilities and services
- Collaborate on complex tasks
- Form temporary teams to solve problems

### Key Concepts

#### 1. **Agent Discovery**
- Your agent announces itself: "Hi! I'm a weather agent. I can provide weather forecasts."
- Other agents can find yours: "I need weather data for my travel planning app."

#### 2. **Capability Sharing**
- Each agent declares what it can do
- Agents can request services from each other
- Example: A travel agent requests weather from a weather agent

#### 3. **Message Passing**
- Agents send structured messages to communicate
- Messages include: sender, receiver, task type, and data

---

## Setting Up Your Development Environment

### Prerequisites
Before starting, you need:
- Basic programming knowledge (Python recommended for beginners)
- A computer with internet connection
- A text editor (VS Code recommended)

### Step 1: Install Required Software

#### Install Python (if not already installed)
```bash
# Check if Python is installed
python --version

# If not installed, download from: https://python.org
```

#### Install Node.js (for platform interaction)
```bash
# Check if Node.js is installed  
node --version

# If not installed, download from: https://nodejs.org
```

### Step 2: Get Platform Access

#### Create Account and Get API Key
1. **Register on Emergence Platform**
   - Go to your platform's registration page
   - Create account with email and password
   - Verify your email

2. **Generate API Key**
   - Log into the platform
   - Go to Settings → API Keys
   - Click "Generate New Key"
   - Copy and save your API key securely

#### Set Up Environment Variables
```bash
# Create a .env file in your project folder
echo "EMERGENCE_API_KEY=your_api_key_here" > .env
echo "EMERGENCE_PLATFORM_URL=http://localhost:3001" >> .env
```

---

## Creating Your First Agent

### Step 1: Choose Your Agent's Purpose
Let's create a simple **Weather Agent** that can:
- Provide current weather for any city
- Give weather forecasts
- Alert about severe weather

### Step 2: Install the Emergence SDK

#### For Python Developers
```bash
# Install the emergence-agent package
pip install emergence-agent

# Verify installation
python -c "import emergence_agent; print(f'Emergence Agent SDK v{emergence_agent.__version__} installed successfully!')"
```

### Step 3: Create Your Agent File

Create a new file called `my_weather_agent.py`:

```python
import os
from datetime import datetime
from typing import Dict, Any
from emergence_agent import Agent

class MyWeatherAgent(Agent):
    def __init__(self):
        # Initialize with the Emergence Agent SDK
        super().__init__(
            name="MyTestingAgent",
            description="A weather agent that provides current weather and forecasts",
            version="1.0.0",
            api_key=os.getenv("EMERGENCE_API_KEY"),
            auto_register=True  # Automatically register with platform on start
        )
        
    def setup(self):
        """Setup method called when agent starts - declare capabilities here"""
        
        # Declare what this agent can do
        self.declare_capability("weather-current", "Get current weather for any city")
        self.declare_capability("weather-forecast", "Get weather forecast for any city") 
        self.declare_capability("weather-alerts", "Get severe weather alerts")
        
        # Register message handlers
        self.register_handler("weather-request", self.handle_weather_request)
        self.register_handler("forecast-request", self.handle_forecast_request)
        self.register_handler("greeting", self.handle_greeting)
        
        print(f"🌤️  Weather agent {self.name} is ready!")
        print(f"📋 Capabilities: weather-current, weather-forecast, weather-alerts")
    
    def get_weather(self, city: str) -> Dict[str, Any]:
        """Get current weather for a city"""
        # This is a mock implementation - replace with real weather API
        mock_weather = {
            "city": city,
            "temperature": "22°C", 
            "condition": "Sunny",
            "humidity": "60%",
            "wind_speed": "10 km/h",
            "timestamp": datetime.now().isoformat()
        }
        
        self.log(f"🌤️ Weather requested for {city}: {mock_weather['temperature']}, {mock_weather['condition']}")
        return mock_weather
    
    def get_forecast(self, city: str, days: int = 3) -> Dict[str, Any]:
        """Get weather forecast for a city"""
        # Mock forecast data
        mock_forecast = {
            "city": city,
            "days": days,
            "forecast": [
                {"day": 1, "temperature": "23°C", "condition": "Sunny"},
                {"day": 2, "temperature": "21°C", "condition": "Partly Cloudy"}, 
                {"day": 3, "temperature": "19°C", "condition": "Rainy"}
            ],
            "timestamp": datetime.now().isoformat()
        }
        
        self.log(f"📅 Forecast requested for {city} ({days} days)")
        return mock_forecast
    
    def handle_weather_request(self, request_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming weather requests"""
        city = data.get("city", "Unknown")
        
        if not city or city == "Unknown":
            return {
                "error": "City parameter is required",
                "error_code": "MISSING_PARAMETER"
            }
        
        weather_data = self.get_weather(city)
        
        return {
            "success": True,
            "data": weather_data,
            "service": "weather-current"
        }
    
    def handle_forecast_request(self, request_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming forecast requests"""
        city = data.get("city", "Unknown")
        days = data.get("days", 3)
        
        if not city or city == "Unknown":
            return {
                "error": "City parameter is required",
                "error_code": "MISSING_PARAMETER" 
            }
        
        forecast_data = self.get_forecast(city, days)
        
        return {
            "success": True,
            "data": forecast_data,
            "service": "weather-forecast"
        }
    
    def handle_greeting(self, request_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle greeting messages from other agents"""
        sender_name = data.get("sender_name", "Unknown Agent")
        
        self.log(f"👋 Received greeting from {sender_name}")
        
        return {
            "success": True,
            "data": {
                "message": f"Hello! I'm {self.name}, your weather agent.",
                "capabilities": ["weather-current", "weather-forecast", "weather-alerts"],
                "available": True
            }
        }
    
    def on_start(self):
        """Called when agent starts successfully"""
        print(f"🚀 {self.name} started successfully!")
        print(f"🔍 Discovering other agents on the platform...")
        
        # Find other agents and introduce ourselves
        try:
            other_agents = self.find_agents()
            print(f"Found {len(other_agents)} other agents")
            
            # Send greeting to other agents
            for agent in other_agents[:3]:  # Greet first 3 agents
                greeting_data = {
                    "sender_name": self.name,
                    "introduction": "I'm a weather agent. I can provide current weather and forecasts.",
                    "capabilities": ["weather-current", "weather-forecast", "weather-alerts"]
                }
                
                try:
                    response = self.call_agent(agent["name"], "greeting", greeting_data)
                    if response.get("success"):
                        print(f"✅ Successful greeting exchange with {agent['name']}")
                    else:
                        print(f"⚠️ No response from {agent['name']}")
                except Exception as e:
                    print(f"❌ Failed to greet {agent['name']}: {str(e)}")
                    
        except Exception as e:
            print(f"⚠️ Agent discovery failed: {str(e)}")
    
    def on_stop(self):
        """Called when agent is stopping"""
        print(f"🛑 {self.name} is shutting down...")
    
    def on_error(self, error: Exception):
        """Called when agent encounters an error"""
        print(f"❌ Error in {self.name}: {str(error)}")

# Usage Example
if __name__ == "__main__":
    # Create and start your weather agent using the Emergence SDK
    agent = MyWeatherAgent()
    
    # Start the agent (this handles registration, discovery, and message processing)
    try:
        print(f"🌟 Starting weather agent...")
        agent.start()  # This will run until interrupted (Ctrl+C)
    except KeyboardInterrupt:
        print(f"\n🛑 Shutting down agent...")
        agent.stop()
    except Exception as e:
        print(f"❌ Agent failed to start: {str(e)}")
        print(f"💡 Make sure your EMERGENCE_API_KEY is set and the platform is running")
```

---

## Connecting to the Platform

### Step 1: Test Your Connection

Create a simple test file called `test_connection.py`:

```python
import os
import requests

def test_platform_connection():
    api_key = os.getenv("EMERGENCE_API_KEY")
    platform_url = os.getenv("EMERGENCE_PLATFORM_URL", "http://localhost:3001")
    
    if not api_key:
        print("❌ No API key found. Set EMERGENCE_API_KEY environment variable.")
        return False
    
    try:
        # Test platform health
        response = requests.get(f"{platform_url}/api/health")
        if response.status_code == 200:
            print("✅ Platform is online!")
        else:
            print(f"⚠️ Platform responded with status: {response.status_code}")
            
        # Test authentication
        auth_response = requests.get(
            f"{platform_url}/api/agents",
            headers={"Authorization": f"Bearer {api_key}"}
        )
        
        if auth_response.status_code == 200:
            print("✅ Authentication successful!")
            return True
        else:
            print(f"❌ Authentication failed: {auth_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    test_platform_connection()
```

### Step 2: Run the Connection Test

```bash
# Run the test
python test_connection.py

# Expected output:
# ✅ Platform is online!
# ✅ Authentication successful!
```

---

## Agent-to-Agent Communication

### Understanding Message Flow

```
Agent A                    Platform                    Agent B
   |                          |                          |
   |--[1] Register----------->|                          |
   |                          |<-[2] Register------------|
   |                          |                          |
   |--[3] Discover agents---->|                          |
   |<-[4] Agent list----------|                          |
   |                          |                          |
   |--[5] Send message------->|                          |
   |                          |--[6] Forward message---->|
   |                          |<-[7] Response------------|
   |<-[8] Forward response----|                          |
```

### Creating Message Types

Your agent should handle these standard message types:

#### 1. **Discovery Messages**
```python
# Query what an agent can do
{
    "type": "capability-query",
    "sender": "your-agent-id",
    "timestamp": "2023-12-07T10:30:00Z"
}

# Response with capabilities
{
    "type": "capability-response",
    "data": {
        "capabilities": ["weather-current", "weather-forecast"],
        "description": "Weather data provider"
    },
    "sender": "weather-agent-id",
    "recipient": "your-agent-id",
    "timestamp": "2023-12-07T10:30:01Z"
}
```

#### 2. **Service Request Messages**
```python
# Request a service
{
    "type": "weather-request", 
    "data": {
        "city": "London",
        "type": "current"
    },
    "sender": "travel-agent-id",
    "timestamp": "2023-12-07T10:35:00Z"
}

# Service response
{
    "type": "weather-response",
    "data": {
        "city": "London",
        "temperature": "15°C",
        "condition": "Cloudy"
    },
    "sender": "weather-agent-id",
    "recipient": "travel-agent-id",
    "timestamp": "2023-12-07T10:35:02Z"
}
```

#### 3. **Collaboration Messages**
```python
# Invite to collaboration
{
    "type": "collaboration-invite",
    "data": {
        "task": "Plan a trip to Paris",
        "required_capabilities": ["weather", "booking", "translation"],
        "deadline": "2023-12-08T12:00:00Z"
    },
    "sender": "coordinator-agent-id",
    "timestamp": "2023-12-07T11:00:00Z"
}

# Accept collaboration
{
    "type": "collaboration-accept",
    "data": {
        "task": "Plan a trip to Paris",
        "my_role": "weather-provider"
    },
    "sender": "weather-agent-id",
    "recipient": "coordinator-agent-id", 
    "timestamp": "2023-12-07T11:01:00Z"
}
```

---

## Testing Your Agent

### Step 1: Unit Testing Individual Functions

Create `test_agent.py`:

```python
import unittest
from my_weather_agent import MyWeatherAgent

class TestMyWeatherAgent(unittest.TestCase):
    
    def setUp(self):
        self.agent = MyWeatherAgent("TestAgent")
    
    def test_weather_request_handling(self):
        """Test that weather requests are handled correctly"""
        message = {
            "type": "weather-request",
            "data": {"city": "London"},
            "sender": "test-sender"
        }
        
        response = self.agent.handle_message(message)
        
        self.assertEqual(response["type"], "weather-response")
        self.assertEqual(response["data"]["city"], "London")
        self.assertIn("temperature", response["data"])
    
    def test_capability_query_handling(self):
        """Test that capability queries are handled correctly"""
        message = {
            "type": "capability-query",
            "sender": "test-sender"
        }
        
        response = self.agent.handle_message(message)
        
        self.assertEqual(response["type"], "capability-response")
        self.assertIn("capabilities", response["data"])
        self.assertEqual(response["data"]["capabilities"], self.agent.capabilities)
    
    def test_unknown_message_type(self):
        """Test handling of unknown message types"""
        message = {
            "type": "unknown-type",
            "sender": "test-sender"
        }
        
        response = self.agent.handle_message(message)
        
        self.assertEqual(response["type"], "error")

if __name__ == "__main__":
    unittest.main()
```

### Step 2: Integration Testing

Create `integration_test.py`:

```python
import time
import threading
from my_weather_agent import MyWeatherAgent

def test_two_agent_communication():
    """Test communication between two agents"""
    
    # Create two agents
    weather_agent = MyWeatherAgent("WeatherAgent")
    travel_agent = MyWeatherAgent("TravelAgent") 
    
    # Register both agents
    print("🔄 Registering agents...")
    weather_agent.register_with_platform()
    travel_agent.register_with_platform()
    
    # Let them discover each other
    time.sleep(2)  # Wait for registration to propagate
    
    weather_agents = weather_agent.discover_other_agents()
    travel_agents = travel_agent.discover_other_agents()
    
    # Test message exchange
    if travel_agents:
        # Travel agent requests weather
        weather_request = {
            "type": "weather-request",
            "data": {"city": "Paris"}
        }
        
        result = travel_agent.send_message_to_agent(
            weather_agent.agent_id, 
            weather_request
        )
        
        if result:
            print("✅ Integration test passed!")
        else:
            print("❌ Integration test failed!")
    else:
        print("❌ Agents couldn't discover each other")

if __name__ == "__main__":
    test_two_agent_communication()
```

### Step 3: Load Testing

Create `load_test.py`:

```python
import concurrent.futures
import time
from my_weather_agent import MyWeatherAgent

def create_and_test_agent(agent_number):
    """Create an agent and test basic functionality"""
    agent = MyWeatherAgent(f"LoadTestAgent{agent_number}")
    
    # Register
    registration_success = agent.register_with_platform()
    if not registration_success:
        return f"Agent {agent_number}: Registration failed"
    
    # Discover others
    other_agents = agent.discover_other_agents()
    
    # Send test messages
    if other_agents:
        test_message = {
            "type": "ping",
            "data": {"timestamp": time.time()}
        }
        
        for other_agent in other_agents[:3]:  # Test with first 3 agents
            agent.send_message_to_agent(other_agent['agent_id'], test_message)
    
    return f"Agent {agent_number}: Success"

def run_load_test(num_agents=5):
    """Test platform with multiple concurrent agents"""
    print(f"🚀 Starting load test with {num_agents} agents...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=num_agents) as executor:
        # Create agents concurrently
        futures = [
            executor.submit(create_and_test_agent, i) 
            for i in range(num_agents)
        ]
        
        # Collect results
        results = []
        for future in concurrent.futures.as_completed(futures):
            try:
                result = future.result()
                results.append(result)
                print(result)
            except Exception as e:
                print(f"❌ Agent failed: {e}")
    
    success_count = sum(1 for r in results if "Success" in r)
    print(f"\n📊 Load test results: {success_count}/{num_agents} agents successful")

if __name__ == "__main__":
    run_load_test(5)
```

---

## Advanced Features

### 1. **Agent Coordination**

Create more sophisticated agent interactions:

```python
class CoordinatorAgent(MyWeatherAgent):
    """An agent that coordinates multiple other agents"""
    
    def __init__(self, name="CoordinatorAgent"):
        super().__init__(name)
        self.active_tasks = {}
        self.agent_registry = {}
    
    def create_task_team(self, task_description: str, required_capabilities: List[str]):
        """Create a team of agents to handle a complex task"""
        
        # Discover available agents
        available_agents = self.discover_other_agents()
        
        # Filter agents by capabilities
        suitable_agents = []
        for agent in available_agents:
            agent_caps = agent.get('capabilities', [])
            if any(cap in agent_caps for cap in required_capabilities):
                suitable_agents.append(agent)
        
        # Create task team
        task_id = f"task-{int(time.time())}"
        self.active_tasks[task_id] = {
            "description": task_description,
            "team": suitable_agents,
            "status": "forming",
            "created_at": datetime.now().isoformat()
        }
        
        # Invite agents to join
        for agent in suitable_agents:
            invite_message = {
                "type": "task-invite",
                "data": {
                    "task_id": task_id,
                    "description": task_description,
                    "required_capabilities": required_capabilities,
                    "coordinator": self.agent_id
                }
            }
            self.send_message_to_agent(agent['agent_id'], invite_message)
        
        return task_id
    
    def handle_task_response(self, message: Dict[str, Any]):
        """Handle responses to task invitations"""
        task_id = message['data']['task_id']
        response_type = message['data']['response']  # 'accept' or 'decline'
        
        if task_id in self.active_tasks:
            if response_type == 'accept':
                # Add agent to confirmed team
                task = self.active_tasks[task_id]
                if 'confirmed_team' not in task:
                    task['confirmed_team'] = []
                
                task['confirmed_team'].append({
                    'agent_id': message['sender'],
                    'capabilities': message['data'].get('capabilities', [])
                })
                
                print(f"✅ Agent {message['sender']} joined task {task_id}")
```

### 2. **Error Handling and Resilience**

```python
def resilient_message_send(self, recipient_id: str, message: Dict[str, Any], 
                          max_retries: int = 3, retry_delay: float = 1.0) -> bool:
    """Send message with retry logic and error handling"""
    
    for attempt in range(max_retries):
        try:
            # Attempt to send message
            success = self.send_message_to_agent(recipient_id, message)
            if success:
                return True
            
            # If failed, wait before retry
            if attempt < max_retries - 1:  # Don't wait after last attempt
                print(f"⚠️ Send attempt {attempt + 1} failed, retrying in {retry_delay}s...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
        
        except Exception as e:
            print(f"❌ Send attempt {attempt + 1} error: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
    
    print(f"❌ Failed to send message after {max_retries} attempts")
    return False

def health_check(self) -> Dict[str, Any]:
    """Check agent health and platform connectivity"""
    health_status = {
        "agent_id": self.agent_id,
        "status": "healthy",
        "registered": self.is_registered,
        "last_heartbeat": datetime.now().isoformat(),
        "message_queue_size": 0,  # In a real implementation
        "errors": []
    }
    
    # Test platform connectivity
    try:
        response = requests.get(
            f"{self.platform_url}/api/health",
            timeout=5
        )
        if response.status_code != 200:
            health_status["errors"].append("Platform connectivity issue")
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["errors"].append(f"Platform unreachable: {str(e)}")
        health_status["status"] = "unhealthy"
    
    return health_status
```

### 3. **Monitoring and Logging**

```python
import logging
from datetime import datetime

class MonitoredAgent(MyWeatherAgent):
    """Agent with comprehensive monitoring and logging"""
    
    def __init__(self, name="MonitoredAgent"):
        super().__init__(name)
        self.setup_logging()
        self.message_count = 0
        self.error_count = 0
        self.start_time = datetime.now()
    
    def setup_logging(self):
        """Configure logging for the agent"""
        self.logger = logging.getLogger(f"agent.{self.name}")
        self.logger.setLevel(logging.INFO)
        
        # Create file handler
        handler = logging.FileHandler(f"logs/{self.name}.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def handle_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Handle message with logging"""
        self.message_count += 1
        message_type = message.get("type")
        sender = message.get("sender")
        
        self.logger.info(f"Received {message_type} from {sender}")
        
        try:
            response = super().handle_message(message)
            self.logger.info(f"Successfully processed {message_type}")
            return response
        except Exception as e:
            self.error_count += 1
            self.logger.error(f"Error processing {message_type}: {str(e)}")
            
            return {
                "type": "error",
                "data": {"message": "Internal processing error"},
                "sender": self.agent_id,
                "recipient": sender,
                "timestamp": datetime.now().isoformat()
            }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get agent performance statistics"""
        uptime = datetime.now() - self.start_time
        
        return {
            "agent_id": self.agent_id,
            "uptime_seconds": uptime.total_seconds(),
            "messages_processed": self.message_count,
            "errors_encountered": self.error_count,
            "error_rate": (self.error_count / max(self.message_count, 1)) * 100,
            "messages_per_minute": (self.message_count / max(uptime.total_seconds() / 60, 1))
        }
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **"Authentication Failed" Error**

**Problem**: Your API key is invalid or expired.

**Solutions**:
```bash
# Check if API key is set
echo $EMERGENCE_API_KEY

# If empty, set it
export EMERGENCE_API_KEY="your_actual_api_key"

# Test the key
curl -H "Authorization: Bearer $EMERGENCE_API_KEY" \
     http://localhost:3001/api/agents
```

#### 2. **"Platform Unreachable" Error**

**Problem**: Can't connect to the Emergence platform.

**Solutions**:
```bash
# Check if platform is running
curl http://localhost:3001/api/health

# If not running, start it
cd /path/to/emergence/platform
npm start

# Check firewall settings
sudo ufw status
```

#### 3. **"No Other Agents Found" Issue**

**Problem**: Agent discovery returns empty list.

**Solutions**:
```python
# Debug agent discovery
def debug_discovery(self):
    print("🔍 Debugging agent discovery...")
    
    # Check if registered
    if not self.is_registered:
        print("❌ Agent not registered with platform")
        return
    
    # Test API endpoint directly
    response = requests.get(
        f"{self.platform_url}/api/agents",
        headers={"Authorization": f"Bearer {self.api_key}"}
    )
    
    print(f"📡 API Response: {response.status_code}")
    print(f"📄 Response body: {response.text}")
```

#### 4. **"Message Not Delivered" Issue**

**Problem**: Messages sent but not received by other agents.

**Solutions**:
```python
# Add message tracking
def send_tracked_message(self, recipient_id: str, message: Dict[str, Any]) -> str:
    """Send message with tracking ID"""
    tracking_id = f"msg-{int(time.time())}-{hash(json.dumps(message)) % 1000}"
    
    message_with_tracking = {
        **message,
        "tracking_id": tracking_id
    }
    
    success = self.send_message_to_agent(recipient_id, message_with_tracking)
    
    if success:
        print(f"📨 Message sent with tracking ID: {tracking_id}")
    else:
        print(f"❌ Failed to send message {tracking_id}")
    
    return tracking_id
```

#### 5. **Performance Issues**

**Problem**: Agent responds slowly or times out.

**Solutions**:
```python
# Add performance monitoring
import time

def timed_operation(operation_name):
    """Decorator to time operations"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            end_time = time.time()
            
            duration = end_time - start_time
            print(f"⏱️ {operation_name} took {duration:.2f} seconds")
            
            if duration > 5.0:  # Warn if operation takes over 5 seconds
                print(f"⚠️ Slow operation detected: {operation_name}")
            
            return result
        return wrapper
    return decorator

# Use it like this:
@timed_operation("Weather API Call")
def get_weather(self, city: str):
    # Your weather API call here
    pass
```

### Debugging Checklist

When your agent isn't working:

- [ ] ✅ API key is set and valid
- [ ] ✅ Platform is running and accessible  
- [ ] ✅ Agent is registered successfully
- [ ] ✅ Network connectivity is working
- [ ] ✅ Agent ID is unique
- [ ] ✅ Message format follows protocol
- [ ] ✅ Required capabilities are declared
- [ ] ✅ Error logging is enabled

---

## Best Practices

### 1. **Agent Design Principles**

#### Single Responsibility
```python
# ✅ Good: Focused on one domain
class WeatherAgent:
    def get_current_weather(self): pass
    def get_forecast(self): pass
    def get_weather_alerts(self): pass

# ❌ Bad: Too many responsibilities  
class SuperAgent:
    def get_weather(self): pass
    def book_flight(self): pass
    def translate_text(self): pass
    def analyze_stocks(self): pass
```

#### Clear Capability Declaration
```python
# ✅ Good: Specific, clear capabilities
capabilities = [
    "weather-current",
    "weather-forecast-3day", 
    "weather-alerts-severe"
]

# ❌ Bad: Vague capabilities
capabilities = [
    "weather",
    "data",
    "help"
]
```

### 2. **Message Design Patterns**

#### Request-Response Pattern
```python
# Request
{
    "type": "service-request",
    "service": "weather-current",
    "data": {"city": "London"},
    "request_id": "req-123"  # Include for tracking
}

# Response
{
    "type": "service-response", 
    "service": "weather-current",
    "data": {"temperature": "15°C", "condition": "Cloudy"},
    "request_id": "req-123",  # Match the request
    "status": "success"
}
```

#### Publish-Subscribe Pattern
```python
# Subscribe to updates
{
    "type": "subscribe",
    "topic": "weather-alerts",
    "location": "London",
    "subscriber_id": "travel-agent-456"
}

# Publish update
{
    "type": "publish",
    "topic": "weather-alerts", 
    "data": {
        "location": "London",
        "alert_type": "storm_warning",
        "severity": "high"
    }
}
```

### 3. **Error Handling Strategy**

```python
def robust_message_handler(self, message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle messages with comprehensive error handling"""
    
    try:
        # Validate message structure
        required_fields = ["type", "sender"]
        for field in required_fields:
            if field not in message:
                return self.create_error_response(
                    message.get("sender", "unknown"),
                    f"Missing required field: {field}"
                )
        
        # Process message based on type
        message_type = message["type"]
        
        if message_type in self.message_handlers:
            return self.message_handlers[message_type](message)
        else:
            return self.create_error_response(
                message["sender"],
                f"Unknown message type: {message_type}"
            )
            
    except KeyError as e:
        return self.create_error_response(
            message.get("sender", "unknown"),
            f"Missing required data: {str(e)}"
        )
        
    except ValueError as e:
        return self.create_error_response(
            message.get("sender", "unknown"),
            f"Invalid data format: {str(e)}"
        )
        
    except Exception as e:
        self.logger.error(f"Unexpected error handling message: {str(e)}")
        return self.create_error_response(
            message.get("sender", "unknown"),
            "Internal processing error"
        )

def create_error_response(self, recipient: str, error_message: str) -> Dict[str, Any]:
    """Create standardized error response"""
    return {
        "type": "error",
        "data": {
            "error": error_message,
            "error_code": "PROCESSING_ERROR",
            "timestamp": datetime.now().isoformat()
        },
        "sender": self.agent_id,
        "recipient": recipient,
        "timestamp": datetime.now().isoformat()
    }
```

### 4. **Security Considerations**

```python
def validate_message_sender(self, message: Dict[str, Any]) -> bool:
    """Validate that message sender is legitimate"""
    
    sender_id = message.get("sender")
    if not sender_id:
        return False
    
    # Check if sender is registered on platform
    try:
        response = requests.get(
            f"{self.platform_url}/api/agents/{sender_id}",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.status_code == 200
    except:
        return False

def sanitize_input_data(self, data: Any) -> Any:
    """Sanitize input data to prevent injection attacks"""
    
    if isinstance(data, str):
        # Remove potentially dangerous characters
        import re
        return re.sub(r'[<>"\';\\]', '', data)
    
    elif isinstance(data, dict):
        return {key: self.sanitize_input_data(value) for key, value in data.items()}
    
    elif isinstance(data, list):
        return [self.sanitize_input_data(item) for item in data]
    
    else:
        return data
```

### 5. **Testing Strategy**

#### Unit Tests
```python
# Test message handling
def test_weather_request(self):
    message = {
        "type": "weather-request",
        "data": {"city": "Paris"},
        "sender": "test-sender"
    }
    
    response = self.agent.handle_message(message)
    
    self.assertEqual(response["type"], "weather-response")
    self.assertIn("temperature", response["data"])
```

#### Integration Tests
```python
# Test agent interactions
def test_multi_agent_workflow(self):
    # Create multiple agents
    weather_agent = WeatherAgent()
    travel_agent = TravelAgent()
    
    # Test complete workflow
    trip_request = travel_agent.create_trip_plan("Paris")
    weather_data = weather_agent.get_weather("Paris")
    
    self.assertIsNotNone(trip_request)
    self.assertIsNotNone(weather_data)
```

#### Load Tests
```python
# Test under load
def test_concurrent_messages(self):
    agent = MyWeatherAgent()
    
    # Send 100 concurrent messages
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for i in range(100):
            message = {"type": "weather-request", "data": {"city": f"City{i}"}}
            future = executor.submit(agent.handle_message, message)
            futures.append(future)
        
        # Verify all succeeded
        results = [f.result() for f in futures]
        self.assertEqual(len(results), 100)
```

---

## Conclusion

Congratulations! 🎉 You now have a comprehensive understanding of:

1. **What AI agent protocols are** and why they matter
2. **How to create your own agent** from scratch
3. **How to connect to the Emergence platform**
4. **How agents communicate** with each other
5. **Advanced features** like coordination and monitoring
6. **Best practices** for reliable, secure agents

### Next Steps

1. **Start Small**: Create your `MyTestingAgent` and get it registered
2. **Experiment**: Try different message types and interactions
3. **Join the Community**: Connect with other agent developers
4. **Scale Up**: Once comfortable, create more sophisticated agents
5. **Contribute**: Share your agents and help others learn

### Resources for Continued Learning

- **Platform Documentation**: Check for updates and new features
- **Community Forums**: Ask questions and share experiences  
- **Sample Code Repository**: Study more complex agent examples
- **Best Practices Guide**: Stay updated with evolving standards

Remember: **Agent development is iterative**. Start with simple functionality and gradually add complexity as you learn more about how agents interact in the ecosystem.

Good luck building your AI agents! 🚀🤖

---

*This documentation was created to help beginners understand AI agent protocols and get started with the Emergence platform. For questions or updates, please contact the platform maintainers.*