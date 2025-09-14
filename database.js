const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Enhanced volume mount verification functions
function checkVolumeSpaceAvailability(volumePath) {
  try {
    const stats = fs.statSync(volumePath);
    if (!stats.isDirectory()) {
      return { available: false, reason: 'Path is not a directory' };
    }

    // Try to get disk space information using df command
    try {
      const dfOutput = execSync(`df -h "${volumePath}"`, { encoding: 'utf8' });
      const lines = dfOutput.trim().split('\n');
      if (lines.length >= 2) {
        const spaceInfo = lines[1].split(/\s+/);
        const available = spaceInfo[3] || 'Unknown';
        const used = spaceInfo[2] || 'Unknown';
        const total = spaceInfo[1] || 'Unknown';
        
        console.log(`💾 Volume space information:
          Total: ${total}
          Used: ${used}
          Available: ${available}`);
        
        return { 
          available: true, 
          total, 
          used, 
          free: available,
          details: dfOutput 
        };
      }
    } catch (dfError) {
      console.log(`⚠️  Could not get disk space info: ${dfError.message}`);
    }

    return { available: true, reason: 'Directory accessible but space info unavailable' };
  } catch (error) {
    return { available: false, reason: error.message };
  }
}

function verifyVolumeMount(volumePath) {
  const verification = {
    path: volumePath,
    exists: false,
    isDirectory: false,
    writable: false,
    readable: false,
    mounted: false,
    spaceInfo: null,
    errors: []
  };

  try {
    // Check if path exists
    verification.exists = fs.existsSync(volumePath);
    if (!verification.exists) {
      verification.errors.push('Volume directory does not exist');
      return verification;
    }

    // Check if it's a directory
    const stats = fs.statSync(volumePath);
    verification.isDirectory = stats.isDirectory();
    if (!verification.isDirectory) {
      verification.errors.push('Volume path is not a directory');
      return verification;
    }

    // Check read permissions
    try {
      fs.accessSync(volumePath, fs.constants.R_OK);
      verification.readable = true;
    } catch (readError) {
      verification.errors.push(`Not readable: ${readError.message}`);
    }

    // Check write permissions
    try {
      fs.accessSync(volumePath, fs.constants.W_OK);
      verification.writable = true;
    } catch (writeError) {
      verification.errors.push(`Not writable: ${writeError.message}`);
    }

    // Test actual write capability with a temporary file
    if (verification.writable) {
      try {
        const testFile = path.join(volumePath, '.volume_test_' + Date.now());
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log(`✅ Volume write test successful: ${volumePath}`);
      } catch (writeTestError) {
        verification.writable = false;
        verification.errors.push(`Write test failed: ${writeTestError.message}`);
      }
    }

    // Check if this appears to be a mounted volume (Railway specific checks)
    try {
      // In Railway, mounted volumes typically have different characteristics
      // Check if the directory has the expected mount characteristics
      const mountInfo = execSync('mount', { encoding: 'utf8' });
      verification.mounted = mountInfo.includes(volumePath) || 
                           mountInfo.includes('/app/data') ||
                           process.env.RAILWAY_VOLUME_MOUNT_PATH === volumePath;
      
      if (!verification.mounted) {
        // Additional check: see if directory behaves like a mount point
        const parentStats = fs.statSync(path.dirname(volumePath));
        verification.mounted = stats.dev !== parentStats.dev;
      }
    } catch (mountError) {
      console.log(`⚠️  Could not verify mount status: ${mountError.message}`);
      // Assume mounted if we can't verify (to avoid false negatives)
      verification.mounted = true;
    }

    // Get space information
    verification.spaceInfo = checkVolumeSpaceAvailability(volumePath);

  } catch (error) {
    verification.errors.push(`Verification failed: ${error.message}`);
  }

  return verification;
}

function logVolumeStatus(verification) {
  console.log(`📊 Volume Mount Verification Report:
  Path: ${verification.path}
  Exists: ${verification.exists ? '✅' : '❌'}
  Is Directory: ${verification.isDirectory ? '✅' : '❌'}
  Readable: ${verification.readable ? '✅' : '❌'}
  Writable: ${verification.writable ? '✅' : '❌'}
  Mounted: ${verification.mounted ? '✅' : '❌'}
  Space Available: ${verification.spaceInfo?.available ? '✅' : '❌'}`);

  if (verification.spaceInfo?.available) {
    console.log(`  Space Details: ${verification.spaceInfo.free} free of ${verification.spaceInfo.total}`);
  }

  if (verification.errors.length > 0) {
    console.log(`  Errors: ${verification.errors.join(', ')}`);
  }

  return verification.exists && verification.isDirectory && verification.readable && verification.writable;
}

// Database configuration - use persistent volume in production
let DB_PATH;
let volumeVerification = null;

if (process.env.NODE_ENV === 'production') {
  // In production, always use the volume path even if DB_PATH env var isn't set
  const requestedPath = process.env.DB_PATH || '/app/data/database.sqlite';
  const volumeDir = '/app/data';
  
  console.log(`🔍 Starting volume mount verification for production environment...`);
  console.log(`   Requested DB path: ${requestedPath}`);
  console.log(`   Expected volume directory: ${volumeDir}`);
  
  // Perform comprehensive volume verification
  volumeVerification = verifyVolumeMount(volumeDir);
  const isVolumeHealthy = logVolumeStatus(volumeVerification);
  
  if (isVolumeHealthy) {
    DB_PATH = requestedPath;
    console.log(`✅ Volume verification successful, using: ${DB_PATH}`);
  } else {
    console.error(`❌ Volume verification failed for ${volumeDir}`);
    console.error(`   Errors: ${volumeVerification.errors.join(', ')}`);
    
    // Attempt to create volume directory if it doesn't exist
    if (!volumeVerification.exists) {
      console.log(`🔧 Attempting to create volume directory: ${volumeDir}`);
      try {
        fs.mkdirSync(volumeDir, { recursive: true });
        console.log(`✅ Successfully created volume directory: ${volumeDir}`);
        
        // Re-verify after creation
        volumeVerification = verifyVolumeMount(volumeDir);
        const isVolumeHealthyAfterCreation = logVolumeStatus(volumeVerification);
        
        if (isVolumeHealthyAfterCreation) {
          DB_PATH = requestedPath;
          console.log(`✅ Volume verification successful after creation, using: ${DB_PATH}`);
        } else {
          throw new Error('Volume still not healthy after creation attempt');
        }
      } catch (createError) {
        console.error(`❌ Failed to create volume directory: ${createError.message}`);
        console.error(`   This indicates the Railway volume is not properly mounted`);
        console.log(`⚠️  Falling back to container filesystem: /app/database.sqlite`);
        DB_PATH = '/app/database.sqlite';
      }
    } else {
      console.log(`⚠️  Volume directory exists but has issues, falling back to container filesystem`);
      DB_PATH = '/app/database.sqlite';
    }
  }
} else {
  // In development, use local path
  DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
  console.log(`🔧 Development environment detected, using local path: ${DB_PATH}`);
}

// Enhanced fallback mechanisms with retry logic
function createDatabaseDirectoryWithRetry(dbPath, maxRetries = 3, retryDelay = 1000) {
  const dbDir = path.dirname(dbPath);
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔧 Attempt ${attempt}/${maxRetries}: Ensuring database directory exists: ${dbDir}`);
      
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`✅ Created database directory: ${dbDir}`);
      } else {
        console.log(`✅ Database directory already exists: ${dbDir}`);
      }
      
      // Verify directory permissions
      fs.accessSync(dbDir, fs.constants.W_OK);
      console.log(`✅ Database directory is writable: ${dbDir}`);
      
      // Test write capability
      const testFile = path.join(dbDir, '.db_test_' + Date.now());
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`✅ Database directory write test successful: ${dbDir}`);
      
      return { success: true, directory: dbDir, attempts: attempt };
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      console.error(`   Directory: ${dbDir}`);
      console.error(`   Error code: ${error.code}`);
      console.error(`   Current working directory: ${process.cwd()}`);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
        // Simple delay implementation
        const start = Date.now();
        while (Date.now() - start < retryDelay) {
          // Busy wait for simplicity in this context
        }
      }
    }
  }
  
  return { success: false, error: lastError, attempts: maxRetries };
}

function implementGracefulFallback(originalPath, error) {
  console.log(`🔄 Implementing graceful fallback for database path: ${originalPath}`);
  console.log(`   Original error: ${error.message}`);
  
  const fallbackOptions = [
    '/tmp/database.sqlite',
    path.join(process.cwd(), 'database.sqlite'),
    path.join(__dirname, 'database.sqlite')
  ];
  
  for (const fallbackPath of fallbackOptions) {
    try {
      console.log(`🔧 Testing fallback option: ${fallbackPath}`);
      
      const fallbackDir = path.dirname(fallbackPath);
      
      // Test if we can create the directory and write to it
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      
      fs.accessSync(fallbackDir, fs.constants.W_OK);
      
      // Test write capability
      const testFile = path.join(fallbackDir, '.fallback_test_' + Date.now());
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      
      console.log(`✅ Fallback option successful: ${fallbackPath}`);
      console.log(`⚠️  WARNING: Using fallback database location!`);
      console.log(`   Original path: ${originalPath}`);
      console.log(`   Fallback path: ${fallbackPath}`);
      console.log(`   Data persistence may be affected depending on the environment`);
      
      return { success: true, path: fallbackPath, warning: true };
      
    } catch (fallbackError) {
      console.log(`❌ Fallback option failed: ${fallbackPath} - ${fallbackError.message}`);
    }
  }
  
  console.error(`💥 All fallback options exhausted. Cannot establish database location.`);
  return { success: false, error: 'No viable database location found' };
}

// Ensure the directory exists for the database file with enhanced error handling
const DB_DIR = path.dirname(DB_PATH);
console.log(`🔧 Setting up database directory: ${DB_DIR}`);

const directoryResult = createDatabaseDirectoryWithRetry(DB_PATH);

if (!directoryResult.success) {
  console.error(`❌ Failed to create database directory after ${directoryResult.attempts} attempts`);
  console.error(`   Last error: ${directoryResult.error.message}`);
  
  // Implement graceful fallback
  const fallbackResult = implementGracefulFallback(DB_PATH, directoryResult.error);
  
  if (fallbackResult.success) {
    DB_PATH = fallbackResult.path;
    console.log(`🔄 Database path updated to fallback location: ${DB_PATH}`);
    
    if (fallbackResult.warning) {
      console.log(`⚠️  IMPORTANT: Database is using a fallback location.`);
      console.log(`   This may affect data persistence across deployments.`);
      console.log(`   Please check Railway volume configuration.`);
    }
  } else {
    console.error(`💥 CRITICAL: Cannot establish any database location.`);
    console.error(`   Error: ${fallbackResult.error}`);
    console.error(`   The application may not function correctly.`);
    throw new Error(`Database initialization failed: ${fallbackResult.error}`);
  }
} else {
  console.log(`✅ Database directory setup completed successfully after ${directoryResult.attempts} attempt(s)`);
}

// Enhanced database configuration logging
function logDatabaseConfiguration() {
  const dbDir = path.dirname(DB_PATH);
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`📊 Database Configuration Summary:
  Environment: ${process.env.NODE_ENV || 'development'}
  DB_PATH env var: ${process.env.DB_PATH || 'NOT SET'}
  Resolved database path: ${DB_PATH}
  Database directory: ${dbDir}
  Directory exists: ${fs.existsSync(dbDir)}
  Database file exists: ${fs.existsSync(DB_PATH)}
  Process CWD: ${process.cwd()}
  Railway volume expected at: /app/data`);

  if (isProduction) {
    console.log(`  Volume verification status: ${volumeVerification ? 'COMPLETED' : 'NOT PERFORMED'}`);
    
    if (volumeVerification) {
      console.log(`  Volume mount healthy: ${volumeVerification.exists && volumeVerification.writable ? '✅' : '❌'}`);
      
      if (volumeVerification.spaceInfo?.available) {
        console.log(`  Volume space: ${volumeVerification.spaceInfo.free} available`);
      }
      
      if (volumeVerification.errors.length > 0) {
        console.log(`  Volume issues: ${volumeVerification.errors.join(', ')}`);
      }
    }
    
    // Check if we're using a fallback path
    const expectedProductionPath = '/app/data/database.sqlite';
    if (DB_PATH !== expectedProductionPath) {
      console.log(`  ⚠️  WARNING: Using fallback database path!`);
      console.log(`     Expected: ${expectedProductionPath}`);
      console.log(`     Actual: ${DB_PATH}`);
      console.log(`     This may indicate Railway volume mount issues.`);
    }
  }
  
  console.log(`  Final database location: ${DB_PATH}`);
}

logDatabaseConfiguration();

// Database backup utility functions
function createDatabaseBackup() {
  return new Promise((resolve, reject) => {
    try {
      // Check if database file exists
      if (!fs.existsSync(DB_PATH)) {
        console.log('📦 No existing database to backup');
        resolve({ created: false, reason: 'No database file exists' });
        return;
      }

      // Create backup directory
      const backupDir = path.join(DB_DIR, 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        console.log(`✅ Created backup directory: ${backupDir}`);
      }

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                       new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
      const backupFilename = `database_backup_${timestamp}.sqlite`;
      const backupPath = path.join(backupDir, backupFilename);

      // Copy database file
      fs.copyFileSync(DB_PATH, backupPath);
      
      // Verify backup file was created and get stats
      const originalStats = fs.statSync(DB_PATH);
      const backupStats = fs.statSync(backupPath);
      
      // Calculate checksum for verification
      const originalChecksum = calculateFileChecksum(DB_PATH);
      const backupChecksum = calculateFileChecksum(backupPath);
      
      if (originalChecksum !== backupChecksum) {
        throw new Error('Backup verification failed: checksums do not match');
      }
      
      const backupInfo = {
        created: true,
        timestamp: new Date().toISOString(),
        filename: backupFilename,
        size: backupStats.size,
        checksum: backupChecksum,
        source_path: DB_PATH,
        backup_path: backupPath,
        original_size: originalStats.size
      };
      
      console.log(`✅ Database backup created successfully:
        File: ${backupFilename}
        Size: ${backupStats.size} bytes
        Checksum: ${backupChecksum.substring(0, 16)}...`);
      
      resolve(backupInfo);
    } catch (error) {
      console.error('❌ Failed to create database backup:', error.message);
      reject(error);
    }
  });
}

function cleanupOldBackups() {
  return new Promise((resolve, reject) => {
    try {
      const backupDir = path.join(DB_DIR, 'backups');
      
      // Check if backup directory exists
      if (!fs.existsSync(backupDir)) {
        console.log('📦 No backup directory found, nothing to cleanup');
        resolve({ cleaned: 0, reason: 'No backup directory' });
        return;
      }
      
      // Get all backup files
      const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('database_backup_') && file.endsWith('.sqlite'))
        .map(file => ({
          name: file,
          path: path.join(backupDir, file),
          stats: fs.statSync(path.join(backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime); // Sort by modification time, newest first
      
      console.log(`📦 Found ${files.length} backup files`);
      
      // Keep only the last 5 backups
      const maxBackups = 5;
      let cleanedCount = 0;
      
      if (files.length > maxBackups) {
        const filesToDelete = files.slice(maxBackups);
        
        for (const file of filesToDelete) {
          try {
            fs.unlinkSync(file.path);
            console.log(`🗑️  Deleted old backup: ${file.name}`);
            cleanedCount++;
          } catch (deleteError) {
            console.error(`❌ Failed to delete backup ${file.name}:`, deleteError.message);
          }
        }
      }
      
      const result = {
        cleaned: cleanedCount,
        total_backups: files.length,
        remaining_backups: files.length - cleanedCount,
        backup_directory: backupDir
      };
      
      console.log(`✅ Backup cleanup completed: ${cleanedCount} old backups removed, ${result.remaining_backups} backups remaining`);
      resolve(result);
      
    } catch (error) {
      console.error('❌ Failed to cleanup old backups:', error.message);
      reject(error);
    }
  });
}

function calculateFileChecksum(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error(`❌ Failed to calculate checksum for ${filePath}:`, error.message);
    throw error;
  }
}

// Enhanced database connection with robust error handling
function createDatabaseConnection(dbPath, retryCount = 0, maxRetries = 2) {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error(`❌ Error opening database (attempt ${retryCount + 1}/${maxRetries + 1}):`, err.message);
      console.error('   Database path:', dbPath);
      console.error('   Error code:', err.code);
      console.error('   Error details:', err);
      
      // Provide specific guidance based on error type
      if (err.code === 'SQLITE_CANTOPEN') {
        console.error('   💡 This usually indicates file permission or path issues');
        console.error('   💡 Check if the directory exists and is writable');
      } else if (err.code === 'ENOENT') {
        console.error('   💡 Directory or file path does not exist');
      } else if (err.code === 'EACCES') {
        console.error('   💡 Permission denied - check file/directory permissions');
      }
      
      // Attempt recovery if retries are available
      if (retryCount < maxRetries) {
        console.log(`🔄 Attempting database connection recovery...`);
        
        // Try to implement fallback for connection issues
        const fallbackResult = implementGracefulFallback(dbPath, err);
        
        if (fallbackResult.success && fallbackResult.path !== dbPath) {
          console.log(`🔄 Retrying with fallback path: ${fallbackResult.path}`);
          // Update global DB_PATH for consistency
          DB_PATH = fallbackResult.path;
          logDatabaseConfiguration();
          
          // Retry with new path
          setTimeout(() => {
            createDatabaseConnection(fallbackResult.path, retryCount + 1, maxRetries);
          }, 1000);
          return;
        }
      }
      
      console.error('💥 CRITICAL: Database connection failed after all recovery attempts');
      console.error('   The application cannot function without a database connection');
      
      // Log final troubleshooting information
      console.error(`🔍 Troubleshooting Information:
        Current working directory: ${process.cwd()}
        Database path attempted: ${dbPath}
        Directory exists: ${fs.existsSync(path.dirname(dbPath))}
        Directory writable: ${(() => {
          try {
            fs.accessSync(path.dirname(dbPath), fs.constants.W_OK);
            return 'Yes';
          } catch {
            return 'No';
          }
        })()}
        Environment: ${process.env.NODE_ENV || 'development'}
        Railway volume mount: ${process.env.RAILWAY_VOLUME_MOUNT_PATH || 'Not set'}`);
      
      throw err;
    } else {
      console.log('✅ Connected to SQLite database successfully.');
      console.log(`📁 Database file: ${dbPath}`);
      
      // Check if this is a new database or existing
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log(`📈 Database file size: ${stats.size} bytes`);
        console.log(`📅 Database last modified: ${stats.mtime}`);
        
        if (stats.size === 0) {
          console.log('📝 Database file is empty - will initialize with fresh schema');
        } else {
          console.log('📚 Existing database detected - will run migrations if needed');
        }
      } else {
        console.log('🆕 New database file will be created');
      }
      
      // Log success metrics
      if (retryCount > 0) {
        console.log(`✅ Database connection established after ${retryCount + 1} attempts`);
      }
      
      console.log('🚀 Starting database initialization...');
      initializeDatabase();
    }
  });
}

// Create database connection with enhanced error handling
const db = createDatabaseConnection(DB_PATH);

// Initialize database tables
function initializeDatabase() {
  // Create backup before running migrations
  createDatabaseBackup()
    .then((backupResult) => {
      if (backupResult.created) {
        console.log('📦 Pre-migration backup completed successfully');
      } else {
        console.log('📦 Pre-migration backup skipped:', backupResult.reason);
      }
      
      // Cleanup old backups after successful backup
      return cleanupOldBackups();
    })
    .then((cleanupResult) => {
      console.log('🧹 Backup cleanup completed');
      
      // Proceed with database initialization
      initializeDatabaseTables();
    })
    .catch((error) => {
      console.error('⚠️  Backup operation failed, but continuing with database initialization:', error.message);
      
      // Continue with database initialization even if backup fails
      initializeDatabaseTables();
    });
}

// Separate function for database table initialization
function initializeDatabaseTables() {
  db.serialize(() => {
    // Create users table with password_hash and email verification fields
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      is_verified BOOLEAN DEFAULT 1,
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
      uploaded_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating agent_instances table:', err.message);
      } else {
        console.log('Agent instances table initialized successfully.');
        migrateAgentInstancesTable();
      }
    });

    // Create capability_categories table
    db.run(`CREATE TABLE IF NOT EXISTS capability_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating capability_categories table:', err.message);
      } else {
        console.log('Capability categories table initialized successfully.');
        seedCapabilityCategories();
      }
    });

    // Create agent_capabilities table (many-to-many relationship)
    db.run(`CREATE TABLE IF NOT EXISTS agent_capabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
      capability_category_id INTEGER REFERENCES capability_categories(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(agent_id, capability_category_id)
    )`, (err) => {
      if (err) {
        console.error('Error creating agent_capabilities table:', err.message);
      } else {
        console.log('Agent capabilities table initialized successfully.');
      }
    });

    // Create agent_messages table for inter-agent communication
    db.run(`CREATE TABLE IF NOT EXISTS agent_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_instance_id INTEGER REFERENCES agent_instances(id),
      to_instance_id INTEGER REFERENCES agent_instances(id),
      message_type TEXT CHECK(message_type IN ('request', 'response', 'error')) NOT NULL,
      subject TEXT,
      content TEXT NOT NULL,
      priority INTEGER DEFAULT 3 CHECK(priority BETWEEN 1 AND 5),
      correlation_id TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating agent_messages table:', err.message);
      } else {
        console.log('Agent messages table initialized successfully.');
        
        // Create indexes separately
        db.run('CREATE INDEX IF NOT EXISTS idx_agent_messages_from ON agent_messages(from_instance_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_agent_messages_to ON agent_messages(to_instance_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_agent_messages_type ON agent_messages(message_type)');
        db.run('CREATE INDEX IF NOT EXISTS idx_agent_messages_correlation ON agent_messages(correlation_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_agent_messages_created ON agent_messages(created_at)');
      }
    });

    // Create message_delivery_status table for tracking message delivery
    db.run(`CREATE TABLE IF NOT EXISTS message_delivery_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER REFERENCES agent_messages(id) ON DELETE CASCADE,
      status TEXT CHECK(status IN ('pending', 'delivered', 'read', 'failed', 'expired')) DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      last_attempt DATETIME,
      delivered_at DATETIME,
      read_at DATETIME,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating message_delivery_status table:', err.message);
      } else {
        console.log('Message delivery status table initialized successfully.');
        
        // Create indexes separately
        db.run('CREATE INDEX IF NOT EXISTS idx_message_delivery_message ON message_delivery_status(message_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_message_delivery_status ON message_delivery_status(status)');
        db.run('CREATE INDEX IF NOT EXISTS idx_message_delivery_created ON message_delivery_status(created_at)');
      }
    });

    // Create agent_api_keys table for secure authentication
    db.run(`CREATE TABLE IF NOT EXISTS agent_api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      instance_id INTEGER REFERENCES agent_instances(id) ON DELETE CASCADE,
      api_key TEXT UNIQUE NOT NULL,
      key_name TEXT,
      is_active BOOLEAN DEFAULT 1,
      expires_at DATETIME,
      last_used DATETIME,
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating agent_api_keys table:', err.message);
      } else {
        console.log('Agent API keys table initialized successfully.');
        
        // Create indexes separately
        db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_key ON agent_api_keys(api_key)');
        db.run('CREATE INDEX IF NOT EXISTS idx_api_keys_instance ON agent_api_keys(instance_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_api_keys_active ON agent_api_keys(is_active)');
      }
    });

    // Create communication_logs table for debugging and audit
    db.run(`CREATE TABLE IF NOT EXISTS communication_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT CHECK(event_type IN ('message_sent', 'message_received', 'auth_attempt', 'rate_limit_hit', 'validation_error')) NOT NULL,
      from_instance_id INTEGER REFERENCES agent_instances(id),
      to_instance_id INTEGER REFERENCES agent_instances(id),
      message_id INTEGER REFERENCES agent_messages(id),
      api_key_used TEXT,
      ip_address TEXT,
      user_agent TEXT,
      request_data TEXT,
      response_status INTEGER,
      error_message TEXT,
      processing_time_ms INTEGER,
      rate_limit_bucket TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating communication_logs table:', err.message);
      } else {
        console.log('Communication logs table initialized successfully.');
        
        // Create indexes separately
        db.run('CREATE INDEX IF NOT EXISTS idx_comm_logs_event ON communication_logs(event_type)');
        db.run('CREATE INDEX IF NOT EXISTS idx_comm_logs_from ON communication_logs(from_instance_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_comm_logs_to ON communication_logs(to_instance_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_comm_logs_message ON communication_logs(message_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_comm_logs_created ON communication_logs(created_at)');
        db.run('CREATE INDEX IF NOT EXISTS idx_comm_logs_api_key ON communication_logs(api_key_used)');
      }
    });

    // Create rate_limit_buckets table for tracking API usage
    db.run(`CREATE TABLE IF NOT EXISTS rate_limit_buckets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bucket_key TEXT UNIQUE NOT NULL,
      current_count INTEGER DEFAULT 0,
      reset_time DATETIME NOT NULL,
      max_requests INTEGER NOT NULL,
      window_seconds INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating rate_limit_buckets table:', err.message);
      } else {
        console.log('Rate limit buckets table initialized successfully.');
        
        // Create indexes separately
        db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_buckets_key ON rate_limit_buckets(bucket_key)');
        db.run('CREATE INDEX IF NOT EXISTS idx_rate_buckets_reset ON rate_limit_buckets(reset_time)');
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
      
      if (!columnNames.includes('scan_results')) {
        console.log('Adding scan_results column to agents table...');
        db.run('ALTER TABLE agents ADD COLUMN scan_results TEXT', (err) => {
          if (err) {
            console.error('Error adding scan_results column:', err.message);
          } else {
            console.log('Successfully added scan_results column to agents table.');
          }
        });
      } else {
        console.log('scan_results column already exists in agents table.');
      }
      
      if (!columnNames.includes('communication_score')) {
        console.log('Adding communication_score column to agents table...');
        db.run('ALTER TABLE agents ADD COLUMN communication_score INTEGER DEFAULT 0', (err) => {
          if (err) {
            console.error('Error adding communication_score column:', err.message);
          } else {
            console.log('Successfully added communication_score column to agents table.');
          }
        });
      } else {
        console.log('communication_score column already exists in agents table.');
      }
      
      if (!columnNames.includes('compliance_level')) {
        console.log('Adding compliance_level column to agents table...');
        db.run('ALTER TABLE agents ADD COLUMN compliance_level TEXT DEFAULT \'Unlikely\'', (err) => {
          if (err) {
            console.error('Error adding compliance_level column:', err.message);
          } else {
            console.log('Successfully added compliance_level column to agents table.');
          }
        });
      } else {
        console.log('compliance_level column already exists in agents table.');
      }
    });
  });
}

// Migration function for agent_instances table
function migrateAgentInstancesTable() {
  // Check if agent_instances table exists and has required columns
  db.all("PRAGMA table_info(agent_instances)", [], (err, columns) => {
    if (err || columns.length === 0) {
      console.log('agent_instances table does not exist, creating...');
      db.run(`CREATE TABLE agent_instances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id INTEGER REFERENCES agents(id),
        instance_name TEXT NOT NULL,
        status TEXT DEFAULT 'running',
        endpoint_url TEXT,
        last_ping DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        uploaded_by INTEGER REFERENCES users(id),
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
      
      if (!columnNames.includes('uploaded_by')) {
        console.log('Adding uploaded_by column to agent_instances table...');
        db.run('ALTER TABLE agent_instances ADD COLUMN uploaded_by INTEGER REFERENCES users(id)', (err) => {
          if (err) {
            console.error('Error adding uploaded_by column:', err.message);
          } else {
            console.log('Successfully added uploaded_by column to agent_instances table.');
          }
        });
      }
    }
  });
}

// Seed capability categories with predefined values
function seedCapabilityCategories() {
  const defaultCapabilities = [
    {
      name: 'email',
      display_name: 'Email Processing',
      description: 'Can send, receive, and process email communications'
    },
    {
      name: 'data-processing',
      display_name: 'Data Processing',
      description: 'Can analyze, transform, and manipulate data sets'
    },
    {
      name: 'customer-support',
      display_name: 'Customer Support',
      description: 'Can handle customer inquiries and provide support responses'
    },
    {
      name: 'content-generation',
      display_name: 'Content Generation',
      description: 'Can create written content, articles, and documentation'
    },
    {
      name: 'web-scraping',
      display_name: 'Web Scraping',
      description: 'Can extract and collect data from websites and web sources'
    },
    {
      name: 'api-integration',
      display_name: 'API Integration',
      description: 'Can connect with and utilize external APIs and services'
    },
    {
      name: 'file-processing',
      display_name: 'File Processing',
      description: 'Can read, write, and manipulate various file formats'
    },
    {
      name: 'scheduling',
      display_name: 'Scheduling',
      description: 'Can manage calendars, appointments, and time-based tasks'
    },
    {
      name: 'database',
      display_name: 'Database Operations',
      description: 'Can perform database queries, updates, and data management'
    },
    {
      name: 'monitoring',
      display_name: 'System Monitoring',
      description: 'Can monitor systems, services, and provide alerts'
    },
    {
      name: 'social-media',
      display_name: 'Social Media',
      description: 'Can interact with social media platforms and manage content'
    },
    {
      name: 'image-processing',
      display_name: 'Image Processing',
      description: 'Can analyze, edit, and generate images'
    },
    {
      name: 'nlp',
      display_name: 'Natural Language Processing',
      description: 'Can understand and process natural language text'
    },
    {
      name: 'ml-prediction',
      display_name: 'Machine Learning Prediction',
      description: 'Can make predictions using machine learning models'
    },
    {
      name: 'workflow-automation',
      display_name: 'Workflow Automation',
      description: 'Can automate business processes and workflows'
    }
  ];
  
  // Check if capabilities already exist
  db.get('SELECT COUNT(*) as count FROM capability_categories', [], (err, row) => {
    if (err) {
      console.error('Error checking capability_categories:', err.message);
      return;
    }
    
    if (row.count === 0) {
      console.log('Seeding capability categories...');
      const stmt = db.prepare('INSERT INTO capability_categories (name, display_name, description) VALUES (?, ?, ?)');
      
      defaultCapabilities.forEach(capability => {
        stmt.run([capability.name, capability.display_name, capability.description], (err) => {
          if (err) {
            console.error(`Error inserting capability ${capability.name}:`, err.message);
          }
        });
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error finalizing capability insertion:', err.message);
        } else {
          console.log(`Successfully seeded ${defaultCapabilities.length} capability categories.`);
        }
      });
    } else {
      console.log('Capability categories already seeded.');
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
      const { 
        name, description, category, author_name, file_path, file_size, user_id,
        scan_results, communication_score, compliance_level 
      } = agentData;
      
      // SQL with all columns (including new ones)
      const sql = `INSERT INTO agents (
        name, description, category, author_name, file_path, file_size, user_id,
        scan_results, communication_score, compliance_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        name, description, category, author_name, file_path, file_size, user_id,
        scan_results || null,
        communication_score || 0,
        compliance_level || 'Unlikely'
      ];
      
      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...agentData });
        }
      });
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
  },

  // Get instances by status
  getInstancesByStatus: (status) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ai.*, a.name as agent_name, a.description as agent_description 
        FROM agent_instances ai 
        LEFT JOIN agents a ON ai.agent_id = a.id 
        WHERE ai.status = ? 
        ORDER BY ai.last_ping DESC
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

  // Update last ping for an instance
  updateLastPing: (instanceId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE agent_instances SET last_ping = datetime("now") WHERE id = ?',
        [instanceId],
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

  // Update agent instance with enhanced workload and performance metrics
  updateInstanceMetrics: (instanceId, metricsData) => {
    return new Promise((resolve, reject) => {
      const {
        status,
        current_load,
        queue_length,
        response_time_ms,
        success_rate,
        total_requests,
        failed_requests,
        avg_processing_time,
        memory_usage,
        cpu_usage,
        custom_metrics
      } = metricsData;

      // Get current metadata
      db.get('SELECT metadata FROM agent_instances WHERE id = ?', [instanceId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        let metadata = {};
        try {
          metadata = row?.metadata ? JSON.parse(row.metadata) : {};
        } catch (e) {
          metadata = {};
        }

        // Update performance metrics
        const now = new Date().toISOString();
        const performance = metadata.performance || {};
        const capacity = metadata.capacity || {};
        const system = metadata.system || {};

        // Update capacity metrics
        if (current_load !== undefined) capacity.current_load = current_load;
        if (queue_length !== undefined) capacity.queue_length = queue_length;
        capacity.last_updated = now;

        // Update performance metrics with rolling averages
        if (response_time_ms !== undefined) {
          performance.avg_response_time_ms = performance.avg_response_time_ms
            ? Math.round((performance.avg_response_time_ms * 0.8) + (response_time_ms * 0.2))
            : response_time_ms;
          performance.last_response_time_ms = response_time_ms;
        }

        if (success_rate !== undefined) {
          performance.success_rate = success_rate;
        }

        if (total_requests !== undefined) {
          performance.total_requests = total_requests;
          performance.requests_per_minute = performance.requests_per_minute 
            ? Math.round((performance.requests_per_minute * 0.9) + ((total_requests - (performance.last_total_requests || 0)) * 0.1))
            : total_requests - (performance.last_total_requests || 0);
          performance.last_total_requests = total_requests;
        }

        if (failed_requests !== undefined) {
          performance.failed_requests = failed_requests;
          performance.error_rate = total_requests > 0 ? ((failed_requests / total_requests) * 100) : 0;
        }

        if (avg_processing_time !== undefined) {
          performance.avg_processing_time_ms = avg_processing_time;
        }

        performance.last_updated = now;

        // Update system metrics
        if (memory_usage !== undefined) system.memory_usage_mb = memory_usage;
        if (cpu_usage !== undefined) system.cpu_usage_percent = cpu_usage;
        system.last_updated = now;

        // Add custom metrics
        if (custom_metrics && typeof custom_metrics === 'object') {
          metadata.custom_metrics = { ...metadata.custom_metrics, ...custom_metrics };
        }

        // Update metadata structure
        metadata.capacity = capacity;
        metadata.performance = performance;
        metadata.system = system;

        // Calculate availability score
        const maxCapacity = capacity.max_concurrent_requests || 100;
        const loadPercentage = (capacity.current_load || 0) / maxCapacity * 100;
        const availabilityScore = Math.max(0, 100 - loadPercentage);
        
        metadata.availability = {
          score: availabilityScore,
          available: loadPercentage < 90,
          load_percentage: loadPercentage,
          calculated_at: now
        };

        // Update database
        const newStatus = status || 'running';
        db.run(
          'UPDATE agent_instances SET status = ?, last_ping = datetime("now"), metadata = ? WHERE id = ?',
          [newStatus, JSON.stringify(metadata), instanceId],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ 
                updated: this.changes > 0, 
                metadata: metadata,
                availability_score: availabilityScore
              });
            }
          }
        );
      });
    });
  },

  // Get stale instances (haven't pinged recently)
  getStaleInstances: (minutes) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ai.*, a.name as agent_name, a.description as agent_description 
        FROM agent_instances ai 
        LEFT JOIN agents a ON ai.agent_id = a.id 
        WHERE ai.last_ping < datetime('now', '-${minutes} minutes') 
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
  },

  // Main discovery engine - find agents matching multiple criteria
  discoverAgents: (filters = {}) => {
    return new Promise((resolve, reject) => {
      const {
        capability,
        capabilities,
        match_all = false,
        status = 'running',
        location,
        radius = 50, // km
        availability = 'now',
        load_threshold = 80,
        limit = 10,
        sort_by = 'last_ping'
      } = filters;

      let query = `
        SELECT DISTINCT
          a.id as agent_id,
          a.name as agent_name,
          a.description as agent_description,
          a.category as agent_category,
          a.author_name,
          a.download_count,
          a.created_at as agent_created_at,
          ai.id as instance_id,
          ai.instance_name,
          ai.status as instance_status,
          ai.endpoint_url,
          ai.last_ping,
          ai.metadata,
          ai.created_at as instance_created_at,
          GROUP_CONCAT(cc.name) as capability_names,
          GROUP_CONCAT(cc.display_name) as capability_display_names,
          GROUP_CONCAT(cc.id) as capability_ids
        FROM agents a
        LEFT JOIN agent_instances ai ON a.id = ai.agent_id
        LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
        LEFT JOIN capability_categories cc ON ac.capability_category_id = cc.id
      `;

      const conditions = [];
      const params = [];

      // Status filter
      if (status) {
        conditions.push('ai.status = ?');
        params.push(status);
      }

      // Single capability filter
      if (capability) {
        conditions.push(`EXISTS (
          SELECT 1 FROM agent_capabilities ac2 
          JOIN capability_categories cc2 ON ac2.capability_category_id = cc2.id
          WHERE ac2.agent_id = a.id AND LOWER(cc2.name) = ?
        )`);
        params.push(capability.toLowerCase());
      }

      // Multiple capabilities filter
      if (capabilities && Array.isArray(capabilities) && capabilities.length > 0) {
        const capabilityPlaceholders = capabilities.map(() => '?').join(',');
        
        if (match_all) {
          // Agent must have ALL specified capabilities
          conditions.push(`(
            SELECT COUNT(DISTINCT ac3.capability_category_id)
            FROM agent_capabilities ac3
            WHERE ac3.agent_id = a.id AND ac3.capability_category_id IN (${capabilityPlaceholders})
          ) = ?`);
          params.push(...capabilities, capabilities.length);
        } else {
          // Agent must have ANY of the specified capabilities
          conditions.push(`EXISTS (
            SELECT 1 FROM agent_capabilities ac3
            WHERE ac3.agent_id = a.id AND ac3.capability_category_id IN (${capabilityPlaceholders})
          )`);
          params.push(...capabilities);
        }
      }

      // Health check - only show instances that pinged recently (within 5 minutes)
      conditions.push("ai.last_ping > datetime('now', '-5 minutes')");

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' GROUP BY a.id, ai.id';

      // Sorting
      switch (sort_by) {
        case 'last_ping':
          query += ' ORDER BY ai.last_ping DESC';
          break;
        case 'load':
          query += ' ORDER BY ai.last_ping DESC'; // For now, will enhance with actual load
          break;
        case 'random':
          query += ' ORDER BY RANDOM()';
          break;
        default:
          query += ' ORDER BY ai.last_ping DESC';
      }

      if (limit && limit > 0) {
        query += ` LIMIT ${parseInt(limit)}`;
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Process and enrich results
          const agents = rows.map(row => {
            let metadata = null;
            try {
              metadata = row.metadata ? JSON.parse(row.metadata) : {};
            } catch (e) {
              metadata = {};
            }

            // Parse capabilities
            const capabilities = [];
            if (row.capability_ids) {
              const ids = row.capability_ids.split(',');
              const names = row.capability_names.split(',');
              const displayNames = row.capability_display_names.split(',');
              
              for (let i = 0; i < ids.length; i++) {
                capabilities.push({
                  id: parseInt(ids[i]),
                  name: names[i],
                  display_name: displayNames[i]
                });
              }
            }

            // Extract location from metadata
            const location = metadata.location || {};
            
            // Extract availability from metadata
            const capacity = metadata.capacity || {};
            const availability = {
              current_load: capacity.current_load || 0,
              max_capacity: capacity.max_concurrent_requests || 100,
              available: capacity.current_load < (capacity.max_concurrent_requests || 100),
              queue_length: capacity.queue_length || 0
            };

            // Health metrics
            const performance = metadata.performance || {};
            const health = {
              last_ping: row.last_ping,
              response_time_ms: performance.avg_response_time_ms || null,
              uptime_percentage: performance.success_rate || null,
              status: row.instance_status
            };

            return {
              agent_id: row.agent_id,
              agent_name: row.agent_name,
              agent_description: row.agent_description,
              agent_category: row.agent_category,
              author_name: row.author_name,
              download_count: row.download_count,
              instance_id: row.instance_id,
              instance_name: row.instance_name,
              endpoint_url: row.endpoint_url,
              status: row.instance_status,
              capabilities,
              location,
              availability,
              health,
              metadata: metadata
            };
          });

          resolve(agents);
        }
      });
    });
  },

  // Get agents by geographic location
  getAgentsByLocation: (targetLocation, radius = 50) => {
    return new Promise((resolve, reject) => {
      // This is a simplified version - in production, you'd use proper geographic distance calculations
      const query = `
        SELECT DISTINCT
          a.id as agent_id,
          a.name as agent_name,
          ai.id as instance_id,
          ai.instance_name,
          ai.endpoint_url,
          ai.status,
          ai.metadata,
          ai.last_ping
        FROM agents a
        JOIN agent_instances ai ON a.id = ai.agent_id
        WHERE ai.status = 'running' 
        AND ai.last_ping > datetime('now', '-5 minutes')
        AND ai.metadata IS NOT NULL
        ORDER BY ai.last_ping DESC
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Filter by location in application code
          const filteredAgents = rows.filter(row => {
            try {
              const metadata = JSON.parse(row.metadata || '{}');
              const agentLocation = metadata.location || {};
              
              // Simple location matching - could be enhanced with proper geo calculations
              if (targetLocation && agentLocation.city) {
                return agentLocation.city.toLowerCase().includes(targetLocation.toLowerCase()) ||
                       agentLocation.region?.toLowerCase().includes(targetLocation.toLowerCase()) ||
                       agentLocation.country?.toLowerCase().includes(targetLocation.toLowerCase());
              }
              return true;
            } catch (e) {
              return false;
            }
          });

          resolve(filteredAgents);
        }
      });
    });
  },

  // Get available agent instances with health checking
  getAvailableAgentInstances: (filters = {}) => {
    return new Promise((resolve, reject) => {
      const { 
        max_load = 80, 
        min_uptime = 95,
        status = 'running',
        ping_threshold_minutes = 5 
      } = filters;

      const query = `
        SELECT 
          ai.*,
          a.name as agent_name,
          a.description as agent_description,
          a.category as agent_category
        FROM agent_instances ai
        JOIN agents a ON ai.agent_id = a.id
        WHERE ai.status = ?
        AND ai.last_ping > datetime('now', '-' || ? || ' minutes')
        ORDER BY ai.last_ping DESC
      `;

      db.all(query, [status, ping_threshold_minutes], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Filter by availability criteria
          const availableInstances = rows.filter(row => {
            try {
              const metadata = JSON.parse(row.metadata || '{}');
              const capacity = metadata.capacity || {};
              const performance = metadata.performance || {};

              const currentLoad = capacity.current_load || 0;
              const maxCapacity = capacity.max_concurrent_requests || 100;
              const loadPercentage = (currentLoad / maxCapacity) * 100;
              const uptime = performance.success_rate || 100;

              return loadPercentage <= max_load && uptime >= min_uptime;
            } catch (e) {
              return true; // Include if metadata is malformed
            }
          });

          resolve(availableInstances);
        }
      });
    });
  },

  // Agent ranking system
  calculateAgentRank: (agent) => {
    const weights = {
      availability: 0.35,      // 35% - How available/not overloaded
      performance: 0.30,       // 30% - Response time and success rate
      health: 0.20,           // 20% - Recent ping and uptime
      capacity: 0.15          // 15% - Current vs max capacity
    };

    let scores = {
      availability: 0,
      performance: 0,
      health: 0,
      capacity: 0
    };

    const metadata = agent.metadata || {};
    const availability = metadata.availability || {};
    const performance = metadata.performance || {};
    const capacity = metadata.capacity || {};

    // Availability Score (0-100)
    scores.availability = availability.score || 50;

    // Performance Score (based on response time and success rate)
    const responseTime = performance.avg_response_time_ms || 1000;
    const successRate = performance.success_rate || 95;
    const errorRate = performance.error_rate || 5;

    // Response time score (faster = better, 0ms = 100, 1000ms = 0)
    const responseScore = Math.max(0, 100 - (responseTime / 10));
    // Success rate score (higher = better)
    const successScore = successRate;
    // Error rate penalty
    const errorPenalty = Math.max(0, errorRate * 2);

    scores.performance = Math.max(0, (responseScore * 0.4) + (successScore * 0.6) - errorPenalty);

    // Health Score (based on recent ping and uptime)
    const lastPing = new Date(agent.last_ping || Date.now());
    const pingAge = (Date.now() - lastPing.getTime()) / (1000 * 60); // minutes
    const pingScore = Math.max(0, 100 - (pingAge * 20)); // Penalty for old pings

    const uptime = performance.success_rate || 95;
    scores.health = (pingScore * 0.6) + (uptime * 0.4);

    // Capacity Score (based on current load vs max capacity)
    const currentLoad = capacity.current_load || 0;
    const maxCapacity = capacity.max_concurrent_requests || 100;
    const loadPercentage = (currentLoad / maxCapacity) * 100;
    scores.capacity = Math.max(0, 100 - loadPercentage);

    // Calculate weighted total score
    const totalScore = 
      (scores.availability * weights.availability) +
      (scores.performance * weights.performance) +
      (scores.health * weights.health) +
      (scores.capacity * weights.capacity);

    return {
      total_score: Math.round(totalScore * 10) / 10,
      scores: {
        availability: Math.round(scores.availability * 10) / 10,
        performance: Math.round(scores.performance * 10) / 10,
        health: Math.round(scores.health * 10) / 10,
        capacity: Math.round(scores.capacity * 10) / 10
      },
      weights: weights,
      rank_factors: {
        load_percentage: Math.round((loadPercentage || 0) * 10) / 10,
        response_time_ms: responseTime,
        success_rate: successRate,
        ping_age_minutes: Math.round(pingAge * 10) / 10,
        availability_score: availability.score || 50
      }
    };
  },

  // Enhanced discovery with ranking
  discoverRankedAgents: (filters = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Get basic discovery results
        const agents = await dbHelpers.discoverAgents(filters);
        
        // Calculate ranking for each agent
        const rankedAgents = agents.map(agent => {
          const ranking = dbHelpers.calculateAgentRank(agent);
          return {
            ...agent,
            ranking: ranking
          };
        });

        // Sort by ranking score (highest first)
        rankedAgents.sort((a, b) => b.ranking.total_score - a.ranking.total_score);

        // Add position information
        const finalResults = rankedAgents.map((agent, index) => ({
          ...agent,
          discovery_rank: index + 1
        }));

        resolve(finalResults);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Capability management methods
  // Get all capability categories
  getAllCapabilities: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM capability_categories WHERE is_active = 1 ORDER BY display_name', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Get capability by ID
  getCapabilityById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM capability_categories WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Get capability by name
  getCapabilityByName: (name) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM capability_categories WHERE LOWER(name) = ? AND is_active = 1', [name.toLowerCase()], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Get capabilities for a specific agent
  getAgentCapabilities: (agentId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT cc.*, ac.created_at as assigned_at
        FROM capability_categories cc
        JOIN agent_capabilities ac ON cc.id = ac.capability_category_id
        WHERE ac.agent_id = ? AND cc.is_active = 1
        ORDER BY cc.display_name
      `, [agentId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Add capability to agent
  addAgentCapability: (agentId, capabilityId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO agent_capabilities (agent_id, capability_category_id) VALUES (?, ?)',
        [agentId, capabilityId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: this.changes > 0, id: this.lastID });
          }
        }
      );
    });
  },

  // Remove capability from agent
  removeAgentCapability: (agentId, capabilityId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM agent_capabilities WHERE agent_id = ? AND capability_category_id = ?',
        [agentId, capabilityId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ removed: this.changes > 0 });
          }
        }
      );
    });
  },

  // Set multiple capabilities for an agent (replace existing)
  setAgentCapabilities: (agentId, capabilityIds) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Remove all existing capabilities for the agent
        db.run('DELETE FROM agent_capabilities WHERE agent_id = ?', [agentId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          if (!capabilityIds || capabilityIds.length === 0) {
            db.run('COMMIT');
            resolve({ updated: true, count: 0 });
            return;
          }
          
          // Insert new capabilities
          const stmt = db.prepare('INSERT INTO agent_capabilities (agent_id, capability_category_id) VALUES (?, ?)');
          let completed = 0;
          let hasError = false;
          
          capabilityIds.forEach(capabilityId => {
            stmt.run([agentId, capabilityId], (err) => {
              if (err && !hasError) {
                hasError = true;
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              
              completed++;
              if (completed === capabilityIds.length && !hasError) {
                stmt.finalize();
                db.run('COMMIT');
                resolve({ updated: true, count: capabilityIds.length });
              }
            });
          });
        });
      });
    });
  },

  // Get agents by capability
  getAgentsByCapability: (capabilityId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, ac.created_at as capability_assigned_at
        FROM agents a
        JOIN agent_capabilities ac ON a.id = ac.agent_id
        WHERE ac.capability_category_id = ?
        ORDER BY a.created_at DESC
      `, [capabilityId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Search agents by multiple capabilities
  searchAgentsByCapabilities: (capabilityIds, matchAll = false) => {
    return new Promise((resolve, reject) => {
      if (!capabilityIds || capabilityIds.length === 0) {
        resolve([]);
        return;
      }
      
      const placeholders = capabilityIds.map(() => '?').join(',');
      const havingClause = matchAll 
        ? `HAVING COUNT(DISTINCT ac.capability_category_id) = ${capabilityIds.length}`
        : '';
      
      const query = `
        SELECT a.*, GROUP_CONCAT(cc.display_name) as capabilities_list
        FROM agents a
        JOIN agent_capabilities ac ON a.id = ac.agent_id
        JOIN capability_categories cc ON ac.capability_category_id = cc.id
        WHERE ac.capability_category_id IN (${placeholders})
        GROUP BY a.id
        ${havingClause}
        ORDER BY a.created_at DESC
      `;
      
      db.all(query, capabilityIds, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // ============================================================================
  // INTER-AGENT MESSAGING SYSTEM
  // ============================================================================

  // Send a message from one agent instance to another
  sendMessage: (fromInstanceId, toInstanceId, messageType, content, options = {}) => {
    return new Promise((resolve, reject) => {
      const {
        subject = null,
        priority = 3,
        correlationId = null,
        expiresAt = null
      } = options;

      const messageData = {
        from_instance_id: fromInstanceId,
        to_instance_id: toInstanceId,
        message_type: messageType,
        subject,
        content,
        priority,
        correlation_id: correlationId,
        expires_at: expiresAt
      };

      const columns = Object.keys(messageData).join(', ');
      const placeholders = Object.keys(messageData).map(() => '?').join(', ');
      const values = Object.values(messageData);

      const query = `INSERT INTO agent_messages (${columns}) VALUES (${placeholders})`;

      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          const messageId = this.lastID;
          
          // Create initial delivery status record
          db.run(
            'INSERT INTO message_delivery_status (message_id, status) VALUES (?, ?)',
            [messageId, 'pending'],
            (statusErr) => {
              if (statusErr) {
                reject(statusErr);
              } else {
                resolve({
                  message_id: messageId,
                  ...messageData,
                  created_at: new Date().toISOString()
                });
              }
            }
          );
        }
      });
    });
  },

  // Get messages for a specific agent instance
  getMessages: (instanceId, options = {}) => {
    return new Promise((resolve, reject) => {
      const {
        messageType = null,
        status = null,
        limit = 50,
        offset = 0,
        includeRead = true
      } = options;

      let whereConditions = ['am.to_instance_id = ?'];
      let queryParams = [instanceId];

      if (messageType) {
        whereConditions.push('am.message_type = ?');
        queryParams.push(messageType);
      }

      if (status) {
        whereConditions.push('mds.status = ?');
        queryParams.push(status);
      }

      if (!includeRead) {
        whereConditions.push('mds.status != ?');
        queryParams.push('read');
      }

      const whereClause = whereConditions.join(' AND ');
      queryParams.push(limit, offset);

      const query = `
        SELECT 
          am.id,
          am.from_instance_id,
          am.to_instance_id,
          am.message_type,
          am.subject,
          am.content,
          am.priority,
          am.correlation_id,
          am.expires_at,
          am.created_at,
          mds.status,
          mds.delivered_at,
          mds.read_at,
          fi.instance_name as from_instance_name,
          ti.instance_name as to_instance_name
        FROM agent_messages am
        JOIN message_delivery_status mds ON am.id = mds.message_id
        LEFT JOIN agent_instances fi ON am.from_instance_id = fi.id
        LEFT JOIN agent_instances ti ON am.to_instance_id = ti.id
        WHERE ${whereClause}
        ORDER BY am.created_at DESC
        LIMIT ? OFFSET ?
      `;

      db.all(query, queryParams, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Update message delivery status
  updateMessageStatus: (messageId, status, errorMessage = null) => {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      let updateFields = ['status = ?', 'updated_at = ?'];
      let params = [status, now];

      if (status === 'delivered') {
        updateFields.push('delivered_at = ?');
        params.push(now);
      } else if (status === 'read') {
        updateFields.push('read_at = ?');
        params.push(now);
      } else if (status === 'failed' && errorMessage) {
        updateFields.push('error_message = ?');
        params.push(errorMessage);
      }

      updateFields.push('attempts = attempts + 1', 'last_attempt = ?');
      params.push(now);
      params.push(messageId);

      const query = `
        UPDATE message_delivery_status 
        SET ${updateFields.join(', ')}
        WHERE message_id = ?
      `;

      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            message_id: messageId,
            status,
            updated_at: now,
            changes: this.changes
          });
        }
      });
    });
  },

  // Get message by ID with delivery status
  getMessageById: (messageId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          am.*,
          mds.status,
          mds.attempts,
          mds.delivered_at,
          mds.read_at,
          mds.error_message,
          fi.instance_name as from_instance_name,
          ti.instance_name as to_instance_name
        FROM agent_messages am
        JOIN message_delivery_status mds ON am.id = mds.message_id
        LEFT JOIN agent_instances fi ON am.from_instance_id = fi.id
        LEFT JOIN agent_instances ti ON am.to_instance_id = ti.id
        WHERE am.id = ?
      `;

      db.get(query, [messageId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Clean up expired messages
  cleanupExpiredMessages: () => {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      
      db.run(
        'UPDATE message_delivery_status SET status = ? WHERE message_id IN (SELECT id FROM agent_messages WHERE expires_at < ? AND expires_at IS NOT NULL)',
        ['expired', now],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ expired_count: this.changes });
          }
        }
      );
    });
  },

  // Get message queue statistics
  getMessageQueueStats: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          mds.status,
          COUNT(*) as count,
          AVG(julianday('now') - julianday(am.created_at)) * 24 * 60 as avg_age_minutes
        FROM message_delivery_status mds
        JOIN agent_messages am ON mds.message_id = am.id
        GROUP BY mds.status
        
        UNION ALL
        
        SELECT 
          'total' as status,
          COUNT(*) as count,
          AVG(julianday('now') - julianday(am.created_at)) * 24 * 60 as avg_age_minutes
        FROM message_delivery_status mds
        JOIN agent_messages am ON mds.message_id = am.id
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const stats = {};
          rows.forEach(row => {
            stats[row.status] = {
              count: row.count,
              avg_age_minutes: row.avg_age_minutes
            };
          });
          resolve(stats);
        }
      });
    });
  },

  // ============================================================================
  // AGENT SECURITY & API KEY MANAGEMENT
  // ============================================================================

  // Generate secure API key for agent instance
  generateApiKey: (instanceId, keyName = null, expiresAt = null) => {
    return new Promise((resolve, reject) => {
      // Generate a cryptographically secure API key
      const crypto = require('crypto');
      const apiKey = 'ak_' + crypto.randomBytes(32).toString('hex');
      
      const keyData = {
        instance_id: instanceId,
        api_key: apiKey,
        key_name: keyName,
        expires_at: expiresAt,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.run(
        'INSERT INTO agent_api_keys (instance_id, api_key, key_name, expires_at, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [keyData.instance_id, keyData.api_key, keyData.key_name, keyData.expires_at, keyData.is_active, keyData.created_at, keyData.updated_at],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              ...keyData
            });
          }
        }
      );
    });
  },

  // Validate API key and return instance info
  validateApiKey: (apiKey) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          aak.*,
          ai.agent_id,
          ai.instance_name,
          ai.status as instance_status,
          ai.endpoint_url
        FROM agent_api_keys aak
        JOIN agent_instances ai ON aak.instance_id = ai.id
        WHERE aak.api_key = ? 
        AND aak.is_active = 1
        AND (aak.expires_at IS NULL OR aak.expires_at > datetime('now'))
      `;

      db.get(query, [apiKey], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            // Update last_used and usage_count
            const now = new Date().toISOString();
            db.run(
              'UPDATE agent_api_keys SET last_used = ?, usage_count = usage_count + 1, updated_at = ? WHERE id = ?',
              [now, now, row.id],
              (updateErr) => {
                if (updateErr) {
                  console.error('Error updating API key usage:', updateErr);
                }
              }
            );
          }
          resolve(row);
        }
      });
    });
  },

  // Revoke API key
  revokeApiKey: (apiKeyId, instanceId = null) => {
    return new Promise((resolve, reject) => {
      let query = 'UPDATE agent_api_keys SET is_active = 0, updated_at = ? WHERE id = ?';
      let params = [new Date().toISOString(), apiKeyId];

      // If instanceId provided, ensure key belongs to that instance
      if (instanceId) {
        query += ' AND instance_id = ?';
        params.push(instanceId);
      }

      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            success: this.changes > 0,
            changes: this.changes
          });
        }
      });
    });
  },

  // Get API keys for an instance
  getInstanceApiKeys: (instanceId, includeRevoked = false) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM agent_api_keys WHERE instance_id = ?';
      let params = [instanceId];

      if (!includeRevoked) {
        query += ' AND is_active = 1';
      }

      query += ' ORDER BY created_at DESC';

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Don't return full API keys in listings for security
          const sanitizedRows = rows.map(row => ({
            ...row,
            api_key: row.api_key.substring(0, 10) + '...' + row.api_key.slice(-4)
          }));
          resolve(sanitizedRows);
        }
      });
    });
  },

  // ============================================================================
  // RATE LIMITING SYSTEM
  // ============================================================================

  // Check and update rate limit for a bucket
  checkRateLimit: (bucketKey, maxRequests, windowSeconds) => {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const resetTime = new Date(now.getTime() + windowSeconds * 1000);

      // First, try to get existing bucket
      db.get(
        'SELECT * FROM rate_limit_buckets WHERE bucket_key = ?',
        [bucketKey],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            // Create new bucket
            db.run(
              'INSERT INTO rate_limit_buckets (bucket_key, current_count, reset_time, max_requests, window_seconds, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [bucketKey, 1, resetTime.toISOString(), maxRequests, windowSeconds, now.toISOString(), now.toISOString()],
              function(insertErr) {
                if (insertErr) {
                  reject(insertErr);
                } else {
                  resolve({
                    allowed: true,
                    current_count: 1,
                    max_requests: maxRequests,
                    reset_time: resetTime.toISOString(),
                    remaining: maxRequests - 1
                  });
                }
              }
            );
          } else {
            const bucketResetTime = new Date(row.reset_time);
            
            // Check if bucket has expired and needs reset
            if (now >= bucketResetTime) {
              // Reset the bucket
              const newResetTime = new Date(now.getTime() + windowSeconds * 1000);
              db.run(
                'UPDATE rate_limit_buckets SET current_count = 1, reset_time = ?, updated_at = ? WHERE bucket_key = ?',
                [newResetTime.toISOString(), now.toISOString(), bucketKey],
                function(updateErr) {
                  if (updateErr) {
                    reject(updateErr);
                  } else {
                    resolve({
                      allowed: true,
                      current_count: 1,
                      max_requests: maxRequests,
                      reset_time: newResetTime.toISOString(),
                      remaining: maxRequests - 1
                    });
                  }
                }
              );
            } else {
              // Check if we're under the limit
              if (row.current_count < row.max_requests) {
                // Increment and allow
                db.run(
                  'UPDATE rate_limit_buckets SET current_count = current_count + 1, updated_at = ? WHERE bucket_key = ?',
                  [now.toISOString(), bucketKey],
                  function(updateErr) {
                    if (updateErr) {
                      reject(updateErr);
                    } else {
                      resolve({
                        allowed: true,
                        current_count: row.current_count + 1,
                        max_requests: row.max_requests,
                        reset_time: row.reset_time,
                        remaining: row.max_requests - row.current_count - 1
                      });
                    }
                  }
                );
              } else {
                // Rate limit exceeded
                resolve({
                  allowed: false,
                  current_count: row.current_count,
                  max_requests: row.max_requests,
                  reset_time: row.reset_time,
                  remaining: 0
                });
              }
            }
          }
        }
      );
    });
  },

  // Clean up expired rate limit buckets
  cleanupRateLimitBuckets: () => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM rate_limit_buckets WHERE reset_time < datetime("now", "-1 hour")',
        [],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ cleaned_buckets: this.changes });
          }
        }
      );
    });
  },

  // ============================================================================
  // COMMUNICATION LOGGING SYSTEM
  // ============================================================================

  // Log communication event
  logCommunicationEvent: (eventData) => {
    return new Promise((resolve, reject) => {
      const {
        event_type,
        from_instance_id = null,
        to_instance_id = null,
        message_id = null,
        api_key_used = null,
        ip_address = null,
        user_agent = null,
        request_data = null,
        response_status = null,
        error_message = null,
        processing_time_ms = null,
        rate_limit_bucket = null
      } = eventData;

      db.run(
        'INSERT INTO communication_logs (event_type, from_instance_id, to_instance_id, message_id, api_key_used, ip_address, user_agent, request_data, response_status, error_message, processing_time_ms, rate_limit_bucket, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          event_type,
          from_instance_id,
          to_instance_id,
          message_id,
          api_key_used ? api_key_used.substring(0, 10) + '...' : null, // Truncate API key for security
          ip_address,
          user_agent,
          request_data ? JSON.stringify(request_data) : null,
          response_status,
          error_message,
          processing_time_ms,
          rate_limit_bucket,
          new Date().toISOString()
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ log_id: this.lastID });
          }
        }
      );
    });
  },

  // Get communication logs with filtering
  getCommunicationLogs: (options = {}) => {
    return new Promise((resolve, reject) => {
      const {
        event_type = null,
        from_instance_id = null,
        to_instance_id = null,
        api_key_used = null,
        limit = 100,
        offset = 0,
        since = null
      } = options;

      let whereConditions = [];
      let queryParams = [];

      if (event_type) {
        whereConditions.push('cl.event_type = ?');
        queryParams.push(event_type);
      }

      if (from_instance_id) {
        whereConditions.push('cl.from_instance_id = ?');
        queryParams.push(from_instance_id);
      }

      if (to_instance_id) {
        whereConditions.push('cl.to_instance_id = ?');
        queryParams.push(to_instance_id);
      }

      if (api_key_used) {
        whereConditions.push('cl.api_key_used LIKE ?');
        queryParams.push(api_key_used.substring(0, 10) + '%');
      }

      if (since) {
        whereConditions.push('cl.created_at >= ?');
        queryParams.push(since);
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
      queryParams.push(limit, offset);

      const query = `
        SELECT 
          cl.*,
          fi.instance_name as from_instance_name,
          ti.instance_name as to_instance_name
        FROM communication_logs cl
        LEFT JOIN agent_instances fi ON cl.from_instance_id = fi.id
        LEFT JOIN agent_instances ti ON cl.to_instance_id = ti.id
        ${whereClause}
        ORDER BY cl.created_at DESC
        LIMIT ? OFFSET ?
      `;

      db.all(query, queryParams, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Get communication statistics
  getCommunicationStats: (timeRange = '24h') => {
    return new Promise((resolve, reject) => {
      let timeFilter = '';
      switch (timeRange) {
        case '1h':
          timeFilter = "datetime('now', '-1 hour')";
          break;
        case '24h':
          timeFilter = "datetime('now', '-1 day')";
          break;
        case '7d':
          timeFilter = "datetime('now', '-7 days')";
          break;
        default:
          timeFilter = "datetime('now', '-1 day')";
      }

      const query = `
        SELECT 
          event_type,
          COUNT(*) as count,
          AVG(processing_time_ms) as avg_processing_time,
          MIN(created_at) as first_event,
          MAX(created_at) as last_event
        FROM communication_logs 
        WHERE created_at >= ${timeFilter}
        GROUP BY event_type
        
        UNION ALL
        
        SELECT 
          'total' as event_type,
          COUNT(*) as count,
          AVG(processing_time_ms) as avg_processing_time,
          MIN(created_at) as first_event,
          MAX(created_at) as last_event
        FROM communication_logs 
        WHERE created_at >= ${timeFilter}
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const stats = {};
          rows.forEach(row => {
            stats[row.event_type] = {
              count: row.count,
              avg_processing_time: row.avg_processing_time,
              first_event: row.first_event,
              last_event: row.last_event
            };
          });
          resolve(stats);
        }
      });
    });
  },

  // Database health check and persistence verification
  checkDatabaseHealth: () => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔍 Starting database health check...');
        
        // Check database connection
        await testConnection();
        console.log('✅ Database connection: OK');
        
        // Check if tables exist
        const tables = await new Promise((resolve, reject) => {
          db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.name));
          });
        });
        
        console.log('📋 Database tables:', tables.length);
        const expectedTables = ['users', 'agents', 'capability_categories', 'agent_instances'];
        const missingTables = expectedTables.filter(table => !tables.includes(table));
        
        if (missingTables.length > 0) {
          console.log('⚠️  Missing tables:', missingTables);
        } else {
          console.log('✅ All core tables exist');
        }
        
        // Check record counts
        const userCount = await new Promise((resolve, reject) => {
          db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          });
        });
        
        const agentCount = await new Promise((resolve, reject) => {
          db.get("SELECT COUNT(*) as count FROM agents", [], (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          });
        });
        
        const capabilityCount = await new Promise((resolve, reject) => {
          db.get("SELECT COUNT(*) as count FROM capability_categories", [], (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          });
        });
        
        console.log(`📊 Database statistics:
  Users: ${userCount}
  Agents: ${agentCount}  
  Capabilities: ${capabilityCount}
  Database file: ${DB_PATH}
  Database size: ${fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0} bytes`);
        
        // Test write capability
        const testId = Date.now();
        await new Promise((resolve, reject) => {
          db.run("INSERT INTO capability_categories (name, display_name, description, is_active) VALUES (?, ?, ?, ?)", 
            [`test-${testId}`, `Test ${testId}`, `Health check test ${testId}`, 0], 
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
        
        // Remove test record
        await new Promise((resolve, reject) => {
          db.run("DELETE FROM capability_categories WHERE name = ?", [`test-${testId}`], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        console.log('✅ Database write/delete test: OK');
        console.log('🎉 Database health check completed successfully!');
        
        resolve({
          status: 'healthy',
          tables: tables.length,
          users: userCount,
          agents: agentCount,
          capabilities: capabilityCount,
          dbPath: DB_PATH,
          dbSize: fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0
        });
        
      } catch (error) {
        console.error('❌ Database health check failed:', error);
        reject(error);
      }
    });
  },

  // ============================================================================
  // USER API KEY MANAGEMENT HELPERS
  // ============================================================================

  // Get user's agent instances
  getUserAgentInstances: (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ai.*,
          a.name as agent_name
        FROM agent_instances ai
        JOIN agents a ON ai.agent_id = a.id
        WHERE ai.uploaded_by = ?
        ORDER BY ai.created_at DESC
      `;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  },

  // Get or create user's default instance for API key generation
  getUserDefaultInstance: (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ai.*,
          a.name as agent_name
        FROM agent_instances ai
        JOIN agents a ON ai.agent_id = a.id
        WHERE ai.uploaded_by = ? AND ai.instance_name LIKE '%default%'
        ORDER BY ai.created_at DESC
        LIMIT 1
      `;
      
      db.get(query, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  },

  // Create default instance for user
  createUserDefaultInstance: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        // First create a default agent if needed
        const defaultAgentName = `user-${userId}-default-agent`;
        
        // Check if default agent exists
        let defaultAgent = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM agents WHERE name = ?', [defaultAgentName], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        // Create default agent if it doesn't exist
        if (!defaultAgent) {
          defaultAgent = await new Promise((resolve, reject) => {
            const agentData = {
              name: defaultAgentName,
              description: 'Default agent for API key usage',
              category: 'utility',
              author_name: 'System Generated',
              file_path: null,
              file_size: 0,
              download_count: 0,
              user_id: userId,
              created_at: new Date().toISOString()
            };

            const query = 'INSERT INTO agents (name, description, category, author_name, file_path, file_size, download_count, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const params = [agentData.name, agentData.description, agentData.category, agentData.author_name, agentData.file_path, agentData.file_size, agentData.download_count, agentData.user_id, agentData.created_at];

            db.run(query, params, function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({ id: this.lastID, ...agentData });
              }
            });
          });
        }

        // Create default instance
        const instanceData = {
          agent_id: defaultAgent.id,
          instance_name: `${defaultAgentName}-instance`,
          status: 'active',
          endpoint_url: null,
          uploaded_by: userId,
          created_at: new Date().toISOString()
        };

        const query = 'INSERT INTO agent_instances (agent_id, instance_name, status, endpoint_url, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?)';
        const params = [instanceData.agent_id, instanceData.instance_name, instanceData.status, instanceData.endpoint_url, instanceData.uploaded_by, instanceData.created_at];

        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              id: this.lastID, 
              ...instanceData,
              agent_name: defaultAgent.name 
            });
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  },

  // Get API key by ID
  getApiKeyById: (keyId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM agent_api_keys WHERE id = ?';
      
      db.get(query, [keyId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  },

  // ============================================================================
  // VOLUME AND FILESYSTEM HEALTH MONITORING
  // ============================================================================

  // Check volume health status
  checkVolumeHealth: () => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔍 Starting volume health check...');
        
        const isProduction = process.env.NODE_ENV === 'production';
        const volumePath = isProduction ? '/app/data' : path.dirname(DB_PATH);
        
        // Perform volume verification
        const verification = verifyVolumeMount(volumePath);
        
        const volumeHealth = {
          status: verification.exists && verification.writable ? 'healthy' : 'unhealthy',
          path: verification.path,
          exists: verification.exists,
          isDirectory: verification.isDirectory,
          readable: verification.readable,
          writable: verification.writable,
          mounted: verification.mounted,
          errors: verification.errors,
          spaceInfo: verification.spaceInfo,
          environment: process.env.NODE_ENV || 'development',
          isProductionVolume: isProduction && volumePath === '/app/data'
        };

        // Add warnings for production issues
        if (isProduction && !verification.mounted) {
          volumeHealth.warnings = ['Volume may not be properly mounted in Railway'];
        }

        if (isProduction && DB_PATH !== '/app/data/database.sqlite') {
          volumeHealth.warnings = volumeHealth.warnings || [];
          volumeHealth.warnings.push('Database is using fallback path, not persistent volume');
        }

        console.log(`✅ Volume health check completed: ${volumeHealth.status}`);
        resolve(volumeHealth);
        
      } catch (error) {
        console.error('❌ Volume health check failed:', error);
        reject(error);
      }
    });
  },

  // Check backup system health
  checkBackupHealth: () => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔍 Starting backup health check...');
        
        const backupDir = path.join(path.dirname(DB_PATH), 'backups');
        const backupHealth = {
          status: 'healthy',
          backupDirectory: backupDir,
          directoryExists: fs.existsSync(backupDir),
          backupCount: 0,
          lastBackup: null,
          totalBackupSize: 0,
          oldestBackup: null,
          newestBackup: null,
          backupFiles: []
        };

        // Check if backup directory exists
        if (!backupHealth.directoryExists) {
          backupHealth.status = 'warning';
          backupHealth.message = 'Backup directory does not exist';
          console.log('⚠️  Backup directory does not exist');
          resolve(backupHealth);
          return;
        }

        // Get backup files
        try {
          const files = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('database_backup_') && file.endsWith('.sqlite'))
            .map(file => {
              const filePath = path.join(backupDir, file);
              const stats = fs.statSync(filePath);
              return {
                name: file,
                path: filePath,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
              };
            })
            .sort((a, b) => b.modified - a.modified); // Sort by modification time, newest first

          backupHealth.backupCount = files.length;
          backupHealth.backupFiles = files.slice(0, 5); // Include details for last 5 backups
          backupHealth.totalBackupSize = files.reduce((total, file) => total + file.size, 0);

          if (files.length > 0) {
            backupHealth.newestBackup = {
              filename: files[0].name,
              created: files[0].created,
              size: files[0].size
            };
            backupHealth.lastBackup = backupHealth.newestBackup.created;
            
            backupHealth.oldestBackup = {
              filename: files[files.length - 1].name,
              created: files[files.length - 1].created,
              size: files[files.length - 1].size
            };
          }

          // Check if backups are recent (within last 24 hours for production)
          if (process.env.NODE_ENV === 'production' && files.length > 0) {
            const lastBackupAge = Date.now() - new Date(backupHealth.lastBackup).getTime();
            const hoursOld = lastBackupAge / (1000 * 60 * 60);
            
            if (hoursOld > 24) {
              backupHealth.status = 'warning';
              backupHealth.message = `Last backup is ${Math.round(hoursOld)} hours old`;
            }
          }

        } catch (readError) {
          backupHealth.status = 'unhealthy';
          backupHealth.error = `Failed to read backup directory: ${readError.message}`;
        }

        console.log(`✅ Backup health check completed: ${backupHealth.status} (${backupHealth.backupCount} backups)`);
        resolve(backupHealth);
        
      } catch (error) {
        console.error('❌ Backup health check failed:', error);
        reject(error);
      }
    });
  },

  // Check filesystem health
  checkFilesystemHealth: () => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔍 Starting filesystem health check...');
        
        const dbDir = path.dirname(DB_PATH);
        const filesystemHealth = {
          status: 'healthy',
          databasePath: DB_PATH,
          databaseDirectory: dbDir,
          databaseExists: fs.existsSync(DB_PATH),
          databaseSize: 0,
          directoryWritable: false,
          directoryReadable: false,
          freeSpace: null,
          permissions: {}
        };

        // Check database file
        if (filesystemHealth.databaseExists) {
          const dbStats = fs.statSync(DB_PATH);
          filesystemHealth.databaseSize = dbStats.size;
          filesystemHealth.databaseLastModified = dbStats.mtime;
          
          // Check database file permissions
          try {
            fs.accessSync(DB_PATH, fs.constants.R_OK);
            filesystemHealth.permissions.databaseReadable = true;
          } catch {
            filesystemHealth.permissions.databaseReadable = false;
            filesystemHealth.status = 'unhealthy';
          }

          try {
            fs.accessSync(DB_PATH, fs.constants.W_OK);
            filesystemHealth.permissions.databaseWritable = true;
          } catch {
            filesystemHealth.permissions.databaseWritable = false;
            filesystemHealth.status = 'unhealthy';
          }
        }

        // Check directory permissions
        try {
          fs.accessSync(dbDir, fs.constants.R_OK);
          filesystemHealth.directoryReadable = true;
        } catch {
          filesystemHealth.directoryReadable = false;
          filesystemHealth.status = 'unhealthy';
        }

        try {
          fs.accessSync(dbDir, fs.constants.W_OK);
          filesystemHealth.directoryWritable = true;
        } catch {
          filesystemHealth.directoryWritable = false;
          filesystemHealth.status = 'unhealthy';
        }

        // Test write capability
        if (filesystemHealth.directoryWritable) {
          try {
            const testFile = path.join(dbDir, '.fs_health_test_' + Date.now());
            fs.writeFileSync(testFile, 'filesystem health test');
            fs.unlinkSync(testFile);
            filesystemHealth.writeTestPassed = true;
          } catch (writeError) {
            filesystemHealth.writeTestPassed = false;
            filesystemHealth.writeTestError = writeError.message;
            filesystemHealth.status = 'unhealthy';
          }
        }

        // Get disk space information
        try {
          const spaceInfo = checkVolumeSpaceAvailability(dbDir);
          if (spaceInfo.available) {
            filesystemHealth.freeSpace = spaceInfo.free;
            filesystemHealth.totalSpace = spaceInfo.total;
            filesystemHealth.usedSpace = spaceInfo.used;
          }
        } catch (spaceError) {
          filesystemHealth.spaceCheckError = spaceError.message;
        }

        console.log(`✅ Filesystem health check completed: ${filesystemHealth.status}`);
        resolve(filesystemHealth);
        
      } catch (error) {
        console.error('❌ Filesystem health check failed:', error);
        reject(error);
      }
    });
  }
};

module.exports = {
  db,
  dbHelpers,
  testConnection,
  closeDatabase,
  initializeDatabase,
  seedCapabilityCategories,
  createDatabaseBackup,
  cleanupOldBackups,
  calculateFileChecksum
};
