import * as fs from 'fs/promises';
import * as path from 'path';

// Use environment variable or relative path for portability
const AUDIT_LOG_PATH = process.env.AUDIT_LOG_PATH || path.resolve(__dirname, '../../VAULT_AUDIT_LOG.md');

async function runWriteTest() {
  console.log(`Attempting to write to: ${AUDIT_LOG_PATH}`);
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `
---
**Event:** Simple Write Test
**Timestamp:** ${timestamp}
**Details:** This is a test to confirm file write access.
---
`;
    await fs.appendFile(AUDIT_LOG_PATH, logEntry);
    console.log('✅ Success! File write access is confirmed.');
  } catch (error) {
    console.error('❌ Failure! Could not write to file.');
    console.error(error);
  }
}

runWriteTest();
