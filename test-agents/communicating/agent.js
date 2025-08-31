// Communicating agent with platform integration for testing
const axios = require('axios');

class CommunicatingAgent {
    constructor() {
        this.name = "Test Communicating Agent";
        this.version = "1.0.0";
        this.platformUrl = process.env.PLATFORM_URL || 'https://emergence-platform.com';
        this.agentId = null;
        this.registered = false;
    }

    // Register with the platform
    async register() {
        try {
            console.log('Registering with platform...');
            const response = await axios.post(`${this.platformUrl}/api/webhook/register`, {
                name: this.name,
                version: this.version,
                capabilities: ['data-processing', 'text-analysis'],
                webhook_url: `${this.platformUrl}/agent-webhook/${this.agentId}`
            });

            this.agentId = response.data.agent_id;
            this.registered = true;
            console.log('Successfully registered with platform:', this.agentId);
            return response.data;
        } catch (error) {
            console.error('Failed to register with platform:', error.message);
            throw error;
        }
    }

    // Send ping to maintain connection
    async ping() {
        if (!this.registered) {
            throw new Error('Agent not registered. Call register() first.');
        }

        try {
            console.log('Sending ping to platform...');
            const response = await axios.post(`${this.platformUrl}/api/webhook/ping`, {
                agent_id: this.agentId,
                status: 'active',
                timestamp: new Date().toISOString()
            });

            console.log('Ping successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Ping failed:', error.message);
            throw error;
        }
    }

    // Process data with platform communication
    async processData(input) {
        console.log("Processing input with platform integration:", input);
        
        // Simulate some processing
        const result = {
            original: input,
            processed: input.toUpperCase(),
            timestamp: new Date().toISOString(),
            agent_id: this.agentId
        };

        // Send result back to platform if registered
        if (this.registered) {
            try {
                await axios.post(`${this.platformUrl}/api/agent/result`, {
                    agent_id: this.agentId,
                    result: result
                });
                console.log('Result sent to platform');
            } catch (error) {
                console.warn('Failed to send result to platform:', error.message);
            }
        }

        return result;
    }

    // Main execution function
    async run() {
        try {
            console.log("Starting communicating agent...");
            
            // Register with platform
            await this.register();
            
            // Send initial ping
            await this.ping();
            
            // Process some test data
            const testInput = "hello platform";
            const result = await this.processData(testInput);
            console.log("Processing complete:", result);
            
            return result;
        } catch (error) {
            console.error('Agent execution failed:', error.message);
            throw error;
        }
    }

    // Cleanup function
    async shutdown() {
        if (this.registered) {
            try {
                await axios.post(`${this.platformUrl}/api/webhook/unregister`, {
                    agent_id: this.agentId
                });
                console.log('Agent unregistered from platform');
            } catch (error) {
                console.warn('Failed to unregister:', error.message);
            }
        }
    }
}

module.exports = CommunicatingAgent;

// Auto-run if executed directly
if (require.main === module) {
    const agent = new CommunicatingAgent();
    agent.run().catch(console.error);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down...');
        await agent.shutdown();
        process.exit(0);
    });
}