# Railway Deployment Guide

## Prerequisites
- Railway account
- GitHub repository connected to Railway

## Deployment Steps

### 1. Connect to Railway
1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository: `https://github.com/thesathwik/Emergence.git`

### 2. Configure Environment Variables
In Railway dashboard, add these environment variables:
- `NODE_ENV=production`
- `PORT=3001` (Railway will set this automatically)

### 3. Deploy
1. Railway will automatically detect the Node.js project
2. The build process will:
   - Install backend dependencies
   - Install frontend dependencies
   - Build the React frontend
   - Start the server

### 4. Build Process
The deployment uses these scripts:
- `postinstall`: Installs frontend dependencies
- `build`: Builds the React frontend
- `start`: Starts the Node.js server

### 5. File Structure After Build
```
/
├── server.js (backend)
├── frontend/
│   ├── build/ (built React files)
│   └── src/ (source files)
└── uploads/ (agent files)
```

### 6. How It Works
- Backend serves API at `/api/*`
- Frontend is built and served from `/frontend/build`
- All routes fall back to React app for client-side routing
- File uploads go to `/uploads` directory

### 7. Custom Domain (Optional)
- Add custom domain in Railway dashboard
- Update CORS settings if needed

## Troubleshooting

### Frontend Not Loading
- Check if `frontend/build` directory exists
- Verify build script completed successfully
- Check Railway logs for build errors

### API Not Working
- Verify environment variables are set
- Check if backend is starting correctly
- Ensure CORS settings are correct

### File Uploads Not Working
- Check if `/uploads` directory is writable
- Verify file size limits
- Check Railway storage configuration
