# 🐳 Docker Deployment Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. **npm ci --only=production Error**

**Error**: `The 'npm ci' command can only install with an existing package-lock.json`

**Solution**: The Dockerfile has been updated to handle missing package-lock.json files:

```dockerfile
# Updated approach - generates package-lock.json if missing
RUN npm install --only=production && npm cache clean --force
```

**Alternative Solution**: Generate package-lock.json manually:
```bash
cd backend
npm install
# This creates package-lock.json
```

### 2. **Port Already in Use**

**Error**: `Port 3001 is already allocated`

**Solution**:
```bash
# Stop existing containers
docker-compose down

# Check what's using the port
netstat -tulpn | grep :3001

# Kill the process if needed
sudo kill -9 <PID>
```

### 3. **Database Connection Issues**

**Error**: `ECONNREFUSED` to PostgreSQL

**Solution**:
```bash
# Check if PostgreSQL container is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### 4. **Permission Denied Errors**

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Fix file permissions
chmod +x docker-build.sh

# Or run with sudo (Linux/Mac)
sudo docker-compose up --build
```

### 5. **Out of Disk Space**

**Error**: `no space left on device`

**Solution**:
```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune

# Remove unused images
docker image prune -a
```

## 🛠️ Build Commands

### **Quick Build (Recommended)**
```bash
# Linux/Mac
./docker-build.sh

# Windows
docker-build.bat
```

### **Manual Build**
```bash
# Stop existing containers
docker-compose down

# Build and start
docker-compose up --build -d

# Check status
docker-compose ps
```

### **Development Build**
```bash
# Build without cache
docker-compose build --no-cache

# Start in foreground (see logs)
docker-compose up --build
```

## 📊 Monitoring & Debugging

### **View Logs**
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f backend
```

### **Container Status**
```bash
# List running containers
docker-compose ps

# Detailed container info
docker inspect ecoguard-backend

# Container resource usage
docker stats
```

### **Access Container Shell**
```bash
# Backend container
docker-compose exec backend sh

# PostgreSQL container
docker-compose exec postgres psql -U ecoguard -d ecoguard_pro

# Check files in container
docker-compose exec backend ls -la /app
```

## 🔧 Environment Variables

### **Required Variables**
```env
NODE_ENV=production
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ecoguard_pro
DB_USER=ecoguard
DB_PASSWORD=ecoguard123
JWT_SECRET=your-super-secret-jwt-key-here
```

### **Optional Variables**
```env
MQTT_BROKER_HOST=mqtt
MQTT_BROKER_PORT=1883
WEBSOCKET_PORT=8080
REDIS_HOST=redis
REDIS_PORT=6379
```

## 🌐 Network Issues

### **Service Communication**
```bash
# Test backend from frontend container
docker-compose exec frontend curl http://backend:3001/health

# Test database connection
docker-compose exec backend nc -zv postgres 5432

# Check network
docker network ls
docker network inspect ecoguard_default
```

### **External Access**
```bash
# Test from host machine
curl http://localhost:3001/health
curl http://localhost/

# Check port binding
docker port ecoguard-backend
```

## 🔄 Reset & Clean Start

### **Complete Reset**
```bash
# Stop and remove everything
docker-compose down -v --rmi all

# Clean Docker system
docker system prune -a

# Rebuild from scratch
docker-compose up --build
```

### **Data Reset Only**
```bash
# Remove volumes (keeps images)
docker-compose down -v

# Restart with fresh data
docker-compose up
```

## 📋 Health Checks

### **Service Health**
```bash
# Check all services
curl http://localhost:3001/health
curl http://localhost/

# Database health
docker-compose exec postgres pg_isready -U ecoguard

# MQTT broker health
docker-compose exec mqtt mosquitto_sub -h localhost -t '$SYS/broker/uptime' -C 1
```

### **Performance Monitoring**
```bash
# Container resource usage
docker stats --no-stream

# Disk usage
docker system df

# Network usage
docker-compose exec backend netstat -i
```

## 🚀 Production Deployment

### **Security Checklist**
- [ ] Change default passwords
- [ ] Use environment files for secrets
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Enable container restart policies

### **Performance Optimization**
```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    restart: unless-stopped
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check logs**: `docker-compose logs [service-name]`
2. **Verify environment**: Check `.env` files
3. **Test connectivity**: Use `curl` or `nc` commands
4. **Clean rebuild**: `docker-compose down -v && docker-compose up --build`
5. **Check resources**: Ensure sufficient disk space and memory

## 🎯 Quick Fixes

### **Most Common Solutions**
```bash
# 1. Permission fix
sudo chown -R $USER:$USER .

# 2. Port conflict fix
docker-compose down && docker-compose up

# 3. Cache clear
docker system prune && docker-compose build --no-cache

# 4. Complete reset
docker-compose down -v --rmi all && docker-compose up --build
```

---

**Need more help?** Check the main [Setup Guide](./SETUP.md) or create an issue in the project repository.