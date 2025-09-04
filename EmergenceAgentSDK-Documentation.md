# Emergence Agent SDK - Complete Developer Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Classes](#core-classes)
5. [Decorators & Utilities](#decorators--utilities)
6. [Agent Types](#agent-types)
7. [Platform Integration](#platform-integration)
8. [Advanced Features](#advanced-features)
9. [Best Practices](#best-practices)
10. [API Reference](#api-reference)
11. [Examples](#examples)
12. [Troubleshooting](#troubleshooting)

---

## Introduction

The **Emergence Agent SDK** is the official Python library for building intelligent agents on the Emergence Platform. It provides a clean, developer-friendly interface for:

- 🤖 **Agent Development**: Simple class-based agent creation
- 🌐 **Platform Integration**: Automatic registration and discovery
- 📡 **Communication**: Agent-to-agent messaging and collaboration
- 🚀 **Deployment**: Built-in webhook servers and async support
- 🛠 **Tools**: Decorators for validation, caching, rate limiting
- 🔒 **Security**: Built-in authentication and input validation

### Package Information
- **Version**: 0.1.0
- **Author**: Emergence Platform Team
- **License**: MIT
- **Homepage**: https://github.com/emergence-platform/emergence-agent-sdk

---

## Installation

### Requirements
- Python 3.8+
- pip package manager
- Emergence Platform API key

### Install from PyPI
```bash
# Install the latest version
pip install emergence-agent

# Install specific version
pip install emergence-agent==0.1.0

# Install with optional dependencies
pip install emergence-agent[async,webhook]
```

### Verify Installation
```bash
python -c "import emergence_agent; print(f'✅ Emergence Agent SDK v{emergence_agent.__version__} installed successfully!')"
```

### Environment Setup
```bash
# Set your API key (required)
export EMERGENCE_API_KEY="your_api_key_here"

# Optional: Set platform URL (defaults to production)
export EMERGENCE_PLATFORM_URL="https://platform.emergence.ai"
```

---

## Quick Start

### Your First Agent in 5 Minutes

```python
from emergence_agent import Agent

class HelloWorldAgent(Agent):
    def setup(self):
        """Called when agent starts - declare capabilities here"""
        self.declare_capability(
            "greeting", 
            "Generate personalized greetings"
        )
    
    def handle_request(self, request_type, data):
        """Handle incoming requests from other agents"""
        if request_type == "greeting":
            name = data.get("name", "World")
            return {
                "message": f"Hello, {name}!",
                "timestamp": self.get_timestamp(),
                "agent": self.name
            }
        
        return {"error": "Unknown request type"}

# Create and start your agent
if __name__ == "__main__":
    agent = HelloWorldAgent(name="hello-world-agent")
    agent.start()  # Runs until Ctrl+C
```

### Run Your Agent
```bash
# Set API key
export EMERGENCE_API_KEY="your_key_here"

# Run agent
python hello_agent.py

# Expected output:
# 🚀 Agent hello-world-agent started successfully!
# 🔍 Discovering other agents on the platform...
# 🌟 Ready to handle requests!
```

### Test Your Agent
```python
from emergence_agent import call_agent

# Call your agent from another script
response = call_agent(
    agent_name="hello-world-agent",
    request_type="greeting", 
    data={"name": "Alice"}
)

print(response)
# Output: {"message": "Hello, Alice!", "timestamp": "2024-01-07T10:30:00Z", "agent": "hello-world-agent"}
```

---

## Core Classes

### 1. Agent (Developer Interface)

The main class for creating agents. Provides a clean, simple interface.

```python
from emergence_agent import Agent

class MyAgent(Agent):
    def __init__(self):
        super().__init__(
            name="my-agent",                    # Required: Unique agent name
            description="My first agent",      # Optional: Agent description
            version="1.0.0",                   # Optional: Agent version
            api_key="your_key",                # Optional: API key (or use env var)
            auto_register=True,                # Optional: Auto-register on start
            heartbeat_interval=60              # Optional: Heartbeat interval (seconds)
        )
    
    def setup(self):
        """Called once when agent starts"""
        self.declare_capability("my_service", "What this agent does")
    
    def handle_request(self, request_type, data):
        """Handle incoming requests - OVERRIDE THIS"""
        return {"result": "processed"}
    
    def on_start(self):
        """Called when agent starts successfully"""
        print("Agent started!")
    
    def on_stop(self):
        """Called when agent is stopping"""
        print("Agent stopping...")
    
    def on_error(self, error):
        """Called when agent encounters an error"""
        print(f"Error: {error}")
```

### 2. AsyncAgent (High Performance)

For agents that need async/await support:

```python
from emergence_agent import AsyncAgent
import asyncio

class FastAgent(AsyncAgent):
    async def setup(self):
        """Async setup method"""
        await self.declare_capability_async("fast_processing", "High-speed processing")
    
    async def handle_request(self, request_type, data):
        """Async request handler"""
        if request_type == "process":
            # Can use await for async operations
            result = await self.process_data_async(data)
            return {"result": result}
        
        return {"error": "Unknown request"}
    
    async def process_data_async(self, data):
        """Your async processing logic"""
        await asyncio.sleep(0.1)  # Simulate async work
        return f"processed: {data}"

# Usage
agent = FastAgent(name="fast-agent")
asyncio.run(agent.start_async())
```

### 3. WebhookAgent (HTTP Server)

For agents that need to receive HTTP requests:

```python
from emergence_agent import WebhookAgent

class WebServerAgent(WebhookAgent):
    def setup(self):
        self.declare_capability("web_service", "HTTP-based service")
    
    def handle_webhook(self, path, method, headers, body):
        """Handle HTTP requests"""
        if path == "/api/process" and method == "POST":
            data = self.parse_json(body)
            result = self.process(data)
            return {"status": "success", "result": result}
        
        return {"error": "Not found"}, 404
    
    def handle_request(self, request_type, data):
        """Still handle platform requests"""
        return {"message": "Hello from webhook agent!"}

# Start with webhook server
agent = WebServerAgent(
    name="webhook-agent",
    webhook_url="https://myagent.com/webhook",
    enable_webhooks=True
)
agent.start_server(host="0.0.0.0", port=8080)
```

### 4. EmergenceClient (Platform API)

Direct access to platform APIs:

```python
from emergence_agent import EmergenceClient

# Create client
client = EmergenceClient(api_key="your_api_key")

# Register agent manually
agent_data = {
    "name": "manual-agent",
    "description": "Manually registered agent",
    "version": "1.0.0",
    "capabilities": ["data_processing"]
}
response = client.register_agent(agent_data)

# Find other agents
agents = client.find_agents(capability="weather")
print(f"Found {len(agents)} weather agents")

# Send message to agent
message = {
    "request_type": "get_weather",
    "data": {"city": "London"}
}
response = client.send_message("weather-agent-1", message)
```

---

## Decorators & Utilities

The SDK provides powerful decorators to enhance your agent methods:

### 1. @capability - Auto-declare capabilities

```python
from emergence_agent import Agent, capability

class SmartAgent(Agent):
    @capability(
        name="text_analysis",
        description="Analyze text sentiment and extract keywords",
        parameters={
            "text": {"type": "string", "required": True},
            "language": {"type": "string", "default": "en"}
        },
        returns={
            "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
            "keywords": {"type": "array", "items": {"type": "string"}},
            "confidence": {"type": "number", "min": 0, "max": 1}
        },
        examples=[
            {
                "input": {"text": "I love this product!", "language": "en"},
                "output": {"sentiment": "positive", "keywords": ["love", "product"], "confidence": 0.95}
            }
        ]
    )
    def analyze_text(self, text, language="en"):
        """Analyze text sentiment - capability auto-declared"""
        # Your analysis logic here
        return {
            "sentiment": "positive",
            "keywords": ["example", "text"],
            "confidence": 0.8
        }
    
    def handle_request(self, request_type, data):
        if request_type == "text_analysis":
            return self.analyze_text(
                text=data["text"], 
                language=data.get("language", "en")
            )
        return {"error": "Unknown request"}
```

### 2. @request_handler - Auto-route requests

```python
from emergence_agent import Agent, request_handler

class CalculatorAgent(Agent):
    @request_handler("add")
    def add_numbers(self, data):
        """Handle 'add' requests automatically"""
        return {"result": data["a"] + data["b"]}
    
    @request_handler("multiply")  
    def multiply_numbers(self, data):
        """Handle 'multiply' requests automatically"""
        return {"result": data["a"] * data["b"]}
    
    # No need to override handle_request - auto-routing works!
```

### 3. @validate_input - Input validation

```python
from emergence_agent import Agent, validate_input

class ValidationAgent(Agent):
    @validate_input(
        email={"type": "string", "required": True, "format": "email"},
        age={"type": "number", "min": 0, "max": 120},
        name={"type": "string", "required": True, "min_length": 2}
    )
    def process_user(self, email, age, name):
        """Input automatically validated before method runs"""
        return {
            "message": f"Processing user {name}, age {age}, email {email}",
            "valid": True
        }
```

### 4. @rate_limit - Rate limiting

```python
from emergence_agent import Agent, rate_limit

class LimitedAgent(Agent):
    @rate_limit(requests_per_second=2.0, burst_size=5)
    def expensive_operation(self, data):
        """This method is rate limited to 2 req/sec with burst of 5"""
        # Expensive computation here
        return {"result": "computed"}
```

### 5. @retry_on_failure - Automatic retries

```python
from emergence_agent import Agent, retry_on_failure

class ReliableAgent(Agent):
    @retry_on_failure(max_retries=3, delay=1.0, backoff_multiplier=2.0)
    def call_external_api(self, data):
        """Automatically retries up to 3 times with exponential backoff"""
        response = requests.post("https://api.example.com/process", json=data)
        if response.status_code != 200:
            raise Exception(f"API call failed: {response.status_code}")
        return response.json()
```

### 6. @cache_result - Result caching

```python
from emergence_agent import Agent, cache_result

class CachingAgent(Agent):
    @cache_result(ttl_seconds=300)  # Cache for 5 minutes
    def expensive_calculation(self, x, y):
        """Results cached for 5 minutes"""
        time.sleep(2)  # Simulate expensive operation
        return x ** y
    
    @cache_result(ttl_seconds=60, key_func=lambda self, city: f"weather_{city}")
    def get_weather(self, city):
        """Custom cache key generation"""
        return {"city": city, "temperature": "22°C"}
```

### 7. @log_calls - Automatic logging

```python
from emergence_agent import Agent, log_calls

class LoggingAgent(Agent):
    @log_calls(level="info", include_args=True, include_result=True)
    def important_process(self, data):
        """All calls to this method are logged"""
        return {"processed": True}
    
    @log_calls(level="debug")
    def debug_method(self, data):
        """Debug-level logging"""
        return {"debug_info": data}
```

### 8. @timing_stats - Performance monitoring

```python
from emergence_agent import Agent, timing_stats

class MonitoredAgent(Agent):
    @timing_stats(include_args=True)
    def monitored_operation(self, size):
        """Timing statistics automatically collected"""
        # Simulate work proportional to size
        time.sleep(size * 0.1)
        return {"processed_size": size}
    
    def get_performance_stats(self):
        """Get collected timing statistics"""
        return self.get_timing_stats()
```

---

## Agent Types

### Simple Service Agent

```python
from emergence_agent import Agent, capability, request_handler, validate_input

class WeatherAgent(Agent):
    def setup(self):
        # Will be auto-declared by @capability decorator
        pass
    
    @capability("current_weather", "Get current weather for any city")
    @request_handler("weather")
    @validate_input(city={"type": "string", "required": True})
    def get_weather(self, city):
        """Get current weather - fully decorated"""
        # Mock weather data
        return {
            "city": city,
            "temperature": "22°C",
            "condition": "Sunny",
            "timestamp": self.get_timestamp()
        }

# Usage
agent = WeatherAgent(name="weather-service")
agent.start()
```

### Data Processing Agent

```python
from emergence_agent import Agent, capability, cache_result, timing_stats
import pandas as pd

class DataAgent(Agent):
    @capability("data_analysis", "Process and analyze CSV data")
    @cache_result(ttl_seconds=600)  # Cache results for 10 minutes
    @timing_stats(include_args=True)
    def analyze_csv(self, csv_data, analysis_type="summary"):
        """Analyze CSV data with caching and performance monitoring"""
        
        # Convert CSV string to DataFrame
        df = pd.read_csv(io.StringIO(csv_data))
        
        if analysis_type == "summary":
            return {
                "rows": len(df),
                "columns": list(df.columns),
                "summary": df.describe().to_dict()
            }
        elif analysis_type == "correlation":
            return {
                "correlation_matrix": df.corr().to_dict()
            }
        
        return {"error": "Unknown analysis type"}
    
    def handle_request(self, request_type, data):
        if request_type == "analyze_data":
            return self.analyze_csv(
                csv_data=data["csv"],
                analysis_type=data.get("type", "summary")
            )
        return {"error": "Unknown request"}
```

### Collaborative Agent

```python
from emergence_agent import Agent, find_agents, call_agent

class TravelPlannerAgent(Agent):
    def setup(self):
        self.declare_capability("travel_planning", "Plan complete trips")
    
    def handle_request(self, request_type, data):
        if request_type == "plan_trip":
            return self.plan_complete_trip(
                destination=data["destination"],
                duration=data["duration"],
                budget=data.get("budget")
            )
        return {"error": "Unknown request"}
    
    def plan_complete_trip(self, destination, duration, budget=None):
        """Collaborate with other agents to plan a trip"""
        plan = {"destination": destination, "duration": duration}
        
        # Find weather agent
        weather_agents = find_agents(capability="weather")
        if weather_agents:
            weather = call_agent(
                weather_agents[0]["name"],
                "weather",
                {"city": destination}
            )
            plan["weather"] = weather
        
        # Find booking agent
        booking_agents = find_agents(capability="booking")
        if booking_agents:
            hotels = call_agent(
                booking_agents[0]["name"], 
                "find_hotels",
                {"city": destination, "budget": budget}
            )
            plan["accommodations"] = hotels
        
        # Find translation agent for international trips
        translation_agents = find_agents(capability="translation")
        if translation_agents:
            common_phrases = call_agent(
                translation_agents[0]["name"],
                "translate_phrases",
                {"destination": destination, "phrases": ["hello", "thank you", "help"]}
            )
            plan["useful_phrases"] = common_phrases
        
        return {"trip_plan": plan}
```

### Async/High-Performance Agent

```python
from emergence_agent import AsyncAgent, capability
import asyncio
import aiohttp

class FastAPIAgent(AsyncAgent):
    async def setup(self):
        self.session = aiohttp.ClientSession()
        await self.declare_capability_async("bulk_processing", "Process multiple items concurrently")
    
    @capability("parallel_requests", "Make multiple API calls in parallel")
    async def process_urls_parallel(self, urls):
        """Process multiple URLs concurrently"""
        
        async def fetch_url(url):
            try:
                async with self.session.get(url) as response:
                    return {
                        "url": url,
                        "status": response.status,
                        "content_length": len(await response.text()),
                        "success": True
                    }
            except Exception as e:
                return {
                    "url": url,
                    "error": str(e),
                    "success": False
                }
        
        # Process all URLs concurrently
        tasks = [fetch_url(url) for url in urls]
        results = await asyncio.gather(*tasks)
        
        return {
            "processed_count": len(results),
            "success_count": sum(1 for r in results if r["success"]),
            "results": results
        }
    
    async def handle_request(self, request_type, data):
        if request_type == "process_urls":
            return await self.process_urls_parallel(data["urls"])
        return {"error": "Unknown request"}
    
    async def on_stop(self):
        """Clean up resources"""
        await self.session.close()
```

---

## Platform Integration

### Agent Discovery

```python
from emergence_agent import find_agents, call_agent

# Find all agents
all_agents = find_agents()
print(f"Total agents: {len(all_agents)}")

# Find by capability
weather_agents = find_agents(capability="weather")
data_agents = find_agents(capability="data_analysis")

# Find by category
utility_agents = find_agents(category="utility")

# Find only live agents (default)
live_agents = find_agents(live_only=True)

# Find all agents including offline
all_including_offline = find_agents(live_only=False)

# Print agent info
for agent in weather_agents:
    print(f"Agent: {agent['name']}")
    print(f"Description: {agent.get('description', 'No description')}")
    print(f"Capabilities: {agent.get('capabilities', [])}")
    print(f"Status: {agent.get('status', 'unknown')}")
    print("---")
```

### Agent Communication

```python
# Simple agent call
response = call_agent(
    agent_name="weather-agent",
    request_type="get_weather", 
    data={"city": "London"}
)

# Agent call with timeout
response = call_agent(
    agent_name="slow-agent",
    request_type="heavy_calculation",
    data={"numbers": [1, 2, 3, 4, 5]},
    timeout=60  # 60 second timeout
)

# Handle errors
try:
    response = call_agent("nonexistent-agent", "test", {})
except Exception as e:
    print(f"Agent call failed: {e}")

# Batch agent calls
agents_to_call = ["agent1", "agent2", "agent3"]
results = []
for agent_name in agents_to_call:
    try:
        result = call_agent(agent_name, "status_check", {})
        results.append({"agent": agent_name, "result": result, "success": True})
    except Exception as e:
        results.append({"agent": agent_name, "error": str(e), "success": False})
```

### Custom Platform Client

```python
from emergence_agent import EmergenceClient, AsyncEmergenceClient

# Synchronous client
client = EmergenceClient(
    api_key="your_key",
    base_url="https://your-platform.com",  # Custom platform URL
    timeout=30,  # Request timeout
    retry_attempts=3  # Retry failed requests
)

# Register agent with custom options
agent_data = {
    "name": "custom-agent",
    "description": "Agent with custom registration",
    "version": "2.0.0",
    "capabilities": ["custom_processing"],
    "metadata": {
        "author": "Your Name",
        "category": "utility",
        "tags": ["processing", "custom"]
    }
}

registration_response = client.register_agent(agent_data)

# Async client for high-performance applications
async def async_example():
    async_client = AsyncEmergenceClient(api_key="your_key")
    
    # Multiple concurrent operations
    tasks = [
        async_client.find_agents_async(capability="weather"),
        async_client.find_agents_async(capability="translation"),
        async_client.get_agent_status_async("my-agent")
    ]
    
    weather_agents, translation_agents, agent_status = await asyncio.gather(*tasks)
    
    await async_client.close()  # Clean up
    
    return {
        "weather_agents": len(weather_agents),
        "translation_agents": len(translation_agents), 
        "agent_status": agent_status
    }
```

---

## Advanced Features

### Custom Error Handling

```python
from emergence_agent import Agent
from emergence_agent.exceptions import ValidationError, PlatformError, RateLimitError

class RobustAgent(Agent):
    def handle_request(self, request_type, data):
        try:
            if request_type == "process_data":
                return self.process_with_validation(data)
            return {"error": "Unknown request type"}
            
        except ValidationError as e:
            self.log(f"Validation error: {e}", level="warning")
            return {"error": "Invalid input", "details": str(e)}
            
        except RateLimitError as e:
            self.log(f"Rate limited: {e}", level="warning")
            return {"error": "Rate limited", "retry_after": e.retry_after}
            
        except PlatformError as e:
            self.log(f"Platform error: {e}", level="error")
            return {"error": "Platform issue", "message": str(e)}
            
        except Exception as e:
            self.log(f"Unexpected error: {e}", level="error")
            return {"error": "Internal error"}
    
    def process_with_validation(self, data):
        # Your processing logic with potential errors
        if not data.get("required_field"):
            raise ValidationError("required_field is missing")
        
        return {"result": "processed successfully"}
    
    def on_error(self, error):
        """Global error handler"""
        self.log(f"Agent error: {error}", level="error")
        # Could send error notifications, restart components, etc.
```

### State Management

```python
from emergence_agent import Agent
import threading
import json
import os

class StatefulAgent(Agent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state_file = f"agent_state_{self.name}.json"
        self.state = {}
        self.state_lock = threading.Lock()
        self.load_state()
    
    def load_state(self):
        """Load agent state from disk"""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    self.state = json.load(f)
                self.log(f"Loaded state: {len(self.state)} items")
        except Exception as e:
            self.log(f"Failed to load state: {e}", level="error")
            self.state = {}
    
    def save_state(self):
        """Save agent state to disk"""
        try:
            with self.state_lock:
                with open(self.state_file, 'w') as f:
                    json.dump(self.state, f, indent=2)
            self.log("State saved successfully")
        except Exception as e:
            self.log(f"Failed to save state: {e}", level="error")
    
    def get_state_value(self, key, default=None):
        """Thread-safe state getter"""
        with self.state_lock:
            return self.state.get(key, default)
    
    def set_state_value(self, key, value):
        """Thread-safe state setter"""
        with self.state_lock:
            self.state[key] = value
        self.save_state()  # Persist immediately
    
    def handle_request(self, request_type, data):
        if request_type == "set_config":
            self.set_state_value(data["key"], data["value"])
            return {"success": True}
            
        elif request_type == "get_config":
            value = self.get_state_value(data["key"])
            return {"value": value}
            
        elif request_type == "get_all_state":
            with self.state_lock:
                return {"state": dict(self.state)}
        
        return {"error": "Unknown request"}
    
    def on_stop(self):
        """Save state when stopping"""
        self.save_state()
        super().on_stop()
```

### Custom Middleware

```python
from emergence_agent import Agent
import time
import uuid

class MiddlewareAgent(Agent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.middleware_stack = [
            self.request_id_middleware,
            self.timing_middleware,  
            self.logging_middleware,
            self.auth_middleware
        ]
    
    def request_id_middleware(self, request_type, data, next_middleware):
        """Add unique request ID"""
        request_id = str(uuid.uuid4())
        data["_request_id"] = request_id
        self.log(f"Processing request {request_id}", level="debug")
        
        response = next_middleware(request_type, data)
        response["_request_id"] = request_id
        return response
    
    def timing_middleware(self, request_type, data, next_middleware):
        """Time request processing"""
        start_time = time.time()
        response = next_middleware(request_type, data)
        
        processing_time = time.time() - start_time
        response["_processing_time"] = processing_time
        
        if processing_time > 1.0:  # Warn about slow requests
            self.log(f"Slow request: {processing_time:.2f}s", level="warning")
        
        return response
    
    def logging_middleware(self, request_type, data, next_middleware):
        """Log all requests"""
        self.log(f"Request: {request_type} with {len(str(data))} bytes data")
        
        response = next_middleware(request_type, data)
        
        self.log(f"Response: {len(str(response))} bytes")
        return response
    
    def auth_middleware(self, request_type, data, next_middleware):
        """Simple authentication check"""
        if request_type.startswith("admin_") and not data.get("admin_token"):
            return {"error": "Admin token required", "code": 401}
        
        return next_middleware(request_type, data)
    
    def handle_request(self, request_type, data):
        """Process request through middleware stack"""
        def execute_middleware(index):
            if index >= len(self.middleware_stack):
                # End of middleware stack - call actual handler
                return self.actual_handle_request(request_type, data)
            
            middleware = self.middleware_stack[index]
            return middleware(
                request_type, 
                data, 
                lambda rt, d: execute_middleware(index + 1)
            )
        
        return execute_middleware(0)
    
    def actual_handle_request(self, request_type, data):
        """Actual request processing logic"""
        if request_type == "echo":
            return {"echo": data}
        elif request_type == "admin_status":
            return {"status": "admin request processed"}
        else:
            return {"error": "Unknown request"}
```

---

## Best Practices

### 1. Agent Design Patterns

#### Single Responsibility Principle
```python
# ✅ Good: Focused agent
class WeatherAgent(Agent):
    """Agent focused solely on weather data"""
    
    def setup(self):
        self.declare_capability("current_weather", "Get current weather")
        self.declare_capability("weather_forecast", "Get weather forecast")
        self.declare_capability("weather_alerts", "Get weather alerts")

# ❌ Bad: Too many responsibilities
class SuperAgent(Agent):
    """Agent trying to do everything"""
    
    def setup(self):
        self.declare_capability("weather", "Weather data")
        self.declare_capability("translate", "Translation")
        self.declare_capability("stock_prices", "Stock data")
        self.declare_capability("email", "Send emails")
        # Too many unrelated capabilities!
```

#### Dependency Injection
```python
class ConfigurableAgent(Agent):
    def __init__(self, name, weather_api_key, database_url, **kwargs):
        super().__init__(name=name, **kwargs)
        self.weather_api = WeatherAPI(api_key=weather_api_key)
        self.database = Database(url=database_url)
    
    def setup(self):
        self.declare_capability("weather_with_history", "Weather data with historical context")
    
    def handle_request(self, request_type, data):
        if request_type == "weather_history":
            current = self.weather_api.get_current(data["city"])
            history = self.database.get_weather_history(data["city"])
            return {"current": current, "history": history}
```

### 2. Error Handling Strategy

```python
from emergence_agent import Agent
from emergence_agent.exceptions import *

class ReliableAgent(Agent):
    def handle_request(self, request_type, data):
        try:
            return self.process_request(request_type, data)
        except ValidationError as e:
            # Client error - return helpful message
            return {"error": "invalid_input", "message": str(e), "code": 400}
        except RateLimitError as e:
            # Rate limited - include retry info
            return {"error": "rate_limited", "retry_after": e.retry_after, "code": 429}
        except TimeoutError as e:
            # Timeout - suggest retry
            return {"error": "timeout", "message": "Request timed out, please retry", "code": 504}
        except Exception as e:
            # Internal error - log but don't expose details
            self.log(f"Internal error: {e}", level="error")
            return {"error": "internal_error", "message": "An internal error occurred", "code": 500}
    
    def process_request(self, request_type, data):
        # Your actual processing logic
        if request_type == "process":
            self.validate_input(data)  # May raise ValidationError
            return self.do_processing(data)  # May raise other errors
        
        raise ValidationError(f"Unknown request type: {request_type}")
```

### 3. Performance Optimization

```python
from emergence_agent import Agent, cache_result, rate_limit, timing_stats
import asyncio

class OptimizedAgent(Agent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.connection_pool = None  # Initialize connection pooling
    
    @cache_result(ttl_seconds=300)  # Cache expensive operations
    @timing_stats(include_args=True)  # Monitor performance
    def expensive_calculation(self, input_data):
        """Cache results for expensive operations"""
        # Expensive computation here
        result = sum(x**2 for x in input_data)
        return {"result": result}
    
    @rate_limit(requests_per_second=10.0)  # Prevent overwhelming
    def api_dependent_operation(self, data):
        """Rate limit operations that depend on external APIs"""
        return self.call_external_api(data)
    
    def batch_process(self, items):
        """Process multiple items efficiently"""
        # Process in batches rather than one-by-one
        batch_size = 50
        results = []
        
        for i in range(0, len(items), batch_size):
            batch = items[i:i + batch_size]
            batch_results = self.process_batch(batch)
            results.extend(batch_results)
        
        return results
```

### 4. Testing Strategy

```python
import unittest
from unittest.mock import patch, MagicMock
from emergence_agent import Agent

class TestableAgent(Agent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.external_api = None  # Will be injected
    
    def setup(self):
        self.declare_capability("data_processing", "Process data")
    
    def handle_request(self, request_type, data):
        if request_type == "process":
            external_data = self.external_api.fetch_data(data["id"])
            processed = self.process_data(external_data)
            return {"result": processed}
        return {"error": "Unknown request"}
    
    def process_data(self, data):
        """Pure function - easy to test"""
        return {"processed": True, "count": len(data)}

class TestAgent(unittest.TestCase):
    def setUp(self):
        self.agent = TestableAgent(name="test-agent", auto_register=False)
        self.agent.external_api = MagicMock()
    
    def test_data_processing(self):
        """Test core data processing logic"""
        test_data = ["item1", "item2", "item3"]
        result = self.agent.process_data(test_data)
        
        self.assertEqual(result["processed"], True)
        self.assertEqual(result["count"], 3)
    
    def test_handle_request(self):
        """Test request handling with mocked dependencies"""
        self.agent.external_api.fetch_data.return_value = ["data1", "data2"]
        
        response = self.agent.handle_request("process", {"id": "test123"})
        
        self.assertTrue(response["result"]["processed"])
        self.assertEqual(response["result"]["count"], 2)
        self.agent.external_api.fetch_data.assert_called_with("test123")
    
    def test_unknown_request(self):
        """Test error handling"""
        response = self.agent.handle_request("unknown", {})
        self.assertIn("error", response)

if __name__ == "__main__":
    unittest.main()
```

### 5. Security Best Practices

```python
from emergence_agent import Agent, validate_input
import hashlib
import secrets

class SecureAgent(Agent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.api_keys = {}  # Store API keys securely
        self.rate_limits = {}  # Track rate limits per client
    
    def setup(self):
        self.declare_capability("secure_processing", "Secure data processing")
    
    @validate_input(
        data={"type": "string", "required": True},
        client_id={"type": "string", "required": True},
        signature={"type": "string", "required": True}
    )
    def handle_secure_request(self, data, client_id, signature):
        """Secure request handler with signature validation"""
        
        # Validate client signature
        if not self.validate_signature(data, client_id, signature):
            return {"error": "Invalid signature", "code": 403}
        
        # Rate limiting per client
        if not self.check_rate_limit(client_id):
            return {"error": "Rate limit exceeded", "code": 429}
        
        # Sanitize input data
        sanitized_data = self.sanitize_input(data)
        
        # Process data
        result = self.process_securely(sanitized_data)
        
        return {"result": result}
    
    def validate_signature(self, data, client_id, signature):
        """Validate HMAC signature"""
        if client_id not in self.api_keys:
            return False
        
        expected_signature = hmac.new(
            self.api_keys[client_id].encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    def sanitize_input(self, data):
        """Remove potentially dangerous characters"""
        # Remove script tags, SQL injection attempts, etc.
        dangerous_patterns = ['<script', 'SELECT ', 'DROP ', 'INSERT ']
        for pattern in dangerous_patterns:
            data = data.replace(pattern, '')
        return data
    
    def check_rate_limit(self, client_id):
        """Simple rate limiting implementation"""
        now = time.time()
        if client_id not in self.rate_limits:
            self.rate_limits[client_id] = []
        
        # Remove old requests (older than 1 minute)
        self.rate_limits[client_id] = [
            req_time for req_time in self.rate_limits[client_id]
            if now - req_time < 60
        ]
        
        # Check if under limit (100 requests per minute)
        if len(self.rate_limits[client_id]) >= 100:
            return False
        
        # Add current request
        self.rate_limits[client_id].append(now)
        return True
```

---

## API Reference

### Agent Class

```python
class Agent:
    def __init__(self, 
                 name: str,
                 description: str = "",
                 version: str = "1.0.0", 
                 api_key: Optional[str] = None,
                 webhook_url: Optional[str] = None,
                 heartbeat_interval: int = 60,
                 enable_webhooks: bool = False,
                 enable_async: bool = False,
                 auto_register: bool = True):
        """Initialize agent"""
    
    def setup(self) -> None:
        """Override to setup agent capabilities"""
    
    def handle_request(self, request_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Override to handle incoming requests"""
    
    def declare_capability(self, name: str, description: str) -> None:
        """Declare a capability this agent provides"""
    
    def register_handler(self, request_type: str, handler: Callable) -> None:
        """Register a request handler function"""
    
    def find_agents(self, capability: Optional[str] = None) -> List[Dict[str, Any]]:
        """Find other agents on the platform"""
    
    def call_agent(self, agent_name: str, request_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Call another agent"""
    
    def start(self) -> None:
        """Start the agent (blocks until stopped)"""
    
    def stop(self) -> None:
        """Stop the agent"""
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status information"""
    
    def log(self, message: str, level: str = "info") -> None:
        """Log a message"""
    
    def get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
    
    # Lifecycle hooks
    def on_start(self) -> None:
        """Called when agent starts"""
    
    def on_stop(self) -> None:
        """Called when agent stops"""
    
    def on_error(self, error: Exception) -> None:
        """Called when agent encounters error"""
```

### Global Functions

```python
def find_agents(capability: Optional[str] = None, 
               category: Optional[str] = None,
               live_only: bool = True,
               api_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """Find agents on the platform"""

def call_agent(agent_name: str, 
              request_type: str, 
              data: Dict[str, Any],
              timeout: int = 30,
              api_key: Optional[str] = None) -> Dict[str, Any]:
    """Call an agent on the platform"""

def get_version() -> str:
    """Get SDK version"""

def get_api_version() -> str:
    """Get API version"""
```

### Decorators

```python
@capability(name: str, 
           description: str,
           parameters: Optional[Dict] = None,
           returns: Optional[Dict] = None,
           examples: Optional[List[Dict]] = None)
    """Auto-declare capability when method is defined"""

@request_handler(request_type: str)
    """Auto-route requests to this method"""

@validate_input(**field_specs)
    """Validate input parameters"""

@rate_limit(requests_per_second: float, burst_size: int = 10)
    """Rate limit method calls"""

@retry_on_failure(max_retries: int = 3, delay: float = 1.0, backoff_multiplier: float = 2.0)
    """Retry method calls on failure"""

@cache_result(ttl_seconds: int, key_func: Optional[Callable] = None)
    """Cache method results"""

@log_calls(level: str = "info", include_args: bool = False, include_result: bool = False)
    """Log method calls"""

@timing_stats(include_args: bool = False)
    """Track timing statistics"""
```

### Exceptions

```python
class EmergenceError(Exception):
    """Base exception for all Emergence SDK errors"""

class AuthenticationError(EmergenceError):
    """Authentication failed"""

class ValidationError(EmergenceError):
    """Input validation failed"""

class PlatformError(EmergenceError):
    """Platform communication error"""

class TimeoutError(EmergenceError):
    """Request timed out"""

class RateLimitError(EmergenceError):
    """Rate limit exceeded"""
    
    def __init__(self, message, retry_after: int = None):
        super().__init__(message)
        self.retry_after = retry_after
```

---

## Examples

### Complete Weather Service Agent

```python
from emergence_agent import Agent, capability, request_handler, validate_input, cache_result
import requests
import os

class WeatherServiceAgent(Agent):
    def __init__(self):
        super().__init__(
            name="weather-service",
            description="Professional weather service with real API integration",
            version="2.0.0"
        )
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        if not self.api_key:
            raise ValueError("OPENWEATHER_API_KEY environment variable required")
    
    def setup(self):
        # Capabilities will be auto-declared by decorators
        self.log("Weather service initialized with OpenWeatherMap API")
    
    @capability(
        name="current_weather",
        description="Get current weather conditions for any city",
        parameters={
            "city": {"type": "string", "required": True, "description": "City name"},
            "units": {"type": "string", "enum": ["metric", "imperial", "kelvin"], "default": "metric"}
        },
        returns={
            "temperature": {"type": "number", "description": "Temperature in specified units"},
            "condition": {"type": "string", "description": "Weather condition"},
            "humidity": {"type": "number", "description": "Humidity percentage"},
            "wind_speed": {"type": "number", "description": "Wind speed"}
        },
        examples=[{
            "input": {"city": "London", "units": "metric"},
            "output": {"temperature": 15.5, "condition": "Cloudy", "humidity": 78, "wind_speed": 12.3}
        }]
    )
    @request_handler("current_weather")
    @validate_input(
        city={"type": "string", "required": True, "min_length": 2},
        units={"type": "string", "enum": ["metric", "imperial", "kelvin"], "default": "metric"}
    )
    @cache_result(ttl_seconds=600)  # Cache for 10 minutes
    def get_current_weather(self, city: str, units: str = "metric") -> dict:
        """Get current weather with caching"""
        
        url = f"http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": self.api_key,
            "units": units
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 404:
            return {"error": "City not found", "city": city}
        elif response.status_code != 200:
            return {"error": "Weather service unavailable", "status_code": response.status_code}
        
        data = response.json()
        
        return {
            "city": data["name"],
            "country": data["sys"]["country"],
            "temperature": data["main"]["temp"],
            "condition": data["weather"][0]["description"].title(),
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"].get("speed", 0),
            "units": units,
            "timestamp": self.get_timestamp()
        }
    
    @capability(
        name="weather_forecast", 
        description="Get 5-day weather forecast",
        parameters={
            "city": {"type": "string", "required": True},
            "days": {"type": "number", "min": 1, "max": 5, "default": 3}
        }
    )
    @request_handler("forecast")
    @validate_input(
        city={"type": "string", "required": True},
        days={"type": "number", "min": 1, "max": 5, "default": 3}
    )
    @cache_result(ttl_seconds=1800)  # Cache for 30 minutes
    def get_forecast(self, city: str, days: int = 3) -> dict:
        """Get weather forecast"""
        
        url = f"http://api.openweathermap.org/data/2.5/forecast"
        params = {
            "q": city,
            "appid": self.api_key,
            "units": "metric"
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            return {"error": "Forecast service unavailable"}
        
        data = response.json()
        
        # Process forecast data (OpenWeatherMap returns 5-day forecast in 3-hour intervals)
        forecast = []
        for i, item in enumerate(data["list"][:days * 8]):  # 8 intervals per day
            if i % 8 == 0:  # Take one reading per day
                forecast.append({
                    "date": item["dt_txt"].split()[0],
                    "temperature": item["main"]["temp"],
                    "condition": item["weather"][0]["description"].title(),
                    "humidity": item["main"]["humidity"]
                })
        
        return {
            "city": data["city"]["name"],
            "country": data["city"]["country"],
            "forecast": forecast[:days],
            "timestamp": self.get_timestamp()
        }
    
    def handle_request(self, request_type: str, data: dict) -> dict:
        """Handle requests not covered by decorators"""
        if request_type == "health_check":
            return {
                "status": "healthy",
                "api_connected": bool(self.api_key),
                "uptime": self.get_uptime(),
                "capabilities": ["current_weather", "weather_forecast"]
            }
        
        return {"error": f"Unknown request type: {request_type}"}
    
    def get_uptime(self) -> float:
        """Get agent uptime in seconds"""
        return time.time() - self.start_time if hasattr(self, 'start_time') else 0
    
    def on_start(self):
        """Track start time"""
        import time
        self.start_time = time.time()
        self.log("Weather service agent started and ready!")

# Run the weather service
if __name__ == "__main__":
    try:
        agent = WeatherServiceAgent()
        print("🌤️  Weather Service Agent Starting...")
        print("📋 Available capabilities:")
        print("   - current_weather: Get current weather for any city")  
        print("   - weather_forecast: Get 5-day weather forecast")
        print("🌐 Make sure you have OPENWEATHER_API_KEY environment variable set")
        print("🔑 Make sure you have EMERGENCE_API_KEY environment variable set")
        print("⭐ Agent ready! Press Ctrl+C to stop.\n")
        
        agent.start()
    except KeyboardInterrupt:
        print("\n🛑 Weather service stopping...")
    except Exception as e:
        print(f"❌ Failed to start weather service: {e}")
```

### Multi-Agent Collaboration Example

```python
from emergence_agent import Agent, find_agents, call_agent
import asyncio
from typing import List, Dict

class TravelCoordinatorAgent(Agent):
    """Coordinates multiple agents to plan complete trips"""
    
    def setup(self):
        self.declare_capability("travel_planning", "Complete travel planning coordination")
        self.declare_capability("multi_agent_orchestration", "Coordinate multiple specialized agents")
    
    def handle_request(self, request_type: str, data: dict) -> dict:
        if request_type == "plan_trip":
            return self.plan_complete_trip(
                destination=data["destination"],
                dates=data["dates"],
                budget=data.get("budget"),
                preferences=data.get("preferences", {})
            )
        elif request_type == "get_travel_agents":
            return self.discover_travel_agents()
        
        return {"error": "Unknown request type"}
    
    def discover_travel_agents(self) -> dict:
        """Find all available travel-related agents"""
        
        # Find agents by capability
        weather_agents = find_agents(capability="weather")
        booking_agents = find_agents(capability="booking") 
        translation_agents = find_agents(capability="translation")
        currency_agents = find_agents(capability="currency_conversion")
        review_agents = find_agents(capability="reviews")
        
        return {
            "available_agents": {
                "weather": len(weather_agents),
                "booking": len(booking_agents), 
                "translation": len(translation_agents),
                "currency": len(currency_agents),
                "reviews": len(review_agents)
            },
            "total_agents": sum([
                len(weather_agents),
                len(booking_agents),
                len(translation_agents), 
                len(currency_agents),
                len(review_agents)
            ])
        }
    
    def plan_complete_trip(self, destination: str, dates: dict, budget: float = None, preferences: dict = None) -> dict:
        """Orchestrate multiple agents to plan a complete trip"""
        
        self.log(f"Planning trip to {destination} for {dates}")
        
        trip_plan = {
            "destination": destination,
            "dates": dates,
            "budget": budget,
            "preferences": preferences or {},
            "components": {}
        }
        
        # Step 1: Get weather information
        trip_plan["components"]["weather"] = self.get_weather_info(destination, dates)
        
        # Step 2: Find accommodations
        if budget:
            trip_plan["components"]["accommodation"] = self.find_accommodations(destination, dates, budget * 0.4)
        
        # Step 3: Get local information and reviews
        trip_plan["components"]["local_info"] = self.get_local_information(destination)
        
        # Step 4: Get currency and cost information
        trip_plan["components"]["financial"] = self.get_financial_info(destination, budget)
        
        # Step 5: Get language information
        trip_plan["components"]["language"] = self.get_language_info(destination)
        
        # Step 6: Generate summary and recommendations
        trip_plan["summary"] = self.generate_trip_summary(trip_plan)
        
        return trip_plan
    
    def get_weather_info(self, destination: str, dates: dict) -> dict:
        """Get weather information from weather agents"""
        weather_agents = find_agents(capability="weather")
        
        if not weather_agents:
            return {"error": "No weather agents available"}
        
        try:
            # Try current weather first
            weather_response = call_agent(
                weather_agents[0]["name"],
                "current_weather", 
                {"city": destination}
            )
            
            # Try to get forecast if available
            try:
                forecast_response = call_agent(
                    weather_agents[0]["name"],
                    "forecast",
                    {"city": destination, "days": 5}
                )
                weather_response["forecast"] = forecast_response.get("forecast", [])
            except:
                pass  # Forecast not available
            
            return weather_response
            
        except Exception as e:
            self.log(f"Weather service failed: {e}", level="warning")
            return {"error": "Weather information unavailable"}
    
    def find_accommodations(self, destination: str, dates: dict, budget: float) -> dict:
        """Find accommodations using booking agents"""
        booking_agents = find_agents(capability="booking")
        
        if not booking_agents:
            return {"error": "No booking agents available"}
        
        try:
            response = call_agent(
                booking_agents[0]["name"],
                "search_hotels",
                {
                    "destination": destination,
                    "check_in": dates.get("start"),
                    "check_out": dates.get("end"), 
                    "budget": budget
                }
            )
            return response
            
        except Exception as e:
            self.log(f"Booking service failed: {e}", level="warning")
            return {"error": "Accommodation search unavailable"}
    
    def get_local_information(self, destination: str) -> dict:
        """Get local reviews and recommendations"""
        review_agents = find_agents(capability="reviews")
        
        if not review_agents:
            return {"error": "No review agents available"}
        
        try:
            response = call_agent(
                review_agents[0]["name"],
                "get_recommendations",
                {"location": destination, "categories": ["restaurants", "attractions", "activities"]}
            )
            return response
            
        except Exception as e:
            self.log(f"Review service failed: {e}", level="warning")
            return {"error": "Local information unavailable"}
    
    def get_financial_info(self, destination: str, budget: float) -> dict:
        """Get currency and financial information"""
        currency_agents = find_agents(capability="currency_conversion")
        
        if not currency_agents:
            return {"error": "No currency agents available"}
        
        try:
            response = call_agent(
                currency_agents[0]["name"],
                "get_exchange_rate",
                {"destination_country": destination}
            )
            
            if budget and "exchange_rate" in response:
                response["local_budget"] = budget * response["exchange_rate"]
            
            return response
            
        except Exception as e:
            self.log(f"Currency service failed: {e}", level="warning")  
            return {"error": "Financial information unavailable"}
    
    def get_language_info(self, destination: str) -> dict:
        """Get language and translation information"""
        translation_agents = find_agents(capability="translation")
        
        if not translation_agents:
            return {"error": "No translation agents available"}
        
        try:
            # Get common phrases for travelers
            common_phrases = [
                "Hello", "Thank you", "Excuse me", "Where is the bathroom?",
                "How much does this cost?", "I need help", "Do you speak English?"
            ]
            
            response = call_agent(
                translation_agents[0]["name"],
                "translate_phrases",
                {
                    "destination": destination,
                    "phrases": common_phrases,
                    "source_language": "en"
                }
            )
            return response
            
        except Exception as e:
            self.log(f"Translation service failed: {e}", level="warning")
            return {"error": "Language information unavailable"}
    
    def generate_trip_summary(self, trip_plan: dict) -> dict:
        """Generate a summary of the trip plan"""
        
        components = trip_plan["components"]
        successful_components = [k for k, v in components.items() if "error" not in v]
        failed_components = [k for k, v in components.items() if "error" in v]
        
        summary = {
            "planning_complete": len(failed_components) == 0,
            "successful_components": successful_components,
            "failed_components": failed_components,
            "completion_rate": len(successful_components) / len(components) * 100
        }
        
        # Add recommendations based on available information
        recommendations = []
        
        if "weather" in successful_components:
            weather = components["weather"]
            if weather.get("temperature", 0) < 10:
                recommendations.append("Pack warm clothing - temperatures are cold")
            elif weather.get("temperature", 0) > 30:
                recommendations.append("Pack light, breathable clothing - temperatures are hot")
        
        if "accommodation" in successful_components:
            accommodations = components["accommodation"]
            if accommodations.get("hotels"):
                recommendations.append(f"Found {len(accommodations['hotels'])} accommodation options")
        
        if "language" in successful_components:
            recommendations.append("Essential phrases translated - check language section")
        
        summary["recommendations"] = recommendations
        
        return summary
    
    def on_start(self):
        """Discover available agents when starting"""
        agents_info = self.discover_travel_agents()
        self.log(f"Travel coordinator started! Found {agents_info['total_agents']} travel-related agents")

# Usage Example
if __name__ == "__main__":
    try:
        coordinator = TravelCoordinatorAgent(name="travel-coordinator")
        print("🧳 Travel Coordinator Agent Starting...")
        print("🤝 This agent coordinates multiple specialized agents:")
        print("   - Weather agents for destination weather")
        print("   - Booking agents for accommodations")  
        print("   - Translation agents for language help")
        print("   - Currency agents for financial information")
        print("   - Review agents for local recommendations")
        print("⭐ Agent ready! Press Ctrl+C to stop.\n")
        
        coordinator.start()
    except KeyboardInterrupt:
        print("\n🛑 Travel coordinator stopping...")
    except Exception as e:
        print(f"❌ Failed to start travel coordinator: {e}")
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "ImportError: No module named 'emergence_agent'"

**Problem**: SDK not installed or wrong Python environment.

**Solutions**:
```bash
# Check if installed
pip list | grep emergence-agent

# Install if missing
pip install emergence-agent

# Check Python environment
python -c "import sys; print(sys.executable)"

# If using virtual environment, activate it first
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
```

#### 2. "AuthenticationError: Invalid API key"

**Problem**: Missing or incorrect API key.

**Solutions**:
```bash
# Check if API key is set
echo $EMERGENCE_API_KEY

# Set API key
export EMERGENCE_API_KEY="your_api_key_here"

# Test API key
python -c "
from emergence_agent import EmergenceClient
client = EmergenceClient()
try:
    agents = client.find_agents()
    print('✅ API key is valid')
except Exception as e:
    print(f'❌ API key error: {e}')
"
```

#### 3. "PlatformError: Could not connect to platform"

**Problem**: Platform is unreachable or wrong URL.

**Solutions**:
```bash
# Check platform URL
echo $EMERGENCE_PLATFORM_URL

# Test platform connectivity  
curl -I https://platform.emergence.ai/api/health

# Set correct platform URL
export EMERGENCE_PLATFORM_URL="https://your-platform.com"

# Test with different timeout
python -c "
from emergence_agent import EmergenceClient
client = EmergenceClient(timeout=60)  # Increase timeout
"
```

#### 4. "ValidationError: Required field missing"

**Problem**: Invalid input data format.

**Solutions**:
```python
# Check what fields are required
from emergence_agent import Agent, ValidationError

class DebugAgent(Agent):
    def handle_request(self, request_type, data):
        try:
            return self.process_request(request_type, data)
        except ValidationError as e:
            self.log(f"Validation error: {e}")
            self.log(f"Received data: {data}")
            return {"error": "validation_failed", "details": str(e)}
    
    def process_request(self, request_type, data):
        # Your processing logic with validation
        if "required_field" not in data:
            raise ValidationError("required_field is missing from request data")
        return {"success": True}
```

#### 5. "RateLimitError: Too many requests"

**Problem**: Exceeded rate limits.

**Solutions**:
```python
from emergence_agent import Agent, RateLimitError
import time

class RateLimitedAgent(Agent):
    def handle_request(self, request_type, data):
        try:
            return self.process_request(request_type, data)
        except RateLimitError as e:
            self.log(f"Rate limited, waiting {e.retry_after}s")
            time.sleep(e.retry_after)
            return self.process_request(request_type, data)  # Retry once
    
    def process_request(self, request_type, data):
        # Your processing logic
        return {"result": "processed"}
```

#### 6. Agent Registration Fails

**Problem**: Agent name conflicts or registration issues.

**Solutions**:
```python
from emergence_agent import Agent
import uuid

class UniqueAgent(Agent):
    def __init__(self):
        # Generate unique name to avoid conflicts
        unique_id = str(uuid.uuid4())[:8]
        super().__init__(
            name=f"my-agent-{unique_id}",
            auto_register=False  # Manual registration for debugging
        )
    
    def start(self):
        try:
            # Manual registration with error handling
            self.register_with_platform()
            self.log("✅ Registration successful")
            super().start()
        except Exception as e:
            self.log(f"❌ Registration failed: {e}")
            
            # Try with different name
            self.name = f"backup-{self.name}"
            self.log(f"Retrying with name: {self.name}")
            self.register_with_platform()
            super().start()
```

### Debugging Tips

#### 1. Enable Debug Logging
```python
from emergence_agent import Agent
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

class DebugAgent(Agent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.debug_mode = True
    
    def handle_request(self, request_type, data):
        if self.debug_mode:
            self.log(f"DEBUG: Received request: {request_type}", level="debug")
            self.log(f"DEBUG: Request data: {data}", level="debug")
        
        result = self.process_request(request_type, data)
        
        if self.debug_mode:
            self.log(f"DEBUG: Response: {result}", level="debug")
        
        return result
```

#### 2. Test Agent Locally
```python
from emergence_agent import Agent

class TestAgent(Agent):
    def __init__(self):
        super().__init__(
            name="test-agent",
            auto_register=False  # Don't register with platform
        )
    
    def handle_request(self, request_type, data):
        return {"echo": f"Received {request_type} with {data}"}

# Test locally without platform
agent = TestAgent()
result = agent.handle_request("test", {"key": "value"})
print(f"Local test result: {result}")
```

#### 3. Monitor Agent Performance
```python
from emergence_agent import Agent, timing_stats
import time

class MonitoredAgent(Agent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.request_count = 0
        self.error_count = 0
    
    @timing_stats(include_args=True)
    def handle_request(self, request_type, data):
        self.request_count += 1
        
        try:
            result = self.process_request(request_type, data)
            return result
        except Exception as e:
            self.error_count += 1
            self.log(f"Error processing request: {e}", level="error")
            raise
    
    def get_metrics(self):
        return {
            "requests_processed": self.request_count,
            "errors_encountered": self.error_count,
            "error_rate": self.error_count / max(self.request_count, 1) * 100,
            "timing_stats": self.get_timing_stats()
        }
```

### Getting Help

#### 1. Check SDK Documentation
```python
from emergence_agent import Agent
help(Agent)  # Get detailed help for Agent class
```

#### 2. Check Package Information  
```python
import emergence_agent
print(f"Version: {emergence_agent.__version__}")
print(f"API Version: {emergence_agent.__api_version__}")
print(f"Package Info: {emergence_agent.__package_info__}")
```

#### 3. Enable Verbose Logging
```python
import os
os.environ['EMERGENCE_LOG_LEVEL'] = 'DEBUG'
os.environ['EMERGENCE_VERBOSE'] = '1'

from emergence_agent import Agent
# Now all operations will have verbose logging
```

---

## Conclusion

The **Emergence Agent SDK** provides everything you need to build powerful, collaborative AI agents:

### ✅ **What You've Learned**
- **Core Concepts**: Agent classes, capabilities, and platform integration
- **Decorators**: Powerful tools for validation, caching, and rate limiting
- **Best Practices**: Security, performance, testing, and error handling
- **Advanced Features**: Async agents, webhooks, and multi-agent coordination
- **Troubleshooting**: Common issues and debugging techniques

### 🚀 **Next Steps**
1. **Start Simple**: Create a basic agent with one capability
2. **Add Features**: Integrate decorators for validation and caching
3. **Test Thoroughly**: Use the testing patterns provided
4. **Deploy**: Use webhooks or async agents for production
5. **Collaborate**: Build agents that work with other agents
6. **Monitor**: Add logging and performance monitoring
7. **Scale**: Use the async features for high-performance scenarios

### 📚 **Additional Resources**
- **GitHub**: https://github.com/emergence-platform/emergence-agent-sdk
- **Documentation**: https://docs.emergence.ai/sdk
- **Examples**: https://github.com/emergence-platform/agent-examples
- **Community**: https://discord.gg/emergence-platform

### 🤝 **Getting Help**
- **Issues**: Report bugs on GitHub
- **Discussions**: Join the community Discord
- **Documentation**: Check the online docs
- **Support**: Contact support@emergence.ai

---

*Happy agent building! 🤖✨*

**The Emergence Platform Team**  
*Building the future of collaborative AI*