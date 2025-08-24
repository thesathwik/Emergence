# Agent Collaboration Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Agent Capability Declaration](#agent-capability-declaration)
3. [Agent Discovery](#agent-discovery)
4. [Inter-Agent Communication](#inter-agent-communication)
5. [Common Collaboration Patterns](#common-collaboration-patterns)
6. [Error Handling & Best Practices](#error-handling--best-practices)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Configuration Reference](#configuration-reference)

---

## Introduction

The Emergence platform enables seamless collaboration between agents through a sophisticated discovery and communication system. Agents can declare their capabilities, find other agents with specific skills, and call methods on remote agents to accomplish complex tasks together.

### Key Features
- 🔍 **Agent Discovery**: Find agents by capability
- 📞 **Remote Method Calls**: Invoke methods on other agents
- 🛡️ **Secure Communication**: API key authentication and rate limiting
- 🔄 **Retry Logic**: Automatic retry with exponential backoff
- 📊 **Logging & Monitoring**: Comprehensive audit trail
- ⚙️ **Configurable**: Fine-tune collaboration behavior

---

## Agent Capability Declaration

### Overview
Capabilities are standardized tags that describe what your agent can do. Other agents use these capabilities to find and collaborate with your agent.

### Available Capabilities

| Capability | Description | Use Cases |
|------------|-------------|-----------|
| `email-processing` | Handle emails, parse content, send responses | Email automation, customer service |
| `data-processing` | Process CSV, JSON, databases, analytics | Data analysis, reporting |
| `customer-support` | Handle customer inquiries, ticket management | Support automation, FAQ responses |
| `content-generation` | Create articles, posts, documentation | Marketing, content creation |
| `web-scraping` | Extract data from websites | Data collection, monitoring |
| `api-integration` | Connect to external APIs, data sync | System integration, data flow |
| `file-processing` | Handle file uploads, conversions, parsing | Document processing, format conversion |
| `scheduling` | Manage calendars, appointments, reminders | Meeting coordination, task scheduling |
| `database` | Database operations, queries, migrations | Data management, persistence |
| `monitoring` | System monitoring, alerts, health checks | Infrastructure monitoring, alerting |
| `social-media` | Post to social platforms, engagement | Social media automation, community management |
| `image-processing` | Image analysis, editing, optimization | Media processing, computer vision |
| `nlp` | Natural language processing, sentiment analysis | Text analysis, language understanding |
| `ml-prediction` | Machine learning models, predictions | AI/ML services, data science |
| `workflow-automation` | Business process automation | Process optimization, task coordination |

### Implementation

```python
def declare_capabilities(self):
    """
    Override this method to declare what your agent can do.
    Return a list of capabilities from the available options above.
    """
    # Example: Email processing agent
    return ["email-processing", "customer-support", "nlp"]
    
    # Example: Data analysis agent
    return ["data-processing", "database", "ml-prediction"]
    
    # Example: Content creation agent
    return ["content-generation", "nlp", "social-media"]
    
    # Example: Multi-purpose agent
    return ["email-processing", "data-processing", "api-integration"]
```

### Method Declaration

```python
def declare_methods(self):
    """
    Declare what methods other agents can call on your agent.
    Return a dictionary of method_name -> description.
    """
    # Example: Email processing agent
    return {
        "process_email": "Process incoming email and extract key information",
        "send_email": "Send email with given subject and body",
        "classify_email": "Classify email as support, sales, or billing",
        "extract_contact_info": "Extract contact information from email content"
    }
    
    # Example: Data processing agent
    return {
        "analyze_csv": "Analyze CSV file and return insights",
        "generate_report": "Generate data analysis report",
        "clean_data": "Clean and normalize data",
        "run_prediction": "Run ML prediction on provided data"
    }
```

---

## Agent Discovery

### Basic Discovery

```python
# Find all available agents
all_agents = self.find_agents()
print(f"Found {len(all_agents)} agents total")

# Find agents with specific capability
email_agents = self.find_agents("email-processing")
for agent in email_agents:
    print(f"Email agent: {agent['instance_name']} - {agent['instance_id']}")
```

### Advanced Discovery

```python
# Find multiple capability types
data_agents = self.find_agents("data-processing")
support_agents = self.find_agents("customer-support")
ml_agents = self.find_agents("ml-prediction")

# Check agent details
for agent in data_agents:
    print(f"Agent: {agent['instance_name']}")
    print(f"Capabilities: {agent.get('capabilities', [])}")
    print(f"Available methods: {list(agent.get('methods', {}).keys())}")
    print(f"Status: {agent.get('status', 'unknown')}")
```

### Discovery Response Format

```python
# Each agent in the discovery results has this structure:
{
    "instance_id": "agent-123",
    "instance_name": "email-processor-1",
    "agent_id": "email-agent",
    "capabilities": ["email-processing", "nlp"],
    "methods": {
        "process_email": "Process incoming email...",
        "classify_email": "Classify email type..."
    },
    "status": "running",
    "last_seen": "2024-01-15T10:30:00Z"
}
```

---

## Inter-Agent Communication

### Basic Agent Calls

```python
# Simple status check
response = self.call_agent("agent-123", "status")
if response and not response.get("error"):
    print(f"Agent status: {response}")

# Call with data
response = self.call_agent("agent-123", "process_email", {
    "subject": "Customer inquiry",
    "body": "How do I return an item?",
    "sender": "customer@example.com"
})
```

### Advanced Communication

```python
# Call with custom timeout
response = self.call_agent(
    agent_id="data-agent-456", 
    method="analyze_large_dataset",
    data={"file_path": "/path/to/big_data.csv"},
    timeout=300  # 5 minutes for large data processing
)

# Handle response
if response and not response.get("error"):
    results = response.get("analysis_results", {})
    print(f"Analysis complete: {results}")
else:
    print(f"Analysis failed: {response.get('error', 'Unknown error')}")
```

### Response Handling

```python
def handle_agent_response(self, response):
    """Standard response handling pattern"""
    if not response:
        return {"error": "No response received"}
    
    if response.get("error"):
        error_type = response.get("type", "unknown")
        if error_type == "timeout":
            print("Agent call timed out - may retry later")
        elif error_type == "connection_error":
            print("Network issue - agent may be offline")
        else:
            print(f"Agent error: {response['error']}")
        return None
    
    return response  # Success case
```

---

## Common Collaboration Patterns

### Pattern 1: Email Processing Workflow

```python
def process_incoming_emails(self):
    """Multi-agent email processing workflow"""
    new_emails = self.check_inbox()
    
    for email in new_emails:
        # Step 1: Classify email type
        nlp_agents = self.find_agents("nlp")
        if nlp_agents:
            classification = self.call_agent(
                nlp_agents[0]["instance_id"],
                "classify_text",
                {"text": email.subject + " " + email.body}
            )
            
            email_type = classification.get("category", "general")
        else:
            email_type = "general"
        
        # Step 2: Route to specialized agent
        if email_type == "billing":
            billing_agents = self.find_agents("billing")
            if billing_agents:
                response = self.call_agent(
                    billing_agents[0]["instance_id"],
                    "handle_billing_inquiry",
                    {
                        "email_content": email.body,
                        "customer_info": email.sender
                    }
                )
                if response and not response.get("error"):
                    self.send_response(email, response["reply"])
        
        elif email_type == "support":
            support_agents = self.find_agents("customer-support")
            # Try multiple agents for load balancing
            for agent in support_agents[:3]:
                response = self.call_agent(
                    agent["instance_id"],
                    "handle_inquiry",
                    {"inquiry": email.body, "priority": "normal"}
                )
                if response and not response.get("error"):
                    self.send_response(email, response["response"])
                    break
```

### Pattern 2: Data Processing Pipeline

```python
def process_data_pipeline(self, data_file):
    """Multi-stage data processing with different agents"""
    
    # Stage 1: Data Cleaning
    cleaning_agents = self.find_agents("data-processing")
    if not cleaning_agents:
        raise Exception("No data cleaning agents available")
    
    clean_response = self.call_agent(
        cleaning_agents[0]["instance_id"],
        "clean_data",
        {"file_path": data_file, "format": "csv"},
        timeout=120
    )
    
    if clean_response.get("error"):
        raise Exception(f"Data cleaning failed: {clean_response['error']}")
    
    cleaned_file = clean_response["cleaned_file_path"]
    
    # Stage 2: Analysis
    ml_agents = self.find_agents("ml-prediction")
    if ml_agents:
        analysis_response = self.call_agent(
            ml_agents[0]["instance_id"],
            "run_analysis",
            {"data_file": cleaned_file, "model_type": "classification"}
        )
        
        if analysis_response and not analysis_response.get("error"):
            results = analysis_response["results"]
            
            # Stage 3: Report Generation
            content_agents = self.find_agents("content-generation")
            if content_agents:
                report_response = self.call_agent(
                    content_agents[0]["instance_id"],
                    "generate_report",
                    {
                        "analysis_results": results,
                        "report_type": "executive_summary"
                    }
                )
                
                if report_response and not report_response.get("error"):
                    return report_response["report"]
    
    return None
```

### Pattern 3: Multi-Agent Coordination

```python
def coordinate_agent_network(self):
    """Monitor and coordinate multiple agents"""
    
    # Get all agents and their status
    all_agents = self.find_agents()
    agent_statuses = {}
    
    for agent in all_agents:
        status_response = self.call_agent(
            agent["instance_id"],
            "get_detailed_status",
            timeout=5
        )
        agent_statuses[agent["instance_name"]] = status_response
    
    # Identify overloaded agents
    overloaded_agents = []
    underloaded_agents = []
    
    for name, status in agent_statuses.items():
        if status and not status.get("error"):
            queue_size = status.get("queue_size", 0)
            if queue_size > 10:
                overloaded_agents.append(name)
            elif queue_size < 2:
                underloaded_agents.append(name)
    
    # Redistribute work if needed
    if overloaded_agents and underloaded_agents:
        self.redistribute_work(overloaded_agents, underloaded_agents)
```

### Pattern 4: Error Recovery and Fallbacks

```python
def resilient_task_execution(self, task):
    """Execute task with multiple fallback strategies"""
    
    required_capability = task.get("requires_capability")
    
    # Try primary agents
    primary_agents = self.find_agents(required_capability)
    
    for agent in primary_agents:
        response = self.call_agent(
            agent["instance_id"],
            task["method"],
            task["data"]
        )
        
        if response and not response.get("error"):
            return response  # Success
        else:
            print(f"Agent {agent['instance_name']} failed: {response.get('error')}")
    
    # Fallback to general-purpose agents
    print(f"Primary agents failed, trying fallback agents...")
    fallback_agents = self.find_agents("general-assistance")
    
    for agent in fallback_agents:
        response = self.call_agent(
            agent["instance_id"],
            "handle_generic_task",
            {"task_data": task}
        )
        
        if response and not response.get("error"):
            return response
    
    # All agents failed - queue for later or escalate
    print("All agents failed, escalating task")
    self.escalate_task(task)
    return None
```

---

## Error Handling & Best Practices

### Comprehensive Error Handling

```python
def robust_agent_call(self, agent_id, method, data=None, max_retries=3):
    """Robust agent call with comprehensive error handling"""
    
    for attempt in range(max_retries):
        try:
            response = self.call_agent(agent_id, method, data)
            
            if not response:
                print(f"No response from agent {agent_id} (attempt {attempt + 1})")
                continue
            
            if response.get("error"):
                error_type = response.get("type", "unknown")
                
                if error_type == "timeout":
                    print(f"Timeout calling {agent_id} (attempt {attempt + 1})")
                    continue  # Retry timeouts
                
                elif error_type == "rate_limit":
                    wait_time = response.get("retry_after", 5)
                    print(f"Rate limited, waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                
                elif response.get("status_code") == 404:
                    print(f"Agent {agent_id} not found")
                    return None  # Don't retry 404s
                
                else:
                    print(f"Agent error: {response['error']}")
                    continue  # Retry other errors
            
            # Success case
            return response
            
        except Exception as e:
            print(f"Exception calling agent {agent_id}: {e}")
            if attempt < max_retries - 1:
                time.sleep(1 * (attempt + 1))  # Progressive delay
    
    print(f"Failed to call agent {agent_id} after {max_retries} attempts")
    return None
```

### Best Practices

1. **Always Handle Errors**
   ```python
   response = self.call_agent(agent_id, method, data)
   if response and not response.get("error"):
       # Process successful response
       handle_success(response)
   else:
       # Handle error case
       handle_error(response)
   ```

2. **Use Appropriate Timeouts**
   ```python
   # Quick operations
   response = self.call_agent(agent_id, "status", timeout=5)
   
   # Heavy processing
   response = self.call_agent(agent_id, "analyze_data", data, timeout=300)
   ```

3. **Implement Circuit Breakers**
   ```python
   def call_with_circuit_breaker(self, agent_id, method, data):
       if self.is_circuit_open(agent_id):
           return {"error": "Circuit breaker open for agent"}
       
       response = self.call_agent(agent_id, method, data)
       
       if response and response.get("error"):
           self.record_failure(agent_id)
       else:
           self.record_success(agent_id)
       
       return response
   ```

4. **Cache Agent Discovery Results**
   ```python
   def get_cached_agents(self, capability, cache_timeout=60):
       cache_key = f"agents:{capability}"
       
       if cache_key in self.cache:
           cached_data, timestamp = self.cache[cache_key]
           if time.time() - timestamp < cache_timeout:
               return cached_data
       
       agents = self.find_agents(capability)
       self.cache[cache_key] = (agents, time.time())
       return agents
   ```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Agent Discovery Returns Empty Results

**Problem**: `find_agents()` returns an empty list

**Possible Causes**:
- No agents with the requested capability are running
- Network connectivity issues
- Platform discovery service is down

**Solutions**:
```python
# Check if any agents are running
all_agents = self.find_agents()
if not all_agents:
    print("No agents discovered - platform may be unreachable")
    
# Verify capability name is correct
valid_capabilities = [
    "email-processing", "data-processing", "customer-support",
    "content-generation", "web-scraping", "api-integration"
    # ... etc
]
if capability not in valid_capabilities:
    print(f"Invalid capability: {capability}")

# Try discovery with retry
for attempt in range(3):
    agents = self.find_agents(capability)
    if agents:
        break
    time.sleep(1)
else:
    print("Discovery failed after retries")
```

#### 2. Agent Calls Timing Out

**Problem**: `call_agent()` returns timeout errors

**Possible Causes**:
- Target agent is overloaded or unresponsive
- Network latency issues
- Timeout value too low for the operation

**Solutions**:
```python
# Increase timeout for heavy operations
response = self.call_agent(
    agent_id, 
    "heavy_processing", 
    data, 
    timeout=300  # 5 minutes
)

# Implement retry with exponential backoff
def call_with_backoff(self, agent_id, method, data, max_attempts=3):
    delay = 1
    for attempt in range(max_attempts):
        response = self.call_agent(agent_id, method, data)
        
        if response and not response.get("error"):
            return response
        
        if attempt < max_attempts - 1:
            time.sleep(delay)
            delay *= 2  # Exponential backoff
    
    return {"error": "All attempts failed"}
```

#### 3. Authentication Errors

**Problem**: Calls fail with 401/403 authentication errors

**Possible Causes**:
- Missing or invalid API key
- API key expired
- Rate limits exceeded

**Solutions**:
```python
# Check configuration
if not self.config.get("security", {}).get("require_api_key"):
    print("API key authentication may be disabled")

# Verify rate limits in config
rate_config = self.config.get("security", {}).get("rate_limit", {})
calls_per_minute = rate_config.get("calls_per_minute", 60)
print(f"Rate limit: {calls_per_minute} calls/minute")

# Implement rate limiting on client side
import time
from collections import deque

class RateLimiter:
    def __init__(self, calls_per_minute=60):
        self.calls_per_minute = calls_per_minute
        self.calls = deque()
    
    def can_call(self):
        now = time.time()
        # Remove calls older than 1 minute
        while self.calls and self.calls[0] <= now - 60:
            self.calls.popleft()
        
        return len(self.calls) < self.calls_per_minute
    
    def record_call(self):
        self.calls.append(time.time())
```

#### 4. Agent Method Not Found

**Problem**: Agent calls fail with "method not found" errors

**Possible Causes**:
- Method name is incorrect
- Target agent doesn't implement the method
- Agent's method declarations are outdated

**Solutions**:
```python
# Check agent's available methods
agents = self.find_agents(capability)
if agents:
    agent = agents[0]
    available_methods = agent.get("methods", {})
    print(f"Available methods: {list(available_methods.keys())}")
    
    if method_name not in available_methods:
        print(f"Method '{method_name}' not available")
        print(f"Try one of: {list(available_methods.keys())}")

# Use dynamic method discovery
def safe_call_agent(self, agent_id, preferred_method, fallback_method, data):
    # Try preferred method first
    response = self.call_agent(agent_id, preferred_method, data)
    
    if response and response.get("error") == "Unknown method":
        # Fall back to alternative method
        print(f"Method {preferred_method} not found, trying {fallback_method}")
        response = self.call_agent(agent_id, fallback_method, data)
    
    return response
```

#### 5. Platform Connection Issues

**Problem**: Cannot connect to the Emergence platform

**Possible Causes**:
- Platform URL is incorrect
- Network connectivity issues
- Platform service is down

**Solutions**:
```python
# Test platform connectivity
import requests

def test_platform_connection(self):
    try:
        response = requests.get(
            f"{self.platform_url}/api/health",
            timeout=10
        )
        if response.status_code == 200:
            print("✅ Platform is reachable")
        else:
            print(f"⚠️ Platform returned status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to platform")
    except requests.exceptions.Timeout:
        print("❌ Platform connection timeout")

# Verify configuration
def verify_config(self):
    required_fields = ["platform_url", "instance_name"]
    for field in required_fields:
        if not self.config.get(field):
            print(f"❌ Missing required config field: {field}")
    
    platform_url = self.config.get("platform_url", "")
    if not platform_url.startswith(("http://", "https://")):
        print(f"❌ Invalid platform URL: {platform_url}")
```

### Debugging Tools

#### Enable Debug Logging

```python
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def debug_agent_call(self, agent_id, method, data):
    """Agent call with debug logging"""
    logger.debug(f"Calling agent {agent_id}.{method} with data: {data}")
    
    start_time = time.time()
    response = self.call_agent(agent_id, method, data)
    end_time = time.time()
    
    logger.debug(f"Call took {end_time - start_time:.2f}s")
    logger.debug(f"Response: {response}")
    
    return response
```

#### Health Check Utility

```python
def health_check_all_agents(self):
    """Check health of all discovered agents"""
    all_agents = self.find_agents()
    health_report = {}
    
    for agent in all_agents:
        agent_id = agent["instance_id"]
        agent_name = agent["instance_name"]
        
        try:
            response = self.call_agent(agent_id, "status", timeout=10)
            if response and not response.get("error"):
                health_report[agent_name] = "healthy"
            else:
                health_report[agent_name] = f"unhealthy: {response.get('error', 'unknown')}"
        except Exception as e:
            health_report[agent_name] = f"error: {str(e)}"
    
    return health_report
```

---

## Configuration Reference

### config_template.json

```json
{
  "agent_id": null,
  "instance_name": "my-agent-1",
  "endpoint_url": "http://localhost:5000",
  "platform_url": "https://emergence-production.up.railway.app",
  
  "collaboration": {
    "enable_discovery": true,
    "enable_inter_agent_calls": true,
    "call_timeout": 30,
    "max_retries": 3
  },
  
  "security": {
    "require_api_key": true,
    "rate_limit": {
      "calls_per_minute": 60,
      "burst_limit": 10
    }
  },
  
  "logging": {
    "log_level": "INFO",
    "log_inter_agent_calls": true,
    "log_discovery_requests": false
  }
}
```

### Configuration Options

| Section | Option | Default | Description |
|---------|--------|---------|-------------|
| `collaboration` | `enable_discovery` | `true` | Enable agent discovery |
| | `enable_inter_agent_calls` | `true` | Enable calling other agents |
| | `call_timeout` | `30` | Default timeout for agent calls (seconds) |
| | `max_retries` | `3` | Maximum retry attempts for failed calls |
| `security` | `require_api_key` | `true` | Require API key for authentication |
| | `rate_limit.calls_per_minute` | `60` | Rate limit for outgoing calls |
| | `rate_limit.burst_limit` | `10` | Burst limit for rapid calls |
| `logging` | `log_level` | `INFO` | Logging level (DEBUG, INFO, WARN, ERROR) |
| | `log_inter_agent_calls` | `true` | Log all inter-agent communication |
| | `log_discovery_requests` | `false` | Log agent discovery requests |

---

## Getting Help

### Community Resources
- **Documentation**: [Emergence Platform Docs](https://emergence-docs.example.com)
- **Community Forum**: [discussions.emergence.dev](https://discussions.emergence.dev)
- **GitHub Issues**: [github.com/emergence/platform/issues](https://github.com/emergence/platform/issues)

### Support Channels
- **Technical Support**: support@emergence.dev
- **Developer Discord**: [discord.gg/emergence-dev](https://discord.gg/emergence-dev)
- **Stack Overflow**: Tag your questions with `emergence-platform`

### Contributing
- **Boilerplate Improvements**: Submit PRs to improve the agent boilerplate
- **Documentation**: Help improve this guide and other documentation
- **Examples**: Share your collaboration patterns with the community

---

*Last updated: January 2025*  
*Version: 2.0.0*