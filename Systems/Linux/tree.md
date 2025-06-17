# Tree Command Usage

You can use the `tree` command to get a nice tree representation of directory content. If you don't have it installed, you can usually install it via your package manager.

## Basic Usage
```bash
tree /path/to/directory
```

## Limit Depth
Use the `-L` option to limit the depth:
```bash
tree -L 2 /path/to/directory
```
This will show the directory tree up to level 2.

## Alternative Using `find`
If you don't have `tree` installed and can't install it, you can use `find` command as an alternative:
```bash
find /path/to/directory
```

With a specific depth:
```bash
find /path/to/directory -maxdepth 2
```

## Excluding Directories
You can exclude the `node_modules` folder using the `-I` option:
```bash
tree -I node_modules /path/to/directory
```
This will ignore any directories or files that match the pattern `node_modules`.

For multiple exclusions, separate patterns with a pipe `|`:
```bash
tree -I "node_modules|dist|build" /path/to/directory
```