#!/usr/bin/env node

/**
 * Setup script to install git hooks
 * Run with: npm run setup-hooks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function setupGitHooks() {
  console.log('🔧 Setting up git hooks...');
  
  const gitHooksDir = path.join(__dirname, '../.git/hooks');
  const projectHooksDir = path.join(__dirname, '../.githooks');
  
  if (!fs.existsSync(gitHooksDir)) {
    console.log('❌ .git/hooks directory not found. Make sure you are in a git repository.');
    return false;
  }
  
  if (!fs.existsSync(projectHooksDir)) {
    console.log('❌ .githooks directory not found.');
    return false;
  }
  
  // Copy pre-commit hook
  const sourceHook = path.join(projectHooksDir, 'pre-commit');
  const targetHook = path.join(gitHooksDir, 'pre-commit');
  
  if (fs.existsSync(sourceHook)) {
    fs.copyFileSync(sourceHook, targetHook);
    
    // Make executable (for Unix systems)
    try {
      fs.chmodSync(targetHook, '755');
    } catch (error) {
      console.log('⚠️ Could not make hook executable (Windows system)');
    }
    
    console.log('✅ Pre-commit hook installed');
  } else {
    console.log('❌ Pre-commit hook source not found');
    return false;
  }
  
  console.log('🎉 Git hooks setup complete!');
  console.log('📝 README.md will now be automatically updated on each commit');
  
  return true;
}

// Main execution
try {
  const success = setupGitHooks();
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error('❌ Error setting up git hooks:', error.message);
  process.exit(1);
}
