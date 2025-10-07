# Version Management

This project uses automatic version bumping with pre-commit hooks using Husky.

## How it works

- **Automatic**: Every commit automatically bumps the patch version (0.0.1 → 0.0.2)
- **Manual**: You can manually bump versions using yarn scripts
- **Git Hooks**: Uses Husky to run pre-commit hooks

## Available Commands

```bash
# Automatic patch version bump (happens on every commit)
git commit -m "your commit message"

# Manual version bumping
yarn version:patch   # 0.0.1 → 0.0.2
yarn version:minor   # 0.0.1 → 0.1.0  
yarn version:major   # 0.0.1 → 1.0.0
```

## Pre-commit Process

When you commit, the following happens automatically:

1. 🔍 **Lint Check**: Runs ESLint to check code quality
2. 🔄 **Version Bump**: Automatically bumps patch version
3. 📝 **Update package.json**: Adds updated package.json to the commit
4. 🧪 **Tests**: Runs test suite
5. ✅ **Commit**: Proceeds with commit if all checks pass

## Files

- `.husky/pre-commit` - Git hook configuration
- `scripts/bump-version.js` - Custom version bumping script
- `package.json` - Contains version and scripts

## Current Version

The current version is automatically maintained in `package.json`.

## Skipping Version Bump

If you need to commit without bumping the version (rare cases), you can use:

```bash
git commit --no-verify -m "your message"
```

⚠️ **Note**: This skips all pre-commit hooks including linting and tests.

## Version Format

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)