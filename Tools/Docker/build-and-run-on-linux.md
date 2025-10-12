# 🐳 Dockerized TypeScript Project – Fedora Linux Setup Guide

This guide explains how to **build and run a Docker-based Node.js/TypeScript project** on Fedora Linux. It's tailored for developers who **don't use Docker daily** and want a quick reference to get things running again.



## 📦 Prerequisites

- Fedora Linux (Workstation or Server)
- Docker installed (`dnf install -y docker`)
- `npm` / `node` environment ready



## 🚀 One-Time Setup

### 1. **Install Docker**

```bash
sudo dnf install -y docker
```

### 2. **Enable and Start Docker (When Needed)**

```bash
# Start Docker service
sudo systemctl start docker

# (Optional) Enable Docker to start on boot
sudo systemctl enable docker
```

### 3. **Run Docker as Non-Root User (Optional but recommended)**

```bash
sudo usermod -aG docker $USER
# You MUST log out and back in for this to take effect
```



## 🛠 Project Structure Overview

Your project should look like:

```
project/
├── src/
├── dist/                # built by `tsc`
├── Dockerfile
├── .env                 # environment variables
├── package.json
└── output/
    ├── logs/            # created automatically or mounted as volume
    └── exports/         # data exports
```



## ⚙️ Scripts (`package.json`)

```json
"scripts": {
  "start": "node dist/index.js",
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "docker:build": "npm run build && docker build -t $npm_package_config_IMAGE_NAME:$npm_package_config_IMAGE_TAG .",
  "docker:run": "docker run -p 3000:3000 --env-file .env -v $(pwd)/output:/app/output $npm_package_config_IMAGE_NAME:$npm_package_config_IMAGE_TAG",
  "docker:run:detached": "docker run -d -p 3000:3000 -v $(pwd)/output:/app/output --name $npm_package_config_IMAGE_NAME $npm_package_config_IMAGE_NAME:$npm_package_config_IMAGE_TAG",
  "docker:save": "docker save -o $npm_package_config_IMAGE_NAME.tar $npm_package_config_IMAGE_NAME:$npm_package_config_IMAGE_TAG",
  "docker:clean": "docker rm -f $npm_package_config_IMAGE_NAME 2>/dev/null || true && docker rmi -f $(docker images $npm_package_config_IMAGE_NAME -q) 2>/dev/null || true",
  "docker:stop-all": "docker stop $(docker ps -q) 2>/dev/null || true",
  "docker:dev": "npm run docker:stop-all && npm run docker:clean && npm run docker:build && npm run docker:run",
  "docker:deploy": "npm run docker:clean && npm run docker:build && npm run docker:save",
  "docker:push": "docker push $npm_package_config_IMAGE_NAME:$npm_package_config_IMAGE_TAG",
  "docker:publish": "npm run docker:build && npm run docker:push"
}
```



## 🧪 Run Instructions

### 1. **Build TypeScript project**

```bash
npm run build
```

This compiles your `src/` files into `dist/` so Docker can run it.

### 2. **Build Docker image**

```bash
npm run docker:build
```

### 3. **Create `.env` file**

Define your environment variables like this:

```env
PORT=3000
EMAIL_SERVICE=gmail
EMAIL_AUTH_USER=your@gmail.com
EMAIL_AUTH_PASS=your-app-password
LOG_DIR=/app/output/logs
```

### 4. **Run Docker container**

```bash
npm run docker:run
```

### 5. **Run in background (detached mode)**

```bash
npm run docker:run:detached
```

### 6. **Quick development cycle**

```bash
npm run docker:dev
```

This stops all containers, cleans up, rebuilds, and runs in one command.



## 🧹 Cleanup

### Stop and remove a specific container:

```bash
docker stop my-app
docker rm my-app
```

### Remove the image:

```bash
docker rmi my-app
```

### Clean up all stopped containers:

```bash
docker container prune -f
```

### Nuclear option (remove all containers and images):

```bash
docker stop $(docker ps -q) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null
docker rmi $(docker images -q) 2>/dev/null
```



## 💡 Troubleshooting

| Problem | Solution |
| - | -- |
| `docker: command not found` | Install Docker using `dnf install -y docker` |
| `Cannot connect to the Docker daemon...` | Run `sudo systemctl start docker` |
| `COPY dist ./dist` fails in Dockerfile | Run `npm run build` before building the Docker image |
| `.env variables missing` | Ensure `--env-file .env` is used when running container |
| `Permission denied for /app/output` | Ensure directory exists and user has correct permissions |
| **`Bind for 0.0.0.0:3000 failed: port is already allocated`** | **See Port Conflict section below** |



## 🔴 Port Conflict Issues

### Problem

You might see this error:

```
docker: Error response from daemon: failed to set up container networking: 
driver failed programming external connectivity on endpoint romantic_kilby: 
Bind for 0.0.0.0:3000 failed: port is already allocated
```

### Cause

Port 3000 is being used by another Docker container or process.

### Solutions

#### 1. **Check what's using the port**

```bash
# Check running containers
docker ps

# Check what process is using port 3000 (Linux)
sudo netstat -tlnp | grep :3000
# or
sudo lsof -i :3000
```

#### 2. **Stop all Docker containers**

```bash
# Stop all running containers
npm run docker:stop-all
# or manually
docker stop $(docker ps -q)
```

#### 3. **Clean up containers**

```bash
# Remove stopped containers
docker container prune -f

# Or use the project's clean script
npm run docker:clean
```

#### 4. **Quick fix: Stop everything and restart**

```bash
docker stop $(docker ps -q) 2>/dev/null
docker container prune -f
npm run docker:dev
```

#### 5. **Use a different port temporarily**

Modify the port mapping in your command:

```bash
docker run -p 3001:3000 --env-file .env -v $(pwd)/output:/app/output my-app
```



## 🔁 Development Workflow Best Practices

### For Frequent Docker Development

If you're using `docker:dev` frequently:

1. **Always use the cleanup script** – The `docker:stop-all` step prevents port conflicts
2. **Monitor running containers** – Run `docker ps` occasionally to check for orphaned containers
3. **Clean up regularly** – Run `docker container prune -f` and `docker image prune -f` weekly
4. **Use detached mode for testing** – Run containers with `-d` flag when you need them running in background

### Recommended Commands for Daily Use

```bash
# Start fresh development session
npm run docker:dev

# Check what's running
docker ps

# Stop everything when done
npm run docker:stop-all

# Weekly cleanup
docker system prune -f
```



## 📌 Notes

* Keep Docker turned **off on boot** if not used daily:
  Just run `sudo systemctl start docker` when needed.
* Using `docker:dev` frequently is fine as long as cleanup steps are included (which they are in the updated script)
* You can also use [`docker-compose`](https://docs.docker.com/compose/) for more complex setups or multiple services.
* The `2>/dev/null || true` pattern in scripts ensures commands don't fail if containers don't exist



## ✅ Example Build & Run (Quick Copy)

```bash
# Start Docker service
sudo systemctl start docker

# Clean start (recommended)
npm run docker:dev

# Or manual step-by-step
npm run build
npm run docker:build
npm run docker:run
```



## 🆘 Emergency Commands

When things go wrong and you need to reset everything:

```bash
# Stop Docker service
sudo systemctl stop docker

# Start fresh
sudo systemctl start docker

# Nuclear reset (removes all containers and images)
docker stop $(docker ps -aq) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null
docker rmi $(docker images -q) 2>/dev/null

# Then rebuild
npm run docker:dev
```