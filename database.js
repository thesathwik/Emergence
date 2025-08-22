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
    // Create users table with password_hash and email verification fields
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      is_verified BOOLEAN DEFAULT 0,
      verification_token TEXT,
      token_expires_at DATETIME,
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

    // Create agent_instances table
    db.run(`CREATE TABLE IF NOT EXISTS agent_instances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER REFERENCES agents(id),
      instance_name TEXT NOT NULL,
      status TEXT DEFAULT 'running',
      endpoint_url TEXT,
      last_ping DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating agent_instances table:', err.message);
      } else {
        console.log('Agent instances table initialized successfully.');
        migrateAgentInstancesTable();
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
      
      const columnNames = columns.map(col => col.name);
      
      // Add password_hash column if it doesn't exist
      if (!columnNames.includes('password_hash')) {
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
      
      // Add email verification columns if they don't exist
      if (!columnNames.includes('is_verified')) {
        console.log('Adding is_verified column to users table...');
        db.run('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0', (err) => {
          if (err) {
            console.error('Error adding is_verified column:', err.message);
          } else {
            console.log('Successfully added is_verified column to users table.');
          }
        });
      } else {
        console.log('is_verified column already exists in users table.');
      }
      
      if (!columnNames.includes('verification_token')) {
        console.log('Adding verification_token column to users table...');
        db.run('ALTER TABLE users ADD COLUMN verification_token TEXT', (err) => {
          if (err) {
            console.error('Error adding verification_token column:', err.message);
          } else {
            console.log('Successfully added verification_token column to users table.');
          }
        });
      } else {
        console.log('verification_token column already exists in users table.');
      }
      
      if (!columnNames.includes('token_expires_at')) {
        console.log('Adding token_expires_at column to users table...');
        db.run('ALTER TABLE users ADD COLUMN token_expires_at DATETIME', (err) => {
          if (err) {
            console.error('Error adding token_expires_at column:', err.message);
          } else {
            console.log('Successfully added token_expires_at column to users table.');
          }
        });
      } else {
        console.log('token_expires_at column already exists in users table.');
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
      
      const columnNames = columns.map(col => col.name);
      
      if (!columnNames.includes('user_id')) {
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

// Migration function for agent_instances table
function migrateAgentInstancesTable() {
  // Check if agent_instances table exists and has required columns
  db.get("PRAGMA table_info(agent_instances)", [], (err, rows) => {
    if (err) {
      console.log('agent_instances table does not exist, creating...');
      db.run(`CREATE TABLE agent_instances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id INTEGER REFERENCES agents(id),
        instance_name TEXT NOT NULL,
        status TEXT DEFAULT 'running',
        endpoint_url TEXT,
        last_ping DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('Error creating agent_instances table:', err.message);
        } else {
          console.log('Successfully created agent_instances table.');
        }
      });
    } else {
      console.log('agent_instances table already exists.');
      
      // Check for required columns and add them if missing
      const columnNames = columns.map(col => col.name);
      
      if (!columnNames.includes('metadata')) {
        console.log('Adding metadata column to agent_instances table...');
        db.run('ALTER TABLE agent_instances ADD COLUMN metadata TEXT', (err) => {
          if (err) {
            console.error('Error adding metadata column:', err.message);
          } else {
            console.log('Successfully added metadata column to agent_instances table.');
          }
        });
      }
      
      if (!columnNames.includes('created_at')) {
        console.log('Adding created_at column to agent_instances table...');
        db.run('ALTER TABLE agent_instances ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP', (err) => {
          if (err) {
            console.error('Error adding created_at column:', err.message);
          } else {
            console.log('Successfully added created_at column to agent_instances table.');
          }
        });
      }
    }
  });
}

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

  // Email verification methods
  // Set verification token for user
  setVerificationToken: (userId, token, expiresAt) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET verification_token = ?, token_expires_at = ? WHERE id = ?',
        [token, expiresAt, userId],
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

  // Verify user email
  verifyUserEmail: (token) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET is_verified = 1, verification_token = NULL, token_expires_at = NULL WHERE verification_token = ? AND token_expires_at > datetime("now")',
        [token],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ verified: this.changes > 0 });
          }
        }
      );
    });
  },

  // Get user by verification token
  getUserByVerificationToken: (token) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE verification_token = ? AND token_expires_at > datetime("now")',
        [token],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  },

  // Resend verification email (update token and expiry)
  resendVerificationToken: (userId, token, expiresAt) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET verification_token = ?, token_expires_at = ? WHERE id = ? AND is_verified = 0',
        [token, expiresAt, userId],
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
  },

  // Agent Instance Management Methods
  // Create new agent instance
  createAgentInstance: (instanceData) => {
    return new Promise((resolve, reject) => {
      const { agent_id, instance_name, status, endpoint_url, metadata } = instanceData;
      
      db.run(
        'INSERT INTO agent_instances (agent_id, instance_name, status, endpoint_url, metadata) VALUES (?, ?, ?, ?, ?)',
        [agent_id, instance_name, status || 'running', endpoint_url, metadata ? JSON.stringify(metadata) : null],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...instanceData });
          }
        }
      );
    });
  },

  // Get all agent instances
  getAllAgentInstances: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ai.*, a.name as agent_name, a.description as agent_description 
        FROM agent_instances ai 
        LEFT JOIN agents a ON ai.agent_id = a.id 
        ORDER BY ai.created_at DESC
      `, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse metadata JSON for each instance
          const instances = rows.map(row => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null
          }));
          resolve(instances);
        }
      });
    });
  },

  // Get agent instance by ID
  getAgentInstanceById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT ai.*, a.name as agent_name, a.description as agent_description 
        FROM agent_instances ai 
        LEFT JOIN agents a ON ai.agent_id = a.id 
        WHERE ai.id = ?
      `, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            row.metadata = row.metadata ? JSON.parse(row.metadata) : null;
          }
          resolve(row);
        }
      });
    });
  },

  // Update agent instance
  updateAgentInstance: (id, instanceData) => {
    return new Promise((resolve, reject) => {
      const { agent_id, instance_name, status, endpoint_url, metadata } = instanceData;
      
      db.run(
        'UPDATE agent_instances SET agent_id = ?, instance_name = ?, status = ?, endpoint_url = ?, metadata = ? WHERE id = ?',
        [agent_id, instance_name, status, endpoint_url, metadata ? JSON.stringify(metadata) : null, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...instanceData });
          }
        }
      );
    });
  },

  // Delete agent instance
  deleteAgentInstance: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM agent_instances WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  },

  // Get agent instances by agent ID
  getAgentInstancesByAgentId: (agentId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ai.*, a.name as agent_name, a.description as agent_description 
        FROM agent_instances ai 
        LEFT JOIN agents a ON ai.agent_id = a.id 
        WHERE ai.agent_id = ? 
        ORDER BY ai.created_at DESC
      `, [agentId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse metadata JSON for each instance
          const instances = rows.map(row => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null
          }));
          resolve(instances);
        }
      });
    });
  },

  // Update agent instance status
  updateAgentInstanceStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE agent_instances SET status = ?, last_ping = datetime("now") WHERE id = ?',
        [status, id],
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

  // Get running agent instances
  getRunningAgentInstances: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ai.*, a.name as agent_name, a.description as agent_description 
        FROM agent_instances ai 
        LEFT JOIN agents a ON ai.agent_id = a.id 
        WHERE ai.status = 'running' 
        ORDER BY ai.last_ping DESC
      `, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse metadata JSON for each instance
          const instances = rows.map(row => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null
          }));
          resolve(instances);
        }
      });
    });
  }
};

module.exports = {
  db,
  dbHelpers,
  testConnection,
  closeDatabase,
  initializeDatabase
};
