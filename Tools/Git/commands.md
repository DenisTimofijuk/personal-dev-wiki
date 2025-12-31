# Git Common Commands

Here's a list of the most commonly used Git commands when working on projects:

## Git Commands

### Basic Git Workflow
- `git init` - Initialize a new Git repository
- `git clone <repository-url>` - Clone a repository from remote
- `git status` - Check status of working directory
- `git add <file>` - Add specific file to staging
- `git add .` - Add all changed files to staging
- `git commit -m "message"` - Commit staged changes with a message
- `git push` - Push commits to remote repository
- `git pull` - Fetch and merge changes from remote repository

### Branches
- `git branch` - List all local branches
- `git branch -a` - List all branches (local and remote)
- `git branch <branch-name>` - Create a new branch
- `git checkout <branch-name>` - Switch to a branch
- `git checkout -b <branch-name>` - Create and switch to a new branch
- `git merge <branch-name>` - Merge specified branch into current branch
- `git branch -d <branch-name>` - Delete a local branch
- `git push origin --delete <branch-name>` - Delete a remote branch

### Undoing Changes
- `git reset <file>` - Unstage a file while keeping changes
- `git reset --soft HEAD~1` - Undo last commit but keep changes staged
- `git reset --hard HEAD~1` - Remove last commit and discard changes
- `git checkout -- <file>` - Discard changes to a file
- `git revert <commit-hash>` - Create a new commit that undoes specified commit
- `git clean -fd` - Remove untracked files and directories

### History & Logs
- `git log` - View commit history
- `git log --oneline` - View simplified commit history
- `git blame <file>` - Show who changed what and when in a file
- `git diff` - Show changes between working directory and last commit