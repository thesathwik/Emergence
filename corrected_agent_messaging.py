import time
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class TaskManagerAgent:
    def __init__(self):
        self.name = "TaskManagerAgent"
        self.description = "A task management agent that creates, tracks, and manages tasks and deadlines"
        self.version = "1.0.0"
        self.api_key = os.getenv("EMERGENCE_API_KEY")
        self.platform_url = os.getenv("EMERGENCE_PLATFORM_URL")
        
        print(f"Loaded API Key: {self.api_key[:20]}..." if self.api_key else "No API Key loaded")
        print(f"Loaded Platform URL: {self.platform_url}")
        
        self.agent_id = f"task-manager-{int(time.time())}"
        self.instance_id = None  # Will be set after webhook registration
        self.is_registered = False
        self.tasks = {}
        self.task_counter = 0
        
        print(f"Task Manager agent {self.name} is ready!")
        print(f"Capabilities: task management, deadline tracking, collaboration")
    
    def register_with_platform(self):
        """Register with platform using webhook/register endpoint"""
        try:
            # First, find our agent ID by name (since we need to register with an existing agent)
            agents_response = requests.get(
                f"{self.platform_url}/api/agents",
                headers={"X-API-Key": self.api_key},
                timeout=10
            )
            
            if agents_response.status_code != 200:
                print(f"Failed to get agents: {agents_response.text}")
                return False
            
            agents_data = agents_response.json()
            agents = agents_data.get('agents', [])
            
            # Use an existing agent for testing (pick the first one)
            if not agents:
                print("No agents found in platform. Please create one first.")
                return False
            
            task_agent = agents[0]  # Use the first available agent
            print(f"Using existing agent: {task_agent.get('name')} (ID: {task_agent.get('id')})")
            
            # Register an instance of this agent
            registration_data = {
                "agent_id": task_agent['id'],
                "instance_name": f"TaskManager-{int(time.time())}",
                "endpoint_url": f"http://localhost:8080/{self.agent_id}",
                "status": "running",
                "metadata": {
                    "version": self.version,
                    "capabilities": ["task-create", "task-list", "task-update", "deadline-reminder"]
                }
            }
            
            response = requests.post(
                f"{self.platform_url}/api/webhook/register",
                headers={"X-API-Key": self.api_key},
                json=registration_data,
                timeout=10
            )
            
            if response.status_code in [200, 201]:  # Accept both 200 and 201
                result = response.json()
                # Get instance ID from the response
                instance_data = result.get('instance', {})
                self.instance_id = instance_data.get('id')
                print(f"✅ Successfully registered! Instance ID: {self.instance_id}")
                print(f"Instance Name: {instance_data.get('instance_name')}")
                
                # Store the new API key if provided
                security_info = result.get('security', {})
                if security_info.get('api_key'):
                    print(f"🔑 New API key provided: {security_info['api_key'][:20]}...")
                
                self.is_registered = True
                return True
            else:
                print(f"Registration failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Registration error: {e}")
            return False
    
    def send_message_correct(self, target_instance_id, message_type, content):
        """Send message using the CORRECT API endpoint"""
        try:
            message_data = {
                "to_instance_id": target_instance_id,
                "message_type": message_type,
                "content": content,
                "priority": 2,
                "metadata": {
                    "sender_name": self.name,
                    "timestamp": time.time()
                }
            }
            
            response = requests.post(
                f"{self.platform_url}/api/agents/message",  # Correct endpoint
                headers={"X-API-Key": self.api_key},
                json=message_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Message sent successfully! Message ID: {result.get('messageId')}")
                return result
            else:
                print(f"❌ Message send failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Error sending message: {e}")
            return None
    
    def get_messages_correct(self):
        """Get messages using the CORRECT API endpoint"""
        try:
            if not self.instance_id:
                print("No instance ID - cannot get messages")
                return []
            
            response = requests.get(
                f"{self.platform_url}/api/agents/{self.instance_id}/messages",
                headers={"X-API-Key": self.api_key},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                messages = result.get('messages', [])
                print(f"✅ Retrieved {len(messages)} messages")
                return messages
            else:
                print(f"❌ Get messages failed: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            print(f"Error getting messages: {e}")
            return []
    
    def get_agent_instances(self):
        """Get all running agent instances"""
        try:
            response = requests.get(
                f"{self.platform_url}/api/instances",  # Correct endpoint
                headers={"X-API-Key": self.api_key},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                instances = result.get('instances', [])
                print(f"Found {len(instances)} running agent instances:")
                for instance in instances:
                    print(f"  - {instance.get('instance_name')} (ID: {instance.get('id')}, Agent: {instance.get('agent_name')}, Status: {instance.get('status')})")
                return instances
            else:
                print(f"Failed to get instances: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            print(f"Error getting instances: {e}")
            return []
    
    def test_real_messaging(self):
        """Test messaging with correct API endpoints"""
        print("\n=== Testing REAL Agent Messaging ===")
        
        # Get all running instances
        instances = self.get_agent_instances()
        
        # Find a target instance (not ourselves) with correct status
        target_instance = None
        valid_statuses = ['running', 'available']
        
        for instance in instances:
            instance_id = instance.get('id')
            status = instance.get('status')
            
            # Skip our own instance and only target instances with valid status
            if instance_id != self.instance_id and status in valid_statuses:
                target_instance = instance
                print(f"Found valid target: {instance.get('instance_name')} (Status: {status})")
                break
        
        # If no valid target found, list all instances and their statuses
        if not target_instance:
            print("\nNo valid target instances found. Current instances:")
            for instance in instances:
                print(f"  - ID {instance.get('id')}: Status '{instance.get('status')}' (Valid: {instance.get('status') in valid_statuses})")
            
            # Try to send a message to another TaskManager instance if available
            for instance in instances:
                if (instance.get('id') != self.instance_id and 
                    'TaskManager' in instance.get('instance_name', '') and
                    instance.get('status') in valid_statuses):
                    target_instance = instance
                    print(f"Found TaskManager target: {instance.get('instance_name')}")
                    break
        
        if target_instance:
            target_id = target_instance['id']
            target_name = target_instance.get('instance_name', 'Unknown')
            
            print(f"\n📨 Sending message to {target_name} (Instance ID: {target_id})")
            
            # Send a test message
            result = self.send_message_correct(
                target_id, 
                "request", 
                "Hello from TaskManagerAgent! Can you help me with a task?"
            )
            
            if result:
                print("Message sent successfully!")
                
                # Wait a bit and check our own messages
                print("\n📬 Checking for any messages to us...")
                time.sleep(2)
                messages = self.get_messages_correct()
                
                if messages:
                    print("Found messages:")
                    for msg in messages:
                        print(f"  - From Instance {msg.get('from_instance_id')}: {msg.get('content')}")
                else:
                    print("No messages received yet")
                    
                return True
            else:
                print("Failed to send message")
                return False
        else:
            print("No valid target instances found for messaging")
            print("This might be because:")
            print("1. No other instances are running")  
            print("2. Other instances have incompatible status (need 'running' or 'available')")
            print("3. Try running another agent instance first")
            return False
    
    def send_ping(self):
        """Send health check ping"""
        try:
            if not self.instance_id:
                print("No instance ID for ping")
                return False
            
            ping_data = {
                "instance_id": self.instance_id,
                "status": "running",
                "metadata": {
                    "tasks_count": len(self.tasks),
                    "last_activity": time.time()
                }
            }
            
            response = requests.post(
                f"{self.platform_url}/api/webhook/ping",
                headers={"X-API-Key": self.api_key},
                json=ping_data,
                timeout=10
            )
            
            if response.status_code == 200:
                print("✅ Health check ping sent successfully")
                return True
            else:
                print(f"❌ Ping failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Error sending ping: {e}")
            return False
    
    def start(self):
        """Start the agent with proper registration and messaging"""
        print(f"Starting {self.name}...")
        
        # Register with platform (webhook/register)
        if self.register_with_platform():
            print("✅ Registration successful!")
            
            # Send initial health check
            self.send_ping()
            
            # Wait a bit to ensure database is updated
            print("Waiting for database to sync...")
            time.sleep(3)
            
            # Test real messaging
            messaging_success = self.test_real_messaging()
            
            if messaging_success:
                print("\n🎉 REAL MESSAGING TEST PASSED!")
                print("Your agent can send and receive messages!")
            else:
                print("\n⚠️ Messaging test incomplete")
            
        else:
            print("❌ Registration failed")
            return
        
        # Keep running with periodic pings
        try:
            print("\nAgent is running. Sending periodic health checks...")
            ping_counter = 0
            while True:
                time.sleep(30)  # Wait 30 seconds
                ping_counter += 1
                print(f"Sending health check #{ping_counter}...")
                self.send_ping()
                
                # Check for new messages every few pings
                if ping_counter % 3 == 0:
                    print("Checking for new messages...")
                    messages = self.get_messages_correct()
                    
        except KeyboardInterrupt:
            print("\nStopping agent...")

if __name__ == "__main__":
    agent = TaskManagerAgent()
    agent.start()