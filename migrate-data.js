#!/usr/bin/env node

/**
 * Data Migration Script for Railway Volume Migration
 * 
 * This script helps migrate data from your local SQLite database
 * to the new persistent volume location in production.
 * 
 * Usage:
 *   node migrate-data.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const OLD_DB_PATH = path.join(__dirname, 'database.sqlite');
const NEW_DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'database.sqlite');

console.log('🚀 Railway Volume Migration Script');
console.log('==================================');

// Check if old database exists
if (!fs.existsSync(OLD_DB_PATH)) {
  console.log('❌ No existing database found at:', OLD_DB_PATH);
  console.log('✅ Nothing to migrate. New database will be created automatically.');
  process.exit(0);
}

// Ensure new directory exists
const newDir = path.dirname(NEW_DB_PATH);
if (!fs.existsSync(newDir)) {
  fs.mkdirSync(newDir, { recursive: true });
  console.log('📁 Created directory:', newDir);
}

// Copy database file
try {
  fs.copyFileSync(OLD_DB_PATH, NEW_DB_PATH);
  console.log('✅ Database migrated successfully!');
  console.log('   From:', OLD_DB_PATH);
  console.log('   To:', NEW_DB_PATH);
  
  // Verify the migration
  const oldStats = fs.statSync(OLD_DB_PATH);
  const newStats = fs.statSync(NEW_DB_PATH);
  
  console.log('\n📊 Migration Verification:');
  console.log('   Original size:', oldStats.size, 'bytes');
  console.log('   New size:', newStats.size, 'bytes');
  console.log('   ✅ Sizes match:', oldStats.size === newStats.size);
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Migration completed successfully!');
console.log('\n📝 Next steps:');
console.log('   1. Test your application locally with: npm start');
console.log('   2. Deploy to Railway: git push');
console.log('   3. Your data will now persist between deployments!');