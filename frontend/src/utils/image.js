import { BACKEND_URL } from './request';

// Full URL for an image_path returned by the API ("media/abc.jpg")
export const imageUrl = (path) => {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return `${BACKEND_URL}/${path.replace(/\\/g, '/').replace(/^\//, '')}`;
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * Shrink a photo before upload. Phone cameras produce 4-12MB images; for an inventory
 * thumbnail ~1600px JPEG is plenty and uploads quickly over mobile data.
 * Falls back to the original file if the browser can't decode it (e.g. HEIC on desktop).
 */
export const compressImage = async (file, maxSize = 1600, quality = 0.82) => {
  if (!(file instanceof Blob) || file.type === 'image/gif') return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
  } catch (e) {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
