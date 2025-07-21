# 📖 Auto-Generated API Documentation

Generated: 21/7/2568 03:07:09

## 🌐 API Endpoints

- **GET** `/health`

## 🛠️ MCP Tools

- `advancedPromptGenerator.ts`
- `appendBlockChildren.ts`
- `autoTagSystem.ts`
- `batchAppendBlockChildren.ts`
- `batchDeleteBlocks.ts`
- `batchMixedOperations.ts`
- `batchUpdateBlocks.ts`
- `blocks.ts`
- `characterDialogueGenerator.ts`
- `comments.ts`
- `conflictGenerator.ts`
- `consistencyChecker.ts`
- `createDatabase.ts`
- `createPage.ts`
- `dataCompletionAssistant.ts`
- `database.ts`
- `databaseAnalyzer.ts`
- `deleteBlock.ts`
- `dialogueGenerator.ts`
- `imageGenerator.ts`
- `index.ts`
- `pages.ts`
- `projectTaskSummarizer.ts`
- `projects.ts`
- `queryDatabase.ts`
- `retrieveBlock.ts`
- `retrieveBlockChildren.ts`
- `searchPage.ts`
- `smartFilter.ts`
- `storyArcAnalyzer.ts`
- `storyStructureAnalyzer.ts`
- `timelineAnalyzer.ts`
- `updateBlock.ts`
- `updateDatabase.ts`
- `updatePage.ts`
- `updatePageProperties.ts`
- `users.ts`
- `versionControl.ts`
- `worldRulesQuery.ts`

## ⚡ Available Scripts

- **build**: `tsc`
- **prepare**: `npm run build`
- **watch**: `tsc --watch`
- **inspector**: `npx @modelcontextprotocol/inspector build/index.js -e NOTION_TOKEN=your_notion_token -e NOTION_PAGE_ID=your_notion_page_id`
- **update-readme**: `node scripts/update-readme.js`
- **status**: `node scripts/update-readme.js`
- **setup-hooks**: `node scripts/setup-hooks.js`
- **cleanup**: `node auto-cleanup.js`
- **update-roadmap**: `node auto-update-roadmap.js`
- **add-idea**: `node auto-update-roadmap.js`
- **start-bot**: `node build/bot/index.js`
- **start-web**: `cd web-chat && npx vite`
- **start-web-chat**: `cd web-chat && npx vite`
- **build-web-chat**: `cd web-chat && npm run build`
- **serve-web**: `cd web-chat && npx vite preview`
- **dev-bot**: `tsc && node build/bot/index.js`
- **demo**: `node demo/integration-demo.js`
- **start-gateway**: `node server/app.js`
- **test**: `echo "No tests available" && exit 0`
- **unicorn**: `node unicorn-x/server-working.cjs`
- **security-scan**: `npm audit --audit-level moderate`
- **performance-test**: `echo "Running performance tests..." && node -e "console.log('Performance test completed')"`
- **deploy:staging**: `echo "Deploying to staging..."`
- **deploy:production**: `echo "Deploying to production..."`
- **health-check**: `curl -f http://localhost:3001/health || echo "Health check failed"`
- **validate**: `npm run build && npm run test && npm run security-scan`
- **version:patch**: `node scripts/version-manager.js patch`
- **version:minor**: `node scripts/version-manager.js minor`
- **version:major**: `node scripts/version-manager.js major`
- **version:auto**: `node scripts/version-manager.js auto`
- **version:set**: `node scripts/version-manager.js set`
- **version:quick**: `node scripts/version-manager.js quick`
- **version:check**: `node scripts/version-manager.js check`
- **notion:pull**: `node scripts/pull-from-notion.js`
- **notion:push**: `node scripts/push-to-notion.js`
- **gdrive:upload**: `node scripts/upload-to-drive.js`
- **gdrive:test**: `node scripts/test-gdrive.js`
- **backup:notion**: `npm run notion:pull && npm run gdrive:upload`
- **backup:test**: `echo "Testing backup process..." && npm run gdrive:test`
- **docs:update**: `echo "Updating documentation versions..." && node -e "console.log('Documentation updated')"`

