const fs = require('fs');
const path = require('path');

const VAULT_PATH = path.join(__dirname, 'vault');
const AUDIT_LOG_PATH = path.join(__dirname, 'VAULT_AUDIT_LOG.md');

console.log(`Vault Path: ${VAULT_PATH}`);
console.log(`Audit Log Path: ${AUDIT_LOG_PATH}`);

function countMarkdownFiles(dir, callback) {
    let fileCount = 0;
    let dirCount = 0;
    
    fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error(`Error reading directory ${dir}:`, err);
            return callback(err, null);
        }

        let pending = entries.length;
        if (pending === 0) {
            return callback(null, { fileCount, dirCount });
        }

        entries.forEach(entry => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                dirCount++;
                countMarkdownFiles(fullPath, (err, subCounts) => {
                    if (err) {
                        return callback(err, null);
                    }
                    fileCount += subCounts.fileCount;
                    dirCount += subCounts.dirCount;
                    if (--pending === 0) {
                        callback(null, { fileCount, dirCount });
                    }
                });
            } else {
                if (entry.name.endsWith('.md')) {
                    fileCount++;
                }
                if (--pending === 0) {
                    callback(null, { fileCount, dirCount });
                }
            }
        });
    });
}

function appendToAuditLog(content, callback) {
    const timestamp = new Date().toISOString();
    const logEntry = `
---
**Event:** Vault Inventory (Direct Script Test)
**Timestamp:** ${timestamp}
**Details:**
${content}
---
`;
    fs.appendFile(AUDIT_LOG_PATH, logEntry, (err) => {
        if (err) {
            return callback(err);
        }
        console.log('Successfully updated audit log.');
        callback(null);
    });
}

console.log('Starting vault inventory test...');
countMarkdownFiles(VAULT_PATH, (err, counts) => {
    if (err) {
        console.error('Failed to run vault inventory:', err);
        return;
    }
    
    const summary = `
- Total Markdown Files: ${counts.fileCount}
- Total Folders: ${counts.dirCount}
`;
    console.log('Inventory successful:');
    console.log(summary);
    
    appendToAuditLog(summary, (err) => {
        if (err) {
            console.error('Failed to write to audit log:', err);
        }
    });
});
