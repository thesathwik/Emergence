# Collaborative Agent Best Practices & Performance Guide

## Table of Contents
1. [Best Practices for Building Collaborative Agents](#best-practices-for-building-collaborative-agents)
2. [Performance Optimization Tips](#performance-optimization-tips)
3. [Architecture Patterns](#architecture-patterns)
4. [Error Handling Strategies](#error-handling-strategies)
5. [Security & Authentication](#security--authentication)
6. [Monitoring & Debugging](#monitoring--debugging)
7. [Scalability Considerations](#scalability-considerations)

---

## Best Practices for Building Collaborative Agents

### 🎯 Design Principles

#### 1. Single Responsibility Principle
Each agent should have a clear, focused purpose rather than trying to do everything.

```python
# ✅ Good: Focused agent
class EmailProcessingAgent(AgentCore):
    def declare_capabilities(self):
        return ["email-processing", "nlp"]  # Related capabilities only
    
    def declare_methods(self):
        return {
            "classify_email": "Classify email content and urgency",
            "extract_info": "Extract key information from emails",
            "generate_reply": "Generate appropriate email responses"
        }

# ❌ Bad: Jack-of-all-trades agent
class GeneralAgent(AgentCore):
    def declare_capabilities(self):
        return [
            "email-processing", "data-processing", "image-processing", 
            "billing", "customer-support", "social-media"
        ]  # Too many unrelated capabilities
```

#### 2. Clear Interface Design
Design methods with clear inputs, outputs, and error conditions.

```python
def declare_methods(self):
    """
    Method declarations should be descriptive and specific
    """
    return {
        # ✅ Good: Clear, specific method names
        "process_refund_request": "Process customer refund with validation and approval workflow",
        "calculate_shipping_cost": "Calculate shipping cost based on weight, distance, and service level",
        "generate_invoice_pdf": "Generate PDF invoice with customer details and line items",
        
        # ❌ Bad: Vague, ambiguous method names  
        "process": "Process something",
        "handle": "Handle request",
        "do_stuff": "Do various operations"
    }

def handle_agent_call(self, method, data):
    """
    Always validate input data and provide structured responses
    """
    if method == "process_refund_request":
        # ✅ Validate required fields
        required_fields = ["customer_id", "order_id", "refund_amount", "reason"]
        for field in required_fields:
            if field not in data:
                return {
                    "success": False,
                    "error": f"Missing required field: {field}",
                    "error_code": "MISSING_FIELD",
                    "required_fields": required_fields
                }
        
        # Process the refund
        result = self.process_refund(data)
        
        # ✅ Return structured response
        return {
            "success": True,
            "result": {
                "refund_id": result["refund_id"],
                "amount": result["amount"], 
                "status": result["status"],
                "processing_time": result["estimated_days"]
            },
            "metadata": {
                "processed_at": datetime.now().isoformat(),
                "processing_agent": self.config["instance_name"]
            }
        }
```

#### 3. Graceful Degradation
Design agents to handle partial failures and provide fallback options.

```python
def coordinate_content_creation(self, briefs):
    """
    Handle partial failures gracefully
    """
    results = []
    successful_briefs = []
    failed_briefs = []
    
    for brief in briefs:
        try:
            # Try primary content agents
            content_agents = self.find_agents("content-generation")
            
            if not content_agents:
                # ✅ Fallback to template-based generation
                result = self.create_content_from_template(brief)
                result["creation_method"] = "template_fallback"
            else:
                # Try multiple agents for resilience
                result = self.try_multiple_agents(content_agents, brief)
            
            if result["success"]:
                successful_briefs.append(brief)
                results.append(result)
            else:
                failed_briefs.append(brief)
                # ✅ Queue for manual handling
                self.queue_for_manual_creation(brief)
                
        except Exception as e:
            print(f"Error processing brief {brief['id']}: {e}")
            failed_briefs.append(brief)
    
    # ✅ Provide summary of partial success
    return {
        "total_briefs": len(briefs),
        "successful": len(successful_briefs),
        "failed": len(failed_briefs),
        "results": results,
        "requires_manual_review": len(failed_briefs) > 0
    }
```

#### 4. State Management
Keep agents stateless or manage state carefully for reliability.

```python
class CustomerSupportAgent(AgentCore):
    def __init__(self, config):
        super().__init__(config)
        
        # ✅ External state storage - not in memory
        self.ticket_store = TicketStore(config["database_url"])
        self.conversation_cache = RedisCache(config["redis_url"])
        
        # ❌ Avoid storing critical state in memory
        # self.active_conversations = {}  # Lost on restart
        # self.customer_data = {}         # Not persistent
    
    def handle_customer_inquiry(self, inquiry_data):
        inquiry_id = inquiry_data["inquiry_id"]
        
        # ✅ Store conversation state externally
        conversation_state = self.conversation_cache.get(inquiry_id) or {
            "started_at": datetime.now().isoformat(),
            "messages": [],
            "status": "new"
        }
        
        # Process inquiry and update state
        response = self.process_inquiry(inquiry_data, conversation_state)
        
        # ✅ Persist updated state
        conversation_state["messages"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "response",
            "content": response
        })
        self.conversation_cache.set(inquiry_id, conversation_state, ttl=3600)
        
        return response
```

### 🔄 Collaboration Patterns

#### 1. Orchestration Pattern
One agent coordinates others to complete complex workflows.

```python
class WorkflowOrchestratorAgent(AgentCore):
    """
    Coordinates multiple agents to complete end-to-end workflows
    """
    
    def execute_customer_onboarding_workflow(self, customer_data):
        """
        Orchestrate complete customer onboarding across multiple agents
        """
        workflow_id = f"ONBOARD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        try:
            # Step 1: Account Creation
            account_agents = self.find_agents("account-management")
            account_result = self.call_agent(
                account_agents[0]["instance_id"],
                "create_customer_account",
                customer_data
            )
            
            if not account_result.get("success"):
                return {"workflow_id": workflow_id, "status": "failed", "step": "account_creation"}
            
            customer_id = account_result["customer_id"]
            
            # Step 2: Send Welcome Email
            email_agents = self.find_agents("email-processing")
            email_result = self.call_agent(
                email_agents[0]["instance_id"],
                "send_welcome_email",
                {"customer_id": customer_id, "customer_data": customer_data}
            )
            
            # Step 3: Create Initial Support Ticket (if needed)
            if customer_data.get("requires_setup_call"):
                support_agents = self.find_agents("customer-support") 
                support_result = self.call_agent(
                    support_agents[0]["instance_id"],
                    "schedule_setup_call",
                    {"customer_id": customer_id}
                )
            
            # Step 4: Analytics Setup
            analytics_agents = self.find_agents("analytics")
            if analytics_agents:
                analytics_result = self.call_agent(
                    analytics_agents[0]["instance_id"],
                    "setup_customer_tracking",
                    {"customer_id": customer_id}
                )
            
            return {
                "workflow_id": workflow_id,
                "status": "completed",
                "customer_id": customer_id,
                "steps_completed": ["account_creation", "welcome_email", "setup_scheduled", "analytics_enabled"]
            }
            
        except Exception as e:
            return {
                "workflow_id": workflow_id,
                "status": "failed",
                "error": str(e),
                "requires_manual_intervention": True
            }
```

#### 2. Pipeline Pattern
Agents process data in sequence, each adding value.

```python
class DataProcessingPipelineAgent(AgentCore):
    """
    Coordinate data processing pipeline with multiple specialized agents
    """
    
    def process_data_pipeline(self, raw_data_file):
        """
        Execute multi-stage data processing pipeline
        """
        pipeline_id = f"PIPE-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        current_file = raw_data_file
        
        # Stage 1: Data Cleaning
        cleaning_agents = self.find_agents("data-cleaning")
        if cleaning_agents:
            clean_result = self.call_agent(
                cleaning_agents[0]["instance_id"],
                "clean_dataset", 
                {"input_file": current_file, "pipeline_id": pipeline_id},
                timeout=300
            )
            
            if clean_result.get("success"):
                current_file = clean_result["output_file"]
                print(f"✅ Data cleaning completed: {clean_result['records_cleaned']} records")
            else:
                return {"pipeline_id": pipeline_id, "status": "failed", "stage": "cleaning"}
        
        # Stage 2: Data Validation
        validation_agents = self.find_agents("data-validation")
        if validation_agents:
            validation_result = self.call_agent(
                validation_agents[0]["instance_id"],
                "validate_dataset",
                {"input_file": current_file, "pipeline_id": pipeline_id},
                timeout=180
            )
            
            if not validation_result.get("valid"):
                return {
                    "pipeline_id": pipeline_id, 
                    "status": "failed", 
                    "stage": "validation",
                    "validation_errors": validation_result.get("errors", [])
                }
        
        # Stage 3: Data Enrichment
        enrichment_agents = self.find_agents("data-enrichment")
        if enrichment_agents:
            enrichment_result = self.call_agent(
                enrichment_agents[0]["instance_id"],
                "enrich_dataset",
                {"input_file": current_file, "pipeline_id": pipeline_id},
                timeout=600
            )
            
            if enrichment_result.get("success"):
                current_file = enrichment_result["output_file"]
                print(f"✅ Data enrichment completed: {enrichment_result['fields_added']} fields added")
        
        # Stage 4: Analysis
        analysis_agents = self.find_agents("data-analysis") 
        if analysis_agents:
            analysis_result = self.call_agent(
                analysis_agents[0]["instance_id"],
                "analyze_dataset",
                {"input_file": current_file, "pipeline_id": pipeline_id},
                timeout=900
            )
            
            if analysis_result.get("success"):
                insights = analysis_result["insights"]
                print(f"✅ Analysis completed: {len(insights)} insights generated")
        
        return {
            "pipeline_id": pipeline_id,
            "status": "completed",
            "final_file": current_file,
            "insights": insights if 'insights' in locals() else [],
            "stages_completed": ["cleaning", "validation", "enrichment", "analysis"]
        }
```

#### 3. Event-Driven Pattern
Agents react to events and trigger other agents accordingly.

```python
class EventDrivenAgent(AgentCore):
    """
    React to system events and coordinate appropriate agent responses
    """
    
    def __init__(self, config):
        super().__init__(config)
        self.event_bus = EventBus(config["event_bus_url"])
        self.event_handlers = {
            "customer_signed_up": self.handle_customer_signup,
            "payment_failed": self.handle_payment_failure, 
            "support_ticket_urgent": self.handle_urgent_ticket,
            "order_completed": self.handle_order_completion
        }
    
    def run_cycle(self):
        """Listen for events and coordinate agent responses"""
        events = self.event_bus.poll_events()
        
        for event in events:
            event_type = event["type"]
            event_data = event["data"]
            
            if event_type in self.event_handlers:
                try:
                    result = self.event_handlers[event_type](event_data)
                    print(f"✅ Handled {event_type}: {result}")
                except Exception as e:
                    print(f"❌ Error handling {event_type}: {e}")
                    # Could trigger error handling agents here
    
    def handle_customer_signup(self, event_data):
        """Coordinate response to new customer signup"""
        customer_id = event_data["customer_id"]
        customer_email = event_data["email"]
        
        # Trigger welcome email
        email_agents = self.find_agents("email-processing")
        if email_agents:
            self.call_agent(
                email_agents[0]["instance_id"],
                "send_welcome_sequence",
                {"customer_id": customer_id, "email": customer_email}
            )
        
        # Trigger account setup
        account_agents = self.find_agents("account-management")
        if account_agents:
            self.call_agent(
                account_agents[0]["instance_id"],
                "initialize_customer_account",
                {"customer_id": customer_id}
            )
        
        return {"customer_id": customer_id, "actions_triggered": 2}
    
    def handle_payment_failure(self, event_data):
        """Coordinate response to failed payments"""
        customer_id = event_data["customer_id"]
        amount = event_data["amount"]
        
        # Notify billing team
        billing_agents = self.find_agents("billing")
        if billing_agents:
            self.call_agent(
                billing_agents[0]["instance_id"],
                "handle_payment_failure",
                event_data
            )
        
        # Create support ticket
        support_agents = self.find_agents("customer-support")
        if support_agents:
            self.call_agent(
                support_agents[0]["instance_id"],
                "create_payment_issue_ticket",
                {
                    "customer_id": customer_id,
                    "issue_type": "payment_failure",
                    "amount": amount,
                    "priority": "high"
                }
            )
        
        return {"customer_id": customer_id, "issue_escalated": True}
```

---

## Performance Optimization Tips

### ⚡ Communication Optimization

#### 1. Connection Pooling and Reuse
Reuse HTTP connections when making multiple agent calls.

```python
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

class OptimizedPlatformClient(PlatformClient):
    def __init__(self, config):
        super().__init__(config)
        
        # ✅ Create session with connection pooling
        self.session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504]
        )
        
        adapter = HTTPAdapter(
            max_retries=retry_strategy,
            pool_connections=20,    # Keep 20 connection pools
            pool_maxsize=100       # Max 100 connections per pool
        )
        
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
    
    def call_agent(self, agent_id, method, data=None, timeout=30):
        """Use session for connection reuse"""
        try:
            response = self.session.post(  # ✅ Use session instead of requests.post
                f"{self.platform_url}/api/agents/{agent_id}/call",
                json={
                    "method": method,
                    "data": data or {},
                    "sender_id": self.instance_id
                },
                timeout=timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            return {"error": str(e)}
```

#### 2. Parallel Processing
Execute multiple agent calls concurrently when possible.

```python
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor, as_completed

class ParallelProcessingAgent(AgentCore):
    """
    Demonstrate parallel agent communication for better performance
    """
    
    def process_multiple_inquiries_parallel(self, inquiries):
        """
        Process multiple inquiries in parallel for better throughput
        """
        # ✅ Use ThreadPoolExecutor for parallel processing
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Submit all inquiries for processing
            future_to_inquiry = {
                executor.submit(self.process_single_inquiry, inquiry): inquiry 
                for inquiry in inquiries
            }
            
            results = []
            for future in as_completed(future_to_inquiry):
                inquiry = future_to_inquiry[future]
                try:
                    result = future.result(timeout=60)
                    results.append(result)
                except Exception as e:
                    print(f"Inquiry {inquiry['id']} failed: {e}")
                    results.append({
                        "inquiry_id": inquiry["id"],
                        "success": False,
                        "error": str(e)
                    })
        
        return results
    
    def batch_agent_calls(self, agent_calls):
        """
        Execute multiple agent calls in parallel
        """
        def make_call(call_data):
            agent_id, method, data = call_data
            return self.call_agent(agent_id, method, data)
        
        # ✅ Execute calls in parallel
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_call, call_data) for call_data in agent_calls]
            results = []
            
            for future in as_completed(futures):
                try:
                    result = future.result(timeout=30)
                    results.append(result)
                except Exception as e:
                    results.append({"error": str(e)})
        
        return results
    
    async def async_agent_calls(self, agent_calls):
        """
        Async version for I/O bound operations
        """
        async def make_async_call(session, call_data):
            agent_id, method, data = call_data
            
            async with session.post(
                f"{self.platform_url}/api/agents/{agent_id}/call",
                json={"method": method, "data": data, "sender_id": self.instance_id}
            ) as response:
                return await response.json()
        
        # ✅ Use aiohttp for async HTTP calls
        async with aiohttp.ClientSession() as session:
            tasks = [make_async_call(session, call_data) for call_data in agent_calls]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return results
```

#### 3. Caching and Memoization
Cache frequently accessed data and agent discovery results.

```python
import time
from functools import lru_cache, wraps

class CachingAgent(AgentCore):
    """
    Demonstrate caching strategies for better performance
    """
    
    def __init__(self, config):
        super().__init__(config)
        
        # ✅ Set up caching layers
        self.agent_discovery_cache = {}
        self.agent_capability_cache = {}
        self.cache_ttl = 300  # 5 minutes
    
    def find_agents_cached(self, capability=None, exclude_self=True):
        """
        Cache agent discovery results to avoid repeated API calls
        """
        cache_key = f"{capability}:{exclude_self}"
        now = time.time()
        
        # ✅ Check cache first
        if cache_key in self.agent_discovery_cache:
            cached_data, timestamp = self.agent_discovery_cache[cache_key]
            if now - timestamp < self.cache_ttl:
                print(f"🔄 Using cached agent discovery for {capability}")
                return cached_data
        
        # ✅ Cache miss - fetch fresh data
        agents = self.find_agents(capability, exclude_self)
        self.agent_discovery_cache[cache_key] = (agents, now)
        
        return agents
    
    @lru_cache(maxsize=100)  # ✅ Cache method results
    def get_agent_capabilities(self, agent_id):
        """
        Cache agent capabilities to avoid repeated lookups
        """
        response = self.call_agent(agent_id, "get_capabilities")
        if response and not response.get("error"):
            return response.get("capabilities", [])
        return []
    
    def cached_agent_call(self, agent_id, method, data, cache_duration=60):
        """
        Cache agent call results for read-only operations
        """
        # Create cache key from call parameters
        cache_key = f"{agent_id}:{method}:{hash(str(sorted(data.items())) if data else '')}"
        now = time.time()
        
        # Check if this is a cacheable read-only operation
        cacheable_methods = ["get_status", "get_info", "analyze", "calculate"]
        if not any(cacheable in method.lower() for cacheable in cacheable_methods):
            # Not cacheable - make direct call
            return self.call_agent(agent_id, method, data)
        
        # ✅ Check cache
        if hasattr(self, '_call_cache'):
            if cache_key in self._call_cache:
                cached_result, timestamp = self._call_cache[cache_key]
                if now - timestamp < cache_duration:
                    print(f"🔄 Using cached result for {agent_id}.{method}")
                    return cached_result
        else:
            self._call_cache = {}
        
        # ✅ Cache miss - make call and cache result
        result = self.call_agent(agent_id, method, data)
        if result and not result.get("error"):
            self._call_cache[cache_key] = (result, now)
        
        return result
```

#### 4. Load Balancing and Circuit Breakers
Distribute load across agents and handle failures gracefully.

```python
import random
from collections import defaultdict, deque
from datetime import datetime, timedelta

class LoadBalancedAgent(AgentCore):
    """
    Implement load balancing and circuit breaker patterns
    """
    
    def __init__(self, config):
        super().__init__(config)
        
        # ✅ Track agent performance and health
        self.agent_metrics = defaultdict(lambda: {
            "success_count": 0,
            "failure_count": 0,
            "avg_response_time": 0,
            "last_call_time": None,
            "circuit_open": False,
            "circuit_open_until": None
        })
        
        self.recent_calls = defaultdict(deque)  # Track recent call times
        self.circuit_breaker_threshold = 5  # Open after 5 failures
        self.circuit_breaker_timeout = 60   # Keep open for 60 seconds
    
    def call_agent_with_load_balancing(self, agents, method, data, timeout=30):
        """
        Load balance calls across multiple agents with circuit breaker
        """
        if not agents:
            return {"error": "No agents available"}
        
        # ✅ Filter out agents with open circuit breakers
        available_agents = []
        now = datetime.now()
        
        for agent in agents:
            agent_id = agent["instance_id"]
            metrics = self.agent_metrics[agent_id]
            
            # Check if circuit breaker should be closed
            if metrics["circuit_open"] and metrics["circuit_open_until"]:
                if now > metrics["circuit_open_until"]:
                    print(f"🔄 Closing circuit breaker for {agent_id}")
                    metrics["circuit_open"] = False
                    metrics["circuit_open_until"] = None
            
            if not metrics["circuit_open"]:
                available_agents.append(agent)
        
        if not available_agents:
            return {"error": "All agents have open circuit breakers"}
        
        # ✅ Select agent based on performance metrics
        selected_agent = self.select_best_agent(available_agents)
        agent_id = selected_agent["instance_id"]
        
        # ✅ Make the call and track metrics
        start_time = time.time()
        response = self.call_agent(agent_id, method, data, timeout)
        end_time = time.time()
        
        # ✅ Update metrics
        self.update_agent_metrics(agent_id, response, end_time - start_time)
        
        return response
    
    def select_best_agent(self, agents):
        """
        Select the best agent based on performance metrics
        """
        # ✅ Score agents based on success rate and response time
        agent_scores = []
        
        for agent in agents:
            agent_id = agent["instance_id"]
            metrics = self.agent_metrics[agent_id]
            
            total_calls = metrics["success_count"] + metrics["failure_count"]
            if total_calls == 0:
                # New agent - give it a chance
                score = 1.0
            else:
                success_rate = metrics["success_count"] / total_calls
                # Lower response time is better, so invert it
                response_time_score = 1.0 / (metrics["avg_response_time"] + 1)
                score = (success_rate * 0.7) + (response_time_score * 0.3)
            
            agent_scores.append((agent, score))
        
        # ✅ Add some randomness to prevent all calls going to one agent
        agent_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Select from top 3 performers with weighted randomness
        top_agents = agent_scores[:3]
        weights = [score for _, score in top_agents]
        
        selected_agent, _ = random.choices(top_agents, weights=weights)[0]
        return selected_agent
    
    def update_agent_metrics(self, agent_id, response, response_time):
        """
        Update performance metrics and circuit breaker state
        """
        metrics = self.agent_metrics[agent_id]
        
        if response and not response.get("error"):
            # ✅ Success
            metrics["success_count"] += 1
            
            # Update rolling average response time
            current_avg = metrics["avg_response_time"]
            total_calls = metrics["success_count"] + metrics["failure_count"]
            metrics["avg_response_time"] = (current_avg * (total_calls - 1) + response_time) / total_calls
            
        else:
            # ✅ Failure
            metrics["failure_count"] += 1
            
            # Check if circuit breaker should open
            total_calls = metrics["success_count"] + metrics["failure_count"]
            failure_rate = metrics["failure_count"] / total_calls
            
            if (metrics["failure_count"] >= self.circuit_breaker_threshold and 
                failure_rate > 0.5):  # Open if >50% failure rate and enough samples
                
                print(f"🔴 Opening circuit breaker for {agent_id}")
                metrics["circuit_open"] = True
                metrics["circuit_open_until"] = datetime.now() + timedelta(
                    seconds=self.circuit_breaker_timeout
                )
        
        metrics["last_call_time"] = datetime.now()
```

### 📊 Resource Management

#### 1. Connection Limits
Manage connection pools and resource limits.

```python
class ResourceManagedAgent(AgentCore):
    """
    Manage resources and connection limits efficiently
    """
    
    def __init__(self, config):
        super().__init__(config)
        
        # ✅ Configure resource limits
        self.max_concurrent_calls = config.get("max_concurrent_calls", 10)
        self.max_queue_size = config.get("max_queue_size", 100)
        self.call_semaphore = asyncio.Semaphore(self.max_concurrent_calls)
        self.call_queue = asyncio.Queue(maxsize=self.max_queue_size)
    
    async def rate_limited_agent_call(self, agent_id, method, data):
        """
        Make agent call with resource limits
        """
        try:
            # ✅ Acquire semaphore to limit concurrent calls
            async with self.call_semaphore:
                # Make the actual call
                response = await self.async_call_agent(agent_id, method, data)
                return response
                
        except asyncio.TimeoutError:
            return {"error": "Rate limit exceeded - call timed out"}
    
    def manage_agent_pool_size(self):
        """
        Dynamically adjust agent discovery based on load
        """
        current_load = self.get_current_load()
        
        if current_load > 0.8:  # High load
            # ✅ Find more agents to distribute load
            additional_agents = self.find_agents(
                capability=self.primary_capability,
                exclude_self=True
            )
            self.available_agents.extend(additional_agents)
            print(f"🔧 Scaled up: Added {len(additional_agents)} agents")
            
        elif current_load < 0.3:  # Low load
            # ✅ Reduce agent pool to save resources
            if len(self.available_agents) > 3:  # Keep minimum of 3
                self.available_agents = self.available_agents[:3]
                print("🔧 Scaled down: Reduced agent pool")
```

#### 2. Memory Management
Manage memory usage for long-running agents.

```python
import gc
import psutil
from collections import deque

class MemoryEfficientAgent(AgentCore):
    """
    Demonstrate memory-efficient practices
    """
    
    def __init__(self, config):
        super().__init__(config)
        
        # ✅ Use bounded collections to prevent memory leaks
        self.recent_calls = deque(maxlen=1000)  # Keep only last 1000 calls
        self.cache = {}
        self.max_cache_size = 500
        
        # Monitor memory usage
        self.memory_threshold = config.get("memory_threshold_mb", 500)
    
    def run_cycle(self):
        """
        Include memory management in main cycle
        """
        # Regular processing
        result = super().run_cycle()
        
        # ✅ Periodic memory cleanup
        self.cleanup_memory()
        
        return result
    
    def cleanup_memory(self):
        """
        Perform memory cleanup when needed
        """
        # ✅ Check current memory usage
        process = psutil.Process()
        memory_mb = process.memory_info().rss / 1024 / 1024
        
        if memory_mb > self.memory_threshold:
            print(f"🧹 Memory usage high ({memory_mb:.1f}MB), cleaning up...")
            
            # ✅ Clear old cache entries
            if len(self.cache) > self.max_cache_size:
                # Remove oldest 20% of cache entries
                items_to_remove = int(len(self.cache) * 0.2)
                old_keys = list(self.cache.keys())[:items_to_remove]
                for key in old_keys:
                    del self.cache[key]
            
            # ✅ Force garbage collection
            gc.collect()
            
            # Check memory again
            new_memory_mb = psutil.Process().memory_info().rss / 1024 / 1024
            print(f"✅ Memory cleanup complete: {memory_mb:.1f}MB -> {new_memory_mb:.1f}MB")
    
    def cache_with_limit(self, key, value):
        """
        Add to cache with automatic cleanup
        """
        # ✅ Implement LRU-style cache management
        if len(self.cache) >= self.max_cache_size:
            # Remove oldest entry
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        
        self.cache[key] = {
            "value": value,
            "timestamp": time.time()
        }
```

---

## Architecture Patterns

### 🏗️ Microservices Architecture
Design agents as independent microservices that communicate through the platform.

### 🔄 Event-Driven Architecture  
Use events to decouple agents and enable asynchronous processing.

### 🎯 Domain-Driven Design
Organize agents around business domains rather than technical concerns.

### 📊 CQRS (Command Query Responsibility Segregation)
Separate read and write operations for better performance and scalability.

---

## Error Handling Strategies

### 🛡️ Defensive Programming
Always validate inputs and handle edge cases.

### 🔄 Retry Mechanisms
Implement intelligent retry logic with exponential backoff.

### 🚨 Graceful Degradation
Provide fallback functionality when dependencies fail.

### 📝 Comprehensive Logging
Log all interactions for debugging and monitoring.

---

## Security & Authentication

### 🔐 API Key Management
Rotate keys regularly and store securely.

### 🛡️ Input Validation
Sanitize all inputs to prevent injection attacks.

### 🔒 Encryption
Encrypt sensitive data in transit and at rest.

### 👤 Authorization
Implement proper access controls for agent methods.

---

## Monitoring & Debugging

### 📊 Metrics Collection
Track performance, success rates, and resource usage.

### 🔍 Distributed Tracing
Trace requests across multiple agents.

### 🚨 Alerting
Set up alerts for failures and performance degradation.

### 📝 Structured Logging
Use structured logs for easier analysis.

---

## Scalability Considerations

### 📈 Horizontal Scaling
Design agents to scale horizontally by adding instances.

### ⚡ Load Balancing
Distribute requests across multiple agent instances.

### 💾 State Management
Use external state storage for stateful operations.

### 🔄 Asynchronous Processing
Use async patterns for I/O bound operations.

---

*This guide provides comprehensive best practices for building high-performance, reliable collaborative agents on the Emergence platform.*