const ZW_SPACE = '\u200B'; // Zero-Width Space (0)
const ZW_NON_JOINER = '\u200C'; // Zero-Width Non-Joiner (1)
const ZW_JOINER = '\u200D'; // Zero-Width Joiner (phân cách)

export class WatermarkService {
  /**
   * Mã hóa User ID thành chuỗi nhị phân zero-width
   */
  static encode(userId: string): string {
    const binary = userId
      .split('')
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');

    return (
      ZW_JOINER +
      binary
        .split('')
        .map((bit) => (bit === '1' ? ZW_NON_JOINER : ZW_SPACE))
        .join('') +
      ZW_JOINER
    );
  }

  /**
   * Nhúng chuỗi Zero-width xen kẽ ngẫu nhiên vào văn bản
   */
  static inject(text: string, userId: string): string {
    if (!userId || !text) return text;
    const watermark = this.encode(userId);
    const paragraphs = text.split('\n');

    const watermarked = paragraphs.map((p, idx) => {
      if (idx % 2 === 0 && p.length > 30) {
        const mid = Math.floor(p.length / 2);
        return p.slice(0, mid) + watermark + p.slice(mid);
      }
      return p;
    });

    return watermarked.join('\n');
  }

  /**
   * Quét và trích xuất User ID từ văn bản bị cào/leak
   */
  static extract(text: string): string | null {
    const parts = text.split(ZW_JOINER);
    if (parts.length < 3) return null;

    for (let i = 1; i < parts.length; i += 2) {
      const hidden = parts[i];
      let binary = '';
      for (const char of hidden) {
        if (char === ZW_NON_JOINER) binary += '1';
        else if (char === ZW_SPACE) binary += '0';
      }

      if (binary.length > 0 && binary.length % 8 === 0) {
        let result = '';
        for (let b = 0; b < binary.length; b += 8) {
          const byte = binary.slice(b, b + 8);
          result += String.fromCharCode(parseInt(byte, 2));
        }
        if (result) return result;
      }
    }
    return null;
  }
}

