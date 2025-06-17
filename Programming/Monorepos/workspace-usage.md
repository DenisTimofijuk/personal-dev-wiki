# Working with workspaces

## Use workspace flags:

Run commands from the root directory:
```
npm install pg --workspace=backend/api
npm install bcrypt --workspace=backend/api
npm install --save-dev @types/bcrypt --workspace=backend/api
npm install socket.io-client --workspace=frontend
npm install lucide-react --workspace=frontend
npm install socket.io --workspace=arduino
```

## Development Mode

Run both frontend and backend together:
```
npm run dev
```

Or run them separately:
```
npm run dev:api       # Starts backend from root
npm run dev:frontend  # Starts frontend from root
```


Yes, you can use npm workspaces to create and manage parts of your monorepo project like that! However, there are a few important details to consider:

**For creating a new workspace:**
```bash
# This creates a new package.json in the backend/services directory
npm init --workspace=backend/services
```

This works if `backend/services` doesn't exist yet - npm will create the directory structure and initialize a new `package.json` there.

**For installing dependencies:**
```bash
# This installs packages specifically to the backend/services workspace
npm install socket.io serialport --workspace=backend/services
```

This will add the dependencies to the `backend/services/package.json` file.

**Prerequisites:**
Your root `package.json` needs to have the workspace configured:

```json
{
  "name": "my-monorepo",
  "workspaces": [
    "backend/*",
    "frontend/*"
  ]
}
```

**Alternative approaches:**
You could also navigate to the directory and run commands there:
```bash
cd backend/services
npm init
npm install socket.io serialport
```

**Workspace management commands:**
```bash
# List all workspaces
npm workspaces list

# Run scripts in specific workspace
npm run build --workspace=backend/services

# Install dependencies for all workspaces
npm install
```

The workspace flag approach you showed is clean and keeps you working from the root directory, which is often preferred in monorepo setups.

## Remove workspace:

```bash
# 1. Remove any references TO this workspace from OTHER workspaces
npm uninstall @backend/services --workspace=root
npm uninstall @backend/services --workspace=frontend/web
# (repeat for any workspace that depends on @backend/services)

# 2. Update root package.json workspaces array if needed
# 3. Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Delete the workspace directory
rm -rf backend/services
```

## The correct single command approach:

If you want a more direct approach, you'd run:
```bash
# Remove the directory entirely
rm -rf backend/services

# Then clean npm's workspace resolution
npm install
```

This is actually simpler and more effective than trying to use `npm uninstall` for workspace removal, since workspace management is more about file structure than package dependencies.