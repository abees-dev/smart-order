/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: "com.smartorder.app",
  productName: "Smart Order",
  copyright: "Copyright © 2025 Smart Order",

  directories: {
    output: "release",
  },

  files: ["dist/**/*", "dist-electron/**/*", "package.json"],

  extraMetadata: {
    main: "dist-electron/main.cjs",
  },

  // Auto-updater configuration
  publish: [
    {
      provider: "github",
      owner: "your-github-username", // TODO: Update with actual GitHub username
      repo: "smart-order", // TODO: Update with actual repo name
      releaseType: "draft",
    },
  ],

  // macOS configuration
  mac: {
    category: "public.app-category.business",
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"],
      },
      {
        target: "zip",
        arch: ["x64", "arm64"],
      },
    ],
    icon: "build/icon.icns", // TODO: Add icon
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
  },

  // macOS DMG configuration
  dmg: {
    title: "Smart Order ${version}",
    icon: "build/icon.icns",
    background: "build/background.png", // TODO: Add background image
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: "link",
        path: "/Applications",
      },
    ],
    window: {
      width: 540,
      height: 380,
    },
  },

  // Windows configuration
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64", "ia32"],
      },
      {
        target: "zip",
        arch: ["x64", "ia32"],
      },
    ],
    icon: "build/icon.ico", // TODO: Add icon
    publisherName: "Smart Order",
    verifyUpdateCodeSignature: false,
  },

  // Windows NSIS installer configuration
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Smart Order",
  },

  // Linux configuration (optional)
  linux: {
    category: "Office",
    target: [
      {
        target: "AppImage",
        arch: ["x64"],
      },
    ],
    icon: "build/icon.png", // TODO: Add icon
  },

  // Code signing (for production)
  afterSign: "scripts/notarize.js", // TODO: Add notarization script for macOS

  // Build resources
  extraResources: [
    {
      from: "build/",
      to: "build/",
      filter: ["**/*"],
    },
  ],
};
