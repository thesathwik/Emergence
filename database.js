const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database configuration
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create users table with password_hash
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table initialized successfully.');
        migrateUsersTable();
      }
    });

    // Create agents table
    db.run(`CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      author_name TEXT,
      file_path TEXT,
      file_size INTEGER,
      download_count INTEGER DEFAULT 0,
      user_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating agents table:', err.message);
      } else {
        console.log('Agents table initialized successfully.');
        migrateAgentsTable();
      }
    });

    console.log('Database initialization completed.');
  });
}

// Migration function for users table
function migrateUsersTable() {
  // Check if password_hash column exists
  db.get("PRAGMA table_info(users)", [], (err, rows) => {
    if (err) {
      console.error('Error checking users table schema:', err.message);
      return;
    }
    
    db.all("PRAGMA table_info(users)", [], (err, columns) => {
      if (err) {
        console.error('Error getting users table columns:', err.message);
        return;
      }
      
      const hasPasswordHash = columns.some(col => col.name === 'password_hash');
      
      if (!hasPasswordHash) {
        console.log('Adding password_hash column to users table...');
        db.run('ALTER TABLE users ADD COLUMN password_hash TEXT', (err) => {
          if (err) {
            console.error('Error adding password_hash column:', err.message);
          } else {
            console.log('Successfully added password_hash column to users table.');
          }
        });
      } else {
        console.log('password_hash column already exists in users table.');
      }
    });
  });
}

// Migration function for agents table
function migrateAgentsTable() {
  // Check if user_id column exists
  db.get("PRAGMA table_info(agents)", [], (err, rows) => {
    if (err) {
      console.error('Error checking agents table schema:', err.message);
      return;
    }
    
    db.all("PRAGMA table_info(agents)", [], (err, columns) => {
      if (err) {
        console.error('Error getting agents table columns:', err.message);
        return;
      }
      
      const hasUserId = columns.some(col => col.name === 'user_id');
      
      if (!hasUserId) {
        console.log('Adding user_id column to agents table...');
        db.run('ALTER TABLE agents ADD COLUMN user_id INTEGER REFERENCES users(id)', (err) => {
          if (err) {
            console.error('Error adding user_id column:', err.message);
          } else {
            console.log('Successfully added user_id column to agents table.');
          }
        });
      } else {
        console.log('user_id column already exists in agents table.');
      }
    });
  });
}

// Database helper functions
const dbHelpers = {
  // Get all agents
  getAllAgents: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM agents ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Get agent by ID
  getAgentById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM agents WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Create new agent
  createAgent: (agentData) => {
    return new Promise((resolve, reject) => {
      const { name, description, category, author_name, file_path, file_size, user_id } = agentData;
      
      db.run(
        'INSERT INTO agents (name, description, category, author_name, file_path, file_size, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, category, author_name, file_path, file_size, user_id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...agentData });
          }
        }
      );
    });
  },

  // Update agent
  updateAgent: (id, agentData) => {
    return new Promise((resolve, reject) => {
      const { name, description, category, author_name, file_path, file_size, user_id } = agentData;
      
      db.run(
        'UPDATE agents SET name = ?, description = ?, category = ?, author_name = ?, file_path = ?, file_size = ?, user_id = ? WHERE id = ?',
        [name, description, category, author_name, file_path, file_size, user_id, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...agentData });
          }
        }
      );
    });
  },

  // Delete agent
  deleteAgent: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM agents WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  },

  // Increment download count
  incrementDownloadCount: (id) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE agents SET download_count = download_count + 1 WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ updated: this.changes > 0 });
        }
      });
    });
  },

  // Get agents by category
  getAgentsByCategory: (category) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM agents WHERE category = ? ORDER BY created_at DESC', [category], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Search agents
  searchAgents: (searchTerm) => {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${searchTerm}%`;
      db.all(
        'SELECT * FROM agents WHERE name LIKE ? OR description LIKE ? OR author_name LIKE ? ORDER BY created_at DESC',
        [searchPattern, searchPattern, searchPattern],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  // Get top downloaded agents
  getTopDownloadedAgents: (limit = 10) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM agents ORDER BY download_count DESC LIMIT ?', [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // User authentication methods
  // Create new user
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      const { email, password_hash, name } = userData;
      
      db.run(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [email, password_hash, name],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, email, name });
          }
        }
      );
    });
  },

  // Get user by email
  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Get user by ID
  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Get agents by user ID
  getAgentsByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM agents WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Update user
  updateUser: (id, userData) => {
    return new Promise((resolve, reject) => {
      const { email, name } = userData;
      
      db.run(
        'UPDATE users SET email = ?, name = ? WHERE id = ?',
        [email, name, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...userData });
          }
        }
      );
    });
  },

  // Update user password
  updateUserPassword: (id, password_hash) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [password_hash, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ updated: this.changes > 0 });
          }
        }
      );
    });
  },

  // Delete user
  deleteUser: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }
};

// Test database connection
function testConnection() {
  return new Promise((resolve, reject) => {
    db.get('SELECT 1 as test', [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve({ connected: true, test: row.test });
      }
    });
  });
}

// Close database connection
function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database connection closed.');
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  dbHelpers,
  testConnection,
  closeDatabase,
  initializeDatabase
};
