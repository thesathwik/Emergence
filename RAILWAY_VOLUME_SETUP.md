# Railway Volume Setup Guide

## CRITICAL: Database Persistence Issue

The database is being lost on deployments because **Railway volumes are not automatically created from the `railway.toml` file**. You must manually create and attach the volume.

## Step 1: Create Volume via Railway CLI

```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Create a volume (interactive)
railway volume add
# Follow the prompts:
# - Name: emergence-db-volume
# - Mount Path: /app/data
# - Size: 1

# Attach the volume to your service
railway volume attach emergence-db-volume /app/data

# Verify the volume was created
railway volume list
```

## Step 2: Alternative - Create Volume via Railway Dashboard

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Volumes" tab
4. Click "Create Volume"
5. Name: `emergence-db-volume`
6. Mount Path: `/app/data`
7. Size: 1GB (or as needed)
8. Click "Create"

## Step 3: Verify Volume Configuration

After creating the volume, your Railway service should show:
- Volume Name: `emergence-db-volume`
- Mount Path: `/app/data`
- Status: `Attached`

## Step 4: Redeploy

After creating the volume, trigger a new deployment:

```bash
# Push any change to trigger redeploy
git commit --allow-empty -m "Trigger redeploy with volume"
git push origin main
```

## Step 5: Verify Database Persistence

Check the logs after deployment. You should see:
```
✅ Volume verification successful, using: /app/data/database.sqlite
```

Instead of:
```
❌ Volume verification failed for /app/data
⚠️  USING TEMPORARY STORAGE: /tmp/database.sqlite
⚠️  ALL DATA WILL BE LOST ON CONTAINER RESTART!
```

## Current Issue

The `railway.toml` file declares the volume but **doesn't create it**:

```toml
[[deploy.volumes]]
name = "emergence-db-volume"
mountPath = "/app/data"
```

This is just a configuration declaration. The actual volume must be created separately through the Railway CLI or dashboard.

## Why Data is Lost

Without a proper volume:
1. Database is stored in container's ephemeral filesystem
2. Every deployment creates a new container
3. Previous container (and its data) is destroyed
4. New container starts with empty filesystem

## Solution Summary

1. **Create the volume** via Railway CLI or dashboard
2. **Attach it to your service** at `/app/data`
3. **Redeploy** to use the persistent volume
4. **Verify** the logs show successful volume mounting

After this setup, your database will persist across deployments.