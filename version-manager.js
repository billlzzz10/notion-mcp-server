#!/usr/bin/env node

/**
 * Version Management Helper
 * ตัวช่วยจัดการเวอร์ชั่นอัตโนมัติ
 */

const fs = require('fs');
const path = require('path');

class VersionManager {
  constructor() {
    this.packagePath = path.join(process.cwd(), 'package.json');
    this.package = this.loadPackage();
  }

  loadPackage() {
    try {
      return JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    } catch (error) {
      console.error('❌ Error loading package.json:', error.message);
      process.exit(1);
    }
  }

  savePackage() {
    try {
      fs.writeFileSync(this.packagePath, JSON.stringify(this.package, null, 2) + '\n');
      console.log('✅ package.json updated successfully');
    } catch (error) {
      console.error('❌ Error saving package.json:', error.message);
      process.exit(1);
    }
  }

  getCurrentVersion() {
    return this.package.version;
  }

  parseVersion(version) {
    const parts = version.split('.');
    return {
      major: parseInt(parts[0]) || 0,
      minor: parseInt(parts[1]) || 0,
      patch: parseInt(parts[2]) || 0
    };
  }

  formatVersion(versionObj) {
    return `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
  }

  bumpVersion(type = 'patch') {
    const current = this.parseVersion(this.getCurrentVersion());
    const newVersion = { ...current };

    switch (type.toLowerCase()) {
      case 'major':
        newVersion.major += 1;
        newVersion.minor = 0;
        newVersion.patch = 0;
        break;
      case 'minor':
        newVersion.minor += 1;
        newVersion.patch = 0;
        break;
      case 'patch':
      default:
        newVersion.patch += 1;
        break;
    }

    const newVersionString = this.formatVersion(newVersion);
    this.package.version = newVersionString;

    return {
      old: this.formatVersion(current),
      new: newVersionString,
      type
    };
  }

  updateDocumentationVersions(newVersion) {
    const files = [
      'README.md',
      'README-new.md',
      'docs/README.md',
      'ROADMAP-UPDATED.md'
    ];

    let updatedFiles = [];

    files.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          let content = fs.readFileSync(file, 'utf8');
          const originalContent = content;

          // อัปเดตรูปแบบต่างๆ ของเวอร์ชั่น
          const patterns = [
            { 
              regex: /version\s+\d+\.\d+\.\d+/gi, 
              replacement: `version ${newVersion}` 
            },
            { 
              regex: /v\d+\.\d+\.\d+/g, 
              replacement: `v${newVersion}` 
            },
            { 
              regex: /"version":\s*"\d+\.\d+\.\d+"/g, 
              replacement: `"version": "${newVersion}"` 
            },
            {
              regex: /## \[Unreleased\]/g,
              replacement: `## [Unreleased]\n\n## [${newVersion}] - ${new Date().toISOString().split('T')[0]}`
            }
          ];

          patterns.forEach(pattern => {
            content = content.replace(pattern.regex, pattern.replacement);
          });

          if (content !== originalContent) {
            fs.writeFileSync(file, content);
            updatedFiles.push(file);
            console.log(`📄 Updated version references in: ${file}`);
          }
        } catch (error) {
          console.warn(`⚠️ Warning: Could not update ${file}:`, error.message);
        }
      }
    });

    return updatedFiles;
  }

  createVersionInfo(versionChange, updatedFiles = []) {
    const info = {
      timestamp: new Date().toISOString(),
      version_change: versionChange,
      updated_files: updatedFiles,
      node_version: process.version,
      platform: process.platform,
      cwd: process.cwd()
    };

    fs.writeFileSync('version-info.json', JSON.stringify(info, null, 2));
    console.log('📋 Version info saved to version-info.json');
    
    return info;
  }

  displaySummary(versionChange, updatedFiles) {
    console.log('\n🎯 Version Update Summary:');
    console.log('========================');
    console.log(`📦 Package: ${this.package.name}`);
    console.log(`🔢 Version: ${versionChange.old} → ${versionChange.new}`);
    console.log(`📈 Type: ${versionChange.type}`);
    console.log(`📅 Date: ${new Date().toLocaleString('th-TH')}`);
    
    if (updatedFiles.length > 0) {
      console.log('\n📄 Updated Files:');
      updatedFiles.forEach(file => console.log(`   - ${file}`));
    }
    
    console.log('\n✨ Next Steps:');
    console.log('1. Review the changes');
    console.log('2. Commit with: git add . && git commit -m "🔖 Bump version to ' + versionChange.new + '"');
    console.log('3. Create tag: git tag v' + versionChange.new);
    console.log('4. Push: git push && git push --tags');
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const versionType = args[1] || 'patch';

  const vm = new VersionManager();

  switch (command) {
    case 'bump':
    case 'update':
      console.log('🚀 Bumping version...');
      
      const versionChange = vm.bumpVersion(versionType);
      vm.savePackage();
      
      console.log('📚 Updating documentation...');
      const updatedFiles = vm.updateDocumentationVersions(versionChange.new);
      
      const info = vm.createVersionInfo(versionChange, updatedFiles);
      vm.displaySummary(versionChange, updatedFiles);
      break;

    case 'current':
    case 'show':
      console.log('📦 Current version:', vm.getCurrentVersion());
      break;

    case 'check':
      const current = vm.getCurrentVersion();
      const parsed = vm.parseVersion(current);
      console.log('📊 Version Info:');
      console.log(`   Current: ${current}`);
      console.log(`   Major: ${parsed.major}`);
      console.log(`   Minor: ${parsed.minor}`);
      console.log(`   Patch: ${parsed.patch}`);
      break;

    case 'help':
    default:
      console.log('🔧 Version Manager Help');
      console.log('=======================');
      console.log('Usage: node version-manager.js <command> [options]');
      console.log('');
      console.log('Commands:');
      console.log('  bump [patch|minor|major]  - Bump version and update docs');
      console.log('  current                   - Show current version');
      console.log('  check                     - Show detailed version info');
      console.log('  help                      - Show this help');
      console.log('');
      console.log('Examples:');
      console.log('  node version-manager.js bump patch');
      console.log('  node version-manager.js bump minor');
      console.log('  node version-manager.js current');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = VersionManager;
