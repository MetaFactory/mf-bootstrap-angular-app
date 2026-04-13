#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

function getAvailableVersions() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }
  return fs
    .readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort(compareVersions);
}

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function printUsage() {
  console.log(`
Usage: mf-create-angular <target-path> [--version <version>]

Scaffold a new MFE project from a versioned template.

Arguments:
  target-path          Destination directory for the scaffolded project

Options:
  --version, -v <ver>  Template version to use (default: latest available)
  --list               List available template versions
  --help, -h           Show this help message
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  if (args.includes("--list")) {
    const versions = getAvailableVersions();
    if (versions.length === 0) {
      console.error("No template versions found.");
      process.exit(1);
    }
    console.log("Available versions:");
    versions.forEach((v) => console.log(`  ${v}`));
    return;
  }

  let targetPath = null;
  let version = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--version" || args[i] === "-v") {
      version = args[++i];
      if (!version) {
        console.error("Error: --version requires a value.");
        process.exit(1);
      }
    } else if (!args[i].startsWith("-")) {
      targetPath = args[i];
    } else {
      console.error(`Unknown option: ${args[i]}`);
      printUsage();
      process.exit(1);
    }
  }

  if (!targetPath) {
    console.error("Error: target path is required.");
    printUsage();
    process.exit(1);
  }

  const versions = getAvailableVersions();
  if (versions.length === 0) {
    console.error("Error: no template versions found in templates/.");
    process.exit(1);
  }

  if (!version) {
    version = versions[versions.length - 1];
    console.log(`No version specified, using latest: ${version}`);
  }

  if (!versions.includes(version)) {
    console.error(
      `Error: version "${version}" not found. Available: ${versions.join(", ")}`
    );
    process.exit(1);
  }

  const templateDir = path.join(TEMPLATES_DIR, version);
  const dest = path.resolve(targetPath);

  if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
    console.error(`Error: target directory "${dest}" is not empty.`);
    process.exit(1);
  }

  console.log(`Scaffolding project from template v${version}...`);
  console.log(`  Source:  ${templateDir}`);
  console.log(`  Target:  ${dest}`);

  copyRecursive(templateDir, dest);

  const fileCount = countFiles(dest);
  console.log(`\nDone! ${fileCount} files copied to ${dest}`);
}

function countFiles(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

main();
