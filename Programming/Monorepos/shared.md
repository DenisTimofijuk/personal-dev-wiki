# Shared Workspace Setup Guide for Monorepos

This guide shows how to set up a shared workspace in a monorepo to share types, utilities, and other code between different packages.

## 1. Initial Setup

### Project Structure
```
monorepo/
├── package.json (root)
├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.ts
│   ├── types/
│   │   ├── Auth.ts
│   │   ├── User.ts
│   │   └── Device.ts
│   └── utils/
│       ├── helpers.ts
│       └── validators.ts
├── backend/
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
└── frontend/
    ├── package.json
    └── src/
```

### Root package.json
```json
{
  "name": "your-monorepo",
  "private": true,
  "workspaces": [
    "frontend",
    "backend/api",
    "shared"
  ],
  "scripts": {
    "build:shared": "npm run build --workspace=shared",
    "build:api": "npm run build --workspace=backend/api",
    "build": "npm run build:shared && npm run build:api"
  }
}
```

## 2. Configure Shared Package

### shared/package.json
```json
{
  "name": "@your-org/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": true,
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.8.3"
  }
}
```

### shared/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["./**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### shared/index.ts (Barrel Export)
```typescript
// Export all types and utilities from main index
export * from './types/Auth';
export * from './types/User';
export * from './types/Device';
export * from './utils/helpers';
export * from './utils/validators';
```

## 3. Configure Consumer Package

### backend/api/package.json
```json
{
  "name": "api",
  "dependencies": {
    "@your-org/shared": "*"
  }
}
```

### backend/api/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../../shared" }
  ]
}
```

## 4. Installation and Build

```bash
# Install dependencies
npm install

# Build shared package first
npm run build:shared

# Build consuming packages
npm run build:api
```

## 5. Usage

### In your consuming package (e.g., backend/api):
```typescript
import { AuthResponse, User, validateEmail } from '@your-org/shared';

const user: User = {
  id: '123',
  email: 'user@example.com'
};

const isValid = validateEmail(user.email);
```

## Common Issues and Solutions

### ⚠️ Multiple Import Suggestions
**Problem**: IDE suggests imports from multiple paths:
- `@your-org/shared`
- `@your-org/shared/types`
- `@your-org/shared/types/Auth`

**Solution**: Only export from main `shared/index.ts`. Don't create `index.ts` files in subdirectories.

### ⚠️ TypeScript rootDir Error
**Problem**: `File is not under 'rootDir'`

**Solution**: Use TypeScript Project References (shown above) instead of including shared files directly.

### ⚠️ npm workspace: protocol error
**Problem**: `npm error Unsupported URL Type "workspace:"`

**Solution**: Use package name directly instead of `workspace:*`:
```json
{
  "dependencies": {
    "@your-org/shared": "*"
  }
}
```

## Best Practices

1. **Build Order**: Always build shared package before consuming packages
2. **Single Export Point**: Only export from main `shared/index.ts` to avoid confusion
3. **Private Packages**: Mark shared packages as `"private": true`
4. **Consistent Naming**: Use scoped names like `@your-org/shared`
5. **TypeScript References**: Use project references for proper TypeScript support

## Development Workflow

```bash
# For development with auto-rebuild
npm run dev --workspace=shared  # Terminal 1
npm run dev --workspace=backend/api  # Terminal 2

# Or use concurrently
npx concurrently "npm run dev --workspace=shared" "npm run dev --workspace=backend/api"
```

## Package Manager Notes

- **npm**: Use package name directly (no `workspace:` protocol)
- **yarn**: Can use `workspace:*` protocol
- **pnpm**: Can use `workspace:*` protocol

This setup provides a clean, maintainable way to share code across your monorepo while avoiding common pitfalls.