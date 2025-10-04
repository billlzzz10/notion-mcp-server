/**
 * Gateway Managers - Advanced Logging, Security & Rate Limiting
 * เพื่อให้ Enhanced Gateway ทำงานได้
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Advanced Log Manager
 * จัดการ logging แบบละเอียด พร้อม transaction tracking
 */
class AdvancedLogManager {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.activeTransactions = new Map();
    this.initLogDirectory();
  }

  async initLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('❌ Failed to create log directory:', error);
    }
  }

  /**
   * เริ่ม transaction และ return log ID
   */
  startTransaction(request) {
    const logId = this.generateLogId();
    const transaction = {
      id: logId,
      startTime: Date.now(),
      request: this.sanitizeRequest(request),
      userAgent: request.headers?.['user-agent'],
      ip: request.ip || request.connection?.remoteAddress,
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString()
    };

    this.activeTransactions.set(logId, transaction);
    
    // Log ทันที
    this.writeLog('transaction_start', {
      logId,
      ...transaction
    });

    return logId;
  }

  /**
   * บันทึกความสำเร็จ
   */
  success(logId, result) {
    const transaction = this.activeTransactions.get(logId);
    if (!transaction) return;

    const duration = Date.now() - transaction.startTime;
    const logData = {
      logId,
      status: 'success',
      duration,
      resultSummary: this.summarizeResult(result),
      timestamp: new Date().toISOString()
    };

    this.writeLog('transaction_success', logData);
    this.activeTransactions.delete(logId);
  }

  /**
   * บันทึกข้อผิดพลาด
   */
  error(logId, error) {
    const transaction = this.activeTransactions.get(logId);
    if (!transaction) return;

    const duration = Date.now() - transaction.startTime;
    const logData = {
      logId,
      status: 'error',
      duration,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      timestamp: new Date().toISOString()
    };

    this.writeLog('transaction_error', logData);
    this.activeTransactions.delete(logId);
  }

  /**
   * บันทึก custom event
   */
  logEvent(event, data) {
    this.writeLog(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * เขียน log ลงไฟล์
   */
  async writeLog(type, data) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const sanitizedType = type.replace(/[^a-zA-Z0-9_-]/g, '');
      const logFile = path.join(this.logDir, `${date}-${sanitizedType}.log`);
      const logEntry = JSON.stringify(data) + '\n';
      
      await fs.appendFile(logFile, logEntry);
      
      // Console log สำหรับ development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📝 [${type}]`, data);
      }
    } catch (error) {
      console.error('❌ Failed to write log:', error);
    }
  }

  generateLogId() {
    return `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  sanitizeRequest(request) {
    // ลบข้อมูลสำคัญออกจาก log
    const sanitized = {
      body: { ...request.body },
      headers: { ...request.headers },
      query: { ...request.query }
    };

    // ลบ sensitive data
    delete sanitized.body.password;
    delete sanitized.body.token;
    delete sanitized.headers.authorization;
    delete sanitized.headers.cookie;

    return sanitized;
  }

  summarizeResult(result) {
    if (!result) return null;
    
    return {
      success: result.success,
      dataLength: result.data ? JSON.stringify(result.data).length : 0,
      resultType: typeof result,
      hasError: !!result.error
    };
  }

  /**
   * ดู log สถิติ
   */
  async getStatistics(date = null) {
    try {
      const rawDate = date || new Date().toISOString().split('T')[0];
      const targetDate = rawDate.replace(/[^0-9-]/g, '');
      const successFile = path.join(this.logDir, `${targetDate}-transaction_success.log`);
      const errorFile = path.join(this.logDir, `${targetDate}-transaction_error.log`);

      const stats = {
        date: targetDate,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        errors: []
      };

      try {
        const successData = await fs.readFile(successFile, 'utf8');
        const successLines = successData.trim().split('\n').filter(line => line);
        stats.successfulRequests = successLines.length;
        
        // คำนวณ average response time
        if (successLines.length > 0) {
          const durations = successLines.map(line => {
            try {
              return JSON.parse(line).duration;
            } catch {
              return 0;
            }
          });
          stats.averageResponseTime = Math.round(
            durations.reduce((sum, duration) => sum + duration, 0) / durations.length
          );
        }
      } catch (error) {
        // ไฟล์ไม่มี
      }

      try {
        const errorData = await fs.readFile(errorFile, 'utf8');
        const errorLines = errorData.trim().split('\n').filter(line => line);
        stats.failedRequests = errorLines.length;
        
        // สรุป error ที่เกิดขึ้นบ่อย
        stats.errors = errorLines.map(line => {
          try {
            const log = JSON.parse(line);
            return log.error.message;
          } catch {
            return 'Unknown error';
          }
        });
      } catch (error) {
        // ไฟล์ไม่มี
      }

      stats.totalRequests = stats.successfulRequests + stats.failedRequests;
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      return null;
    }
  }
}

/**
 * Security Manager
 * จัดการความปลอดภัย validation, authentication
 */
class SecurityManager {
  constructor() {
    this.trustedIPs = new Set([
      '127.0.0.1',
      '::1',
      // Add Make.com IPs if known
      '54.237.158.52',
      '54.237.132.132'
    ]);
    
    this.blockedIPs = new Set();
    this.suspiciousActivities = new Map();
  }

  /**
   * Validate request security
   */
  async validate(request) {
    const checks = [
      this.checkIP(request),
      this.checkHeaders(request),
      this.checkPayload(request),
      this.checkSuspiciousActivity(request)
    ];

    const results = await Promise.all(checks);
    const failed = results.filter(result => !result.valid);

    if (failed.length > 0) {
      const error = new Error(`Security validation failed: ${failed.map(f => f.reason).join(', ')}`);
      error.statusCode = 403;
      throw error;
    }

    return true;
  }

  checkIP(request) {
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    
    if (this.blockedIPs.has(ip)) {
      return { valid: false, reason: 'IP is blocked' };
    }

    // ถ้ามี whitelist และ IP ไม่อยู่ใน whitelist
    if (process.env.IP_WHITELIST_ONLY === 'true' && !this.trustedIPs.has(ip)) {
      return { valid: false, reason: 'IP not in whitelist' };
    }

    return { valid: true };
  }

  checkHeaders(request) {
    const userAgent = request.headers?.['user-agent'];
    
    // ตรวจสอบ user agent ที่น่าสงสัย
    if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
      if (!request.headers['x-webhook-source']) { // ยกเว้น webhook
        return { valid: false, reason: 'Suspicious user agent' };
      }
    }

    // ตรวจสอบ required headers สำหรับ webhook
    if (request.path?.includes('/webhook/')) {
      const webhookSource = request.headers['x-webhook-source'];
      if (!webhookSource) {
        return { valid: false, reason: 'Missing webhook source header' };
      }
    }

    return { valid: true };
  }

  checkPayload(request) {
    const body = request.body;
    
    if (!body) return { valid: true };

    // ตรวจสอบขนาด payload
    const payloadSize = JSON.stringify(body).length;
    if (payloadSize > 10 * 1024 * 1024) { // 10MB
      return { valid: false, reason: 'Payload too large' };
    }

    // ตรวจสอบ SQL injection patterns
    const bodyStr = JSON.stringify(body).toLowerCase();
    const sqlPatterns = ['drop table', 'delete from', 'union select', '<script'];
    
    for (const pattern of sqlPatterns) {
      if (bodyStr.includes(pattern)) {
        return { valid: false, reason: 'Suspicious payload content' };
      }
    }

    return { valid: true };
  }

  checkSuspiciousActivity(request) {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    
    if (!this.suspiciousActivities.has(ip)) {
      this.suspiciousActivities.set(ip, []);
    }

    const activities = this.suspiciousActivities.get(ip);
    
    // ลบ activities ที่เก่าเกิน 1 ชั่วโมง
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentActivities = activities.filter(time => time > oneHourAgo);
    
    this.suspiciousActivities.set(ip, recentActivities);

    // ถ้ามีมากกว่า 100 requests ใน 1 ชั่วโมง = น่าสงสัย
    if (recentActivities.length > 100) {
      this.blockIP(ip, '1 hour');
      return { valid: false, reason: 'Too many requests from IP' };
    }

    // เพิ่ม activity ปัจจุบัน
    recentActivities.push(now);
    
    return { valid: true };
  }

  blockIP(ip, duration = '1 hour') {
    this.blockedIPs.add(ip);
    
    // Auto unblock หลังจากเวลาที่กำหนด
    const durationMs = duration === '1 hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      console.log(`🔓 IP ${ip} unblocked`);
    }, durationMs);
    
    console.log(`🚫 IP ${ip} blocked for ${duration}`);
  }

  addTrustedIP(ip) {
    this.trustedIPs.add(ip);
  }

  getSecurityStats() {
    return {
      trustedIPs: Array.from(this.trustedIPs),
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousActivities: this.suspiciousActivities.size,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Rate Limiter
 * จำกัดจำนวน request ต่อผู้ใช้
 */
class RateLimiter {
  constructor() {
    this.userRequests = new Map();
    this.limits = {
      default: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
      webhook: { requests: 1000, window: 60 * 1000 }, // 1000 requests per minute for webhooks
      heavy: { requests: 10, window: 60 * 1000 } // 10 requests per minute for heavy operations
    };
  }

  /**
   * ตรวจสอบ rate limit
   */
  async check(userId, limitType = 'default') {
    const limit = this.limits[limitType] || this.limits.default;
    const now = Date.now();
    
    if (!userId) {
      userId = 'anonymous';
    }

    if (!this.userRequests.has(userId)) {
      this.userRequests.set(userId, []);
    }

    const userRequestTimes = this.userRequests.get(userId);
    
    // ลบ requests ที่เก่าเกิน window
    const windowStart = now - limit.window;
    const recentRequests = userRequestTimes.filter(time => time > windowStart);
    
    this.userRequests.set(userId, recentRequests);

    // ตรวจสอบว่าเกิน limit หรือไม่
    if (recentRequests.length >= limit.requests) {
      const error = new Error(`Rate limit exceeded: ${limit.requests} requests per ${limit.window/1000} seconds`);
      error.statusCode = 429;
      error.retryAfter = Math.ceil((recentRequests[0] + limit.window - now) / 1000);
      throw error;
    }

    // เพิ่ม request ปัจจุบัน
    recentRequests.push(now);
    
    return {
      allowed: true,
      remaining: limit.requests - recentRequests.length,
      resetTime: recentRequests[0] + limit.window
    };
  }

  /**
   * ปรับ limit สำหรับผู้ใช้เฉพาะ
   */
  setUserLimit(userId, requests, windowMs) {
    this.limits[`user_${userId}`] = { requests, window: windowMs };
  }

  /**
   * รับสถิติการใช้งาน
   */
  getUsageStats() {
    const stats = {
      totalUsers: this.userRequests.size,
      limits: this.limits,
      topUsers: [],
      timestamp: new Date().toISOString()
    };

    // หา top users ที่ใช้งานมากที่สุด
    const userActivity = Array.from(this.userRequests.entries())
      .map(([userId, requests]) => ({
        userId,
        requestCount: requests.length,
        lastRequest: requests.length > 0 ? new Date(Math.max(...requests)).toISOString() : null
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10);

    stats.topUsers = userActivity;
    
    return stats;
  }

  /**
   * ล้าง rate limit สำหรับผู้ใช้
   */
  clearUserLimit(userId) {
    this.userRequests.delete(userId);
  }

  /**
   * ล้าง rate limit ทั้งหมด
   */
  clearAllLimits() {
    this.userRequests.clear();
  }
}

export {
  AdvancedLogManager,
  SecurityManager,
  RateLimiter
};
