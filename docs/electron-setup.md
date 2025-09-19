# Electron Desktop App Setup

This document describes the Electron setup for Smart Order, which enables the web application to run as a native desktop application on Windows and macOS with auto-update functionality.

## Overview

The application is built using:

- **Electron**: Desktop app framework
- **Electron Builder**: Packaging and distribution
- **Electron Updater**: Auto-update functionality
- **Vite**: Build tool for both renderer and main process

## Project Structure

```
src/
├── electron/
│   ├── main.ts          # Main Electron process
│   ├── preload.ts       # Preload script for secure IPC
│   └── utils.ts         # Utility functions
├── components/
│   └── electron/
│       └── auto-updater.tsx # Auto-updater UI component
├── types/
│   └── electron.d.ts    # TypeScript definitions
└── ...

build/
├── entitlements.mac.plist  # macOS entitlements
├── icon.icns              # macOS icon (TODO)
├── icon.ico               # Windows icon (TODO)
└── icon.png               # Linux icon (TODO)

scripts/
├── electron-dev.js        # Development script
└── notarize.js           # macOS notarization (TODO)

configs:
├── electron-builder.config.js  # Build configuration
└── vite.electron.config.ts     # Vite config for Electron
```

## Development

### Prerequisites

1. **Node.js** (version 18 or higher)
2. **Yarn** (package manager)

### Development Scripts

```bash
# Start development mode (web + Electron)
yarn electron:dev

# Start only web development
yarn dev

# Build Electron main process only
vite build --config vite.electron.config.ts
```

### How Development Works

1. `yarn electron:dev` starts two processes:
   - Vite development server on `localhost:4000`
   - Electron main process that loads the dev server
2. The Electron app will automatically reload when you make changes to the renderer code
3. You need to restart the Electron process for changes to the main process

## Building & Distribution

### Build Commands

```bash
# Build for current platform
yarn electron:build

# Build for Windows
yarn electron:build:win

# Build for macOS
yarn electron:build:mac

# Build for Linux
yarn electron:build:linux

# Package without distribution
yarn electron:pack

# Build and publish (requires GitHub setup)
yarn electron:dist
```

### Build Output

Built applications are placed in the `release/` directory:

- **Windows**: `.exe` installer and zip file
- **macOS**: `.dmg` installer and zip file
- **Linux**: `.AppImage` file

## Auto-Updates

### How It Works

1. **electron-updater** checks for updates from GitHub releases
2. Updates are downloaded automatically in the background
3. Users are notified when updates are ready
4. App restarts to apply updates

### Configuration

Update settings are in `electron-builder.config.js`:

```javascript
publish: [
  {
    provider: 'github',
    owner: 'your-github-username',     # Update this
    repo: 'smart-order',               # Update this
    releaseType: 'draft',
  },
],
```

### Publishing Updates

1. **Create GitHub Release**:

   ```bash
   # Tag and push
   git tag v1.0.1
   git push origin v1.0.1

   # Build and publish
   yarn electron:dist
   ```

2. **GitHub Actions** (recommended - TODO):
   Set up automated builds on tag push

### Update UI

The auto-updater includes a React component (`AutoUpdater`) that:

- Shows current app version
- Allows manual update checks
- Displays update status and progress
- Is integrated into the Settings page

## Security & Code Signing

### macOS

- **Entitlements**: Configured in `build/entitlements.mac.plist`
- **Notarization**: Script needed in `scripts/notarize.js` (TODO)
- **Hardened Runtime**: Enabled in build config

### Windows

- **Code Signing**: Configure in build config for production
- **SmartScreen**: Signed apps avoid warnings

## Platform-Specific Notes

### macOS

- Builds universal binaries (x64 + arm64)
- Requires Apple Developer account for distribution
- DMG installer with custom background (TODO)

### Windows

- Builds for x64 and x86 (32-bit)
- NSIS installer with custom options
- No code signing by default (add for production)

## Icons & Branding

**TODO**: Add application icons:

- `build/icon.icns` (macOS) - 1024x1024 PNG → ICNS
- `build/icon.ico` (Windows) - Multiple sizes in ICO format
- `build/icon.png` (Linux) - 512x512 PNG

## Environment Variables

The app detects its environment:

- `isDev`: Development mode (unpackaged or NODE_ENV=development)
- `isPackaged`: Production mode (app.isPackaged)

## Troubleshooting

### Common Issues

1. **Electron won't start in development**:

   - Check that Vite dev server is running on port 4000
   - Ensure `wait-on` can reach the server

2. **Build fails**:

   - Check that all dependencies are installed
   - Verify build directory structure
   - Review electron-builder logs

3. **Auto-updates not working**:

   - Verify GitHub repository settings
   - Check release publishing configuration
   - Ensure app is signed (production)

4. **"Cannot find module 'electron-updater'" error**:

   - Fixed by `ssr.noExternal: true` in `vite.electron.config.ts`
   - Ensures all Node.js dependencies (except 'electron') are bundled
   - The main.cjs file should be ~500KB+ when properly bundled

5. **Preload script loading errors**:

   - Fixed by using `extraFiles` instead of `asarUnpack` in electron-builder config
   - Preload script is placed in Resources/dist-electron/ outside the asar
   - Path resolution uses `process.resourcesPath` directly

6. **White screen on app launch**:

   - Fixed by proper file path configuration for packaged apps
   - Uses `loadFile()` method instead of manual file:// URLs
   - Ensure dist/ folder contains the built web application

7. **ES Module vs CommonJS conflicts**:
   - Fixed by using `.cjs` extension for Electron main process files
   - Allows package.json to have `"type": "module"` for the web app

### Debugging

```bash
# Enable Electron debugging
DEBUG=electron* yarn electron:dev

# Enable verbose electron-builder output
yarn electron:build --publish=never --debug
```

## Next Steps / TODOs

1. **Add application icons** for all platforms
2. **Set up GitHub Actions** for automated builds
3. **Configure code signing** for production releases
4. **Add macOS notarization** script
5. **Create DMG background** image
6. **Set up crash reporting** (optional)
7. **Add update server** alternative to GitHub (optional)

## Security Considerations

- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Secure preload script
- ✅ External links open in browser
- ⚠️ Code signing needed for production
- ⚠️ Update server should use HTTPS

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [Electron Updater](https://github.com/electron-userland/electron-updater)
- [Security Best Practices](https://www.electronjs.org/docs/tutorial/security)
