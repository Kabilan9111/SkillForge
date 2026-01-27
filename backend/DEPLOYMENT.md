# SkillForge Backend - Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

Create a production `.env` file with secure values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration (CRITICAL: Change this!)
JWT_SECRET=generate-a-strong-random-secret-key-here-min-32-chars
JWT_EXPIRES_IN=7d

# Database
DB_PATH=./database.sqlite
# For PostgreSQL in production:
# DATABASE_URL=postgresql://user:password@host:5432/skillforge

# CORS
CORS_ORIGIN=https://yourfrontend.com
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Database Migration (SQLite → PostgreSQL)

For production, upgrade to PostgreSQL:

**Install pg driver:**
```bash
npm install pg
```

**Update `src/config/database.js`** to use PostgreSQL instead of SQLite.

### 3. Security Hardening

**Install security packages:**
```bash
npm install helmet express-rate-limit
```

**Update `server.js`:**
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Logging

**Install winston:**
```bash
npm install winston
```

**Create `src/utils/logger.js`:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

---

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

1. **Provision server** (Ubuntu 22.04 LTS recommended)

2. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2 (Process Manager):**
```bash
sudo npm install -g pm2
```

4. **Clone and setup:**
```bash
git clone <your-repo>
cd backend
npm install --production
cp .env.example .env
# Edit .env with production values
npm run init-db
npm run seed  # Optional
```

5. **Start with PM2:**
```bash
pm2 start server.js --name skillforge-backend
pm2 save
pm2 startup
```

6. **Setup Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name api.yourskillforge.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **SSL with Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourskillforge.com
```

### Option 2: Docker

**Create `Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: skillforge
      POSTGRES_USER: skillforge
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

**Deploy:**
```bash
docker-compose up -d
```

### Option 3: Platform-as-a-Service

#### Heroku
```bash
heroku create skillforge-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run npm run init-db
heroku run npm run seed
```

#### Railway.app
1. Connect GitHub repo
2. Add PostgreSQL plugin
3. Set environment variables
4. Deploy automatically on push

#### Render.com
1. Create Web Service from GitHub
2. Add PostgreSQL database
3. Set build command: `npm install`
4. Set start command: `node server.js`

---

## Post-Deployment

### 1. Health Monitoring

Setup monitoring with:
- **Uptime Robot** (free uptime monitoring)
- **Sentry** (error tracking)
- **Datadog** or **New Relic** (APM)

### 2. Backup Strategy

**Automated database backups:**
```bash
# Add to crontab
0 2 * * * pg_dump skillforge > /backups/db-$(date +\%Y\%m\%d).sql
```

### 3. API Documentation

Deploy API docs using:
- **Swagger/OpenAPI**
- **Postman Collections**
- Static site with API_DOCUMENTATION.md

### 4. CI/CD Pipeline

**GitHub Actions example (`.github/workflows/deploy.yml`):**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/skillforge-backend
            git pull
            npm install --production
            pm2 restart skillforge-backend
```

---

## Performance Optimization

### 1. Database Indexing

Already implemented in `initDatabase.js`:
- User email index
- User-institution index
- User-track indexes
- Progress tracking indexes

### 2. Response Caching

Add Redis for caching:
```bash
npm install redis
```

Cache roadmap and progress data:
```javascript
// Cache for 5 minutes
const CACHE_TTL = 300;
```

### 3. Rate Limiting

Already covered in security hardening.

### 4. Database Connection Pooling

For PostgreSQL, use connection pooling:
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

---

## Scaling Strategy

### Horizontal Scaling

1. **Load Balancer** (Nginx, AWS ALB)
2. **Multiple API instances** behind load balancer
3. **Shared PostgreSQL database**
4. **Redis for session/cache**

### Vertical Scaling

Start with:
- 2 CPU cores
- 2GB RAM
- 20GB SSD

Scale up as needed based on:
- Concurrent users
- Database size
- Request volume

---

## Monitoring Metrics

Track:
- **Request rate** (requests/second)
- **Response time** (p50, p95, p99)
- **Error rate** (4xx, 5xx)
- **Database query time**
- **Active users**
- **Module completion rate**

---

## Troubleshooting

### High CPU Usage
- Check for N+1 queries
- Add database indexes
- Implement caching

### Memory Leaks
- Use PM2 with max memory restart
- Profile with Node.js inspector
- Check for unclosed database connections

### Slow Queries
- Enable query logging
- Use EXPLAIN ANALYZE
- Add missing indexes

---

## Support and Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check API health

**Weekly:**
- Review performance metrics
- Database backup verification
- Security updates

**Monthly:**
- Dependency updates
- Database optimization
- User growth analysis

---

## Emergency Contacts

Maintain a runbook with:
- SSH access credentials
- Database access
- Third-party service credentials
- Rollback procedures
- Emergency contacts

---

## Production URL Structure

```
API Base: https://api.skillforge.com
Health: https://api.skillforge.com/api/health
Auth: https://api.skillforge.com/api/auth
Docs: https://docs.skillforge.com
```

---

## Final Checklist

- [ ] Environment variables configured
- [ ] Database migrated to PostgreSQL
- [ ] SSL certificate installed
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Logging setup complete
- [ ] Monitoring tools configured
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline working
- [ ] Documentation deployed
- [ ] Load testing completed
- [ ] Emergency runbook created

---

**You're ready for production! 🚀**
