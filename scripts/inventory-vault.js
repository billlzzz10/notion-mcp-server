import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
// Hardcode the absolute path for reliability
const VAULT_PATH = 'z:/01_WRI/ROF';
const AUDIT_LOG_PATH = process.env.AUDIT_LOG_PATH || path.join(__dirname, '..', 'VAULT_AUDIT_LOG.md');
async function appendToAuditLog(content) {
    const timestamp = new Date().toISOString();
    const logEntry = `
---
**Event:** Vault Inventory
**Timestamp:** ${timestamp}
**Details:**
${content}
---
`;
    await fs.appendFile(AUDIT_LOG_PATH, logEntry);
    console.log('Successfully updated audit log.');
}
async function runInventory() {
    console.log(`Starting vault inventory for path: ${VAULT_PATH}`);
    try {
        // glob needs forward slashes, even on Windows
        const pattern = path.join(VAULT_PATH, '**', '*.md').replace(/\\/g, '/');
        const files = await glob(pattern);
        const dirPattern = path.join(VAULT_PATH, '**/').replace(/\\/g, '/');
        const allDirs = await glob(dirPattern);
        const fileCount = files.length;
        const dirCount = allDirs.length;
        const summary = `
- Total Markdown Files: ${fileCount}
- Total Folders: ${dirCount}
`;
        console.log(summary);
        await appendToAuditLog(summary);
    }
    catch (error) {
        console.error('Failed to run vault inventory:', error);
    }
}
runInventory();
