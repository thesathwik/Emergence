# Design Document

## Overview

The database persistence issue occurs because Railway's ephemeral filesystem resets on each deployment, but the volume configuration is not properly ensuring data persistence. The current implementation has the right approach with volume mounting but needs fixes in the configuration and additional safeguards.

## Architecture

### Current State Analysis
- SQLite database configured to use `/app/data/database.sqlite` in production
- Railway volume `emergence-db-volume` mounted at `/app/data`
- Volume configuration exists in both `railway.json` and `railway.toml`
- Database initialization logic attempts to create volume directory

### Root Cause Analysis
1. **Volume Configuration Mismatch**: Both `railway.json` and `railway.toml` exist, potentially causing conflicts
2. **Missing Volume Creation**: Railway volume may not be properly created or linked
3. **Insufficient Error Handling**: Current fallback logic may not be working correctly
4. **No Backup Strategy**: No protection against data corruption during deployments

## Components and Interfaces

### 1. Railway Configuration Standardization
- **Purpose**: Ensure consistent volume configuration
- **Implementation**: Use only `railway.toml` (Railway's preferred format)
- **Interface**: Railway deployment configuration

### 2. Enhanced Database Connection Logic
- **Purpose**: Robust database initialization with proper volume handling
- **Components**:
  - Volume verification and creation
  - Database backup before migrations
  - Enhanced error logging
  - Graceful fallback mechanisms

### 3. Database Backup System
- **Purpose**: Automatic backups to prevent data loss
- **Components**:
  - Pre-deployment backup creation
  - Backup rotation (keep last 5 backups)
  - Backup verification
  - Recovery mechanisms

### 4. Volume Health Monitoring
- **Purpose**: Continuous monitoring of volume mount status
- **Components**:
  - Startup volume checks
  - Runtime volume monitoring
  - Health endpoint integration
  - Alert logging

## Data Models

### Backup Metadata
```javascript
{
  timestamp: "2025-01-14T10:30:00Z",
  filename: "database_backup_20250114_103000.sqlite",
  size: 1024000,
  checksum: "sha256hash",
  source_path: "/app/data/database.sqlite",
  backup_path: "/app/data/backups/database_backup_20250114_103000.sqlite"
}
```

### Volume Status
```javascript
{
  mounted: true,
  path: "/app/data",
  writable: true,
  size_available: 1073741824,
  database_exists: true,
  last_check: "2025-01-14T10:30:00Z"
}
```

## Error Handling

### Volume Mount Failures
1. **Detection**: Check if `/app/data` directory exists and is writable
2. **Logging**: Log detailed error with mount path and permissions
3. **Fallback**: Use container filesystem with warning
4. **Recovery**: Attempt to recreate volume directory

### Database Connection Failures
1. **Detection**: SQLite connection errors or file access issues
2. **Logging**: Log database path, permissions, and error details
3. **Fallback**: Try alternative database locations
4. **Recovery**: Restore from backup if available

### Backup Failures
1. **Detection**: File copy errors or insufficient space
2. **Logging**: Log backup attempt details and failure reason
3. **Fallback**: Continue without backup but log warning
4. **Recovery**: Clean up partial backup files

## Testing Strategy

### Volume Persistence Tests
1. **Test**: Deploy application, create data, redeploy, verify data exists
2. **Test**: Simulate volume mount failure and verify fallback behavior
3. **Test**: Verify database operations work correctly with volume mount

### Backup System Tests
1. **Test**: Verify backups are created on startup
2. **Test**: Verify backup rotation (old backups are cleaned up)
3. **Test**: Verify backup restoration functionality

### Error Handling Tests
1. **Test**: Simulate volume mount failures
2. **Test**: Simulate database corruption scenarios
3. **Test**: Verify logging output for troubleshooting

### Integration Tests
1. **Test**: Full deployment cycle with data persistence
2. **Test**: Health endpoint reports correct volume status
3. **Test**: Application startup with existing database

## Implementation Approach

### Phase 1: Configuration Cleanup
- Remove duplicate Railway configuration files
- Standardize on `railway.toml`
- Ensure volume is properly configured in Railway dashboard

### Phase 2: Enhanced Database Logic
- Improve volume detection and creation
- Add comprehensive logging
- Implement backup system
- Add volume health monitoring

### Phase 3: Deployment Verification
- Test deployment with data persistence
- Verify backup creation and rotation
- Validate error handling scenarios

### Phase 4: Monitoring and Maintenance
- Add volume status to health endpoint
- Implement backup verification
- Add recovery procedures documentation