# 🏰 Ashval Chat - Notion MCP Server with Perfect UX

[![Build Status](https://github.com/billlzzz10/notion-mcp-server/workflows/CI/badge.svg)](https://github.com/billlzzz10/notion-mcp-server/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Notion API](https://img.shields.io/badge/Notion-000000?style=flat&logo=notion&logoColor=white)](https://developers.notion.com/)

## 📚 Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [MCP Tools](#mcp-tools)
6. [License](#license)

---

## 🌟 Introduction
**Ashval Chat** เป็น Modern Web Interface ที่ใช้ Notion MCP Server พร้อมระบบ Auto-Detection Schema System ที่พัฒนาขึ้นมาเพื่อการสร้าง World-Building และ UX/UI ที่สมบูรณ์แบบ

---

## ✨ Features
- **Auto-load Environment Variables**: รองรับการตั้งค่า `.env`
- **Responsive Design**: รองรับทุกขนาดหน้าจอ
- **File Upload Support**: รองรับไฟล์ขนาดสูงสุด 10MB
- **Save to MCP**: บันทึกข้อมูลอัตโนมัติไปยัง Notion Database
- **Modern UI/UX**: รวมอนิเมชันและการแจ้งเตือนแบบ Toast

---

## 🚀 Installation

### 1️⃣ ติดตั้ง Dependencies
```bash
npm install
```

### 2️⃣ ตั้งค่า Environment Variables
```bash
cp .env.example .env
# แก้ไขไฟล์ .env เพื่อใส่ API keys
```

### 3️⃣ เริ่มใช้งาน
```bash
npm run start
```

---

## 🛠️ MCP Tools
### ระบบที่รองรับ:
- **Notion API Integration**
- **World-building Tools**
- **Dynamic Schema Detection**

---

## 📜 License
โครงการนี้อยู่ภายใต้ลิขสิทธิ์แบบ MIT
```

---

### 🔧 **GitHub Actions Workflow**

สร้างไฟล์ใน `.github/workflows/update-readme.yml`:

```yaml
name: Update README

on:
  push:
    paths:
      - "README.md"
      - ".env.example"
      - "package.json"

jobs:
  update-readme:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'

    - name: Install dependencies
      run: npm install

    - name: Format README
      run: npm run format-readme

    - name: Commit changes (if any)
      run: |
        git config --local user.name "github-actions[bot]"
        git config --local user.email "github-actions[bot]@users.noreply.github.com"
        git add README.md
        git commit -m "🤖 Update README automatically" || echo "No changes to commit"
        git push
```

---

### 🚀 **ขั้นตอนการ Deploy**
1. สร้างไฟล์ `.env.example` และใส่ตัวแปรที่เกี่ยวข้อง
2. เพิ่ม Workflow ลงในโฟลเดอร์ `.github/workflows/`
3. Push การเปลี่ยนแปลงไปยัง GitHub:
   ```bash
   git add .
   git commit -m "🎉 Update README and add GitHub Actions workflow"
   git push origin main
   ```

---