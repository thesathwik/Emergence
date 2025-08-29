#!/usr/bin/env node

/**
 * Test script for the Code Scanner module
 * Tests zip extraction and analysis with sample uploads
 */

const CodeScanner = require('./utils/codeScanner');
const path = require('path');
const fs = require('fs');

async function testCodeScanner() {
  console.log('🚀 Testing Code Scanner Module');
  console.log('=' .repeat(50));

  const scanner = new CodeScanner();

  // Get list of uploaded files
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Uploads directory not found');
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(file => 
    file.endsWith('.zip') && !file.startsWith('.')
  );

  if (files.length === 0) {
    console.log('⚠️  No zip files found in uploads directory');
    // Create a test zip file for demonstration
    await createTestZipFile();
    return testCodeScanner(); // Retry after creating test file
  }

  console.log(`📁 Found ${files.length} zip file(s) to test:`);
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  console.log('');

  // Test each zip file
  for (const file of files) {
    const zipPath = path.join(uploadsDir, file);
    console.log(`🔍 Testing: ${file}`);
    console.log('-'.repeat(40));

    try {
      const startTime = Date.now();
      const results = await scanner.scanZipFile(zipPath);
      const duration = Date.now() - startTime;

      // Display results
      console.log(`✅ Scan completed in ${duration}ms`);
      console.log(`📊 Files analyzed: ${results.fileCount}`);
      console.log(`📦 Total size: ${(results.totalSize / 1024).toFixed(2)} KB`);
      console.log(`🛡️  Risk level: ${results.summary.riskLevel.toUpperCase()}`);
      console.log(`🔒 Security findings: ${results.securityFindings.length}`);

      if (results.summary.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        results.summary.warnings.forEach(warning => {
          console.log(`   - ${warning}`);
        });
      }

      if (results.summary.errors.length > 0) {
        console.log('❌ Errors:');
        results.summary.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }

      // Show file breakdown
      if (results.files.length > 0) {
        console.log('\n📄 Files found:');
        results.files.slice(0, 10).forEach(file => {
          const riskIndicator = file.suspicious ? '⚠️' : 
                               file.isCodeFile ? '📝' : '📄';
          console.log(`   ${riskIndicator} ${file.fileName} (${(file.size / 1024).toFixed(2)} KB)`);
        });
        if (results.files.length > 10) {
          console.log(`   ... and ${results.files.length - 10} more files`);
        }
      }

      // Show security findings
      if (results.securityFindings.length > 0) {
        console.log('\n🔍 Security Findings:');
        results.securityFindings.slice(0, 5).forEach((finding, index) => {
          const severityIcon = {
            critical: '🚨',
            high: '⚠️',
            medium: '⚡',
            low: 'ℹ️'
          }[finding.severity] || 'ℹ️';
          
          console.log(`   ${severityIcon} [${finding.severity.toUpperCase()}] ${finding.file}:${finding.line}`);
          console.log(`     Category: ${finding.category}`);
          console.log(`     Found: ${finding.match.substring(0, 80)}${finding.match.length > 80 ? '...' : ''}`);
        });
        if (results.securityFindings.length > 5) {
          console.log(`   ... and ${results.securityFindings.length - 5} more findings`);
        }
      }

      // Generate and save report
      const report = scanner.generateReport(results);
      const reportPath = path.join(__dirname, `scan-report-${file.replace('.zip', '')}.txt`);
      fs.writeFileSync(reportPath, report);
      console.log(`📄 Full report saved to: ${path.basename(reportPath)}`);

    } catch (error) {
      console.error(`❌ Error scanning ${file}:`, error.message);
    }

    console.log('');
  }

  console.log('🎉 Code scanner testing completed!');
}

/**
 * Create a test zip file for demonstration if no uploads exist
 */
async function createTestZipFile() {
  console.log('📦 Creating test zip file for demonstration...');
  
  const AdmZip = require('adm-zip');
  const zip = new AdmZip();

  // Create sample Python agent
  const samplePython = `#!/usr/bin/env python3
"""
Sample Agent for Testing Code Scanner
This is a test agent with various code patterns
"""

import os
import sys
import json
import requests
from datetime import datetime

class TestAgent:
    def __init__(self, config_path="config.json"):
        self.config_path = config_path
        self.config = self.load_config()
        
    def load_config(self):
        """Load configuration from JSON file"""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"name": "Test Agent", "version": "1.0.0"}
    
    def process_message(self, message):
        """Process incoming message"""
        print(f"Processing: {message}")
        
        # Example API call
        response = requests.get("https://api.example.com/data")
        
        return {
            "status": "processed",
            "timestamp": datetime.now().isoformat(),
            "data": response.json() if response.status_code == 200 else None
        }
    
    def run(self):
        """Main execution loop"""
        print(f"Starting {self.config.get('name', 'Unknown Agent')}")
        
        # Main loop would go here
        while True:
            try:
                # Agent logic
                break
            except KeyboardInterrupt:
                print("Agent stopped by user")
                break

if __name__ == "__main__":
    agent = TestAgent()
    agent.run()
`;

  // Create sample config
  const sampleConfig = {
    "name": "Test Agent",
    "version": "1.0.0",
    "description": "A sample agent for testing the code scanner",
    "author": "Test User",
    "capabilities": ["data-processing", "api-integration"],
    "requirements": ["requests>=2.25.0", "python>=3.7"]
  };

  // Create sample requirements.txt
  const requirements = `requests>=2.25.0
json>=2.0.9
datetime>=4.3`;

  // Create sample README
  const readme = `# Test Agent

This is a sample agent for testing the Emergence platform code scanner.

## Features

- Basic message processing
- API integration example
- Configuration management
- Error handling

## Installation

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Usage

\`\`\`bash
python main.py
\`\`\`
`;

  // Add files to zip
  zip.addFile("main.py", Buffer.from(samplePython, "utf8"));
  zip.addFile("config.json", Buffer.from(JSON.stringify(sampleConfig, null, 2), "utf8"));
  zip.addFile("requirements.txt", Buffer.from(requirements, "utf8"));
  zip.addFile("README.md", Buffer.from(readme, "utf8"));

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // Save test zip file
  const testZipPath = path.join(uploadsDir, 'test-agent-scanner.zip');
  zip.writeZip(testZipPath);
  
  console.log(`✅ Test zip created: ${path.basename(testZipPath)}`);
}

// Run the test
if (require.main === module) {
  testCodeScanner().catch(console.error);
}

module.exports = { testCodeScanner };