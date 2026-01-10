# Deployment Guide for CapRover

This guide explains how to deploy the AttendEase application to CapRover.

## Prerequisites

1. CapRover instance running
2. MongoDB database accessible
3. MinIO/S3 storage configured (optional, for photo storage)
4. Environment variables configured

## Project Structure

```
attendease-dashboard-ui/
├── server/          # Backend API (Express + TypeScript)
│   ├── Dockerfile
│   └── captain-definition
└── client/          # Frontend (Next.js)
    ├── Dockerfile
    └── captain-definition
```

## Deployment Steps

### 1. Server Deployment

1. **Connect to CapRover** and create a new app (e.g., `attendease-api`)

2. **Set Environment Variables** in CapRover:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb://your-mongo-connection-string
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-client-domain.com
   MINIO_ENDPOINT=your-minio-endpoint
   MINIO_ACCESS_KEY=your-access-key
   MINIO_SECRET_KEY=your-secret-key
   MINIO_BUCKET_NAME=attendease-photos
   MINIO_USE_SSL=false
   ```

3. **Deploy**:
   - Connect your Git repository
   - Set Root Directory to `server`
   - CapRover will automatically detect `captain-definition` and build using Dockerfile

4. **Health Check**: CapRover will use `/api/health` endpoint

### 2. Client Deployment

1. **Create a new app** in CapRover (e.g., `attendease-client`)

2. **Set Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   BUILD_ID=optional-build-id-for-cache-busting
   ```

3. **Deploy**:
   - Connect your Git repository
   - Set Root Directory to `client`
   - CapRover will automatically detect `captain-definition` and build using Dockerfile

4. **Health Check**: CapRover will use `/api/health` endpoint

## Cache Busting

The application implements cache busting through:

1. **Build ID**: Each build generates a unique build ID (timestamp + random string)
2. **Cache Headers**: 
   - Static assets: Long cache (1 year) with immutable flag
   - HTML pages: No cache (must revalidate)
   - API routes: No cache
3. **Next.js**: Automatically appends build ID to static assets

## Environment Variables

### Server (.env)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://...
MINIO_ENDPOINT=...
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_BUCKET_NAME=...
MINIO_USE_SSL=false
```

### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
BUILD_ID=optional-build-id
```

## Health Checks

- **Server**: `GET /api/health` - Returns server status and uptime
- **Client**: `GET /api/health` - Returns client status and uptime

## Building Locally

### Server
```bash
cd server
docker build -t attendease-server .
docker run -p 5000:5000 --env-file .env attendease-server
```

### Client
```bash
cd client
docker build -t attendease-client .
docker run -p 3000:3000 --env-file .env.local attendease-client
```

## Troubleshooting

1. **Build fails**: Check Node.js version (should be 20)
2. **Health check fails**: Verify port configuration
3. **Cache issues**: Set BUILD_ID environment variable for consistent builds
4. **CORS errors**: Update CORS_ORIGIN in server environment variables

## Notes

- Both Dockerfiles use multi-stage builds for smaller images
- Non-root users are used for security
- Health checks are configured for automatic restart
- Standalone mode is enabled for Next.js standalone mode
