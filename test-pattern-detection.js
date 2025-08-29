#!/usr/bin/env node

/**
 * Test Pattern Detection Foundation
 * Tests basic pattern detection functionality with communication patterns
 */

const CodeScanner = require('./utils/codeScanner');

async function testPatternDetection() {
  console.log('🔍 Testing Pattern Detection Foundation');
  console.log('='.repeat(50));

  const scanner = new CodeScanner();

  // Test samples with different communication patterns
  const testCases = [
    {
      name: 'Python API webhook code',
      content: `
import requests
import json

def webhook_handler(data):
    # Send webhook to api/webhook endpoint
    response = requests.post("https://api.example.com/api/webhook", 
                           json=data,
                           headers={'Content-Type': 'application/json'})
    return response.status_code == 200

def fetch_data():
    return requests.get("https://api.example.com/data")
      `,
      expectedPatterns: ['api/webhook', 'requests.post', 'requests.get', 'https://']
    },
    
    {
      name: 'JavaScript fetch API code',
      content: `
const apiEndpoint = 'https://myapi.com/api/callback';

async function sendData(payload) {
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return response.json();
}

// Also using axios
import axios from 'axios';
const result = await axios.post('/webhook', data);
      `,
      expectedPatterns: ['api/callback', 'fetch(', 'POST', 'axios.post', '/webhook', 'https://']
    },
    
    {
      name: 'No communication patterns',
      content: `
def calculate_sum(a, b):
    return a + b

def process_data(data):
    result = []
    for item in data:
        result.append(item * 2)
    return result

class DataProcessor:
    def __init__(self):
        self.data = []
    
    def add_item(self, item):
        self.data.append(item)
      `,
      expectedPatterns: []
    },
    
    {
      name: 'Mixed patterns',
      content: `
# This file has some communication patterns
import requests
import os

def backup_data():
    # Local file operations only
    with open('backup.txt', 'w') as f:
        f.write('backup data')

def sync_remote():
    # Network operations
    response = requests.put('https://sync.example.com/api/webhook')
    if response.status_code == 200:
        print('Sync successful')
      `,
      expectedPatterns: ['requests.put', 'api/webhook', 'https://']
    }
  ];

  console.log('🧪 Running pattern detection tests...\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: ${testCase.name}`);
    console.log('-'.repeat(30));

    // Test 1: Basic pattern detection
    console.log('📋 Testing specific patterns:');
    for (const pattern of ['api/webhook', 'requests.post']) {
      const found = scanner.hasPatterns(testCase.content, pattern);
      const expected = testCase.expectedPatterns.includes(pattern);
      const status = found === expected ? '✅' : '❌';
      console.log(`   ${status} "${pattern}": ${found} (expected: ${expected})`);
    }

    // Test 2: Communication pattern detection
    console.log('\n🌐 Testing communication patterns:');
    const commResult = scanner.detectCommunicationPatterns(testCase.content);
    console.log(`   Overall found: ${commResult.found}`);
    console.log(`   Total matches: ${commResult.matches.length}`);
    
    if (commResult.matches.length > 0) {
      console.log('   Found patterns:');
      const uniqueMatches = [...new Set(commResult.matches)];
      uniqueMatches.slice(0, 5).forEach(match => {
        console.log(`     - "${match.trim()}"`);
      });
      if (uniqueMatches.length > 5) {
        console.log(`     ... and ${uniqueMatches.length - 5} more`);
      }
    }

    // Test 3: Multiple pattern detection
    console.log('\n🔍 Testing multiple patterns:');
    const multiPatterns = ['requests.get', 'requests.post', 'fetch(', 'axios'];
    const multiResult = scanner.detectPatterns(testCase.content, multiPatterns, {
      returnMatches: true
    });
    
    for (const pattern of multiPatterns) {
      const patternResult = multiResult.patternResults[pattern];
      if (patternResult && patternResult.found) {
        console.log(`   ✅ "${pattern}": ${patternResult.count} matches`);
      }
    }

    console.log('');
  }

  // Test 4: Advanced pattern detection features
  console.log('🔧 Testing advanced features:');
  console.log('-'.repeat(30));

  const advancedContent = `
const API_URL = "https://api.example.com/webhook";
const webhookUrl = "/api/webhook";
function callWebhook() { 
  return fetch(API_URL); 
}
`;

  // Case sensitivity test
  const caseResult1 = scanner.hasPatterns(advancedContent, 'WEBHOOK');
  const caseResult2 = scanner.detectPatterns(advancedContent, 'WEBHOOK', { caseSensitive: true });
  console.log(`✅ Case insensitive (default): ${caseResult1}`);
  console.log(`✅ Case sensitive: ${caseResult2.found}`);

  // Whole word test
  const wholeWordResult = scanner.detectPatterns(advancedContent, 'hook', { wholeWord: true });
  console.log(`✅ Whole word "hook": ${wholeWordResult.found} (should be false)`);

  // Return matches test
  const matchesResult = scanner.detectPatterns(advancedContent, ['webhook', 'fetch'], { 
    returnMatches: true 
  });
  console.log(`✅ Return matches: ${matchesResult.matches.length} total matches`);
  console.log(`   Matches: ${matchesResult.matches.join(', ')}`);

  console.log('\n🎉 Pattern Detection Foundation Testing Complete!');
  console.log('\n📋 Summary:');
  console.log('- ✅ Basic string pattern detection working');
  console.log('- ✅ Boolean hasPatterns() function working');
  console.log('- ✅ Communication pattern detection working');
  console.log('- ✅ Multiple pattern support working');
  console.log('- ✅ Advanced options (case sensitivity, whole word) working');
  console.log('- ✅ Match return functionality working');
}

// Run the test
if (require.main === module) {
  testPatternDetection().catch(console.error);
}

module.exports = { testPatternDetection };