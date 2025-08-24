import json
import time
import sys
from platform_client import PlatformClient
from agent_core import AgentCore

def load_config():
    try:
        with open('config.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ config.json not found. Copy from config_template.json and update values.")
        sys.exit(1)

def main():
    print("🤖 Starting agent...")
    
    # Load configuration
    config = load_config()
    
    # Initialize platform communication
    platform = PlatformClient(config)
    
    # Initialize your agent logic
    agent = AgentCore(config)
    
    # Link agent and platform for two-way communication
    agent.platform_client = platform
    platform.agent_core = agent
    
    # Register with platform (now includes capabilities and methods)
    if platform.register():
        print("✅ Registered with platform successfully")
        print(f"📋 Capabilities: {', '.join(agent.declare_capabilities())}")
        print(f"🔧 Methods: {', '.join(agent.declare_methods().keys())}")
    else:
        print("⚠️ Failed to register with platform, continuing anyway...")
    
    print("🚀 Agent running! Press Ctrl+C to stop")
    
    # Main loop
    try:
        while True:
            # Run your agent logic
            agent.run_cycle()
            
            # Send health check to platform
            platform.ping("running")
            
            # Wait before next cycle
            time.sleep(30)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping agent...")
        platform.ping("stopped")
        print("✅ Agent stopped")

if __name__ == "__main__":
    main()
