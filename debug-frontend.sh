#!/bin/bash

echo "🔍 Debugging Frontend Display Issues..."

# Check if containers are running
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🌐 Testing Frontend Endpoints:"

# Test frontend health
echo "Testing frontend health..."
curl -I http://localhost/health 2>/dev/null || echo "❌ Frontend health check failed"

# Test if index.html is served
echo "Testing index.html..."
curl -I http://localhost/ 2>/dev/null || echo "❌ Frontend root failed"

# Test static assets
echo "Testing static assets..."
curl -I http://localhost/vite.svg 2>/dev/null || echo "❌ Static assets failed"

echo ""
echo "📝 Frontend Container Logs:"
docker-compose logs frontend --tail=20

echo ""
echo "🔧 Nginx Configuration Test:"
docker-compose exec frontend nginx -t 2>/dev/null || echo "❌ Nginx config test failed"

echo ""
echo "📁 Frontend Container File Structure:"
docker-compose exec frontend ls -la /usr/share/nginx/html/ 2>/dev/null || echo "❌ Cannot access frontend files"

echo ""
echo "🌐 Network Connectivity:"
echo "Testing backend connectivity from frontend container..."
docker-compose exec frontend nc -zv backend 3001 2>/dev/null || echo "❌ Cannot connect to backend"

echo ""
echo "🔍 Browser Console Errors:"
echo "Open browser developer tools (F12) and check for:"
echo "  - JavaScript errors in Console tab"
echo "  - Failed network requests in Network tab"
echo "  - Missing CSS/JS files"

echo ""
echo "💡 Quick Fixes to Try:"
echo "1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)"
echo "2. Clear browser cache"
echo "3. Try incognito/private browsing mode"
echo "4. Check if ad blockers are interfering"
echo "5. Rebuild containers: docker-compose up --build -d"