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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating agents table:', err.message);
      } else {
        console.log('Agents table initialized successfully.');
      }
    });

    // Create users table (keeping existing functionality)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table initialized successfully.');
      }
    });

    console.log('Database initialization completed.');
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
      const { name, description, category, author_name, file_path, file_size } = agentData;
      
      db.run(
        'INSERT INTO agents (name, description, category, author_name, file_path, file_size) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, category, author_name, file_path, file_size],
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
      const { name, description, category, author_name, file_path, file_size } = agentData;
      
      db.run(
        'UPDATE agents SET name = ?, description = ?, category = ?, author_name = ?, file_path = ?, file_size = ? WHERE id = ?',
        [name, description, category, author_name, file_path, file_size, id],
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
