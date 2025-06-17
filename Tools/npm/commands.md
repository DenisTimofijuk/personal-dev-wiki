# NPM Common Commands

Here's a list of the most commonly used NPM commands when working on projects:

## NPM Commands

### Project Setup
- `npm init` - Initialize a new npm project
- `npm init -y` - Initialize with default values

### Package Management
- `npm install` - Install all dependencies in package.json
- `npm install <package>` - Install a package and add to dependencies
- `npm install <package> --save-dev` - Install as dev dependency
- `npm uninstall <package>` - Remove a package
- `npm update` - Update all packages
- `npm update <package>` - Update specific package
- `npm list` - List installed packages
- `npm outdated` - Check for outdated packages

### Cleaning & Troubleshooting
- `rm -rf node_modules` - Delete node_modules directory
- `rm -rf node_modules && npm cache clean --force && npm install` - Complete reset and reinstall
- `npm cache clean --force` - Clear npm cache
- `npm audit` - Check for vulnerabilities
- `npm audit fix` - Automatically fix vulnerabilities if possible

### Running Scripts
- `npm start` - Run the start script defined in package.json
- `npm test` - Run the test script
- `npm run <script-name>` - Run a custom script defined in package.json

### Package Publication
- `npm version patch/minor/major` - Bump version according to semver
- `npm publish` - Publish package to npm registry
