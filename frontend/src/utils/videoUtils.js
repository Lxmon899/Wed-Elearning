/**
 * Utility functions for handling and embedding video URLs (YouTube & Direct MP4/WebM)
 */

/**
 * ดึง Video ID จากลิงก์ YouTube (รองรับ watch?v=, youtu.be/, embed/, shorts/)
 * @param {string} url 
 * @returns {string|null}
 */
export function getYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * ตรวจสอบว่า URL เป็นของ YouTube หรือไม่
 * @param {string} url 
 * @returns {boolean}
 */
export function isYouTubeUrl(url) {
  return Boolean(getYouTubeId(url));
}

/**
 * แปลงลิงก์ YouTube ให้เป็น Embed URL สำหรับเล่นผ่าน iframe
 * หากไม่ใช่ YouTube จะคืนค่า URL เดิม (เช่น ไฟล์ MP4)
 * @param {string} url 
 * @param {Object} options 
 * @returns {string}
 */
export function getEmbedUrl(url, { autoplay = false } = {}) {
  if (!url) return '';
  const ytId = getYouTubeId(url);
  if (ytId) {
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
    });
    if (autoplay) {
      params.set('autoplay', '1');
    }
    return `https://www.youtube.com/embed/${ytId}?${params.toString()}`;
  }
  return url;
}
