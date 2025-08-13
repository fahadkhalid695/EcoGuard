# 🚨 Frontend Deployment Issues - Analysis & Solutions

## 🔍 **Root Cause Analysis**

Based on the Docker logs, the frontend is failing due to several interconnected issues:

### **1. Docker Compose Version Warning**

```
the attribute 'version' is obsolete, it will be ignored
```

**Impact**: While not critical, this creates noise in logs and indicates outdated configuration.

### **2. Nginx Upstream Configuration Error**

```
nginx: [emerg] upstream "backend" may not have port 8080 in /etc/nginx/nginx.conf:78
```

**Impact**: Critical - Nginx cannot proxy WebSocket requests to backend.

### **3. Port Configuration Mismatch**

- Backend runs on port **3001** (API + WebSocket)
- Nginx config tried to proxy WebSocket to **backend:8080**
- Docker compose exposed both **3001** and **8080** ports

### **4. Service Dependency Issues**

- Frontend container starts before backend is fully ready
- Network connectivity problems between containers

## ✅ **Solutions Applied**

### **1. Fixed Nginx Configuration**

```nginx
# BEFORE (BROKEN)
location /socket.io/ {
    proxy_pass http://backend:8080;  # ❌ Wrong port
}

# AFTER (FIXED)
location /socket.io/ {
    proxy_pass http://backend;       # ✅ Correct upstream
}
```

### **2. Unified Port Configuration**

- Backend now handles both API and WebSocket on port **3001**
- Removed separate **8080** port exposure
- Updated all references to use consistent port

### **3. Updated Docker Compose**

```yaml
# BEFORE
ports:
  - "3001:3001"
  - "8080:8080"    # ❌ Unnecessary

# AFTER
ports:
  - "3001:3001"    # ✅ Single port for API + WebSocket
```

### **4. Removed Obsolete Version Field**

```yaml
# BEFORE
version: "3.8" # ❌ Deprecated

# AFTER
# Docker Compose file for EcoGuard Pro
# Note: version field is deprecated in newer Docker Compose versions
```

## 🛠️ **Quick Fix Commands**

### **Automated Fix (Recommended)**

```bash
# Linux/Mac
chmod +x fix-docker-deployment.sh
./fix-docker-deployment.sh

# Windows
fix-docker-deployment.bat
```

### **Manual Fix**

```bash
# 1. Stop everything
docker-compose down -v

# 2. Clean up
docker system prune -f

# 3. Create required directories
mkdir -p logs/nginx mqtt/config mqtt/data mqtt/log nginx/ssl

# 4. Rebuild and start
docker-compose up --build -d

# 5. Check status
docker-compose ps
docker-compose logs frontend
```

## 🔍 **Verification Steps**

### **1. Check Container Status**

```bash
docker-compose ps
```

Expected output:

```
NAME                 COMMAND                  SERVICE    STATUS
ecoguard-backend     "npm start"              backend    Up
ecoguard-frontend    "/docker-entrypoint.…"   frontend   Up
ecoguard-postgres    "docker-entrypoint.s…"   postgres   Up
```

### **2. Test Endpoints**

```bash
# Backend health
curl http://localhost:3001/health

# Frontend health
curl http://localhost/health

# API endpoint
curl http://localhost/api/v1/sensors
```

### **3. Check Logs**

```bash
# Backend logs
docker-compose logs backend

# Frontend/Nginx logs
docker-compose logs frontend

# All logs
docker-compose logs
```

## 🚨 **Common Issues & Solutions**

### **Issue: "Connection refused"**

```bash
# Check if backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### **Issue: "502 Bad Gateway"**

```bash
# Check nginx configuration
docker-compose exec frontend nginx -t

# Check upstream connectivity
docker-compose exec frontend nc -zv backend 3001

# Restart frontend
docker-compose restart frontend
```

### **Issue: "Port already in use"**

```bash
# Find what's using the port
netstat -tulpn | grep :80
netstat -tulpn | grep :3001

# Stop conflicting services
sudo systemctl stop nginx  # if system nginx is running
sudo systemctl stop apache2  # if apache is running

# Or use different ports in docker-compose.yml
```

### **Issue: "No space left on device"**

```bash
# Clean Docker
docker system prune -a
docker volume prune

# Check disk space
df -h
```

## 📊 **Monitoring & Debugging**

### **Real-time Logs**

```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### **Container Shell Access**

```bash
# Access frontend container
docker-compose exec frontend sh

# Access backend container
docker-compose exec backend sh

# Check nginx config
docker-compose exec frontend nginx -t
```

### **Network Debugging**

```bash
# Test internal connectivity
docker-compose exec frontend ping backend
docker-compose exec frontend nc -zv backend 3001

# Check network
docker network ls
docker network inspect ecoguard_default
```

## 🎯 **Prevention Checklist**

- [ ] All ports consistently configured
- [ ] Nginx upstream matches backend service
- [ ] Required directories exist
- [ ] Environment variables set correctly
- [ ] No port conflicts on host machine
- [ ] Docker has sufficient resources
- [ ] All services have health checks

## 📋 **Service Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (Nginx)       │    │   (Node.js)     │    │   (Database)    │
│   Port: 80      │◄──►│   Port: 3001    │◄──►│   Port: 5432    │
│                 │    │   API + WS      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │      MQTT       │
                    │   (Mosquitto)   │
                    │   Port: 1883    │
                    └─────────────────┘
```

## ✅ **Success Indicators**

When everything is working correctly:

1. **All containers running**: `docker-compose ps` shows all services as "Up"
2. **Frontend accessible**: http://localhost loads the dashboard
3. **Backend healthy**: http://localhost:3001/health returns OK
4. **API working**: http://localhost/api/v1/sensors returns data
5. **No error logs**: `docker-compose logs` shows no critical errors
6. **WebSocket connected**: Real-time updates work in dashboard

---

**The frontend deployment issues have been resolved with these fixes!** 🎉

Your EcoGuard Pro application should now deploy successfully with Docker.
