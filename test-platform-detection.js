#!/usr/bin/env node

/**
 * Test Platform Endpoint Detection
 * Tests platform endpoint detection, HTTP library detection, and pattern counting
 */

const CodeScanner = require('./utils/codeScanner');

async function testPlatformDetection() {
  console.log('🔍 Testing Platform Endpoint Detection');
  console.log('='.repeat(60));

  const scanner = new CodeScanner();

  // Test cases with different platform usage patterns
  const testCases = [
    {
      name: 'Agent Registration Code',
      content: `
import requests
import json

class AgentPlatform:
    def __init__(self, base_url):
        self.base_url = base_url
        self.agent_id = None
    
    def register_agent(self, agent_info):
        """Register agent with platform"""
        endpoint = f"{self.base_url}/api/webhook/register"
        response = requests.post(endpoint, json=agent_info)
        if response.status_code == 200:
            self.agent_id = response.json().get('agent_id')
            return True
        return False
    
    def ping_platform(self):
        """Send ping to platform"""
        endpoint = f"{self.base_url}/api/webhook/ping"
        data = {"agent_id": self.agent_id, "status": "active"}
        response = requests.post(endpoint, json=data)
        return response.status_code == 200
    
    def send_webhook(self, payload):
        """Send webhook data"""
        endpoint = f"{self.base_url}/api/webhook"
        return requests.post(endpoint, json=payload)
      `,
      expectedEndpoints: ['/api/webhook/register', '/api/webhook/ping'],
      expectedLibraries: ['requests']
    },

    {
      name: 'JavaScript Fetch Implementation',
      content: `
const platformUrl = 'https://emergence-platform.com';

class PlatformClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.agentId = null;
  }

  async registerAgent(agentData) {
    const response = await fetch(platformUrl + '/api/webhook/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey
      },
      body: JSON.stringify(agentData)
    });
    
    if (response.ok) {
      const result = await response.json();
      this.agentId = result.agentId;
      return result;
    }
    throw new Error('Registration failed');
  }

  async sendPing() {
    return await fetch(platformUrl + '/api/webhook/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: this.agentId })
    });
  }
}
      `,
      expectedEndpoints: ['/api/webhook/register', '/api/webhook/ping'],
      expectedLibraries: ['fetch']
    },

    {
      name: 'Axios HTTP Client',
      content: `
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.platform.com',
  timeout: 5000
});

async function registerWithPlatform(agentConfig) {
  try {
    const response = await axios.post('/api/webhook/register', agentConfig);
    console.log('Agent registered:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

async function pingPlatform(agentId) {
  const response = await axios.get('/api/webhook/ping?agent=' + agentId);
  return response.data;
}

// Alternative methods
async function updateAgent(agentId, data) {
  return await axios.put('/api/agents/' + agentId, data);
}
      `,
      expectedEndpoints: ['/api/webhook/register', '/api/webhook/ping'],
      expectedLibraries: ['axios']
    },

    {
      name: 'cURL Command Usage',
      content: `
#!/bin/bash

# Agent registration script
PLATFORM_URL="https://platform.example.com"
AGENT_ID="agent-123"

# Register agent
curl -X POST "$PLATFORM_URL/api/webhook/register" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "TestAgent", "version": "1.0.0"}'

# Send periodic ping
ping_platform() {
  curl -X POST "$PLATFORM_URL/api/webhook/ping" \\
    -H "Content-Type: application/json" \\
    -d '{"agent_id": "'"$AGENT_ID"'", "status": "active"}'
}

# Python subprocess with curl
import subprocess
import json

def register_agent_curl(agent_data):
    cmd = [
        'curl', '-X', 'POST',
        'https://api.platform.com/api/webhook/register',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps(agent_data)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0
      `,
      expectedEndpoints: ['/api/webhook/register', '/api/webhook/ping'],
      expectedLibraries: ['curl']
    },

    {
      name: 'No Platform Integration',
      content: `
def process_data(data):
    result = []
    for item in data:
        result.append(item * 2)
    return result

class DataProcessor:
    def __init__(self):
        self.items = []
    
    def add_item(self, item):
        self.items.append(item)
    
    def get_total(self):
        return sum(self.items)
      `,
      expectedEndpoints: [],
      expectedLibraries: []
    }
  ];

  console.log('🧪 Running platform endpoint detection tests...\n');

  let testIndex = 1;
  for (const testCase of testCases) {
    console.log(`Test ${testIndex}: ${testCase.name}`);
    console.log('-'.repeat(50));

    // Test 1: Platform Endpoint Detection
    console.log('📋 Platform Endpoint Detection:');
    const endpointResult = scanner.detectPlatformEndpoints(testCase.content);
    console.log(`   Endpoints found: ${endpointResult.found}`);
    console.log(`   Total matches: ${endpointResult.matches.length}`);
    
    if (endpointResult.matches.length > 0) {
      console.log('   Detected endpoints:');
      const uniqueEndpoints = [...new Set(endpointResult.matches)];
      uniqueEndpoints.forEach(endpoint => {
        const count = endpointResult.matches.filter(m => m === endpoint).length;
        console.log(`     - "${endpoint}" (${count}x)`);
      });
    }

    // Test 2: HTTP Library Detection
    console.log('\n🌐 HTTP Library Detection:');
    const libResult = scanner.detectHttpLibraries(testCase.content);
    console.log(`   Libraries found: ${libResult.found}`);
    console.log(`   Total HTTP calls: ${libResult.totalCount}`);
    
    for (const [libName, libData] of Object.entries(libResult.libraries)) {
      if (libData.found) {
        console.log(`   📚 ${libName.toUpperCase()}:`);
        console.log(`      - Found: ${libData.count} matches`);
        
        // Show pattern breakdown
        const patterns = Object.entries(libData.patterns);
        if (patterns.length > 0) {
          console.log('      - Patterns:');
          patterns.slice(0, 3).forEach(([pattern, count]) => {
            console.log(`        * "${pattern}": ${count}x`);
          });
          if (patterns.length > 3) {
            console.log(`        ... and ${patterns.length - 3} more patterns`);
          }
        }
      }
    }

    // Test 3: Pattern Counting
    console.log('\n🔢 Pattern Counting:');
    const specificPatterns = ['/api/webhook/register', '/api/webhook/ping'];
    const countResult = scanner.countPatterns(testCase.content, specificPatterns);
    
    console.log(`   Total pattern matches: ${countResult.total}`);
    for (const [pattern, count] of Object.entries(countResult.patterns)) {
      if (count > 0) {
        console.log(`   - "${pattern}": ${count} occurrences`);
      }
    }

    // Test 4: Comprehensive Analysis
    console.log('\n📊 Comprehensive Platform Analysis:');
    const analysis = scanner.analyzePlatformUsage(testCase.content);
    console.log(`   Platform endpoints: ${analysis.summary.hasPlatformEndpoints} (${analysis.summary.endpointCount})`);
    console.log(`   HTTP libraries: ${analysis.summary.hasHttpLibraries} (${analysis.summary.httpLibraryCount})`);
    console.log(`   Communication patterns: ${analysis.summary.hasCommunicationPatterns} (${analysis.summary.communicationPatternCount})`);
    console.log(`   Total findings: ${analysis.summary.totalFindings}`);

    // Validation
    console.log('\n✅ Validation:');
    const endpointsMatch = testCase.expectedEndpoints.every(ep => 
      endpointResult.matches.some(match => match.includes(ep))
    );
    const librariesMatch = testCase.expectedLibraries.every(lib =>
      libResult.libraries[lib]?.found
    );
    
    console.log(`   Expected endpoints detected: ${endpointsMatch ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Expected libraries detected: ${librariesMatch ? '✅ PASS' : '❌ FAIL'}`);

    console.log('');
    testIndex++;
  }

  // Demonstrate counting specific patterns
  console.log('🔢 Pattern Counting Demonstration:');
  console.log('-'.repeat(50));

  const sampleCode = `
# Multiple HTTP library usage
import requests
import axios from 'axios';

# Multiple requests calls
requests.get('http://api.com/data')
requests.post('http://api.com/webhook')
requests.put('http://api.com/update')

# Multiple axios calls  
axios.get('/api/webhook/register')
axios.post('/api/webhook/ping')
axios.delete('/api/webhook/unregister')

# Fetch calls
fetch('/api/webhook/register')
fetch('/api/webhook/ping')
  `;

  const httpLibCounts = scanner.detectHttpLibraries(sampleCode);
  console.log('📚 HTTP Library Usage Counts:');
  for (const [lib, data] of Object.entries(httpLibCounts.libraries)) {
    if (data.found) {
      console.log(`   ${lib}: ${data.count} total occurrences`);
      Object.entries(data.patterns).forEach(([pattern, count]) => {
        console.log(`      - "${pattern}": ${count}x`);
      });
    }
  }

  console.log('\n🎉 Platform Endpoint Detection Testing Complete!');
  console.log('\n📋 Summary:');
  console.log('- ✅ Platform endpoint detection (/api/webhook/register, /api/webhook/ping)');
  console.log('- ✅ HTTP library detection (requests, fetch, axios, curl)');
  console.log('- ✅ Pattern occurrence counting');
  console.log('- ✅ Comprehensive platform analysis');
  console.log('- ✅ Multiple test case validation');
}

// Run the test
if (require.main === module) {
  testPlatformDetection().catch(console.error);
}

module.exports = { testPlatformDetection };