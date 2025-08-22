const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database configuration - support both SQLite and PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL;

let db;

if (isProduction && DATABASE_URL) {
  // Use PostgreSQL in production
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  console.log('Connected to PostgreSQL database.');
  db = pool;
} else {
  // Use SQLite in development
  const DB_PATH = path.join(__dirname, 'database.sqlite');
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database.');
    }
  });
}

// Initialize database tables
async function initializeDatabase() {
  if (isProduction && DATABASE_URL) {
    await initializePostgreSQL();
  } else {
    initializeSQLite();
  }
}

// PostgreSQL initialization
async function initializePostgreSQL() {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        token_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table initialized successfully.');

    // Create agents table
    await db.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        author_name VARCHAR(255),
        file_path TEXT,
        file_size INTEGER,
        download_count INTEGER DEFAULT 0,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Agents table initialized successfully.');

    // Create agent_instances table
    await db.query(`
      CREATE TABLE IF NOT EXISTS agent_instances (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER REFERENCES agents(id),
        instance_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'running',
        endpoint_url TEXT,
        last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Agent instances table initialized successfully.');

    console.log('PostgreSQL database initialization completed.');
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
  }
}

// SQLite initialization
function initializeSQLite() {
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

    console.log('SQLite database initialization completed.');
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

// Migration function for agent_instances table
function migrateAgentInstancesTable() {
  // Check if agent_instances table exists and has required columns
  db.all("PRAGMA table_info(agent_instances)", [], (err, columns) => {
    if (err) {
      console.error('Error checking agent_instances table schema:', err.message);
      return;
    }
    
    if (columns.length === 0) {
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

// Database helper functions
const dbHelpers = {
  // Create user
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        const { email, password_hash, name } = userData;
        db.query(
          'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
          [email, password_hash, name],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.rows[0]);
            }
          }
        );
      } else {
        // SQLite
        const { email, password_hash, name } = userData;
        db.run(
          'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
          [email, password_hash, name],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID, email, password_hash, name });
            }
          }
        );
      }
    });
  },

  // Get user by email
  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.rows[0]);
          }
        });
      } else {
        // SQLite
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      }
    });
  },

  // Get user by ID
  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.rows[0]);
          }
        });
      } else {
        // SQLite
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      }
    });
  },

  // Update user
  updateUser: (id, updates) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const query = `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`;
        
        db.query(query, [id, ...values], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.rows[0]);
          }
        });
      } else {
        // SQLite
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const query = `UPDATE users SET ${setClause} WHERE id = ?`;
        
        db.run(query, [...values, id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ updated: this.changes > 0 });
          }
        });
      }
    });
  },

  // Set verification token
  setVerificationToken: (userId, token, expiresAt) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query(
          'UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3',
          [token, expiresAt, userId],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve({ updated: result.rowCount > 0 });
            }
          }
        );
      } else {
        // SQLite
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
      }
    });
  },

  // Verify user email
  verifyUserEmail: (token) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query(
          'UPDATE users SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL WHERE verification_token = $1 AND token_expires_at > NOW()',
          [token],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve({ verified: result.rowCount > 0 });
            }
          }
        );
      } else {
        // SQLite
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
      }
    });
  },

  // Get user by verification token
  getUserByVerificationToken: (token) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query(
          'SELECT * FROM users WHERE verification_token = $1 AND token_expires_at > NOW()',
          [token],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.rows[0]);
            }
          }
        );
      } else {
        // SQLite
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
      }
    });
  },

  // Resend verification token
  resendVerificationToken: (userId, token, expiresAt) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query(
          'UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3 AND is_verified = FALSE',
          [token, expiresAt, userId],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve({ updated: result.rowCount > 0 });
            }
          }
        );
      } else {
        // SQLite
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
      }
    });
  },

  // Delete user
  deleteUser: (id) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('DELETE FROM users WHERE id = $1', [id], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({ deleted: result.rowCount > 0 });
          }
        });
      } else {
        // SQLite
        db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ deleted: this.changes > 0 });
          }
        });
      }
    });
  },

  // Agent Management Methods
  // Get all agents
  getAllAgents: () => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('SELECT * FROM agents ORDER BY created_at DESC', (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.rows);
          }
        });
      } else {
        // SQLite
        db.all('SELECT * FROM agents ORDER BY created_at DESC', [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      }
    });
  },

  // Get agent by ID
  getAgentById: (id) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('SELECT * FROM agents WHERE id = $1', [id], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.rows[0]);
          }
        });
      } else {
        // SQLite
        db.get('SELECT * FROM agents WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      }
    });
  },

  // Create new agent
  createAgent: (agentData) => {
    return new Promise((resolve, reject) => {
      const { name, description, category, author_name, file_path, file_size, user_id } = agentData;
      
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query(
          'INSERT INTO agents (name, description, category, author_name, file_path, file_size, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [name, description, category, author_name, file_path, file_size, user_id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.rows[0]);
            }
          }
        );
      } else {
        // SQLite
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
      }
    });
  },

  // Update agent
  updateAgent: (id, agentData) => {
    return new Promise((resolve, reject) => {
      const { name, description, category, author_name, file_path, file_size, user_id } = agentData;
      
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query(
          'UPDATE agents SET name = $1, description = $2, category = $3, author_name = $4, file_path = $5, file_size = $6, user_id = $7 WHERE id = $8 RETURNING *',
          [name, description, category, author_name, file_path, file_size, user_id, id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.rows[0]);
            }
          }
        );
      } else {
        // SQLite
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
      }
    });
  },

  // Delete agent
  deleteAgent: (id) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('DELETE FROM agents WHERE id = $1', [id], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({ deleted: result.rowCount > 0 });
          }
        });
      } else {
        // SQLite
        db.run('DELETE FROM agents WHERE id = ?', [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ deleted: this.changes > 0 });
          }
        });
      }
    });
  },

  // Increment download count
  incrementDownloadCount: (id) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('UPDATE agents SET download_count = download_count + 1 WHERE id = $1', [id], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({ updated: result.rowCount > 0 });
          }
        });
      } else {
        // SQLite
        db.run('UPDATE agents SET download_count = download_count + 1 WHERE id = ?', [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ updated: this.changes > 0 });
          }
        });
      }
    });
  },

  // Get agents by category
  getAgentsByCategory: (category) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('SELECT * FROM agents WHERE category = $1 ORDER BY created_at DESC', [category], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.rows);
          }
        });
      } else {
        // SQLite
        db.all('SELECT * FROM agents WHERE category = ? ORDER BY created_at DESC', [category], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      }
    });
  },

  // Search agents
  searchAgents: (searchTerm) => {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${searchTerm}%`;
      
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query(
          'SELECT * FROM agents WHERE name ILIKE $1 OR description ILIKE $2 OR author_name ILIKE $3 ORDER BY created_at DESC',
          [searchPattern, searchPattern, searchPattern],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.rows);
            }
          }
        );
      } else {
        // SQLite
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
      }
    });
  },

  // Get top downloaded agents
  getTopDownloadedAgents: (limit = 10) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('SELECT * FROM agents ORDER BY download_count DESC LIMIT $1', [limit], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.rows);
          }
        });
      } else {
        // SQLite
        db.all('SELECT * FROM agents ORDER BY download_count DESC LIMIT ?', [limit], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      }
    });
  },

  // Get agents by user ID
  getAgentsByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      if (isProduction && DATABASE_URL) {
        // PostgreSQL
        db.query('SELECT * FROM agents WHERE user_id = $1 ORDER BY created_at DESC', [userId], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.rows);
          }
        });
      } else {
        // SQLite
        db.all('SELECT * FROM agents WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      }
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

  // Get instances by agent ID
  getInstancesByAgentId: (agentId) => {
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

  // Update agent instance
  updateAgentInstance: (id, instanceData) => {
    return new Promise((resolve, reject) => {
      const { instance_name, status, endpoint_url, metadata } = instanceData;
      
      db.run(
        'UPDATE agent_instances SET instance_name = ?, status = ?, endpoint_url = ?, metadata = ? WHERE id = ?',
        [instance_name, status, endpoint_url, metadata ? JSON.stringify(metadata) : null, id],
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

  // Update instance status
  updateInstanceStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE agent_instances SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ updated: this.changes > 0, id, status });
          }
        }
      );
    });
  },

  // Update last ping time
  updateLastPing: (id) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE agent_instances SET last_ping = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ updated: this.changes > 0, id });
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

  // Get instances by status
  getInstancesByStatus: (status) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ai.*, a.name as agent_name, a.description as agent_description 
        FROM agent_instances ai 
        LEFT JOIN agents a ON ai.agent_id = a.id 
        WHERE ai.status = ? 
        ORDER BY ai.created_at DESC
      `, [status], (err, rows) => {
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

  // Get instances that haven't pinged recently (for health checks)
  getStaleInstances: (minutes = 5) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ai.*, a.name as agent_name, a.description as agent_description 
        FROM agent_instances ai 
        LEFT JOIN agents a ON ai.agent_id = a.id 
        WHERE ai.last_ping < datetime('now', '-${minutes} minutes') 
        AND ai.status = 'running'
        ORDER BY ai.last_ping ASC
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

// Test database connection
function testConnection() {
  return new Promise((resolve, reject) => {
    if (isProduction && DATABASE_URL) {
      // For PostgreSQL, we can't use db.get directly as it's a Pool.
      // We'd need to check if the pool is ready or try a query.
      // For now, we'll assume it's connected if DATABASE_URL is set.
      resolve({ connected: true, message: 'Database connection status (PostgreSQL): Ready (assuming DATABASE_URL is set)' });
    } else {
      db.get('SELECT 1 as test', [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({ connected: true, test: row.test });
        }
      });
    }
  });
}

// Close database connection
function closeDatabase() {
  if (isProduction && DATABASE_URL) {
    // For PostgreSQL, we need to close the pool.
    // This is a simplified example. In a real app, you'd manage the pool.
    // For now, we'll just log a message.
    console.log('PostgreSQL pool closing (simplified). In a real app, manage the pool.');
    // Example: db.end();
  } else {
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
}

module.exports = {
  db,
  dbHelpers,
  testConnection,
  closeDatabase,
  initializeDatabase
};
