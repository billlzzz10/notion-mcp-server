import DataQualityAgent from './src/tools/dataQualityAgent.js';

async function runDataQualityCheck() {
  console.log('🤖 เริ่มต้นระบบ Data Quality Agent');
  console.log('=====================================');
  
  try {
    const agent = new DataQualityAgent();
    const results = await agent.analyzeDataQuality();
    
    console.log('\n✅ การตรวจสอบเสร็จสิ้น');
    console.log('การวิเคราะห์ทั้งหมดถูกบันทึกและแสดงผลแล้ว');
    
    return results;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

// รันการตรวจสอบ
runDataQualityCheck();
