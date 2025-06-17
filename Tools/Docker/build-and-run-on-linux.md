# 🐳 Dockerized TypeScript Project – Fedora Linux Setup Guide

This guide explains how to **build and run a Docker-based Node.js/TypeScript project** on Fedora Linux. It's tailored for developers who **don't use Docker daily** and want a quick reference to get things running again.

---

## 📦 Prerequisites

- Fedora Linux (Workstation or Server)
- Docker installed (`dnf install -y docker`)
- `npm` / `node` environment ready

---

## 🚀 One-Time Setup

### 1. **Install Docker**

```bash
sudo dnf install -y docker
````

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

---

## 🛠 Project Structure Overview

Your project should look like:

```
project/
├── src/
├── dist/                # built by `tsc`
├── Dockerfile
├── .env                 # environment variables
├── package.json
└── logs/                # created automatically or mounted as volume
```

---

## ⚙️ Scripts (`package.json`)

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "tsx watch src/index.ts",
  "docker:build": "docker build -t my-app .",
  "docker:run": "sh -c 'docker run -p 3000:3000 --env-file .env -v $(pwd)/logs:/app/logs my-app'",
  "docker:run-detached": "sh -c 'docker run -d -p 3000:3000 --env-file .env -v $(pwd)/logs:/app/logs --name my-app my-app'"
}
```

---

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
LOG_DIR=/logs
```

### 4. **Run Docker container**

```bash
npm run docker:run
```

### 5. **Run in background**

```bash
npm run docker:run-detached
```

---

## 🧹 Cleanup

Stop and remove the running container:

```bash
docker stop my-app
docker rm my-app
```

Remove the image:

```bash
docker rmi my-app
```

---

## 💡 Troubleshooting

| Problem                                  | Solution                                                 |
| ---------------------------------------- | -------------------------------------------------------- |
| `docker: command not found`              | Install Docker using `dnf install -y docker`             |
| `Cannot connect to the Docker daemon...` | Run `sudo systemctl start docker`                        |
| `COPY dist ./dist` fails in Dockerfile   | Run `npm run build` before building the Docker image     |
| `.env variables missing`                 | Ensure `--env-file .env` is used when running container  |
| `Permission denied for /logs`            | Ensure directory exists and user has correct permissions |

---

## 📌 Notes

* Keep Docker turned **off on boot** if not used daily:
  Just run `sudo systemctl start docker` when needed.
* You can also use [`docker-compose`](https://docs.docker.com/compose/) for more complex setups or multiple services.

---

## ✅ Example Build & Run (Quick Copy)

```bash
sudo systemctl start docker
npm run build
npm run docker:build
npm run docker:run
```

---

Happy hacking! 🚀