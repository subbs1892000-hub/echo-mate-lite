# EchoMateLite AWS Deployment Guide

## What Is Ready Now

EchoMateLite now includes production-oriented hardening for deployment:

- `helmet` for HTTP security headers
- `express-rate-limit` for abuse protection
- request compression
- `/health` endpoint for uptime checks
- paginated API responses for larger collections
- optional Cloudinary image upload support
- backend logging helpers
- React error boundary protection
- Dockerfiles for frontend and backend
- production environment examples
- a basic backend test

## Recommended Production Stack

### Simple Path

- Frontend: `S3 + CloudFront`
- Backend: `Elastic Beanstalk` or `EC2`
- Database: `MongoDB Atlas`
- Image hosting: `Cloudinary`

### Container Path

- Frontend container: `AWS ECS Fargate` or `App Runner`
- Backend container: `AWS ECS Fargate` or `App Runner`
- Database: `MongoDB Atlas`

## Production Environment Variables

### Backend

Use [server/.env.production.example](/Users/subramanyasr/Documents/New%20project/server/.env.production.example)

Required:

- `NODE_ENV=production`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`

Optional image hosting:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Frontend

Use [client/.env.production.example](/Users/subramanyasr/Documents/New%20project/client/.env.production.example)

- `VITE_API_BASE_URL`

## Docker

Build backend:

```bash
cd server
docker build -t echomatelite-server .
```

Build frontend:

```bash
cd client
docker build -t echomatelite-client .
```

Run both:

```bash
cd "/Users/subramanyasr/Documents/New project"
docker compose up --build
```

## Health Check

Use:

```bash
curl https://your-api-domain.com/health
```

## Production Checklist

1. Create MongoDB Atlas cluster
2. Set backend production env values
3. Configure Cloudinary credentials if using local uploads
4. Deploy backend and verify `/health`
5. Set frontend production API URL
6. Deploy frontend
7. Verify auth, posts, stories, messages, notifications, and saved posts

## Tests

Backend smoke test:

```bash
cd server
npm test
```
