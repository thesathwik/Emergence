import requests
import json
import time
from typing import Optional, Dict, List, Any

class PlatformClient:
    def __init__(self, config):
        self.config = config
        self.instance_id = None
        self.platform_url = config.get("platform_url", "https://emergence-production.up.railway.app")
        self.agent_core = None  # Will be set by main.py
        
    def register(self):
        """Register agent with platform"""
        try:
            payload = {
                "agent_id": self.config.get("agent_id"),
                "instance_name": self.config.get("instance_name", "agent-1"),
                "endpoint_url": self.config.get("endpoint_url", "http://localhost:5000")
            }
            
            # Add capabilities if agent_core is available
            if self.agent_core:
                payload["capabilities"] = self.agent_core.declare_capabilities()
                payload["methods"] = self.agent_core.declare_methods()
            
            response = requests.post(
                f"{self.platform_url}/api/webhook/register",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.instance_id = data.get("instance_id")
                return True
            else:
                print(f"Registration failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Registration error: {e}")
            return False
    
    def ping(self, status="running", metadata=None):
        """Send health check to platform"""
        if not self.instance_id:
            return
            
        try:
            requests.post(
                f"{self.platform_url}/api/webhook/ping",
                json={
                    "instance_id": self.instance_id,
                    "status": status,
                    "metadata": metadata or {}
                },
                timeout=5
            )
        except Exception as e:
            # Silently fail - don't crash agent if platform is down
            pass
    
    def find_agents(self, capability=None, exclude_self=True, max_retries=2):
        """
        Find other agents by capability with error handling and retry logic.
        
        Args:
            capability (str): Required capability filter
            exclude_self (bool): Whether to exclude this agent from results
            max_retries (int): Maximum retry attempts for discovery
            
        Returns:
            list: Available agents matching criteria (empty list on failure)
        """
        for attempt in range(max_retries + 1):
            try:
                if attempt > 0:
                    print(f"🔄 Retrying agent discovery (attempt {attempt}/{max_retries})")
                
                params = {}
                if capability:
                    params["capability"] = capability
                if exclude_self and self.instance_id:
                    params["exclude"] = self.instance_id
                    
                response = requests.get(
                    f"{self.platform_url}/api/agents/discover",
                    params=params,
                    timeout=10
                )
                
                if response.status_code == 200:
                    agents = response.json().get("agents", [])
                    if attempt > 0:
                        print(f"✅ Agent discovery succeeded on retry {attempt}")
                    return agents
                    
                elif response.status_code == 404:
                    # Endpoint not found
                    print("❌ Agent discovery endpoint not available")
                    return []
                    
                elif response.status_code >= 500:
                    # Server error - retry
                    print(f"🔄 Server error {response.status_code}, will retry...")
                    if attempt < max_retries:
                        time.sleep(1 * (attempt + 1))  # Progressive delay
                    continue
                    
                else:
                    print(f"Agent discovery failed: HTTP {response.status_code}")
                    return []
                    
            except requests.exceptions.Timeout:
                print(f"⏰ Agent discovery timeout (attempt {attempt + 1}/{max_retries + 1})")
                if attempt < max_retries:
                    time.sleep(0.5)
                    
            except requests.exceptions.ConnectionError:
                print(f"🔌 Connection error during discovery (attempt {attempt + 1}/{max_retries + 1})")
                if attempt < max_retries:
                    time.sleep(1)
                    
            except Exception as e:
                print(f"💥 Agent discovery error (attempt {attempt + 1}/{max_retries + 1}): {e}")
                if attempt < max_retries:
                    time.sleep(0.5)
        
        print(f"❌ Agent discovery failed after {max_retries + 1} attempts")
        return []
    
    def call_agent(self, agent_id, method, data=None, timeout=30, max_retries=None):
        """
        Call another agent's method with comprehensive error handling and retry logic.
        
        Args:
            agent_id (str): Target agent instance ID
            method (str): Method name to call
            data (dict): Data to send to the agent
            timeout (int): Timeout in seconds
            max_retries (int): Maximum retry attempts (uses config default if None)
            
        Returns:
            dict: Response from target agent or error details
        """
        # Get retry settings from config
        if max_retries is None:
            max_retries = self.config.get("collaboration", {}).get("max_retries", 3)
        
        retry_delay = 1  # Start with 1 second delay
        last_error = None
        
        for attempt in range(max_retries + 1):
            try:
                # Log retry attempt
                if attempt > 0:
                    print(f"🔄 Retry attempt {attempt}/{max_retries} for agent {agent_id}.{method}")
                
                response = requests.post(
                    f"{self.platform_url}/api/agents/{agent_id}/call",
                    json={
                        "method": method,
                        "data": data or {},
                        "sender_id": self.instance_id
                    },
                    timeout=timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if attempt > 0:
                        print(f"✅ Agent call succeeded on retry {attempt}")
                    return result
                    
                elif response.status_code == 404:
                    # Agent not found - don't retry
                    return {"error": f"Agent {agent_id} not found", "status_code": 404}
                    
                elif response.status_code == 408:
                    # Timeout - retry with exponential backoff
                    last_error = {"error": "Agent call timeout", "status_code": 408}
                    
                elif response.status_code == 429:
                    # Rate limited - retry with longer delay
                    last_error = {"error": "Rate limited", "status_code": 429}
                    retry_delay = min(retry_delay * 2, 30)  # Cap at 30 seconds
                    
                elif response.status_code >= 500:
                    # Server error - retry
                    last_error = {"error": f"Server error: {response.status_code}", "status_code": response.status_code}
                    
                else:
                    # Client error - don't retry
                    try:
                        error_details = response.json()
                        return {"error": error_details.get("message", "Unknown error"), "status_code": response.status_code}
                    except:
                        return {"error": f"HTTP {response.status_code}", "status_code": response.status_code}
                
            except requests.exceptions.Timeout:
                last_error = {"error": "Connection timeout", "type": "timeout"}
                print(f"⏰ Agent call timeout (attempt {attempt + 1}/{max_retries + 1})")
                
            except requests.exceptions.ConnectionError:
                last_error = {"error": "Connection failed", "type": "connection_error"}
                print(f"🔌 Connection error (attempt {attempt + 1}/{max_retries + 1})")
                
            except requests.exceptions.RequestException as e:
                last_error = {"error": f"Request failed: {str(e)}", "type": "request_error"}
                print(f"❌ Request error (attempt {attempt + 1}/{max_retries + 1}): {e}")
                
            except Exception as e:
                last_error = {"error": f"Unexpected error: {str(e)}", "type": "unexpected_error"}
                print(f"💥 Unexpected error (attempt {attempt + 1}/{max_retries + 1}): {e}")
            
            # Wait before retry (except on last attempt)
            if attempt < max_retries:
                print(f"⏳ Waiting {retry_delay} seconds before retry...")
                time.sleep(retry_delay)
                retry_delay = min(retry_delay * 1.5, 10)  # Exponential backoff, cap at 10 seconds
        
        # All retries failed
        print(f"❌ Agent call failed after {max_retries + 1} attempts")
        return last_error or {"error": "All retry attempts failed"}
