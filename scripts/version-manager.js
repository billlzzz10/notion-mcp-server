#!/usr/bin/env node

/**
 * 🔢 Version Manager
 * อัตโนมัติจัดการเวอร์ชั่นเมื่อมีการเปลี่ยนแปลงเอกสาร
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

class VersionManager {
    constructor() {
        this.packagePath = 'package.json';
        this.changelogPath = this.findChangelogFile();
        this.readmePath = this.findReadmeFile();
    }

    findChangelogFile() {
        const candidates = ['CHANGELOG.md', 'CHANGES.md', 'HISTORY.md', 'NEWS.md'];
        return candidates.find(file => existsSync(file)) || 'CHANGELOG.md';
    }

    findReadmeFile() {
        const candidates = ['README.md', 'README.MD', 'Readme.md', 'readme.md'];
        return candidates.find(file => existsSync(file)) || 'README.md';
    }

    getCurrentVersion() {
        try {
            const pkg = JSON.parse(readFileSync(this.packagePath, 'utf8'));
            return pkg.version || '0.0.0';
        } catch (e) {
            console.log('⚠️ Cannot read package.json, using default version');
            return '0.0.0';
        }
    }

    bumpVersion(type = 'patch', customVersion = null) {
        if (customVersion) {
            console.log(`🔢 Setting custom version: ${customVersion}`);
            try {
                execSync(`npm version ${customVersion} --no-git-tag-version`, { stdio: 'pipe' });
                return customVersion;
            } catch (e) {
                console.log('❌ Failed to set custom version:', e.message);
                return null;
            }
        }

        console.log(`🔢 Bumping ${type} version...`);
        try {
            execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'pipe' });
            return this.getCurrentVersion();
        } catch (e) {
            console.log('❌ Failed to bump version:', e.message);
            return null;
        }
    }

    analyzeChanges() {
        console.log('🔍 Analyzing recent changes...');
        
        try {
            // หาไฟล์ที่เปลี่ยนแปลงใน commit ล่าสุด
            const gitOutput = execSync('git diff --name-only HEAD~1 HEAD', { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            });
            
            const changedFiles = gitOutput.split('\n').filter(f => f.trim());
            
            const analysis = {
                documentationFiles: [],
                newDocFiles: [],
                majorChanges: [],
                recommendedBump: 'patch'
            };

            changedFiles.forEach(file => {
                if (file.match(/\.(md|txt|rst|adoc)$/i)) {
                    analysis.documentationFiles.push(file);
                    
                    // ตรวจสอบว่าเป็นไฟล์ใหม่หรือไม่
                    try {
                        execSync(`git log --follow --oneline ${file} | wc -l`, { stdio: 'pipe' });
                        const commits = execSync(`git log --follow --oneline ${file}`, { 
                            encoding: 'utf8', 
                            stdio: 'pipe' 
                        }).split('\n').filter(l => l.trim()).length;
                        
                        if (commits <= 1) {
                            analysis.newDocFiles.push(file);
                        }
                    } catch (e) {
                        // อาจเป็นไฟล์ใหม่
                        analysis.newDocFiles.push(file);
                    }
                    
                    // ตรวจสอบการเปลี่ยนแปลงสำคัญ
                    if (file.match(/README|CHANGELOG|BREAKING|MAJOR/i)) {
                        analysis.majorChanges.push(file);
                    }
                }
            });

            // ตัดสินใจประเภท version bump
            if (analysis.majorChanges.length > 0) {
                analysis.recommendedBump = 'minor';
            } else if (analysis.newDocFiles.length >= 3) {
                analysis.recommendedBump = 'minor';
            } else if (analysis.newDocFiles.length > 0) {
                analysis.recommendedBump = 'patch';
            }

            console.log('📊 Analysis Results:');
            console.log(`  Documentation files changed: ${analysis.documentationFiles.length}`);
            console.log(`  New documentation files: ${analysis.newDocFiles.length}`);
            console.log(`  Major changes: ${analysis.majorChanges.length}`);
            console.log(`  Recommended bump: ${analysis.recommendedBump}`);

            return analysis;
        } catch (e) {
            console.log('⚠️ Git analysis failed, using default patch bump');
            return { recommendedBump: 'patch', documentationFiles: [] };
        }
    }

    updateDocumentation(newVersion, changes = []) {
        console.log('📝 Updating documentation with new version...');

        // อัปเดต README
        this.updateReadme(newVersion);
        
        // อัปเดต CHANGELOG
        this.updateChangelog(newVersion, changes);
        
        // อัปเดตไฟล์เอกสารอื่นๆ
        this.updateOtherDocs(newVersion);
    }

    updateReadme(newVersion) {
        if (!existsSync(this.readmePath)) {
            console.log('⚠️ README file not found, skipping README update');
            return;
        }

        try {
            let readme = readFileSync(this.readmePath, 'utf8');
            
            // อัปเดต version badge
            readme = readme.replace(
                /!\[Version\]\([^)]*\)/g,
                `![Version](https://img.shields.io/badge/version-${newVersion}-blue)`
            );
            
            // อัปเดต version ในหัวข้อ
            readme = readme.replace(
                /(## Version|### Version|Version:?\s*)[v]?[\d.]+/gi,
                `$1v${newVersion}`
            );
            
            // อัปเดต version ในลิงก์
            readme = readme.replace(
                /(version[=\/-])[v]?[\d.]+/gi,
                `$1${newVersion}`
            );

            writeFileSync(this.readmePath, readme);
            console.log(`✅ Updated ${this.readmePath}`);
        } catch (e) {
            console.log(`❌ Failed to update ${this.readmePath}:`, e.message);
        }
    }

    updateChangelog(newVersion, changes = []) {
        try {
            const today = new Date().toISOString().split('T')[0];
            let changelog = '';
            
            if (existsSync(this.changelogPath)) {
                changelog = readFileSync(this.changelogPath, 'utf8');
            } else {
                changelog = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n`;
            }

            const newEntry = `## [v${newVersion}] - ${today}

### Documentation Updates
${changes.length > 0 
    ? changes.map(c => `- ${c}`).join('\n')
    : '- Documentation improvements and updates'
}
- Automated version bump

`;

            // เพิ่ม entry ใหม่หลัง header
            const lines = changelog.split('\n');
            const headerEnd = lines.findIndex((line, index) => 
                index > 0 && line.match(/^##\s/) 
            );
            
            if (headerEnd !== -1) {
                lines.splice(headerEnd, 0, newEntry);
            } else {
                lines.push(newEntry);
            }

            changelog = lines.join('\n');
            writeFileSync(this.changelogPath, changelog);
            console.log(`✅ Updated ${this.changelogPath}`);
        } catch (e) {
            console.log(`❌ Failed to update ${this.changelogPath}:`, e.message);
        }
    }

    updateOtherDocs(newVersion) {
        // อัปเดตไฟล์ใน docs/ directory
        const docsPatterns = [
            'docs/**/*.md',
            '**/*.md',
            '**/*.txt'
        ];

        docsPatterns.forEach(pattern => {
            try {
                const files = execSync(`find . -path "./node_modules" -prune -o -name "${pattern.replace('**/', '')}" -type f -print`, {
                    encoding: 'utf8',
                    stdio: 'pipe'
                }).split('\n').filter(f => f.trim() && !f.includes('node_modules'));

                files.forEach(file => {
                    try {
                        let content = readFileSync(file, 'utf8');
                        const originalContent = content;
                        
                        // อัปเดต version references ที่ชัดเจน
                        content = content.replace(
                            /(version[:\s]+)[v]?[\d.]+/gi,
                            `$1v${newVersion}`
                        );

                        if (content !== originalContent) {
                            writeFileSync(file, content);
                            console.log(`✅ Updated version references in ${file}`);
                        }
                    } catch (e) {
                        // ไฟล์อาจเป็น binary หรืออ่านไม่ได้
                    }
                });
            } catch (e) {
                // Pattern ไม่ตรงหรือไม่มีไฟล์
            }
        });
    }

    createVersionSummary(oldVersion, newVersion, bumpType, changes) {
        const summary = {
            timestamp: new Date().toISOString(),
            oldVersion,
            newVersion,
            bumpType,
            changes,
            files_updated: [
                this.packagePath,
                this.readmePath,
                this.changelogPath
            ].filter(f => existsSync(f))
        };

        writeFileSync('.version-update-summary.json', JSON.stringify(summary, null, 2));
        
        console.log('📋 Version Update Summary:');
        console.log(`  Previous: v${oldVersion}`);
        console.log(`  New: v${newVersion}`);
        console.log(`  Type: ${bumpType}`);
        console.log(`  Files updated: ${summary.files_updated.length}`);
        
        return summary;
    }

    async run(options = {}) {
        console.log('🚀 Starting Version Manager...');
        
        const oldVersion = this.getCurrentVersion();
        console.log(`📦 Current version: v${oldVersion}`);

        // วิเคราะห์การเปลี่ยนแปลง
        const analysis = options.skipAnalysis ? { recommendedBump: 'patch' } : this.analyzeChanges();
        
        // ตัดสินใจประเภท bump
        const bumpType = options.versionType || analysis.recommendedBump;
        
        // Bump version
        const newVersion = this.bumpVersion(bumpType, options.customVersion);
        
        if (!newVersion) {
            console.log('❌ Version bump failed');
            process.exit(1);
        }

        console.log(`🎉 Version bumped: v${oldVersion} → v${newVersion}`);

        // อัปเดตเอกสาร
        this.updateDocumentation(newVersion, analysis.documentationFiles || []);

        // สร้างสรุป
        this.createVersionSummary(oldVersion, newVersion, bumpType, analysis.documentationFiles || []);

        console.log('✅ Version management completed successfully!');
        
        return {
            oldVersion,
            newVersion,
            bumpType,
            changes: analysis.documentationFiles || []
        };
    }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('version-manager.js')) {
    const args = process.argv.slice(2);
    const options = {};

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--type':
            case '-t':
                options.versionType = args[++i];
                break;
            case '--version':
            case '-v':
                options.customVersion = args[++i];
                break;
            case '--skip-analysis':
                options.skipAnalysis = true;
                break;
            case '--help':
            case '-h':
                console.log(`
🔢 Version Manager

Usage: node version-manager.js [options]

Options:
  -t, --type <type>     Version bump type (patch|minor|major)
  -v, --version <ver>   Custom version (overrides type)
  --skip-analysis       Skip git analysis, use default patch
  -h, --help           Show this help

Examples:
  node version-manager.js                    # Auto-analyze and bump
  node version-manager.js -t minor           # Force minor bump
  node version-manager.js -v 2.1.0           # Set specific version
  node version-manager.js --skip-analysis    # Quick patch bump
`);
                process.exit(0);
        }
    }

    // Run version manager
    const manager = new VersionManager();
    manager.run(options).catch(error => {
        console.error('❌ Version manager error:', error.message);
        process.exit(1);
    });
}

export { VersionManager };
