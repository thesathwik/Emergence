const sqlite3 = require('sqlite3').verbose();

// Quick script to fix stuck registration issue
const db = new sqlite3.Database('./emergence.db');

// Get the email you're trying to register with
const email = process.argv[2];

if (!email) {
  console.log('Usage: node fix-registration.js <email>');
  console.log('Example: node fix-registration.js user@example.com');
  process.exit(1);
}

console.log(`Looking for user with email: ${email}`);

// Check current user status
db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
  if (err) {
    console.error('Error querying user:', err);
    return;
  }
  
  if (user) {
    console.log('Found user:', {
      id: user.id,
      name: user.name,
      email: user.email,
      is_verified: user.is_verified,
      verification_token: user.verification_token ? 'EXISTS' : 'NULL'
    });
    
    // Delete the unverified user so you can register again
    db.run('DELETE FROM users WHERE email = ? AND is_verified = 0', [email], function(err) {
      if (err) {
        console.error('Error deleting user:', err);
      } else {
        console.log(`Deleted unverified user. You can now register again with ${email}`);
      }
      db.close();
    });
  } else {
    console.log('No user found with that email');
    db.close();
  }
});