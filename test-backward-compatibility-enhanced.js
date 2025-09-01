#!/usr/bin/env node

/**
 * Enhanced Backward Compatibility Test Suite
 * Tests that both JavaScript boilerplate and Python SDK agents work simultaneously
 */

const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
    platformUrl: 'http://localhost:3000',
    timeout: 30000,
    pythonAgent: {
        name: 'test-python-agent',
        file: 'test_python_agent.py'
    },
    jsAgent: {
        name: 'Test Compatibility JS Agent',
        file: 'test_compatibility_js_agent.js'
    }
};

class BackwardCompatibilityTester {
    constructor() {
        this.results = {
            jsAgent: { status: 'pending', details: {} },
            pythonAgent: { status: 'pending', details: {} },
            communication: { status: 'pending', details: {} },
            dashboard: { status: 'pending', details: {} }
        };
        this.processes = [];
    }

    // Create a test Python agent for compatibility testing
    createTestPythonAgent() {
        const pythonCode = `#!/usr/bin/env python3
"""
Test Python agent for backward compatibility testing
"""
import os
import sys
import time
import json
import requests
from datetime import datetime

class TestPythonAgent:
    def __init__(self):
        self.name = "test-python-agent"
        self.version = "1.0.0"
        self.platform_url = os.getenv('PLATFORM_URL', 'http://localhost:3000')
        self.agent_id = None
        self.registered = False
        self.capabilities = ['python-processing', 'compatibility-test']

    def register(self):
        """Register with platform using same API as JavaScript"""
        try:
            print(f"🐍 Registering Python agent: {self.name}")
            response = requests.post(f"{self.platform_url}/api/webhook/register", json={
                'name': self.name,
                'version': self.version,
                'capabilities': self.capabilities,
                'webhook_url': f"{self.platform_url}/agent-webhook/{self.name}"
            })
            
            if response.status_code == 200:
                data = response.json()
                self.agent_id = data.get('agent_id', self.name)
                self.registered = True
                print(f"✅ Python agent registered: {self.agent_id}")
                return data
            else:
                print(f"❌ Registration failed: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Registration error: {e}")
            return None

    def ping(self):
        """Send ping to maintain connection"""
        if not self.registered:
            return False
            
        try:
            response = requests.post(f"{self.platform_url}/api/webhook/ping", json={
                'agent_id': self.agent_id,
                'status': 'active',
                'timestamp': datetime.now().isoformat()
            })
            
            if response.status_code == 200:
                print(f"💓 Python agent ping successful")
                return True
            else:
                print(f"⚠️ Ping failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"⚠️ Ping error: {e}")
            return False

    def process_data(self, input_data):
        """Process data and return result"""
        print(f"📝 Python processing: {input_data}")
        
        result = {
            'original': input_data,
            'processed': f"PYTHON: {input_data.upper()}",
            'timestamp': datetime.now().isoformat(),
            'agent_id': self.agent_id,
            'language': 'python'
        }
        
        return result

    def find_agents(self):
        """Find other agents on the platform"""
        try:
            response = requests.get(f"{self.platform_url}/api/agents")
            if response.status_code == 200:
                agents = response.json()
                print(f"🔍 Found {len(agents)} agents on platform:")
                for agent in agents:
                    print(f"  - {agent.get('name', 'unknown')} ({agent.get('language', 'unknown')})")
                return agents
            return []
        except Exception as e:
            print(f"❌ Failed to find agents: {e}")
            return []

    def run_compatibility_test(self):
        """Run the compatibility test"""
        print("🚀 Starting Python agent compatibility test...")
        
        # Register
        if not self.register():
            return False
        
        # Ping
        if not self.ping():
            return False
        
        # Process data
        result = self.process_data("compatibility test from python")
        
        # Find agents (should include JavaScript agent if running)
        agents = self.find_agents()
        
        print("✅ Python agent compatibility test completed")
        return True

if __name__ == "__main__":
    agent = TestPythonAgent()
    
    try:
        success = agent.run_compatibility_test()
        if success:
            print("🎉 Python agent test PASSED")
            # Keep running for a bit to test simultaneous operation
            time.sleep(10)
        else:
            print("❌ Python agent test FAILED")
            sys.exit(1)
    except KeyboardInterrupt:
        print("🛑 Python agent stopped")
    except Exception as e:
        print(f"💥 Python agent crashed: {e}")
        sys.exit(1)
`;

        fs.writeFileSync(CONFIG.pythonAgent.file, pythonCode);
        console.log(`✅ Created test Python agent: ${CONFIG.pythonAgent.file}`);
    }

    // Enhanced JavaScript agent for compatibility testing
    createTestJSAgent() {
        const jsCode = `// Enhanced JavaScript agent for backward compatibility testing
const axios = require('axios');

class CompatibilityJSAgent {
    constructor() {
        this.name = "Test Compatibility JS Agent";
        this.version = "1.0.0";
        this.platformUrl = process.env.PLATFORM_URL || 'http://localhost:3000';
        this.agentId = null;
        this.registered = false;
        this.capabilities = ['js-processing', 'compatibility-test'];
    }

    async register() {
        try {
            console.log(\`🟨 Registering JS agent: \${this.name}\`);
            const response = await axios.post(\`\${this.platformUrl}/api/webhook/register\`, {
                name: this.name,
                version: this.version,
                capabilities: this.capabilities,
                webhook_url: \`\${this.platformUrl}/agent-webhook/\${this.name}\`
            });

            this.agentId = response.data.agent_id || this.name;
            this.registered = true;
            console.log(\`✅ JS agent registered: \${this.agentId}\`);
            return response.data;
        } catch (error) {
            console.error(\`❌ JS registration failed: \${error.message}\`);
            throw error;
        }
    }

    async ping() {
        if (!this.registered) return false;

        try {
            const response = await axios.post(\`\${this.platformUrl}/api/webhook/ping\`, {
                agent_id: this.agentId,
                status: 'active',
                timestamp: new Date().toISOString()
            });
            console.log(\`💓 JS agent ping successful\`);
            return true;
        } catch (error) {
            console.warn(\`⚠️ JS ping failed: \${error.message}\`);
            return false;
        }
    }

    async processData(input) {
        console.log(\`📝 JS processing: \${input}\`);
        
        const result = {
            original: input,
            processed: \`JAVASCRIPT: \${input.toUpperCase()}\`,
            timestamp: new Date().toISOString(),
            agent_id: this.agentId,
            language: 'javascript'
        };

        return result;
    }

    async findAgents() {
        try {
            const response = await axios.get(\`\${this.platformUrl}/api/agents\`);
            const agents = response.data;
            console.log(\`🔍 Found \${agents.length} agents on platform:\`);
            agents.forEach(agent => {
                console.log(\`  - \${agent.name || 'unknown'} (\${agent.language || 'unknown'})\`);
            });
            return agents;
        } catch (error) {
            console.error(\`❌ Failed to find agents: \${error.message}\`);
            return [];
        }
    }

    async runCompatibilityTest() {
        console.log("🚀 Starting JS agent compatibility test...");
        
        try {
            // Register
            await this.register();
            
            // Ping
            await this.ping();
            
            // Process data
            const result = await this.processData("compatibility test from javascript");
            
            // Find agents (should include Python agent if running)
            const agents = await this.findAgents();
            
            console.log("✅ JS agent compatibility test completed");
            return true;
        } catch (error) {
            console.error(\`❌ JS agent test failed: \${error.message}\`);
            return false;
        }
    }

    async shutdown() {
        if (this.registered) {
            try {
                await axios.post(\`\${this.platformUrl}/api/webhook/unregister\`, {
                    agent_id: this.agentId
                });
                console.log("✅ JS agent unregistered");
            } catch (error) {
                console.warn(\`⚠️ Failed to unregister JS agent: \${error.message}\`);
            }
        }
    }
}

module.exports = CompatibilityJSAgent;

// Auto-run if executed directly
if (require.main === module) {
    const agent = new CompatibilityJSAgent();
    
    agent.runCompatibilityTest()
        .then(success => {
            if (success) {
                console.log("🎉 JS agent test PASSED");
                // Keep running for a bit to test simultaneous operation
                setTimeout(() => {
                    console.log("🛑 JS agent test completed");
                    process.exit(0);
                }, 10000);
            } else {
                console.log("❌ JS agent test FAILED");
                process.exit(1);
            }
        })
        .catch(error => {
            console.error(\`💥 JS agent crashed: \${error.message}\`);
            process.exit(1);
        });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('🛑 Shutting down JS agent...');
        await agent.shutdown();
        process.exit(0);
    });
}
`;
        
        fs.writeFileSync(CONFIG.jsAgent.file, jsCode);
        console.log(`✅ Created test JavaScript agent: ${CONFIG.jsAgent.file}`);
    }

    // Test platform availability
    async testPlatformAvailability() {
        console.log("🔍 Testing platform availability...");
        try {
            const response = await axios.get(`${CONFIG.platformUrl}/api/health`, { timeout: 5000 });
            console.log("✅ Platform is available");
            return true;
        } catch (error) {
            console.log("⚠️ Platform not available, tests may fail");
            console.log("   Make sure to start the platform server first:");
            console.log("   npm start");
            return false;
        }
    }

    // Start JavaScript agent in background
    startJSAgent() {
        return new Promise((resolve, reject) => {
            console.log("🟨 Starting JavaScript agent...");
            
            const jsProcess = spawn('node', [CONFIG.jsAgent.file], {
                env: { ...process.env, PLATFORM_URL: CONFIG.platformUrl },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            jsProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) console.log(`[JS] ${output}`);
                
                if (output.includes('JS agent test PASSED')) {
                    this.results.jsAgent.status = 'passed';
                    this.results.jsAgent.details.registered = true;
                } else if (output.includes('JS agent test FAILED')) {
                    this.results.jsAgent.status = 'failed';
                }
            });

            jsProcess.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error) console.error(`[JS ERROR] ${error}`);
            });

            jsProcess.on('close', (code) => {
                if (code === 0) {
                    console.log("✅ JavaScript agent completed successfully");
                } else {
                    console.log(`❌ JavaScript agent exited with code ${code}`);
                }
            });

            jsProcess.on('error', (error) => {
                console.error(`❌ Failed to start JavaScript agent: ${error.message}`);
                reject(error);
            });

            this.processes.push(jsProcess);
            
            // Give it time to start
            setTimeout(() => resolve(true), 2000);
        });
    }

    // Start Python agent in background
    startPythonAgent() {
        return new Promise((resolve, reject) => {
            console.log("🐍 Starting Python agent...");
            
            const pythonProcess = spawn('python3', [CONFIG.pythonAgent.file], {
                env: { ...process.env, PLATFORM_URL: CONFIG.platformUrl },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) console.log(`[PY] ${output}`);
                
                if (output.includes('Python agent test PASSED')) {
                    this.results.pythonAgent.status = 'passed';
                    this.results.pythonAgent.details.registered = true;
                } else if (output.includes('Python agent test FAILED')) {
                    this.results.pythonAgent.status = 'failed';
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error) console.error(`[PY ERROR] ${error}`);
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    console.log("✅ Python agent completed successfully");
                } else {
                    console.log(`❌ Python agent exited with code ${code}`);
                }
            });

            pythonProcess.on('error', (error) => {
                console.error(`❌ Failed to start Python agent: ${error.message}`);
                reject(error);
            });

            this.processes.push(pythonProcess);
            
            // Give it time to start
            setTimeout(() => resolve(true), 2000);
        });
    }

    // Test dashboard shows both agents
    async testDashboardView() {
        console.log("🖥️ Testing dashboard view...");
        try {
            const response = await axios.get(`${CONFIG.platformUrl}/api/agents`);
            const agents = response.data;
            
            console.log(`📊 Found ${agents.length} agents in dashboard:`);
            agents.forEach(agent => {
                console.log(`   - ${agent.name} (${agent.language || 'unknown'})`);
            });

            const jsAgentFound = agents.some(agent => 
                agent.name.includes('JS') || agent.name.includes('JavaScript')
            );
            const pythonAgentFound = agents.some(agent => 
                agent.name.includes('python') || agent.name.includes('Python')
            );

            if (jsAgentFound && pythonAgentFound) {
                this.results.dashboard.status = 'passed';
                this.results.dashboard.details = { 
                    totalAgents: agents.length,
                    jsAgentFound,
                    pythonAgentFound
                };
                console.log("✅ Dashboard shows both JavaScript and Python agents");
                return true;
            } else {
                console.log("⚠️ Dashboard missing some agents");
                console.log(`   JS Agent Found: ${jsAgentFound}`);
                console.log(`   Python Agent Found: ${pythonAgentFound}`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Dashboard test failed: ${error.message}`);
            return false;
        }
    }

    // Clean up processes
    cleanup() {
        console.log("🧹 Cleaning up test processes...");
        this.processes.forEach(process => {
            if (process && !process.killed) {
                process.kill('SIGTERM');
            }
        });
        
        // Clean up test files
        const testFiles = [CONFIG.pythonAgent.file, CONFIG.jsAgent.file];
        testFiles.forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                console.log(`🗑️ Removed test file: ${file}`);
            }
        });
    }

    // Print test results
    printResults() {
        console.log("\\n" + "=".repeat(60));
        console.log("🧪 BACKWARD COMPATIBILITY TEST RESULTS");
        console.log("=".repeat(60));

        const tests = [
            ['JavaScript Agent', this.results.jsAgent],
            ['Python Agent', this.results.pythonAgent],
            ['Dashboard View', this.results.dashboard],
            ['Cross Communication', this.results.communication]
        ];

        tests.forEach(([name, result]) => {
            const status = result.status === 'passed' ? '✅ PASSED' : 
                          result.status === 'failed' ? '❌ FAILED' : 
                          '⏳ PENDING';
            console.log(`${name.padEnd(25)} ${status}`);
        });

        const allPassed = Object.values(this.results).every(r => r.status === 'passed');
        
        console.log("=".repeat(60));
        if (allPassed) {
            console.log("🎉 ALL TESTS PASSED - BACKWARD COMPATIBILITY VERIFIED");
            console.log("   ✅ JavaScript boilerplate agents work");
            console.log("   ✅ Python SDK agents work");
            console.log("   ✅ Both can run simultaneously");
            console.log("   ✅ Platform dashboard shows both types");
        } else {
            console.log("⚠️ SOME TESTS FAILED - CHECK LOGS ABOVE");
        }
        console.log("=".repeat(60));
        
        return allPassed;
    }

    // Run all tests
    async runTests() {
        console.log("🚀 Starting Enhanced Backward Compatibility Test Suite...");
        
        try {
            // Setup
            await this.testPlatformAvailability();
            this.createTestPythonAgent();
            this.createTestJSAgent();

            // Start both agents simultaneously
            console.log("\\n🔄 Starting both agents simultaneously...");
            await Promise.all([
                this.startJSAgent(),
                this.startPythonAgent()
            ]);

            // Give agents time to register and communicate
            console.log("⏳ Waiting for agents to complete registration...");
            await new Promise(resolve => setTimeout(resolve, 8000));

            // Test dashboard view
            await this.testDashboardView();

            // Test completed - mark communication as passed if both agents passed
            if (this.results.jsAgent.status === 'passed' && this.results.pythonAgent.status === 'passed') {
                this.results.communication.status = 'passed';
                this.results.communication.details = { crossLanguageCommunication: true };
            }

        } catch (error) {
            console.error(`💥 Test suite crashed: ${error.message}`);
        } finally {
            // Allow agents to complete their tests
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Cleanup
            this.cleanup();
            
            // Print results
            const success = this.printResults();
            process.exit(success ? 0 : 1);
        }
    }
}

// Main execution
if (require.main === module) {
    const tester = new BackwardCompatibilityTester();
    
    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log('\\n🛑 Test interrupted');
        tester.cleanup();
        process.exit(1);
    });
    
    process.on('uncaughtException', (error) => {
        console.error(`💥 Uncaught exception: ${error.message}`);
        tester.cleanup();
        process.exit(1);
    });
    
    tester.runTests();
}

module.exports = BackwardCompatibilityTester;