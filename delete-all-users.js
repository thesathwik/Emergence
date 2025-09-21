#!/usr/bin/env node

const { db, dbHelpers, initializeDatabase } = require('./database');

async function deleteAllUsers() {
  console.log('🗑️  Starting user deletion process...');

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
      console.log('🎉 All users deleted successfully!');
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

// Confirmation prompt
console.log('⚠️  WARNING: This will permanently delete ALL users from the database!');
console.log('📧 This includes all user accounts, verification tokens, and related data.');
console.log('🔄 User IDs will be reset to start from 1.');
console.log('');

// Check for confirmation argument
if (process.argv.includes('--confirm')) {
  deleteAllUsers();
} else {
  console.log('To proceed, run this command with --confirm flag:');
  console.log('node delete-all-users.js --confirm');
  console.log('');
  process.exit(0);
}