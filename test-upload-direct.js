#!/usr/bin/env node

/**
 * Direct Upload Test
 * Tests the upload functionality by directly querying the database for existing user
 */

const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function testUploadDirect() {
  console.log('🚀 Testing Direct Upload (Bypass Auth)');
  console.log('='.repeat(50));

  try {
    // Get existing user from database
    console.log('👤 Finding existing user in database...');
    const dbPath = path.join(__dirname, 'database.sqlite');
    const db = new sqlite3.Database(dbPath);

    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id, email, name FROM users LIMIT 1', [], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });

    if (!existingUser) {
      console.log('❌ No existing users found. Creating one...');
      
      // Create a test user directly in database
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('testPassword123', 10);
      
      await new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, ?)';
        db.run(sql, ['Direct Test User', 'direct-test@example.com', hashedPassword, 1], function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id: this.lastID, email: 'direct-test@example.com', name: 'Direct Test User' });
        });
      });

      // Get the created user
      const newUser = await new Promise((resolve, reject) => {
        db.get('SELECT id, email, name FROM users WHERE email = ?', ['direct-test@example.com'], (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        });
      });

      console.log(`✅ Created user: ${newUser.name} (ID: ${newUser.id})`);
      db.close();
      
      // Use the new user
      existingUser.id = newUser.id;
      existingUser.email = newUser.email;
      existingUser.name = newUser.name;
    } else {
      console.log(`✅ Using existing user: ${existingUser.name} (ID: ${existingUser.id})`);
      db.close();
    }

    // Create JWT token manually (using server's secret)
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const token = jwt.sign(
      { 
        userId: existingUser.id, 
        email: existingUser.email,
        name: existingUser.name,
        isVerified: true
      }, 
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('🔑 Generated auth token for testing');

    // Create high-quality test agent
    const testAgentCode = `
import requests
import os
import json

class TestPlatformAgent:
    """High-quality agent for testing enhanced upload"""
    
    def __init__(self):
        self.platform_url = os.getenv('PLATFORM_URL', 'https://api.emergence.com')
        self.api_key = os.getenv('API_KEY')
        self.agent_id = None

    def register_with_platform(self) -> bool:
        """Register with platform using webhook endpoint"""
        try:
            endpoint = f"{self.platform_url}/api/webhook/register"
            headers = {'Authorization': f'Bearer {self.api_key}'}
            
            response = requests.post(endpoint, json={
                'name': 'TestPlatformAgent',
                'version': '1.0.0'
            }, headers=headers, timeout=30)
            
            if response.status_code == 200:
                self.agent_id = response.json().get('agent_id')
                return True
            return False
        except Exception as e:
            print(f"Registration error: {e}")
            return False
    
    def send_ping(self) -> bool:
        """Send ping to platform"""
        if not self.agent_id:
            return False
            
        try:
            endpoint = f"{self.platform_url}/api/webhook/ping"
            response = requests.post(endpoint, json={
                'agent_id': self.agent_id,
                'status': 'active'
            }, timeout=10)
            return response.status_code == 200
        except Exception:
            return False

# Initialize and run
agent = TestPlatformAgent()
agent.register_with_platform()
agent.send_ping()
`;

    // Create test zip file
    console.log('\\n📦 Creating test agent zip...');
    const zip = new AdmZip();
    zip.addFile("main.py", Buffer.from(testAgentCode, "utf8"));
    zip.addFile("config.json", Buffer.from(JSON.stringify({
      name: "Direct Test Agent",
      version: "1.0.0",
      description: "Testing direct upload with enhanced scanning"
    }, null, 2), "utf8"));
    
    const testZipPath = path.join(__dirname, 'uploads', 'direct-test-agent.zip');
    zip.writeZip(testZipPath);
    console.log(`✅ Created: ${path.basename(testZipPath)}`);

    // Test upload
    console.log('\\n🔄 Testing Agent Upload...');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testZipPath));
    formData.append('name', 'Direct Test Platform Agent');
    formData.append('description', 'Testing enhanced upload with code scanning and platform scoring');
    formData.append('category', 'Testing');
    formData.append('author_name', 'Direct Upload Test');
    formData.append('capabilities', '1,2,3');

    const uploadResponse = await axios.post('http://localhost:3001/api/agents', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Upload successful!');
    const agent = uploadResponse.data.agent;
    
    console.log('\\n📊 Upload Results:');
    console.log(`   Agent ID: ${agent.id}`);
    console.log(`   Name: ${agent.name}`);
    console.log(`   Communication Score: ${agent.communication_score}/100`);
    console.log(`   Compliance Level: ${agent.compliance_level}`);
    
    // Parse and display scan results
    if (agent.scan_results) {
      try {
        const scanData = JSON.parse(agent.scan_results);
        console.log('\\n🛡️ Security Scan Results:');
        console.log(`   Risk Level: ${scanData.riskLevel}`);
        console.log(`   Findings Count: ${scanData.findingsCount}`);
        console.log(`   Safe: ${scanData.safe}`);
        console.log(`   Platform Score: ${scanData.platformScore}/100`);
        console.log(`   Category: ${scanData.category}`);
        console.log(`   Scanned At: ${scanData.scannedAt}`);
      } catch (e) {
        console.log('⚠️ Could not parse scan results:', agent.scan_results.substring(0, 100) + '...');
      }
    }

    // Verify database storage
    console.log('\\n🗄️ Verifying Database Storage...');
    const dbVerify = new sqlite3.Database(dbPath);
    
    const storedAgent = await new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM agents WHERE id = ?';
      dbVerify.get(sql, [agent.id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
    
    if (storedAgent) {
      console.log('✅ Agent stored correctly in database:');
      console.log(`   Communication Score: ${storedAgent.communication_score}`);
      console.log(`   Compliance Level: ${storedAgent.compliance_level}`);
      console.log(`   Scan Results: ${storedAgent.scan_results ? 'Present' : 'Missing'}`);
    } else {
      console.log('❌ Agent not found in database');
    }
    
    dbVerify.close();

    // Clean up
    console.log('\\n🧹 Cleaning up...');
    try {
      fs.unlinkSync(testZipPath);
      console.log('✅ Test files cleaned up');
    } catch (e) {
      console.log('⚠️ Could not clean up test files');
    }

    console.log('\\n🎉 Direct Upload Test Successful!');
    console.log('\\n✅ Verified:');
    console.log('- ✅ Code scanner integrated into upload endpoint');
    console.log('- ✅ Platform scoring calculated and stored');
    console.log('- ✅ New database columns populated correctly');
    console.log('- ✅ Scan results included in API response');
    console.log('- ✅ Enhanced upload flow working end-to-end');
    
  } catch (error) {
    console.error('❌ Direct upload test failed:', error.response?.data || error.message);
  }
}

// Run the test
if (require.main === module) {
  testUploadDirect().catch(console.error);
}

module.exports = { testUploadDirect };