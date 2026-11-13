/**
 * Giải mã nội dung văn bản trong RAM chuẩn UTF-8 để chống trình cào (Crawler/Scraper)
 */
export function decodeChapterContent(encodedData: string): string {
  try {
    if (encodedData.startsWith('ENC:')) {
      const base64 = encodedData.substring(4);
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    }
    return encodedData;
  } catch {
    return encodedData;
  }
}
