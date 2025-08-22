# Database Migration Guide: SQLite to PostgreSQL

This guide explains how to migrate from SQLite (development) to PostgreSQL (production) to prevent data loss during Railway deployments.

## 🎯 **Problem Solved**

**Issue**: Railway deployments reset the SQLite database file, causing data loss
**Solution**: Use Railway's managed PostgreSQL database for persistent data storage

## 🔧 **Current Setup**

### **Development (Local)**
- ✅ **SQLite** database (`database.sqlite` file)
- ✅ **No data persistence** across deployments
- ✅ **Fast development** and testing

### **Production (Railway)**
- ❌ **SQLite** database gets reset on each deployment
- ❌ **Data loss** on every code push
- ✅ **PostgreSQL** solution prevents this

## 🚀 **Migration Steps**

### **Step 1: Add PostgreSQL Database to Railway**

1. **Go to Railway Dashboard**
   - Visit your Railway project
   - Click **"New"** → **"Database"** → **"Add PostgreSQL"**

2. **Railway will automatically provide**:
   ```bash
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

### **Step 2: Update Environment Variables**

Add these to your Railway environment variables:
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production

# Existing variables (keep these)
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
BASE_URL=https://your-app.railway.app
```

### **Step 3: Code Changes (Already Done)**

The code has been updated to support both databases:

#### **Automatic Database Selection**
```javascript
const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL;

if (isProduction && DATABASE_URL) {
  // Use PostgreSQL
  const { Pool } = require('pg');
  db = new Pool({ connectionString: DATABASE_URL });
} else {
  // Use SQLite
  db = new sqlite3.Database(DB_PATH);
}
```

#### **Unified Database Helpers**
All database functions work with both SQLite and PostgreSQL:
- ✅ `createUser()`
- ✅ `getUserByEmail()`
- ✅ `verifyUserEmail()`
- ✅ `createAgent()`
- ✅ `getAllAgents()`
- And many more...

## 📊 **Database Schema Comparison**

### **SQLite Schema**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT 0,
  verification_token TEXT,
  token_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **PostgreSQL Schema**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 **Migration Process**

### **Option 1: Fresh Start (Recommended for Development)**
1. **Deploy with PostgreSQL**
2. **Users register again**
3. **Data starts fresh**

### **Option 2: Data Migration (For Production)**
1. **Export SQLite data**:
   ```bash
   sqlite3 database.sqlite ".dump" > backup.sql
   ```

2. **Convert to PostgreSQL format**:
   - Replace `INTEGER PRIMARY KEY AUTOINCREMENT` with `SERIAL PRIMARY KEY`
   - Replace `BOOLEAN DEFAULT 0` with `BOOLEAN DEFAULT FALSE`
   - Replace `DATETIME` with `TIMESTAMP`

3. **Import to PostgreSQL**:
   ```bash
   psql $DATABASE_URL < converted_backup.sql
   ```

## 🛠 **Dependencies Added**

```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "sqlite3": "^5.1.6"
  }
}
```

## 🎯 **Benefits of PostgreSQL**

### **Production Benefits**
- ✅ **Data persistence** across deployments
- ✅ **Better performance** for larger datasets
- ✅ **ACID compliance** for data integrity
- ✅ **Concurrent connections** support
- ✅ **Backup and recovery** options

### **Development Benefits**
- ✅ **Same codebase** works in both environments
- ✅ **Easy local development** with SQLite
- ✅ **Seamless deployment** to production
- ✅ **No data loss** during updates

## 🔍 **Testing the Migration**

### **1. Local Testing**
```bash
# Test with SQLite (development)
NODE_ENV=development npm start

# Test with PostgreSQL (production simulation)
DATABASE_URL=postgresql://test:test@localhost:5432/testdb NODE_ENV=production npm start
```

### **2. Railway Deployment**
1. **Push code** to GitHub
2. **Railway auto-deploys**
3. **Check logs** for database connection
4. **Test registration** and verification

## 📝 **Environment Variables Summary**

### **Development (.env)**
```bash
NODE_ENV=development
# No DATABASE_URL needed (uses SQLite)
```

### **Production (Railway)**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
BASE_URL=https://your-app.railway.app
```

## 🚨 **Important Notes**

1. **No code changes needed** - everything is automatic
2. **Data will persist** after the first PostgreSQL deployment
3. **Existing SQLite data** will be lost unless migrated
4. **Railway provides** the DATABASE_URL automatically
5. **Both databases** use the same API - no application changes

## 🎉 **Result**

After migration:
- ✅ **No more data loss** on deployments
- ✅ **Persistent user accounts**
- ✅ **Persistent agent uploads**
- ✅ **Reliable production environment**
- ✅ **Easy development workflow**

Your application will now have a robust, production-ready database that survives all Railway deployments! 🚀
