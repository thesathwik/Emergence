#!/usr/bin/env node

const { chromium } = require('playwright');

async function testFrontendDisplay() {
  console.log('🎯 Testing Frontend Compliance Display');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the main page
    console.log('📱 Opening frontend...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for agents to load
    console.log('⏳ Waiting for agents to load...');
    await page.waitForSelector('[data-testid="agent-card"], .group', { timeout: 10000 });
    
    // Look for compliance badges
    const badges = await page.locator('text=Unlikely').count();
    const warningElements = await page.locator('[class*="bg-red-50"], [class*="bg-amber-50"]').count();
    
    console.log(`🏷️  Found ${badges} compliance badges`);
    console.log(`⚠️  Found ${warningElements} warning elements`);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'frontend-test.png', fullPage: true });
    console.log('📷 Screenshot saved as frontend-test.png');
    
    // Check specific test agents
    const testAgents = await page.locator('text=Test Non-Communicating Agent').count() + 
                       await page.locator('text=Test Communicating Agent').count();
    
    console.log(`🤖 Found ${testAgents} test agents on page`);
    
    if (badges > 0 && testAgents > 0) {
      console.log('✅ Frontend compliance display verified!');
    } else {
      console.log('❌ Frontend compliance display needs attention');
    }
    
  } catch (error) {
    console.error('❌ Error testing frontend:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testFrontendDisplay().catch(console.error);
}

module.exports = { testFrontendDisplay };