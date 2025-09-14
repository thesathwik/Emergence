#!/usr/bin/env node

/**
 * Railway Volume Status Checker
 * 
 * This script checks if the Railway volume is properly mounted and configured.
 * Run this to diagnose database persistence issues.
 */

const fs = require('fs');
const path = require('path');

function checkVolumeStatus() {
  console.log('🔍 Railway Volume Status Check');
  console.log('================================\n');
  
  const volumePath = '/app/data';
  const expectedDbPath = '/app/data/database.sqlite';
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Expected volume path: ${volumePath}`);
  console.log(`Expected database path: ${expectedDbPath}\n`);
  
  // Check if we're in production
  if (!isProduction) {
    console.log('✅ Running in development mode - volume not required');
    return;
  }
  
  // Check if volume directory exists
  const volumeExists = fs.existsSync(volumePath);
  console.log(`Volume directory exists: ${volumeExists ? '✅' : '❌'}`);
  
  if (!volumeExists) {
    console.log('\n🚨 CRITICAL ISSUE: Railway volume not mounted!');
    console.log('\nTo fix this:');
    console.log('1. Create volume: railway volume create emergence-db-volume');
    console.log('2. Attach volume: railway volume attach emergence-db-volume /app/data');
    console.log('3. Redeploy your service');
    console.log('\nSee RAILWAY_VOLUME_SETUP.md for detailed instructions');
    return;
  }
  
  // Check if volume is writable
  try {
    const testFile = path.join(volumePath, '.volume_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('Volume is writable: ✅');
  } catch (error) {
    console.log('Volume is writable: ❌');
    console.log(`Write error: ${error.message}`);
  }
  
  // Check current database location
  try {
    const { db } = require('./database');
    const currentDbPath = db.filename;
    console.log(`Current database path: ${currentDbPath}`);
    
    if (currentDbPath === expectedDbPath) {
      console.log('Database location: ✅ Using persistent volume');
    } else if (currentDbPath.includes('/tmp/')) {
      console.log('Database location: 🚨 Using temporary storage - DATA WILL BE LOST!');
    } else {
      console.log('Database location: ⚠️  Using non-persistent location');
    }
  } catch (error) {
    console.log(`Database check error: ${error.message}`);
  }
  
  // Check if database file exists
  const dbExists = fs.existsSync(expectedDbPath);
  console.log(`Database file exists: ${dbExists ? '✅' : '❌'}`);
  
  if (dbExists) {
    const stats = fs.statSync(expectedDbPath);
    console.log(`Database file size: ${stats.size} bytes`);
    console.log(`Database last modified: ${stats.mtime}`);
  }
  
  console.log('\n📊 Summary:');
  if (volumeExists && dbExists) {
    console.log('✅ Volume is properly mounted and database exists');
    console.log('✅ Database should persist across deployments');
  } else if (volumeExists && !dbExists) {
    console.log('⚠️  Volume is mounted but database not yet created');
    console.log('✅ Database will persist once created');
  } else {
    console.log('🚨 CRITICAL: Volume not mounted - database will be lost on restart!');
    console.log('📖 See RAILWAY_VOLUME_SETUP.md for fix instructions');
  }
}

if (require.main === module) {
  checkVolumeStatus();
} else {
  module.exports = { checkVolumeStatus };
}