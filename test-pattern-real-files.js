#!/usr/bin/env node

/**
 * Test Pattern Detection on Real Uploaded Files
 * Tests the pattern detection on actual uploaded zip files
 */

const CodeScanner = require('./utils/codeScanner');
const path = require('path');
const fs = require('fs');

async function testPatternDetectionRealFiles() {
  console.log('🔍 Testing Pattern Detection on Real Files');
  console.log('='.repeat(50));

  const scanner = new CodeScanner();
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Uploads directory not found');
    return;
  }

  const zipFiles = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.zip'));
  
  if (zipFiles.length === 0) {
    console.log('❌ No zip files found for testing');
    return;
  }

  console.log(`📁 Testing pattern detection on ${zipFiles.length} uploaded files:\n`);

  for (const zipFile of zipFiles) {
    const zipPath = path.join(uploadsDir, zipFile);
    console.log(`🔍 Analyzing: ${zipFile}`);
    console.log('-'.repeat(40));

    try {
      // Scan the file
      const scanResults = await scanner.scanZipFile(zipPath);
      console.log(`📊 Scan completed - ${scanResults.fileCount} files, ${scanResults.securityFindings.length} findings`);

      // Test pattern detection on file contents
      let totalCommunicationPatterns = 0;
      let filesWithPatterns = 0;
      const patternSummary = {};

      // Look at each analyzed file
      for (const fileInfo of scanResults.files) {
        if (fileInfo.isCodeFile && fileInfo.lineCount > 0) {
          // We need to re-extract to get content for pattern testing
          // For now, we'll use the security findings as proxy
          continue;
        }
      }

      // Test specific patterns on the security findings
      let hasWebhook = false;
      let hasRequestsPost = false;
      let hasApiPattern = false;

      for (const finding of scanResults.securityFindings) {
        const content = finding.match || '';
        
        // Check for communication patterns in security findings
        if (scanner.hasPatterns(content, ['webhook', 'api/'])) {
          hasWebhook = true;
        }
        if (scanner.hasPatterns(content, 'requests.post')) {
          hasRequestsPost = true;
        }
        if (scanner.hasPatterns(content, ['api/', '/api'])) {
          hasApiPattern = true;
        }
      }

      // Summary for this file
      console.log('📋 Pattern Detection Results:');
      console.log(`   api/webhook patterns: ${hasWebhook ? '✅ FOUND' : '❌ NOT FOUND'}`);
      console.log(`   requests.post patterns: ${hasRequestsPost ? '✅ FOUND' : '❌ NOT FOUND'}`);
      console.log(`   API patterns: ${hasApiPattern ? '✅ FOUND' : '❌ NOT FOUND'}`);

      // Show sample findings that might contain communication patterns
      const communicationFindings = scanResults.securityFindings.filter(finding => 
        finding.category === 'networkOperations'
      );

      if (communicationFindings.length > 0) {
        console.log('\n🌐 Network Communication Findings:');
        communicationFindings.slice(0, 3).forEach(finding => {
          console.log(`   - ${finding.file}:${finding.line} - "${finding.match}"`);
        });
        if (communicationFindings.length > 3) {
          console.log(`   ... and ${communicationFindings.length - 3} more network findings`);
        }
      }

    } catch (error) {
      console.error(`❌ Error scanning ${zipFile}:`, error.message);
    }

    console.log('');
  }

  // Demonstrate pattern detection with sample content
  console.log('🧪 Testing Pattern Detection with Sample Content:');
  console.log('-'.repeat(50));

  const sampleApiCode = `
import requests
import json

def send_webhook(data):
    webhook_url = "https://api.myservice.com/api/webhook"
    response = requests.post(webhook_url, json=data)
    return response.status_code == 200

def fetch_callback():
    return requests.get("https://api.example.com/api/callback")
`;

  // Test basic patterns
  console.log('📋 Basic Pattern Tests:');
  console.log(`   api/webhook: ${scanner.hasPatterns(sampleApiCode, 'api/webhook')}`);
  console.log(`   requests.post: ${scanner.hasPatterns(sampleApiCode, 'requests.post')}`);
  console.log(`   https://: ${scanner.hasPatterns(sampleApiCode, 'https://')}`);

  // Test communication patterns
  const commResult = scanner.detectCommunicationPatterns(sampleApiCode);
  console.log(`\n🌐 Communication Patterns Found: ${commResult.found}`);
  if (commResult.found) {
    console.log('   Detected patterns:');
    const uniqueMatches = [...new Set(commResult.matches)];
    uniqueMatches.forEach(match => {
      console.log(`     - "${match.trim()}"`);
    });
  }

  console.log('\n🎉 Real File Pattern Detection Testing Complete!');
}

// Run the test
if (require.main === module) {
  testPatternDetectionRealFiles().catch(console.error);
}

module.exports = { testPatternDetectionRealFiles };