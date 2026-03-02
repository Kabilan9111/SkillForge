const fs = require("fs");
const path = require("path");

const IGNORE_FILE = ".skillforgeignore";

function loadIgnoreRules(projectRoot) {
  const ignorePath = path.join(projectRoot, IGNORE_FILE);
  if (!fs.existsSync(ignorePath)) return [];

  return fs
    .readFileSync(ignorePath, "utf-8")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);
}

function shouldIgnore(filePath, ignoreRules) {
  return ignoreRules.some(rule => filePath.includes(rule.replace("/", "")));
}

function collectFiles(dir, ignoreRules, collected = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (shouldIgnore(fullPath, ignoreRules)) continue;

    if (entry.isDirectory()) {
      collectFiles(fullPath, ignoreRules, collected);
    } else {
      const stat = fs.statSync(fullPath);
      if (stat.size < 200_000) { // HARD SAFETY LIMIT (200KB)
        collected.push(fullPath);
      }
    }
  }

  return collected;
}

function buildCommit(projectRoot) {
  const ignoreRules = loadIgnoreRules(projectRoot);

  console.log("Ignoring paths:", ignoreRules);

  const files = collectFiles(projectRoot, ignoreRules);

  return files.map(file => ({
    path: file,
    content: fs.readFileSync(file, "utf-8")
  }));
}

module.exports = {
  buildCommit
};
