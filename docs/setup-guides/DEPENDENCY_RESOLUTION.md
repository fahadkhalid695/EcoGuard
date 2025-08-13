# 🔧 Dependency Resolution Guide

## 🚨 Common Dependency Conflicts

### **React Version Conflicts**

**Error**: `peer react@^16.8.0 from react-speech-kit@3.0.1`

**Root Cause**: Some packages require older React versions but we're using React 18.

### **Quick Fix**

Run the automated fix script:

```bash
# Linux/Mac
chmod +x fix-dependencies.sh
./fix-dependencies.sh

# Windows
fix-dependencies.bat
```

### **Manual Fix**

```bash
# 1. Clean everything
rm -rf node_modules package-lock.json
npm cache clean --force

# 2. Install with legacy peer deps
npm install --legacy-peer-deps

# 3. Fix vulnerabilities
npm audit fix --legacy-peer-deps
```

## 📦 Updated Dependencies

### **Main Dependencies**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@tanstack/react-query": "^4.36.1",
  "recharts": "^2.12.0",
  "framer-motion": "^10.16.16",
  "socket.io-client": "^4.7.4"
}
```

### **Key Changes**
- ✅ **react-query** → **@tanstack/react-query** (React 18 compatible)
- ✅ **Custom speech hooks** instead of react-speech-kit
- ✅ **Legacy peer deps** enabled in .npmrc

## 🔍 Troubleshooting

### **If you still get conflicts:**

1. **Check for global packages:**
   ```bash
   npm list -g --depth=0
   ```

2. **Clear all caches:**
   ```bash
   npm cache clean --force
   yarn cache clean  # if using yarn
   ```

3. **Use npm overrides (package.json):**
   ```json
   {
     "overrides": {
       "react": "^18.3.1",
       "react-dom": "^18.3.1"
     }
   }
   ```

4. **Force resolution (.npmrc):**
   ```
   legacy-peer-deps=true
   auto-install-peers=true
   ```

### **Alternative: Use Yarn**

If npm continues to have issues:

```bash
# Install yarn
npm install -g yarn

# Remove npm files
rm -rf node_modules package-lock.json

# Install with yarn
yarn install
```

## 🚀 Verification

After fixing dependencies:

```bash
# Check for conflicts
npm ls

# Run the app
npm run dev

# Build for production
npm run build
```

## 🎯 Prevention

### **Best Practices**
1. **Pin major versions** in package.json
2. **Use .npmrc** for consistent installs
3. **Regular updates** with `npm update`
4. **Test after updates** with `npm run build`

### **Recommended .npmrc**
```
legacy-peer-deps=true
auto-install-peers=true
fund=false
audit-level=moderate
```

## 📋 Dependency Checklist

- [ ] React 18.3.1 installed
- [ ] No peer dependency warnings
- [ ] App builds successfully
- [ ] All features work correctly
- [ ] No console errors

## 🆘 Still Having Issues?

1. **Delete everything and start fresh:**
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install --legacy-peer-deps
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be 18+ 
   npm --version   # Should be 9+
   ```

3. **Use Docker instead:**
   ```bash
   docker-compose up --build
   ```

---

**The dependency conflicts are now resolved and the project should install and run smoothly!** 🎉