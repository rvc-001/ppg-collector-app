#!/usr/bin/env node
/**
 * Patch script to adjust react-native Gradle plugin Kotlin script after npm/yarn install.
 *
 * This script is meant to be run from the project root (it will resolve paths relative to cwd).
 * It:
 *  - Locates the react-native gradle plugin build.gradle.kts shipped inside node_modules
 *  - Makes a .bak backup (first time only)
 *  - Comments out the import for serviceOf if present
 *  - Replaces the surrounding `testRuntimeOnly(...)` invocation that references `serviceOf<ModuleRegistry>()`
 *    with a safe fallback `testRuntimeOnly(files())` so the Gradle Kotlin script can evaluate on toolchains
 *    that don't expose `serviceOf`.
 *
 * The script is tolerant: if the file isn't found or has already been patched it exits successfully.
 */

const fs = require("fs");
const path = require("path");

function log(...args) {
  console.log("[patch-gradle-plugin]", ...args);
}

function backupFile(filePath) {
  const bakPath = `${filePath}.bak`;
  if (!fs.existsSync(bakPath)) {
    try {
      fs.copyFileSync(filePath, bakPath);
      log("Created backup:", bakPath);
    } catch (err) {
      log("Warning: failed to create backup:", err && err.message);
    }
  } else {
    log("Backup already exists:", bakPath);
  }
}

function findMatchingParenIndex(s, openPos) {
  // openPos is index of '(' in s
  let depth = 0;
  for (let i = openPos; i < s.length; i++) {
    const ch = s[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
    // naive: do not attempt to skip strings/comments; good enough for typical plugin script structure
  }
  return -1;
}

function replaceTestRuntimeOnlyWithFallback(content) {
  // Primary approach: replace an entire call like:
  //   testRuntimeOnly(... serviceOf<ModuleRegistry>() ... .first()))
  // with a safe single call:
  //   testRuntimeOnly(files())
  // The regex below is intentionally permissive to capture variations and avoid leaving an extra trailing ')'.
  const fullCallPattern =
    /testRuntimeOnly\([\s\S]*?serviceOf<ModuleRegistry>[\s\S]*?\.first\(\)\s*\)\)/g;
  if (fullCallPattern.test(content)) {
    const newContent = content.replace(
      fullCallPattern,
      "testRuntimeOnly(files()) // patched fallback to avoid serviceOf on this Gradle distribution",
    );
    return { changed: newContent !== content, content: newContent };
  }

  // If we couldn't find the full enclosing call, fall back to replacing the serviceOf expression itself.
  const simple = content.replace(
    /serviceOf<ModuleRegistry>\([\s\S]*?\)\s*\.getModule\([^)]*\)\s*\.classpath\s*\.asFiles\s*\.first\(\)/g,
    "/* patched fallback */ files()",
  );
  const changed = simple !== content;
  return { changed, content: simple };
}

function commentOutServiceOfImport(content) {
  const importLine =
    "import org.gradle.configurationcache.extensions.serviceOf";
  if (content.indexOf(importLine) === -1) return { changed: false, content };
  const replaced = content.replace(
    importLine,
    "// patched: removed serviceOf import to maintain compatibility",
  );
  return { changed: true, content: replaced };
}

function main() {
  const possiblePaths = [
    // Common location when installed as dependency of react-native
    "node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/build.gradle.kts",
    // Alternative in some setups
    "node_modules/react-native-gradle-plugin/build.gradle.kts",
    "node_modules/@react-native-community/gradle-plugin/build.gradle.kts",
  ];

  let filePath = null;
  for (const p of possiblePaths) {
    const full = path.resolve(process.cwd(), p);
    if (fs.existsSync(full)) {
      filePath = full;
      break;
    }
  }

  if (!filePath) {
    log(
      "react-native gradle plugin build script not found in node_modules. Nothing to do.",
    );
    process.exit(0);
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");

    // If we've already applied the patch marker, skip
    if (
      raw.indexOf("// patched:") !== -1 ||
      raw.indexOf("// patched fallback") !== -1
    ) {
      log("File already contains patch markers. Skipping.");
      process.exit(0);
    }

    backupFile(filePath);

    let newContent = raw;
    let anyChange = false;

    // 1) Comment out the serviceOf import
    const r1 = commentOutServiceOfImport(newContent);
    if (r1.changed) {
      newContent = r1.content;
      anyChange = true;
      log("Commented out serviceOf import.");
    }

    // 2) Replace testRuntimeOnly(...) blocks that reference serviceOf with a safe fallback
    const r2 = replaceTestRuntimeOnlyWithFallback(newContent);
    if (r2.changed) {
      newContent = r2.content;
      anyChange = true;
      log(
        "Replaced testRuntimeOnly(...) invocation referencing serviceOf with fallback.",
      );
    } else {
      // As extra safety, perform a targeted regex replace for the exact serviceOf chain if present
      const regex =
        /serviceOf<ModuleRegistry>\(\)\s*\.getModule\([^)]*\)\s*\.classpath\s*\.asFiles\s*\.first\(\)/g;
      if (regex.test(newContent)) {
        newContent = newContent.replace(
          regex,
          "/* patched fallback */ files()",
        );
        anyChange = true;
        log(
          "Replaced direct serviceOf ModuleRegistry expression with fallback.",
        );
      }
    }

    if (anyChange) {
      fs.writeFileSync(filePath, newContent, "utf8");
      log("Patched file written to:", filePath);
    } else {
      log("No changes required for:", filePath);
    }

    process.exit(0);
  } catch (err) {
    console.error(
      "[patch-gradle-plugin] Error while patching:",
      err && err.stack ? err.stack : err,
    );
    // Do not fail the postinstall step; return success so installs don't break.
    process.exit(0);
  }
}

main();
