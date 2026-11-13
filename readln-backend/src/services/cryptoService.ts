export class CryptoService {
  /**
   * Mã hóa nội dung văn bản UTF-8 chuẩn sang Base64
   */
  static obfuscate(plainText: string): string {
    if (!plainText) return '';
    const base64 = Buffer.from(plainText, 'utf8').toString('base64');
    return `ENC:${base64}`;
  }
}
