console.log("Testing basic import...");

try {
  const renderer = require("./build/services/analytical-artifact-renderer");
  console.log("Import successful!");
  console.log("Available functions:", Object.keys(renderer));
} catch (error) {
  console.error("Import failed:", error.message);
}
