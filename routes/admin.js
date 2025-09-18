const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Admin endpoint to delete all users (for development/testing)
router.delete('/users/all', async (req, res) => {
  try {
    // Security check - only allow in development or with special header
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const hasAdminKey = req.headers['x-admin-key'] === process.env.ADMIN_KEY;
    const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

    if (!isDevelopment && !hasAdminKey && !isLocalhost) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get current user count
    const getUserCount = () => {
      return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });
    };

    // Delete all users
    const deleteUsers = () => {
      return new Promise((resolve, reject) => {
        db.run("DELETE FROM users", [], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    };

    // Reset auto-increment counter
    const resetAutoIncrement = () => {
      return new Promise((resolve, reject) => {
        db.run("DELETE FROM sqlite_sequence WHERE name='users'", [], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    };

    // Get initial count
    const initialCount = await getUserCount();
    console.log(`🗑️  Admin delete request: Found ${initialCount} users`);

    if (initialCount === 0) {
      return res.json({
        success: true,
        message: 'No users to delete',
        usersDeleted: 0,
        finalCount: 0
      });
    }

    // Delete all users
    const deletedCount = await deleteUsers();
    console.log(`✅ Admin delete: Deleted ${deletedCount} users`);

    // Reset auto-increment counter
    await resetAutoIncrement();
    console.log('✅ Admin delete: User ID counter reset');

    // Verify deletion
    const finalCount = await getUserCount();

    res.json({
      success: true,
      message: `Successfully deleted all users from database`,
      usersDeleted: deletedCount,
      finalCount: finalCount,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Admin delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete users',
      error: error.message
    });
  }
});

// Admin endpoint to get user count
router.get('/users/count', async (req, res) => {
  try {
    const getUserCount = () => {
      return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });
    };

    const count = await getUserCount();

    res.json({
      success: true,
      userCount: count,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Admin count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user count',
      error: error.message
    });
  }
});

module.exports = router;