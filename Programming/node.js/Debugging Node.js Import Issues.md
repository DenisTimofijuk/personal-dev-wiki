# Debugging Node.js Import Issues - Complete Guide

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Tool #1: trace-imports.js (Runtime Analysis)](#tool-1-trace-importsjs-runtime-analysis)
- [Tool #2: Madge (Static Analysis)](#tool-2-madge-static-analysis)
- [When to Use Which Tool](#when-to-use-which-tool)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [CI/CD Integration](#cicd-integration)

---

## Overview

When working with Node.js/TypeScript projects, import issues can be frustrating to debug:
- **Silent crashes** with no error messages
- **Circular dependencies** causing mysterious failures
- **Runtime import errors** that don't appear during development

This guide covers two complementary tools to diagnose and prevent these issues.

---

## Quick Start

### Installation
```bash
# Install madge as a dev dependency
npm install --save-dev madge

# Create trace-imports.js (see below)
# No installation needed - it's a single file
```

### Usage
```bash
# Regular development (no debugging)
npm run dev

# Debug runtime import issues
npm run dev:inspect

# Check for circular dependencies
npm run analyze:circular
```

---

## Tool #1: trace-imports.js (Runtime Analysis)

### What It Does

`trace-imports.js` is a Node.js module that intercepts **all** `require()` calls at runtime. It works by:

1. **Hooking into Node's module system** - Overrides `Module.prototype.require`
2. **Tracking every import** - Records each module as it's loaded
3. **Building an import stack** - Maintains the chain of imports
4. **Detecting failures** - Catches when imports fail or crash
5. **Reporting crashes** - Shows the exact import sequence before failure

**Key Point:** This runs **at runtime**, so it sees the actual execution path your code takes.

### How It Works (Technical Details)

```javascript
// Simplified version of how it works:

const Module = require('module');
const originalRequire = Module.prototype.require;

// Override the require function
Module.prototype.require = function(id) {
  console.log('Importing:', id);  // Log before import
  
  try {
    const result = originalRequire.apply(this, arguments);  // Do actual import
    console.log('Success:', id);  // Log success
    return result;
  } catch (error) {
    console.error('Failed:', id);  // Log failure
    throw error;
  }
};
```

The full version tracks depth, detects circular dependencies, and provides detailed crash reports.

### Setup Instructions

#### Step 1: Create `trace-imports.js`

Create a file named `trace-imports.js` in your **project root**:

```javascript
/**
 * Import Tracer - Debug module loading issues
 * 
 * This module intercepts all require() calls to trace module imports
 * and helps identify circular dependencies or failing imports.
 * 
 * Usage: node -r ./trace-imports.js your-script.js
 */

const Module = require('module');
const path = require('path');
const originalRequire = Module.prototype.require;

let depth = 0;
const importStack = [];
const seenModules = new Set();

// Configuration
const config = {
  // Only show user modules (not node_modules)
  userModulesOnly: process.env.TRACE_USER_ONLY === 'true',
  
  // Show full paths
  showFullPaths: process.env.TRACE_FULL_PATHS === 'true',
  
  // Verbose mode (shows successful imports too)
  verbose: process.env.TRACE_VERBOSE === 'true',
  
  // Max depth to display
  maxDepth: parseInt(process.env.TRACE_MAX_DEPTH || '999', 10),
};

console.log('🔍 Import Tracer Active');
console.log('Config:', JSON.stringify(config, null, 2));
console.log('---\n');

/**
 * Check if a module is a user module (not from node_modules)
 */
function isUserModule(id) {
  return id.startsWith('.') || id.startsWith('/') || id.startsWith('\\') || id.includes('src');
}

/**
 * Format module name for display
 */
function formatModuleName(id, parentModule) {
  if (config.showFullPaths && parentModule) {
    try {
      const resolved = Module._resolveFilename(id, parentModule);
      return resolved;
    } catch (e) {
      return id;
    }
  }
  return id;
}

/**
 * Override require to trace imports
 */
Module.prototype.require = function(id) {
  const parentPath = this.filename || 'unknown';
  const shouldTrace = !config.userModulesOnly || isUserModule(id);
  const indent = '  '.repeat(Math.min(depth, 10));
  
  if (shouldTrace && depth <= config.maxDepth) {
    const moduleName = formatModuleName(id, this);
    const isFirstTime = !seenModules.has(moduleName);
    const marker = isFirstTime ? '→' : '↻';
    
    if (config.verbose || isFirstTime) {
      console.log(`${indent}${marker} [${depth}] ${moduleName}`);
    }
    
    seenModules.add(moduleName);
    importStack.push({ id: moduleName, depth, parent: parentPath });
  }
  
  depth++;
  try {
    const result = originalRequire.apply(this, arguments);
    depth--;
    
    if (shouldTrace && config.verbose && depth <= config.maxDepth) {
      console.log(`${indent}✓ [${depth}] ${id}`);
    }
    
    return result;
  } catch (error) {
    depth--;
    
    if (shouldTrace && depth <= config.maxDepth) {
      console.error(`${indent}✗ [${depth}] FAILED: ${id}`);
      console.error(`${indent}   Error: ${error.message}`);
      console.error(`${indent}   Parent: ${parentPath}`);
    }
    
    throw error;
  }
};

/**
 * Handle process exit
 */
process.on('exit', (code) => {
  if (code !== 0) {
    console.error('\n⚠️  Process exiting with code:', code);
    console.error('\n📚 Last 15 imports before exit:');
    importStack.slice(-15).forEach((item, i) => {
      const indent = '  '.repeat(Math.min(item.depth, 5));
      console.error(`  ${indent}${importStack.length - 15 + i}: ${item.id}`);
    });
    
    // Check for potential circular dependencies
    const lastFew = importStack.slice(-10).map(i => i.id);
    const duplicates = lastFew.filter((item, index) => lastFew.indexOf(item) !== index);
    
    if (duplicates.length > 0) {
      console.error('\n⚠️  Potential circular dependency detected:');
      duplicates.forEach(dup => console.error(`   - ${dup}`));
    }
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('\n🔴 UNCAUGHT EXCEPTION:');
  console.error(error.stack || error);
  console.error('\n📚 Import stack (last 20):');
  importStack.slice(-20).forEach((item, i) => {
    const indent = '  '.repeat(Math.min(item.depth, 5));
    console.error(`  ${indent}${i}: ${item.id}`);
    if (item.parent !== 'unknown') {
      console.error(`  ${indent}   from: ${item.parent}`);
    }
  });
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n🔴 UNHANDLED REJECTION:');
  console.error(reason);
  console.error('\n📚 Import stack (last 20):');
  importStack.slice(-20).forEach((item, i) => {
    const indent = '  '.repeat(Math.min(item.depth, 5));
    console.error(`  ${indent}${i}: ${item.id}`);
  });
  process.exit(1);
});
```

#### Step 2: Add NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon -L",
    
    "dev:inspect": "cross-env NODE_ENV=development TRACE_USER_ONLY=true nodemon -L --exec \"node -r ./trace-imports.js -r ts-node/register -r tsconfig-paths/register src/server.ts\"",
    
    "dev:inspect:verbose": "cross-env NODE_ENV=development TRACE_VERBOSE=true TRACE_USER_ONLY=true nodemon -L --exec \"node -r ./trace-imports.js -r ts-node/register -r tsconfig-paths/register src/server.ts\"",
    
    "dev:inspect:all": "cross-env NODE_ENV=development TRACE_VERBOSE=true nodemon -L --exec \"node -r ./trace-imports.js -r ts-node/register -r tsconfig-paths/register src/server.ts\""
  }
}
```

**Note:** Adjust `src/server.ts` to match your entry point.

#### Step 3: Configure Environment Variables

The tracer supports several environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `TRACE_USER_ONLY` | `false` | Only trace your project files, skip node_modules |
| `TRACE_VERBOSE` | `false` | Show successful imports too (not just failures) |
| `TRACE_FULL_PATHS` | `false` | Show full file paths instead of relative paths |
| `TRACE_MAX_DEPTH` | `999` | Maximum import depth to trace |

### Usage Examples

#### Basic Debugging (User Modules Only)
```bash
npm run dev:inspect
```

**Output:**
```
🔍 Import Tracer Active
---

→ [0] ./src/server
  → [1] ./src/app
    → [2] ./src/routes
      → [3] ./src/controllers/userController
        ✗ [3] FAILED: ./src/services/userService
           Error: Cannot find module './userService'
```

#### Verbose Mode (See Everything)
```bash
npm run dev:inspect:verbose
```

#### One-off Debug Without Changing Scripts
```bash
TRACE_USER_ONLY=true node -r ./trace-imports.js -r ts-node/register src/server.ts
```

### Understanding the Output

**Symbols:**
- `→` = First time importing this module
- `↻` = Module already imported (potential circular reference)
- `✓` = Import succeeded (verbose mode only)
- `✗` = Import failed

**Example with Circular Dependency:**
```
→ [0] ./src/services/ThermalChamberService
  → [1] ./src/services/ChamberStateMachine
    ↻ [2] ./src/services/ThermalChamberService  ⚠️ CIRCULAR!

⚠️ Potential circular dependency detected:
  - ./src/services/ThermalChamberService
```

---

## Tool #2: Madge (Static Analysis)

### What It Does

Madge is an **npm package** that performs **static code analysis**. It:
- Parses your source files without running them
- Builds a complete dependency graph
- Detects ALL circular dependencies in your codebase
- Can generate visual dependency diagrams

**Key Point:** This analyzes code **statically** (without running it), so it's fast and comprehensive.

### Setup Instructions

#### Step 1: Install Madge
```bash
npm install --save-dev madge
```

#### Step 2: Add NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "analyze:circular": "madge --circular --extensions ts,js src/",
    "analyze:deps": "madge --extensions ts,js src/",
    "analyze:graph": "madge --extensions ts,js --image dependency-graph.svg src/",
    "analyze:json": "madge --extensions ts,js --json src/ > dependencies.json"
  }
}
```

### Usage Examples

#### Check for Circular Dependencies
```bash
npm run analyze:circular
```

**Output:**
```
Processed 245 files in 1.2s

✖ Found 2 circular dependencies!

1) src/services/ThermalChamberService.ts > src/services/ChamberStateMachine.ts
2) src/utils/logger.ts > src/utils/errorHandler.ts > src/utils/logger.ts
```

#### Generate Visual Dependency Graph
```bash
npm run analyze:graph
```

This creates `dependency-graph.svg` showing your entire project structure.

#### List All Dependencies
```bash
npm run analyze:deps
```

**Output:**
```
src/server.ts
├── ./app
├── ./config
└── express

src/app.ts
├── ./routes
├── ./middleware
└── cors
```

#### Export to JSON for Processing
```bash
npm run analyze:json
```

Creates `dependencies.json` with the full dependency tree.

### Advanced Configuration

Create `.madgerc` in your project root:

```json
{
  "fontSize": "10px",
  "fontName": "Arial",
  "backgroundColor": "#ffffff",
  "nodeColor": "#4a90e2",
  "edgeColor": "#333333",
  "graphVizPath": "/usr/local/bin/dot",
  "excludeRegExp": [".*\\.test\\.ts$", ".*\\.spec\\.ts$"]
}
```

---

## When to Use Which Tool

### Comparison Matrix

| Feature | trace-imports.js | Madge |
|---------|------------------|-------|
| **Analysis Type** | Runtime (dynamic) | Static |
| **Speed** | Slower (runs code) | Fast (parses files) |
| **Shows crash point** | ✅ Yes | ❌ No |
| **Finds all circular deps** | ❌ Only active path | ✅ Yes, all |
| **Visual graphs** | ❌ No | ✅ Yes |
| **Conditional imports** | ✅ Sees them | ❌ Misses them |
| **Setup complexity** | Medium | Easy (npm install) |
| **Runtime overhead** | High | None |
| **CI/CD friendly** | ❌ No | ✅ Yes |

### Decision Tree

```
Is your app crashing on startup?
├─ YES → Use trace-imports.js
│        Find the exact import causing the crash
│
└─ NO → Want to prevent future issues?
         ├─ Code review / refactoring → Use Madge (visual graph)
         ├─ Pre-commit check → Use Madge (circular check)
         └─ CI/CD pipeline → Use Madge (fails on circular deps)
```

### Recommended Workflow

```bash
# 1. Daily development (no overhead)
npm run dev

# 2. App won't start? Debug it!
npm run dev:inspect

# 3. Before committing new features
npm run analyze:circular

# 4. During code review
npm run analyze:graph
# Open dependency-graph.svg to understand structure

# 5. CI/CD (prevent bad merges)
npm run analyze:circular || exit 1
```

---

## Common Issues and Solutions

### Issue 1: Circular Dependency

**Symptom:**
```
import modules...
[hardware] import modules...
⚠️ Process exiting with code: 1

⚠️ Potential circular dependency detected:
  - ./src/services/UserService
```

**Diagnosis:**
```bash
# Use madge to find all circular deps
npm run analyze:circular
```

**Solutions:**

#### Solution A: Use `import type` (if only importing types)
```typescript
// ❌ Before (creates circular dependency)
import { UserStatus } from '../UserService';

// ✅ After (type-only import, no runtime dependency)
import type { UserStatus } from '../UserService';
```

#### Solution B: Extract shared types/enums
```typescript
// Create: src/types/UserStatus.ts
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// UserService.ts
export { UserStatus } from '../types/UserStatus';

// Other files
import { UserStatus } from '../types/UserStatus';
```

#### Solution C: Dependency Injection
```typescript
// ❌ Before (circular)
import { UserService } from './UserService';

class UserValidator {
  validate() {
    const service = new UserService(); // Creates circular dep
  }
}

// ✅ After (inject dependency)
class UserValidator {
  constructor(private userService: UserService) {}
  
  validate() {
    this.userService.doSomething();
  }
}
```

### Issue 2: Silent Crash (No Error Message)

**Symptom:**
```
[APP] *
[APP] *
[nodemon] app crashed - waiting for file changes before starting...
```

**Solution:**
```bash
# Use trace-imports to see exactly where it crashes
npm run dev:inspect

# Look for the last import before exit
```

### Issue 3: "Cannot find module" at Runtime

**Symptom:**
```
Error: Cannot find module '@/services/UserService'
```

**Solutions:**

1. Check `tsconfig.json` paths configuration
2. Ensure `tsconfig-paths` is registered
3. Use `trace-imports.js` to see what path it's trying to resolve

```bash
TRACE_FULL_PATHS=true npm run dev:inspect
```

### Issue 4: Import Works Locally, Fails in Production

**Cause:** Case-sensitive file systems (Linux/Mac vs Windows)

**Solution:**
```bash
# Check for case mismatches
madge --extensions ts src/ --warning
```

Fix:
```typescript
// ❌ Wrong case
import { User } from './userService'; // file is UserService.ts

// ✅ Correct case
import { User } from './UserService';
```

---

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/dependency-check.yml`:

```yaml
name: Dependency Analysis

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  check-circular-deps:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check for circular dependencies
        run: |
          npx madge --circular --extensions ts,js src/
          if [ $? -ne 0 ]; then
            echo "❌ Circular dependencies detected!"
            exit 1
          fi
          echo "✅ No circular dependencies found"
      
      - name: Generate dependency graph
        if: always()
        run: npx madge --image dependency-graph.svg --extensions ts src/
      
      - name: Upload graph artifact
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: dependency-graph
          path: dependency-graph.svg
```

### Pre-commit Hook with Husky

```bash
# Install husky
npm install --save-dev husky

# Setup husky
npx husky install
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Checking for circular dependencies..."

npx madge --circular --extensions ts,js src/

if [ $? -ne 0 ]; then
  echo "❌ Circular dependencies detected! Please fix before committing."
  exit 1
fi

echo "✅ No circular dependencies found"
```

Make it executable:
```bash
chmod +x .husky/pre-commit
```

### NPM Script for CI

Add to `package.json`:

```json
{
  "scripts": {
    "test:deps": "madge --circular --extensions ts,js src/ || (echo '❌ Circular dependencies found!' && exit 1)",
    "ci": "npm run lint && npm run test:deps && npm run test && npm run build"
  }
}
```

---

## Best Practices

### 1. Regular Dependency Audits

Run weekly:
```bash
npm run analyze:circular
npm run analyze:graph
```

Review the graph and look for:
- Unexpected dependencies
- Overly complex connection patterns
- Modules with too many dependencies

### 2. Keep trace-imports.js Updated

Add to your project's README:
```markdown
## Debugging Import Issues

If the app crashes on startup:
1. Run `npm run dev:inspect`
2. Check the last imports before crash
3. Look for circular dependency warnings
```

### 3. Document Your Architecture

```bash
# Generate and commit dependency graph monthly
npm run analyze:graph
git add dependency-graph.svg
git commit -m "docs: update dependency graph"
```

### 4. Set Up Alerts

Configure your CI to fail on circular dependencies:
```json
{
  "scripts": {
    "posttest": "madge --circular --extensions ts src/ --no-color --no-spinner"
  }
}
```

---

## Troubleshooting

### trace-imports.js Not Working

**Problem:** No output when running `dev:inspect`

**Check:**
1. Is `trace-imports.js` in project root?
2. Is the `-r ./trace-imports.js` flag in the command?
3. Try absolute path: `-r /full/path/to/trace-imports.js`

### Madge Shows False Positives

**Problem:** Reports circular deps that don't exist

**Solution:**
```bash
# Exclude test files
madge --circular --extensions ts --exclude '.*\.test\.ts$' src/

# Update .madgerc to exclude patterns
```

### Too Much Output from trace-imports

**Solution:**
```bash
# Only show your files
TRACE_USER_ONLY=true npm run dev:inspect

# Limit depth
TRACE_MAX_DEPTH=5 npm run dev:inspect

# Redirect to file
npm run dev:inspect > imports.log 2>&1
```

---

## Additional Resources

- [Madge GitHub](https://github.com/pahen/madge)
- [Node.js Module System](https://nodejs.org/api/modules.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Circular Dependencies in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#cyclic_imports)

---

## Summary

### Quick Reference

```bash
# Daily work
npm run dev

# App crashes? Debug runtime imports
npm run dev:inspect

# Before commit: check circular deps
npm run analyze:circular

# Code review: visualize structure  
npm run analyze:graph

# CI/CD: prevent bad merges
npm test && npm run analyze:circular
```

### Files to Create

1. `trace-imports.js` - Runtime import tracer (copy code above)
2. `.madgerc` - Madge configuration (optional)
3. Update `package.json` scripts (required)

### Installation Commands

```bash
# One-time setup
npm install --save-dev madge
# Create trace-imports.js (copy code from guide)
# Update package.json scripts

# Verify setup
npm run analyze:circular
npm run dev:inspect
```

---

**Last Updated:** October 2025  
**Maintainer:** Your Team  
**License:** MIT