# TrueNAS Docker Network Endpoint Fix Guide

## Problem Description

When starting apps in TrueNAS, you may encounter this error:
```
Error response from daemon: endpoint with name [container-name] already exists in network [network-name]
```

This typically happens with errors like:
- `endpoint with name ix-mongodb-mongodb-1 already exists in network ix-mongodb_default`
- `endpoint with name ix-pgadmin-pgadmin-1 already exists in network ix-pgadmin_default`

## Common Causes

1. **Unexpected server shutdown** - Power loss, system crash, or forced reboot
2. **App updates interrupted** - Update process fails or is interrupted midway
3. **Docker daemon crashes** - Docker service crashes while containers are running
4. **Force-stopping apps** - Using kill commands instead of graceful UI stops
5. **Network timeouts** during container lifecycle operations

## Solution Steps

### Step 1: Try Simple Restart (First Attempt)

1. Open TrueNAS web interface
2. Navigate to **Apps**
3. Find the problematic app (e.g., MongoDB, pgAdmin)
4. Click **Stop** and wait 30-60 seconds
5. Click **Start**

If this doesn't work, proceed to manual cleanup.

### Step 2: Access TrueNAS Shell

**Option A: Web Interface**
1. In TrueNAS web interface, click the **Shell** icon in the top-right corner
2. This opens a web-based terminal

**Option B: SSH Access**
1. Enable SSH service in TrueNAS:
   - Go to **Services** → **SSH** → Toggle **ON**
2. Connect via SSH client:
   ```bash
   ssh root@[your-truenas-ip]
   ```

**Option C: Direct Console Access**
- Use keyboard/monitor directly connected to TrueNAS server
- Press Alt+F2 (or F1) to access console login

### Step 3: Manual Network Cleanup

Once in the shell, run these commands:

#### Check Current Docker Networks
```bash
# List all Docker networks
sudo docker network ls

# Look for networks with your app name (mongodb, pgadmin, etc.)
sudo docker network ls | grep [app-name]
```

#### Inspect the Problematic Network
```bash
# Replace 'ix-mongodb_default' with your actual network name
sudo docker network inspect ix-mongodb_default
```

This shows you which endpoints are still connected.

#### Clean Up Method 1: Disconnect and Remove
```bash
# Disconnect the stuck endpoint (replace names as needed)
sudo docker network disconnect ix-mongodb_default ix-mongodb-mongodb-1 --force

# Remove the network
sudo docker network rm ix-mongodb_default
```

#### Clean Up Method 2: Complete Container Cleanup
```bash
# Stop all containers for the app (replace 'mongodb' with your app name)
sudo docker stop $(sudo docker ps -q --filter "name=ix-mongodb")

# Remove all containers for the app
sudo docker rm $(sudo docker ps -aq --filter "name=ix-mongodb")

# Remove the network
sudo docker network rm ix-mongodb_default

# Clean up any dangling networks
sudo docker network prune -f
```

#### Clean Up Method 3: Nuclear Option (if above don't work)
```bash
# Stop all running containers
sudo docker stop $(sudo docker ps -q)

# Remove all containers
sudo docker rm $(sudo docker ps -aq)

# Remove all custom networks
sudo docker network prune -f

# Restart Docker service
sudo systemctl restart docker
```

⚠️ **Warning**: Method 3 will stop ALL Docker containers, not just the problematic one.

### Step 4: Restart the App

1. Return to TrueNAS web interface
2. Navigate to **Apps**
3. Start your application
4. The app should now start successfully

## Prevention Tips

### Best Practices
1. **Always use TrueNAS Apps UI** to stop applications - don't use `docker kill` commands
2. **Wait for apps to fully stop** before starting them again
3. **Perform graceful shutdowns** when rebooting TrueNAS
4. **Don't interrupt app updates** - let them complete fully

### Pre-Shutdown Checklist
Before rebooting or shutting down TrueNAS:
1. Stop all apps via the Apps interface
2. Wait for all apps to show "Stopped" status
3. Then proceed with shutdown/reboot

### Monitoring
Check Docker status occasionally:
```bash
# View running containers
sudo docker ps

# View all containers (including stopped)
sudo docker ps -a

# View networks
sudo docker network ls
```

## Troubleshooting Different Apps

### MongoDB
```bash
sudo docker network disconnect ix-mongodb_default ix-mongodb-mongodb-1 --force
sudo docker network rm ix-mongodb_default
```

### pgAdmin
```bash
sudo docker network disconnect ix-pgadmin_default ix-pgadmin-pgadmin-1 --force
sudo docker network rm ix-pgadmin_default
```

### PostgreSQL
```bash
sudo docker network disconnect ix-postgres_default ix-postgres-postgres-1 --force
sudo docker network rm ix-postgres_default
```

### Generic Pattern
```bash
sudo docker network disconnect ix-[APP-NAME]_default ix-[APP-NAME]-[SERVICE-NAME]-1 --force
sudo docker network rm ix-[APP-NAME]_default
```

## Additional Docker Commands

### Useful Diagnostic Commands
```bash
# Show Docker system info
sudo docker system info

# Show Docker disk usage
sudo docker system df

# Show detailed container information
sudo docker inspect [container-name]

# Show container logs
sudo docker logs [container-name]

# Show real-time container logs
sudo docker logs -f [container-name]
```

### Emergency Cleanup Commands
```bash
# Remove all stopped containers
sudo docker container prune -f

# Remove all unused networks
sudo docker network prune -f

# Remove all unused images
sudo docker image prune -f

# Remove all unused volumes (BE CAREFUL!)
sudo docker volume prune -f

# Complete system cleanup (NUCLEAR OPTION)
sudo docker system prune -a -f --volumes
```

⚠️ **Warning**: Be very careful with volume pruning as it can delete your app data!

## When to Seek Further Help

If these steps don't resolve the issue:
1. Check TrueNAS logs in **System** → **Advanced** → **Syslog**
2. Check Docker daemon logs: `sudo journalctl -u docker`
3. Post on TrueNAS forums with:
   - Complete error message
   - Output of `sudo docker network ls`
   - Output of `sudo docker ps -a`
   - Your TrueNAS version

## Recovery Checklist

- [ ] Tried simple restart via TrueNAS UI
- [ ] Accessed TrueNAS shell (web/SSH/console)
- [ ] Identified problematic network with `docker network ls`
- [ ] Inspected network with `docker network inspect`
- [ ] Disconnected stuck endpoint with `--force` flag
- [ ] Removed problematic network
- [ ] Successfully restarted app via TrueNAS UI
- [ ] Verified app is running properly

---