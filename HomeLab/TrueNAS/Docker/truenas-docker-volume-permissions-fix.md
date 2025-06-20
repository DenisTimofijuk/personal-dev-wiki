# Docker Volume Permissions Guide for TrueNAS Scale

## Problem Description

When running Docker containers on TrueNAS Scale as custom apps with mounted volumes, you may encounter permission errors like:

```
Failed to write to log file: EACCES: permission denied, open '/app/logs/app-2025-06-20.log'
```

This occurs because:
- The container runs as a non-root user (e.g., `node` user with UID 1000)
- The mounted volume from the TrueNAS host has different ownership/permissions
- The container user cannot write to the mounted directory

## Solutions

### Solution 1: TrueNAS Scale ACL Configuration (Recommended & Easiest)

**Steps:**
1. Go to TrueNAS Scale web interface
2. Navigate to **Storage** → **Datasets**
3. Find your volume/dataset used for the container
4. Click the three dots → **Edit Permissions**
5. Add an **ACL Entry**:
   - **Who**: User
   - **User**: Enter `1000` (the typical UID for container users like `node`)
   - **Permissions**: Full Control
   - **Flags**: Apply permissions to this folder, subfolders and files
6. Save and apply

**Why this works:**
- Gives the container user (UID 1000) full access to the mounted volume
- No Dockerfile changes needed
- Works with any container that runs as UID 1000

### Solution 2: Host Directory Permissions

If you prefer command-line approach on TrueNAS:

```bash
# SSH into TrueNAS Scale host
# Navigate to your volume mount point
sudo chown -R 1000:1000 /path/to/your/volume
sudo chmod -R 755 /path/to/your/volume
```

### Solution 3: Enhanced Dockerfile with Permission Handling

Modify your Dockerfile to handle permissions automatically:

```dockerfile
FROM node:18-alpine

# Install utilities for permission handling
RUN apk add --no-cache dumb-init su-exec

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY dist ./dist
RUN mkdir -p logs

# Create entrypoint script for permission fixing
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
# Fix permissions if running as root\n\
if [ "$(id -u)" = "0" ] && [ -d "/app/logs" ]; then\n\
    if [ ! -w "/app/logs" ]; then\n\
        echo "Fixing permissions for /app/logs..."\n\
        chown -R node:node /app/logs\n\
        chmod -R 755 /app/logs\n\
    fi\n\
    exec su-exec node "$@"\n\
else\n\
    exec "$@"\n\
fi' > /entrypoint.sh && chmod +x /entrypoint.sh

RUN chown -R node:node /app
VOLUME ["/app/logs"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["dumb-init", "npm", "start"]
```

### Solution 4: Application-Level Fallback

Add permission handling in your application code:

```typescript
import fs from 'fs';
import path from 'path';

function ensureWritableLogDirectory(): string {
    const preferredDir = '/app/logs';
    const fallbackDirs = ['/tmp/logs', './logs'];
    
    for (const dir of [preferredDir, ...fallbackDirs]) {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
            }
            
            // Test writability
            const testFile = path.join(dir, '.write-test');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            
            console.log(`Using log directory: ${dir}`);
            return dir;
        } catch (error) {
            console.warn(`Cannot use ${dir}: ${error.message}`);
        }
    }
    
    throw new Error('No writable log directory found');
}
```

## Common UID/GID Values

| Container Base Image | Default User | UID | GID |
|---------------------|--------------|-----|-----|
| `node:alpine` | node | 1000 | 1000 |
| `nginx:alpine` | nginx | 101 | 101 |
| `postgres:alpine` | postgres | 999 | 999 |
| `redis:alpine` | redis | 999 | 999 |

## Debugging Commands

Inside the container:
```bash
# Check current user
whoami
id

# Check directory permissions
ls -la /app/logs

# Test write permissions
touch /app/logs/test.txt
```

On TrueNAS host:
```bash
# Check mount point permissions
ls -la /path/to/your/volume

# Check if container is running as expected user
docker exec <container_name> id
```

## Best Practices

1. **Use ACL entries** on TrueNAS Scale for the simplest solution
2. **Always run containers as non-root users** for security
3. **Test write permissions** in your application startup code
4. **Use proper volume mounting** in TrueNAS app configuration
5. **Keep fallback directories** in your application for resilience
6. **Document the required UID/GID** for your custom apps

## TrueNAS Scale App Configuration

When creating custom apps in TrueNAS Scale:

- **Host Path**: `/mnt/pool/appdata/myapp/logs`
- **Mount Path**: `/app/logs`
- **ACL**: User ID 1000 with Full Control
- **Type**: Directory

This setup ensures your containerized applications can write to persistent volumes without permission issues.