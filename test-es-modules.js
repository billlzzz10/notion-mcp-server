console.log("Testing basic import...");

async function test() {
  try {
    const renderer = await import("./build/services/analytical-artifact-renderer.js");
    console.log("Import successful!");
    console.log("Available functions:", Object.keys(renderer));
  } catch (error) {
    console.error("Import failed:", error.message);
  }
}

test();
