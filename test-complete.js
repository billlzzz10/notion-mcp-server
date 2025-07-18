console.log("Testing Analytical Framework Renderer...");

async function test() {
  try {
    const renderer = await import("./build/services/analytical-artifact-renderer.js");
    console.log("Import successful!");
    
    // Test data
    const fishboneData = {
      problem: "ยอดขายลดลง",
      categories: [
        { name: "ทีมงาน", causes: ["ขาดทักษะ", "ขาดแรงจูงใจ"] },
        { name: "กระบวนการ", causes: ["ขั้นตอนช้า", "ขาดการติดตาม"] },
        { name: "เครื่องมือ", causes: ["ระบบล้าสมัย", "ขาดประสิทธิภาพ"] }
      ]
    };
    
    const swotData = {
      strengths: ["ทีมงานแข็งแรง", "ประสบการณ์สูง"],
      weaknesses: ["งบประมาณจำกัด", "เทคโนโลยีล้าสมัย"],
      opportunities: ["ตลาดขยายตัว", "เทคโนโลยีใหม่"],
      threats: ["คู่แข่งเพิ่มขึ้น", "ค่าใช้จ่ายสูงขึ้น"]
    };
    
    console.log("\n--- Testing Fishbone Diagram ---");
    const fishboneResult = renderer.renderFishbone(fishboneData);
    console.log(fishboneResult);
    
    console.log("\n--- Testing SWOT Analysis ---");
    const swotResult = renderer.renderSWOT(swotData);
    console.log(swotResult);
    
    console.log("\n--- Testing Framework Selection ---");
    const frameworkType = renderer.selectFrameworkByIntent("วิเคราะห์ปัญหา");
    console.log("Selected framework:", frameworkType);
    
    console.log("\n--- Testing Master Render Function ---");
    const masterResult = renderer.renderAnalyticalFramework("fishbone", fishboneData);
    console.log(masterResult);
    
  } catch (error) {
    console.error("Test failed:", error.message);
    console.error(error.stack);
  }
}

test();
