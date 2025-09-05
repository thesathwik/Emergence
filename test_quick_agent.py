import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("EMERGENCE_API_KEY")
platform_url = os.getenv("EMERGENCE_PLATFORM_URL")

print(f"API Key: {api_key[:20]}...")
print(f"Platform URL: {platform_url}")

# Test 1: Get agents
print("\n1. Testing /api/agents endpoint...")
response = requests.get(f"{platform_url}/api/agents")
print(f"Status: {response.status_code}")
if response.status_code == 200:
    agents = response.json().get('agents', [])
    print(f"Found {len(agents)} agents")
    if agents:
        agent = agents[0]
        print(f"First agent: {agent.get('name')} (ID: {agent.get('id')})")
        
        # Test 2: Try webhook registration
        print(f"\n2. Testing webhook registration...")
        registration_data = {
            "agent_id": agent['id'],
            "instance_name": f"Test-{int(time.time())}",
            "endpoint_url": f"http://localhost:8080/test-agent",
            "status": "running"
        }
        
        reg_response = requests.post(
            f"{platform_url}/api/webhook/register",
            json=registration_data,
            timeout=10
        )
        
        print(f"Registration status: {reg_response.status_code}")
        if reg_response.status_code in [200, 201]:
            result = reg_response.json()
            instance_id = result.get('instance', {}).get('id')
            new_api_key = result.get('security', {}).get('api_key')
            print(f"✅ Registered! Instance ID: {instance_id}")
            print(f"✅ Got API key: {new_api_key[:20]}...")
            
            # Test 3: Test messaging with new API key
            print(f"\n3. Testing messaging...")
            
            # Get instances to find a target
            instances_response = requests.get(f"{platform_url}/api/instances")
            if instances_response.status_code == 200:
                instances = instances_response.json().get('instances', [])
                print(f"Found {len(instances)} instances")
                
                # Try to send a message using the new API key
                if len(instances) > 1:
                    target_id = instances[1]['id'] if instances[1]['id'] != instance_id else instances[0]['id']
                    print(f"Sending message to instance {target_id}...")
                    
                    message_data = {
                        "to_instance_id": target_id,
                        "message_type": "request",
                        "content": "Test message",
                    }
                    
                    msg_response = requests.post(
                        f"{platform_url}/api/agents/message",
                        headers={"X-API-Key": new_api_key},
                        json=message_data,
                        timeout=10
                    )
                    
                    print(f"Message status: {msg_response.status_code}")
                    print(f"Message response: {msg_response.text}")
                    
                    if msg_response.status_code in [200, 201]:
                        print("🎉 SUCCESS! Messaging works!")
                    else:
                        print("❌ Messaging failed")
                else:
                    print("Not enough instances to test messaging")
            else:
                print(f"Failed to get instances: {instances_response.status_code}")
        else:
            print(f"Registration failed: {reg_response.text}")
    else:
        print("No agents found")
else:
    print(f"Failed to get agents: {response.text}")