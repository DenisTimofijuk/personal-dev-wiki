# Git Branch Dependency Issues - Quick Fix Guide

## Common Symptoms
- `Module not found: Can't resolve 'package-name'`
- `npm error code ERESOLVE` with peer dependency conflicts
- App fails to start after switching branches
- Dependencies seem to be missing or wrong versions

## Root Cause
When switching Git branches, your `node_modules` and lock files may be out of sync with the current branch's `package.json`. Different branches often have different dependency versions.

## Quick Fix Steps

### 1. Identify Your Package Manager
Check which lock file exists in your project:
- `package-lock.json` → use **npm**
- `yarn.lock` → use **yarn**
- `pnpm-lock.yaml` → use **pnpm**

### 2. Clean Install Dependencies

**For npm projects:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**For yarn projects:**
```bash
rm -rf node_modules yarn.lock
yarn install
```

**For pnpm projects:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 3. If Still Getting Errors

**npm:**
```bash
npm install --legacy-peer-deps
```

**yarn:**
```bash
yarn install --ignore-engines
```

## Best Practice: Branch Switching Routine

1. **Switch branch:**
   ```bash
   git checkout <branch-name>
   ```

2. **Check if package.json changed:**
   ```bash
   git diff HEAD~1 package.json
   ```

3. **If changed, clean install:**
   ```bash
   # Choose based on your lock file
   rm -rf node_modules [package-lock.json|yarn.lock|pnpm-lock.yaml]
   [npm|yarn|pnpm] install
   ```

4. **Start development:**
   ```bash
   [npm run dev|yarn dev|pnpm dev]
   ```

## Pro Tips
- Always use the same package manager across your team
- Consider adding `node_modules/` to `.gitignore` if not already there
- Use `npm ci` or `yarn install --frozen-lockfile` for production builds
- Keep lock files in version control

## When This Happens Most
- Switching between feature branches with different dependencies
- Merging branches that updated package.json
- Switching between branches from different time periods
- Working with multiple developers who use different package managers