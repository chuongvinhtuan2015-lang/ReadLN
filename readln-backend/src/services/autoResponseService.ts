import prisma from '../config/db';
import { logger } from '../utils/logger';

interface ThreatRecord {
  ip: string;
  violations: Array<{ action: string; timestamp: number; details?: string }>;
}

// Giám sát hành vi bất thường theo IP trong bộ nhớ RAM
const threatMap = new Map<string, ThreatRecord>();

// Định kỳ dọn dẹp các bản ghi quá 10 phút
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [ip, record] of threatMap.entries()) {
    record.violations = record.violations.filter((v) => v.timestamp > cutoff);
    if (record.violations.length === 0) {
      threatMap.delete(ip);
    }
  }
}, 60 * 1000);

export class AutoResponseService {
  /**
   * Kích hoạt chu trình: DETECT (Phát hiện) -> RESPOND (Tự động phản ứng)
   * Phân tích hành vi vi phạm của client_ip để tự động đưa ra biện pháp ngăn chặn thích hợp
   */
  static async handleThreatEvent(clientIp: string, actionType: string, details?: string) {
    if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1') return;

    const now = Date.now();
    let record = threatMap.get(clientIp);
    if (!record) {
      record = { ip: clientIp, violations: [] };
      threatMap.set(clientIp, record);
    }

    record.violations.push({ action: actionType, timestamp: now, details });

    // 1. Phản ứng tức thì khi dính Bẫy Bot Honeypot
    if (actionType === 'BOT_HONEYPOT_TRIGGER') {
      await this.autoBlockIp(
        clientIp,
        'DETECT -> RESPOND Tự Động: Kích hoạt bẫy bot Honeypot',
        24 // Chặn 24 giờ
      );
      return;
    }

    // 2. Phản ứng tự động khi dò mật khẩu Brute-force nhiều lần liên tiếp
    const failedLogins = record.violations.filter(
      (v) => v.action === 'AUTH_FAILED' && now - v.timestamp < 5 * 60 * 1000
    );
    if (failedLogins.length >= 5) {
      await this.autoBlockIp(
        clientIp,
        `DETECT -> RESPOND Tự Động: Tấn công Brute-force mật khẩu (thất bại ${failedLogins.length} lần/5 phút)`,
        2 // Chặn 2 giờ
      );
      return;
    }

    // 3. Phản ứng tự động khi bị kích hoạt Rate Limit (HTTP 429) liên tiếp
    const rateLimitBlocks = record.violations.filter(
      (v) => v.action === 'RATE_LIMIT_BLOCK' && now - v.timestamp < 3 * 60 * 1000
    );
    if (rateLimitBlocks.length >= 3) {
      await this.autoBlockIp(
        clientIp,
        `DETECT -> RESPOND Tự Động: Vượt ngưỡng Rate Limit liên tiếp ${rateLimitBlocks.length} lần`,
        1 // Chặn 1 giờ
      );
      return;
    }

    // 4. Phản ứng khẩn cấp cấp độ cao: Tự động kích hoạt Kill-Switch (Chế độ Chỉ Đọc)
    // Nếu trong 1 phút có hơn 15 địa chỉ IP khác nhau cùng bị Rate Limit hoặc tấn công (dấu hiệu DDoS botnet phân tán)
    await this.checkDistributedAttack(now);
  }

  /**
   * Tự động đưa IP vào ip_blacklists
   */
  private static async autoBlockIp(ip: string, reason: string, durationHours: number) {
    try {
      const blockedUntil = new Date(Date.now() + durationHours * 3600 * 1000);
      await prisma.ip_blacklists.upsert({
        where: { ip_address: ip },
        update: {
          reason,
          blocked_until: blockedUntil,
        },
        create: {
          ip_address: ip,
          reason,
          blocked_until: blockedUntil,
        },
      });

      // Ghi log hành vi tự động phản ứng
      await prisma.audit_logs.create({
        data: {
          client_ip: ip,
          action: 'AUTO_RESPOND_BLOCK_IP',
          status_code: 403,
          details: {
            reason,
            durationHours,
            blockedUntil,
          },
        },
      });

      logger.warn(`🛡️ [RESPOND] Đã tự động chặn IP ${ip} trong ${durationHours}h: ${reason}`);
    } catch (err) {
      logger.error('Lỗi khi tự động chặn IP:', err);
    }
  }

  /**
   * Tự động bật Kill-Switch khi phát hiện tấn công DDoS phân tán nhiều IP
   */
  private static async checkDistributedAttack(now: number) {
    const window1Min = now - 60 * 1000;
    let distinctThreatIps = 0;

    for (const record of threatMap.values()) {
      const hasRecentThreat = record.violations.some((v) => v.timestamp > window1Min);
      if (hasRecentThreat) distinctThreatIps++;
    }

    // Nếu có từ 10 IP khác nhau cùng tấn công trong 1 phút -> Tự động bật Kill-Switch
    if (distinctThreatIps >= 10) {
      try {
        const currentSetting = await prisma.system_settings.findUnique({
          where: { setting_key: 'is_lockdown_mode' },
        });

        if (currentSetting?.setting_value !== 'true') {
          await prisma.system_settings.upsert({
            where: { setting_key: 'is_lockdown_mode' },
            update: { setting_value: 'true' },
            create: { setting_key: 'is_lockdown_mode', setting_value: 'true' },
          });

          await prisma.audit_logs.create({
            data: {
              client_ip: 'SYSTEM_AUTOMATION',
              action: 'AUTO_RESPOND_TRIGGER_KILLSWITCH',
              status_code: 503,
              details: {
                reason: `DETECT -> RESPOND Tự Động: Phát hiện tấn công DDoS phân tán từ ${distinctThreatIps} IP trong 60s`,
              },
            },
          });

          logger.warn(`🚨 [RESPOND] Hệ thống đã tự động kích hoạt Kill-Switch bảo vệ toàn diện (Chế độ Chỉ Đọc)!`);
        }
      } catch (err) {
        logger.error('Lỗi khi kích hoạt tự động Kill-Switch:', err);
      }
    }
  }
}
