#!/usr/bin/env node

const { db, dbHelpers, initializeDatabase } = require('./database');

async function deleteAllProductionUsers() {
  console.log('🗑️  Starting PRODUCTION user deletion process...');
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
  console.log('🚂 Railway detected:', !!process.env.RAILWAY_ENVIRONMENT);

  try {
    // Initialize database connection
    await initializeDatabase();
    console.log('✅ Database connected successfully');

    // Get current user count
    const getUserCount = () => {
      return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count);
          }
        });
      });
    };

    // Get sample user emails (for verification)
    const getSampleUsers = () => {
      return new Promise((resolve, reject) => {
        db.all("SELECT email, created_at FROM users LIMIT 5", [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    };

    // Delete all users
    const deleteUsers = () => {
      return new Promise((resolve, reject) => {
        db.run("DELETE FROM users", [], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        });
      });
    };

    // Reset auto-increment counter
    const resetAutoIncrement = () => {
      return new Promise((resolve, reject) => {
        db.run("DELETE FROM sqlite_sequence WHERE name='users'", [], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    };

    // Get initial count
    const initialCount = await getUserCount();
    console.log(`📊 Found ${initialCount} users in database`);

    if (initialCount === 0) {
      console.log('✅ No users to delete');
      process.exit(0);
    }

    // Show sample users for verification
    const sampleUsers = await getSampleUsers();
    console.log('📋 Sample users to be deleted:');
    sampleUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (created: ${user.created_at})`);
    });

    // Safety check for production
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
      console.log('⚠️  PRODUCTION ENVIRONMENT DETECTED!');
      console.log('🔒 This will permanently delete ALL users from the production database');
    }

    // Delete all users
    console.log('🗑️  Deleting all users...');
    const deletedCount = await deleteUsers();
    console.log(`✅ Deleted ${deletedCount} users successfully`);

    // Reset auto-increment counter so next user gets ID 1
    console.log('🔄 Resetting user ID counter...');
    await resetAutoIncrement();
    console.log('✅ User ID counter reset to 1');

    // Verify deletion
    const finalCount = await getUserCount();
    console.log(`📊 Final user count: ${finalCount}`);

    if (finalCount === 0) {
      console.log('🎉 All users deleted successfully from production!');
      console.log('📝 Next user registration will start with ID 1');
    } else {
      console.error('❌ Some users may not have been deleted');
    }

  } catch (error) {
    console.error('❌ Error during user deletion:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Main execution with safety checks
async function main() {
  console.log('⚠️  WARNING: This will permanently delete ALL users from the database!');
  console.log('📧 This includes all user accounts, verification tokens, and related data.');
  console.log('🔄 User IDs will be reset to start from 1.');
  console.log('');

  // Check environment
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
  const hasConfirmFlag = process.argv.includes('--confirm');
  const hasForceFlag = process.argv.includes('--force-production');

  if (isProduction && !hasForceFlag) {
    console.log('🔒 PRODUCTION ENVIRONMENT DETECTED');
    console.log('To delete users from production, use:');
    console.log('node delete-production-users.js --force-production --confirm');
    console.log('');
    console.log('⚠️  This is a destructive operation that cannot be undone!');
    process.exit(0);
  }

  if (!hasConfirmFlag) {
    console.log('To proceed, run this command with --confirm flag:');
    if (isProduction) {
      console.log('node delete-production-users.js --force-production --confirm');
    } else {
      console.log('node delete-production-users.js --confirm');
    }
    console.log('');
    process.exit(0);
  }

  // Execute deletion
  await deleteAllProductionUsers();
}

// Check for direct execution (not when running via Railway CLI)
if (require.main === module) {
  main();
}