# ใช้ Official Node.js 20 เป็น base image
FROM node:20-slim

# ตั้งค่า Working Directory ภายใน Container
WORKDIR /usr/src/app

# Copy package.json และ package-lock.json เพื่อ Caching
COPY package*.json ./

# ติดตั้งเฉพาะ Dependencies ที่จำเป็นสำหรับ Production
RUN npm ci --only=production

# Copy โค้ดทั้งหมดของโปรเจกต์เข้ามา
COPY . .

# Build TypeScript (ถ้ามี)
RUN if [ -f tsconfig.json ]; then npm run build; fi

# เปิด Port ที่แอปพลิเคชันจะทำงาน
EXPOSE 8080

# คำสั่งสำหรับรันแอปพลิเคชัน (main MCP)
CMD [ "node", "build/index.js" ]
