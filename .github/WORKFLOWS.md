# 🚀 GitHub Actions Workflows Guide

โปรเจกต์นี้ใช้ GitHub Actions เพื่อลดงานซ้ำซากและทำให้การพัฒนาเป็นอัตโนมัติมากขึ้น

## 📋 Available Workflows

### 1. 🧹 Smart Sync & Cleanup (`smart-sync.yml`)
**ทำงานเมื่อ**: ทุกครั้งที่ push ไปยัง main branch
**หน้าที่**:
- ทำความสะอาดไฟล์เก่าอัตโนมัติ
- อัปเดตเอกสารโครงการ
- ตรวจสอบสุขภาพของระบบ
- สร้าง API documentation
- วิเคราะห์ประสิทธิภาพ
- อัปเดต cache และ commit กลับ

### 2. 📦 Dependency Manager (`dependency-manager.yml`)
**ทำงานเมื่อ**: ทุกวันจันทร์ 1:00 AM หรือเมื่อมีการแก้ไข package.json
**หน้าที่**:
- วิเคราะห์ dependencies ที่ล้าสมัย

### 7. 📥 Pull from Notion (`pull-from-notion.yml`)
**ทำงานเมื่อ**: Manual trigger เท่านั้น (workflow_dispatch)
**หน้าที่**:
- ดึงข้อมูลจาก Notion database
- แปลงเป็นไฟล์ Markdown ใน folder `vault/`
- Backup ไปยัง Google Drive (ถ้าตั้งค่าไว้)
- Commit และ push การเปลี่ยนแปลงกลับเข้า repo

**การใช้งาน**:
```bash
# Manual trigger ใน GitHub Actions tab
# หรือใช้ GitHub CLI
gh workflow run "Pull from Notion"
```

**Environment Variables ที่ต้องตั้งใน Secrets**:
- `NOTION_TOKEN`: Notion Integration Token
- `NOTION_CHARACTERS_DB_ID`: Default Database ID สำหรับ Characters
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` (optional): สำหรับ Google Drive backup
- `GOOGLE_PRIVATE_KEY` (optional): สำหรับ Google Drive backup

### 8. 📤 Push to Notion (`push-to-notion.yml`)
**ทำงานเมื่อ**: Manual trigger เท่านั้น (workflow_dispatch)
**หน้าที่**:
- อัปเดตหรือสร้างหน้าใหม่ใน Notion จากไฟล์ Markdown
- แปลง metadata และ content ให้เข้ากับ Notion format
- Backup ไฟล์ไปยัง Google Drive (ถ้าตั้งค่าไว้)

**การใช้งาน**:
```bash
# Manual trigger ใน GitHub Actions tab พร้อมระบุไฟล์
# เช่น: vault/My-Character.md
```
- ตรวจสอบช่องโหว่ด้านความปลอดภัย
- อัปเดต dependencies อัตโนมัติ (minor และ patch versions)
- สร้างรายงานการอัปเดต
- สร้าง Pull Request สำหรับ major updates

### 3. 🤖 AI Code Review (`ai-code-review.yml`)
**ทำงานเมื่อ**: เมื่อมีการสร้าง Pull Request
**หน้าที่**:
- วิเคราะห์ไฟล์ที่เปลี่ยนแปลง
- ตรวจสอบคุณภาพโค้ด
- หา console.log และ TODO comments
- ตรวจสอบ async/await patterns
- ให้คะแนนและคำแนะนำ
- Comment ผลการวิเคราะห์ใน PR

### 4. 🛡️ Security & Performance Monitor (`security-performance.yml`)
**ทำงานเมื่อ**: push ไปยัง main, ทุกวันจันทร์ 2:00 AM, หรือ manual trigger
**หน้าที่**:
- ตรวจสอบช่องโหว่ด้านความปลอดภัย
- สแกนหา secrets ที่อาจรั่วไหล
- ทดสอบประสิทธิภาพ (JSON parsing, File I/O, Memory, Async)
- สร้างรายงานรวม
- อัปโหลด artifacts สำหรับการวิเคราะห์

### 5. 🚀 Auto Deploy & Release Manager (`auto-deploy.yml`)
**ทำงานเมื่อ**: push tags (v*), push ไปยัง main, หรือ manual trigger
**หน้าที่**:
- ตรวจสอบความพร้อมก่อนการ deploy
- Build และ test application
- สร้าง Docker image (สำหรับ production)
- Deploy ไปยัง staging/production
- สร้าง GitHub Release
- สร้างรายงานการ deploy

### 6. 🔢 Auto Version Update (`auto-version-update.yml`)
**ทำงานเมื่อ**: push ไฟล์ .md ไปยัง main หรือ manual trigger
**หน้าที่**:
- ตรวจสอบการเปลี่ยนแปลงเอกสาร
- อัปเดตเวอร์ชั่นอัตโนมัติตามความสำคัญ
- อัปเดต README, CHANGELOG และเอกสารอื่นๆ
- สร้าง Git tag ใหม่
- สร้าง release notes อัตโนมัติ
- อัปโหลด artifacts และรายงาน

## 🎯 การใช้งาน

### Manual Triggers
```bash
# Trigger smart sync manually
gh workflow run smart-sync.yml

# Trigger dependency update
gh workflow run dependency-manager.yml

# Trigger security scan
gh workflow run security-performance.yml

# Deploy to staging
gh workflow run auto-deploy.yml -f environment=staging

# Deploy to production (force)
gh workflow run auto-deploy.yml -f environment=production -f force_deploy=true
```

### Local Commands
```bash
# Add new idea และให้ AI อัปเดต roadmap อัตโนมัติ
npm run idea "[high] feature: new awesome feature"

# ทำความสะอาดไฟล์อัตโนมัติ
npm run cleanup

# ตรวจสอบความปลอดภัย
npm run security-scan

# ตรวจสอบประสิทธิภาพ
npm run performance-test

# Version Management
npm run version:auto          # วิเคราะห์และอัปเดตเวอร์ชั่นอัตโนมัติ
npm run version:patch         # อัปเดต patch version
npm run version:minor         # อัปเดต minor version
npm run version:major         # อัปเดต major version
npm run version:set 2.1.0     # ตั้งเวอร์ชั่นเฉพาะ
npm run version:quick         # อัปเดต patch แบบรวดเร็ว

# Validate ทุกอย่าง
npm run validate
```

### Creating Releases
```bash
# สร้าง tag และ deploy ไปยัง production อัตโนมัติ
git tag v1.0.0
git push origin v1.0.0
```

## 📊 ผลลัพธ์และรายงาน

### Artifacts ที่สร้างจาก Workflows:
- **Smart Sync**: project-cache, documentation-updates
- **Dependency Manager**: dependency-reports, security-audits
- **AI Code Review**: code-review-analysis
- **Security & Performance**: security-performance-reports
- **Auto Deploy**: build artifacts, deployment reports
- **Auto Version Update**: version-analysis, version-update-summary, release-notes

### การแจ้งเตือนและ Notifications:
- Pull Request comments จาก AI Code Review
- Security alerts เมื่อพบช่องโหว่สำคัญ
- Deployment status reports
- Performance degradation warnings

## 🔧 การกำหนดค่า

### Environment Variables (GitHub Secrets):
```
GITHUB_TOKEN        # สำหรับการสร้าง releases และ comments
DOCKER_REGISTRY     # Container registry (default: ghcr.io)
```

### Workflow Permissions:
- Read repository contents
- Write to repository (for automated commits)
- Create releases
- Comment on issues/PRs

## 🚨 การแก้ไขปัญหา

### Common Issues:

1. **Workflow fails on permission**:
   - ตรวจสอบ GITHUB_TOKEN permissions
   - ตรวจสอบ repository settings

2. **Build fails**:
   - ตรวจสอบ Node.js version compatibility
   - ตรวจสอบ dependencies ใน package.json

3. **Security scan fails**:
   - ตรวจสอบ npm audit results
   - อัปเดต vulnerable dependencies

4. **Deploy fails**:
   - ตรวจสอบ pre-deployment checks
   - ใช้ force_deploy=true หากจำเป็น

## 💡 Tips และ Best Practices

1. **ใช้ semantic versioning**: v1.0.0, v1.1.0, v2.0.0
2. **ตรวจสอบ PR**: ให้ AI review ก่อน merge
3. **Monitor regularly**: ดู security และ performance reports
4. **Keep dependencies updated**: ให้ dependency manager ทำงาน
5. **Use environment-specific deploys**: staging → production

## 🔄 การอัปเดต Workflows

เมื่อต้องการแก้ไข workflows:

1. แก้ไขไฟล์ `.github/workflows/*.yml`
2. Test ใน branch ก่อน merge ไปยัง main
3. ตรวจสอบ workflow logs เมื่อ deploy
4. อัปเดตเอกสารนี้เมื่อมีการเปลี่ยนแปลง

---

**หมายเหตุ**: Workflows เหล่านี้ถูกออกแบบมาเพื่อลดงานซ้ำซากของ agent และทำให้การพัฒนาเป็นอัตโนมัติมากขึ้น ระบบจะทำงานร่วมกับ AI systems ในโปรเจกต์เพื่อให้การพัฒนาราบรื่นและมีประสิทธิภาพ
