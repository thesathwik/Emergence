// Simple non-communicating agent for testing
class SimpleAgent {
    constructor() {
        this.name = "Test Non-Communicating Agent";
        this.version = "1.0.0";
    }

    // Basic functionality without platform communication
    processData(input) {
        console.log("Processing input:", input);
        return {
            result: input.toUpperCase(),
            timestamp: new Date().toISOString()
        };
    }

    // Some utility functions
    formatOutput(data) {
        return JSON.stringify(data, null, 2);
    }

    // Main execution function
    run() {
        console.log("Agent started");
        const testInput = "hello world";
        const result = this.processData(testInput);
        console.log("Result:", this.formatOutput(result));
        return result;
    }
}

module.exports = SimpleAgent;

// Auto-run if executed directly
if (require.main === module) {
    const agent = new SimpleAgent();
    agent.run();
}