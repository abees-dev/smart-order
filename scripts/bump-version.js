#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Get the current version
const currentVersion = packageJson.version;
const versionParts = currentVersion.split(".").map((num) => parseInt(num));

// Get version bump type from command line argument or default to patch
const bumpType = process.argv[2] || "patch";

switch (bumpType) {
  case "major":
    versionParts[0]++;
    versionParts[1] = 0;
    versionParts[2] = 0;
    break;
  case "minor":
    versionParts[1]++;
    versionParts[2] = 0;
    break;
  case "patch":
  default:
    versionParts[2]++;
    break;
}

const newVersion = versionParts.join(".");

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

console.log(
  `📦 Version bumped from ${currentVersion} to ${newVersion} (${bumpType})`
);
console.log(`📝 Updated package.json`);
