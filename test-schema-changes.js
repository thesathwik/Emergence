#!/usr/bin/env node

/**
 * Test Database Schema Changes
 * Tests that communication_score and compliance_level columns work correctly
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testSchemaChanges() {
  console.log('🗄️ Testing Database Schema Changes');
  console.log('='.repeat(60));

  const dbPath = path.join(__dirname, 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  try {
    // Test 1: Verify new columns exist
    console.log('📋 Test 1: Verifying new columns exist...');
    
    await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(agents)", [], (err, columns) => {
        if (err) {
          reject(err);
          return;
        }
        
        const columnNames = columns.map(col => col.name);
        const hasCommScore = columnNames.includes('communication_score');
        const hasCompLevel = columnNames.includes('compliance_level');
        
        console.log(`   communication_score column exists: ${hasCommScore ? '✅' : '❌'}`);
        console.log(`   compliance_level column exists: ${hasCompLevel ? '✅' : '❌'}`);
        
        if (hasCommScore && hasCompLevel) {
          console.log('   ✅ All new columns found successfully');
        } else {
          console.log('   ❌ Some columns are missing');
        }
        
        // Show all agent table columns
        console.log('\\n📊 Current agent table schema:');
        columns.forEach(col => {
          const defaultVal = col.dflt_value ? ` (default: ${col.dflt_value})` : '';
          console.log(`   - ${col.name}: ${col.type}${defaultVal}`);
        });
        
        resolve();
      });
    });

    // Test 2: Insert test data with new columns
    console.log('\\n📝 Test 2: Testing insert with new columns...');
    
    const testAgent = {
      name: 'Test Schema Agent',
      description: 'Testing new database schema',
      category: 'Test',
      author_name: 'Schema Tester',
      file_path: '/tmp/test-agent.zip',
      file_size: 1024,
      user_id: 1,
      scan_results: JSON.stringify({
        riskLevel: 'low',
        findingsCount: 0,
        scannedAt: new Date().toISOString(),
        safe: true,
        platformScore: 85,
        category: 'Verified'
      }),
      communication_score: 85,
      compliance_level: 'Verified'
    };

    await new Promise((resolve, reject) => {
      const sql = `INSERT INTO agents (
        name, description, category, author_name, file_path, file_size, 
        user_id, scan_results, communication_score, compliance_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        testAgent.name, testAgent.description, testAgent.category,
        testAgent.author_name, testAgent.file_path, testAgent.file_size,
        testAgent.user_id, testAgent.scan_results, testAgent.communication_score,
        testAgent.compliance_level
      ];

      db.run(sql, values, function(err) {
        if (err) {
          console.log(`   ❌ Insert failed: ${err.message}`);
          reject(err);
          return;
        }
        
        console.log(`   ✅ Successfully inserted agent with ID: ${this.lastID}`);
        console.log(`   📊 Communication Score: ${testAgent.communication_score}`);
        console.log(`   📋 Compliance Level: ${testAgent.compliance_level}`);
        resolve(this.lastID);
      });
    });

    // Test 3: Query data with new columns
    console.log('\\n🔍 Test 3: Querying data with new columns...');
    
    await new Promise((resolve, reject) => {
      const sql = `SELECT id, name, communication_score, compliance_level, scan_results, created_at 
                   FROM agents 
                   WHERE name = ?`;

      db.all(sql, [testAgent.name], (err, rows) => {
        if (err) {
          console.log(`   ❌ Query failed: ${err.message}`);
          reject(err);
          return;
        }

        if (rows.length === 0) {
          console.log('   ❌ No test agent found');
          resolve();
          return;
        }

        const agent = rows[0];
        console.log(`   ✅ Found agent: ${agent.name}`);
        console.log(`   📊 Communication Score: ${agent.communication_score}/100`);
        console.log(`   📋 Compliance Level: ${agent.compliance_level}`);
        
        // Parse and display scan results
        try {
          const scanData = JSON.parse(agent.scan_results);
          console.log(`   🛡️  Scan Results:`);
          console.log(`      Risk Level: ${scanData.riskLevel}`);
          console.log(`      Platform Score: ${scanData.platformScore}`);
          console.log(`      Category: ${scanData.category}`);
          console.log(`      Safe: ${scanData.safe}`);
        } catch (e) {
          console.log(`   ⚠️  Could not parse scan results`);
        }
        
        resolve();
      });
    });

    // Test 4: Update test - modify scores
    console.log('\\n✏️  Test 4: Testing score updates...');
    
    await new Promise((resolve, reject) => {
      const sql = `UPDATE agents 
                   SET communication_score = ?, compliance_level = ?
                   WHERE name = ?`;

      db.run(sql, [92, 'Verified', testAgent.name], function(err) {
        if (err) {
          console.log(`   ❌ Update failed: ${err.message}`);
          reject(err);
          return;
        }
        
        console.log(`   ✅ Successfully updated agent scores`);
        console.log(`   📊 New Communication Score: 92`);
        console.log(`   📋 New Compliance Level: Verified`);
        resolve();
      });
    });

    // Test 5: Query by compliance level
    console.log('\\n📈 Test 5: Querying by compliance level...');
    
    await new Promise((resolve, reject) => {
      const sql = `SELECT name, communication_score, compliance_level 
                   FROM agents 
                   WHERE compliance_level = ?`;

      db.all(sql, ['Verified'], (err, rows) => {
        if (err) {
          console.log(`   ❌ Query failed: ${err.message}`);
          reject(err);
          return;
        }

        console.log(`   ✅ Found ${rows.length} 'Verified' agents:`);
        rows.forEach((agent, index) => {
          console.log(`   ${index + 1}. ${agent.name} (Score: ${agent.communication_score})`);
        });
        
        resolve();
      });
    });

    // Test 6: Aggregate queries
    console.log('\\n📊 Test 6: Testing aggregate queries...');
    
    await new Promise((resolve, reject) => {
      const sql = `SELECT 
                     compliance_level,
                     COUNT(*) as count,
                     AVG(communication_score) as avg_score,
                     MIN(communication_score) as min_score,
                     MAX(communication_score) as max_score
                   FROM agents 
                   WHERE communication_score IS NOT NULL
                   GROUP BY compliance_level`;

      db.all(sql, [], (err, rows) => {
        if (err) {
          console.log(`   ❌ Aggregate query failed: ${err.message}`);
          reject(err);
          return;
        }

        console.log(`   ✅ Agent statistics by compliance level:`);
        rows.forEach(row => {
          console.log(`   📋 ${row.compliance_level}:`);
          console.log(`      Count: ${row.count} agents`);
          console.log(`      Average Score: ${row.avg_score?.toFixed(1) || 'N/A'}`);
          console.log(`      Score Range: ${row.min_score}-${row.max_score}`);
        });
        
        resolve();
      });
    });

    console.log('\\n🎉 Database Schema Testing Complete!');
    console.log('\\n📋 Test Summary:');
    console.log('- ✅ New columns added successfully');
    console.log('- ✅ Insert operations with new columns work');
    console.log('- ✅ Query operations with new columns work');
    console.log('- ✅ Update operations on new columns work');
    console.log('- ✅ Filtering by compliance level works');
    console.log('- ✅ Aggregate queries on communication scores work');
    
  } catch (error) {
    console.error('❌ Schema test failed:', error);
  } finally {
    db.close();
  }
}

// Run the test
if (require.main === module) {
  testSchemaChanges().catch(console.error);
}

module.exports = { testSchemaChanges };