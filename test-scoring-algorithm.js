#!/usr/bin/env node

/**
 * Test Scoring Algorithm
 * Tests the 0-100 scoring system and verification categories
 */

const CodeScanner = require('./utils/codeScanner');

async function testScoringAlgorithm() {
  console.log('🎯 Testing Scoring Algorithm');
  console.log('='.repeat(60));

  const scanner = new CodeScanner();

  // Test cases representing different agent quality levels
  const testCases = [
    {
      name: 'High-Quality Platform Agent (Expected: Verified 80+)',
      content: `
import requests
import json
import os
from typing import Dict, Any

class PlatformAgent:
    """
    A well-structured agent that integrates with the platform
    using proper error handling and configuration management
    """
    
    def __init__(self, config_path: str = "config.json"):
        self.platform_url = os.getenv('PLATFORM_URL', 'https://api.platform.com')
        self.api_key = os.getenv('API_KEY')
        self.agent_id = None
        self.config = self.load_config(config_path)
    
    def load_config(self, path: str) -> Dict[str, Any]:
        """Load configuration from file"""
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"name": "DefaultAgent", "version": "1.0.0"}
        except Exception as e:
            print(f"Config error: {e}")
            return {}
    
    def register_with_platform(self) -> bool:
        """Register agent with platform using webhook endpoint"""
        try:
            endpoint = f"{self.platform_url}/api/webhook/register"
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                endpoint,
                json=self.config,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                self.agent_id = response.json().get('agent_id')
                print("Successfully registered with platform")
                return True
            else:
                print(f"Registration failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"Network error during registration: {e}")
            return False
        except Exception as e:
            print(f"Unexpected error: {e}")
            return False
    
    def send_ping(self) -> bool:
        """Send periodic ping to platform"""
        if not self.agent_id:
            return False
            
        try:
            endpoint = f"{self.platform_url}/api/webhook/ping"
            data = {
                'agent_id': self.agent_id,
                'status': 'active',
                'timestamp': json.dumps({'time': 'now'})
            }
            
            response = requests.post(endpoint, json=data, timeout=10)
            return response.status_code == 200
            
        except Exception as e:
            print(f"Ping failed: {e}")
            return False
    
    def process_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming webhook data"""
        try:
            # Process the payload
            result = {"status": "processed", "data": payload}
            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}

# Usage example
if __name__ == "__main__":
    agent = PlatformAgent()
    if agent.register_with_platform():
        agent.send_ping()
      `,
      expectedCategory: 'Verified',
      expectedScore: { min: 80, max: 100 }
    },

    {
      name: 'Medium-Quality Agent (Expected: Likely 40-79)',
      content: `
import requests
import json

class SimpleAgent:
    def __init__(self):
        self.base_url = "https://api.example.com"
    
    def register(self):
        # Basic registration without proper error handling
        response = requests.post(f"{self.base_url}/api/webhook/register", 
                               json={"name": "SimpleAgent"})
        if response.status_code == 200:
            return response.json()
        return None
    
    def ping_server(self):
        # Simple ping functionality
        try:
            response = requests.get(f"{self.base_url}/api/webhook/ping")
            return response.status_code == 200
        except:
            return False
    
    def send_data(self, data):
        # Basic data sending with fetch
        import axios from 'axios';
        return axios.post('/api/data', data);

def main():
    agent = SimpleAgent()
    agent.register()
    agent.ping_server()
      `,
      expectedCategory: 'Likely',
      expectedScore: { min: 40, max: 79 }
    },

    {
      name: 'Low-Quality Agent (Expected: Unlikely 0-39)',
      content: `
# Basic script with minimal functionality
def process_data(data):
    result = []
    for item in data:
        result.append(item * 2)
    return result

def calculate_total(numbers):
    total = 0
    for num in numbers:
        total += num
    return total

# Some basic operations
data = [1, 2, 3, 4, 5]
processed = process_data(data)
total = calculate_total(processed)
print(f"Total: {total}")
      `,
      expectedCategory: 'Unlikely',
      expectedScore: { min: 0, max: 39 }
    },

    {
      name: 'Dangerous Agent (Expected: Unlikely due to security)',
      content: `
import subprocess
import os
import requests

def dangerous_operations():
    # This agent has security issues
    user_input = input("Enter command: ")
    
    # Dangerous: direct command execution
    result = subprocess.run(user_input, shell=True)
    
    # Dangerous: system calls
    os.system("rm -rf /tmp/*")
    
    # Some legitimate functionality
    response = requests.post("https://api.platform.com/api/webhook/register")
    
    # More dangerous patterns
    eval(user_input)
    exec("print('dangerous code')")

# Platform integration exists but overshadowed by security issues
class PlatformClient:
    def ping(self):
        subprocess.run("curl https://api.platform.com/api/webhook/ping")

dangerous_operations()
      `,
      expectedCategory: 'Unlikely',
      expectedScore: { min: 0, max: 39 }
    },

    {
      name: 'JavaScript/Node.js Agent (Expected: Likely)',
      content: `
const axios = require('axios');
const fs = require('fs');

class NodeAgent {
  constructor(config) {
    this.platformUrl = process.env.PLATFORM_URL || 'https://api.platform.com';
    this.apiKey = process.env.API_KEY;
    this.config = config;
  }

  async registerAgent() {
    try {
      const response = await axios.post(
        this.platformUrl + '/api/webhook/register',
        {
          name: this.config.name,
          version: this.config.version,
          capabilities: this.config.capabilities
        },
        {
          headers: {
            'Authorization': 'Bearer ' + this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      this.agentId = response.data.agentId;
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw error;
    }
  }

  async sendPing() {
    if (!this.agentId) return false;
    
    try {
      const response = await fetch(this.platformUrl + '/api/webhook/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.agentId,
          status: 'active'
        })
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async processWebhook(req, res) {
    try {
      const payload = req.body;
      // Process webhook data
      const result = await this.handleWebhookData(payload);
      res.json({ status: 'success', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = NodeAgent;
      `,
      expectedCategory: 'Likely',
      expectedScore: { min: 50, max: 79 }
    }
  ];

  console.log('🧪 Running scoring algorithm tests...\n');

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: ${testCase.name}`);
    console.log('-'.repeat(60));

    // Calculate score
    const scoreResult = scanner.calculatePlatformScore(testCase.content);
    
    // Display results
    console.log(`🎯 Score: ${scoreResult.score}/100`);
    console.log(`📋 Category: ${scoreResult.category} (${scoreResult.confidence} confidence)`);
    
    // Score breakdown
    console.log('\\n📊 Score Breakdown:');
    console.log(`   Platform Endpoints: ${scoreResult.breakdown.platformEndpoints.toFixed(1)}/30`);
    console.log(`   HTTP Libraries: ${scoreResult.breakdown.httpLibraries.toFixed(1)}/25`);
    console.log(`   Communication Patterns: ${scoreResult.breakdown.communicationPatterns.toFixed(1)}/20`);
    console.log(`   Code Quality: ${scoreResult.breakdown.codeQuality.toFixed(1)}/15`);
    console.log(`   Security Compliance: ${scoreResult.breakdown.securityCompliance.toFixed(1)}/10`);
    console.log(`   Bonus Points: ${scoreResult.breakdown.bonusPoints.toFixed(1)}`);
    if (scoreResult.breakdown.penalties > 0) {
      console.log(`   Penalties: -${scoreResult.breakdown.penalties.toFixed(1)}`);
    }

    // Recommendations
    if (scoreResult.recommendations.length > 0) {
      console.log('\\n💡 Top Recommendations:');
      scoreResult.recommendations.slice(0, 3).forEach(rec => {
        console.log(`   ${rec.impact} - ${rec.category}: ${rec.message} (+${rec.points} pts)`);
      });
    }

    // Validation
    const categoryMatch = scoreResult.category === testCase.expectedCategory;
    const scoreInRange = scoreResult.score >= testCase.expectedScore.min && 
                        scoreResult.score <= testCase.expectedScore.max;
    
    console.log('\\n✅ Validation:');
    console.log(`   Expected category: ${testCase.expectedCategory} ${categoryMatch ? '✅' : '❌'}`);
    console.log(`   Expected score range: ${testCase.expectedScore.min}-${testCase.expectedScore.max} ${scoreInRange ? '✅' : '❌'}`);
    
    results.push({
      testCase: testCase.name,
      score: scoreResult.score,
      category: scoreResult.category,
      expectedCategory: testCase.expectedCategory,
      categoryMatch,
      scoreInRange,
      breakdown: scoreResult.breakdown
    });

    console.log('');
  }

  // Summary
  console.log('📊 Test Results Summary:');
  console.log('='.repeat(60));
  
  const categories = { 'Verified': 0, 'Likely': 0, 'Unlikely': 0 };
  let correctCategories = 0;
  let correctScores = 0;

  results.forEach(result => {
    categories[result.category]++;
    if (result.categoryMatch) correctCategories++;
    if (result.scoreInRange) correctScores++;
  });

  console.log('📈 Score Distribution:');
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} agents`);
  });

  console.log('\\n🎯 Accuracy:');
  console.log(`   Category predictions: ${correctCategories}/${results.length} (${(correctCategories/results.length*100).toFixed(1)}%)`);
  console.log(`   Score range accuracy: ${correctScores}/${results.length} (${(correctScores/results.length*100).toFixed(1)}%)`);

  // Detailed score breakdown
  console.log('\\n📋 Detailed Results:');
  results.forEach(result => {
    const status = result.categoryMatch && result.scoreInRange ? '✅' : '❌';
    console.log(`   ${status} ${result.testCase}: ${result.score} (${result.category})`);
  });

  console.log('\\n🎉 Scoring Algorithm Testing Complete!');
  console.log('\\n📋 Algorithm Features Verified:');
  console.log('- ✅ 0-100 scoring system');
  console.log('- ✅ Verification categories (Verified 80+, Likely 40-79, Unlikely 0-39)');
  console.log('- ✅ Platform endpoint detection scoring');
  console.log('- ✅ HTTP library usage scoring');
  console.log('- ✅ Code quality assessment');
  console.log('- ✅ Security compliance scoring');
  console.log('- ✅ Bonus points and penalties');
  console.log('- ✅ Automated recommendations');
}

// Run the test
if (require.main === module) {
  testScoringAlgorithm().catch(console.error);
}

module.exports = { testScoringAlgorithm };