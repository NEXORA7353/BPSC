/**
 * ImageKit.io Cloud Storage & CDN Integration Service
 * Fast, Global CDN for BPSC Mock Test Diagrams, PNGs, and Math Images
 */

export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  name: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  size?: number;
}

const IMAGEKIT_CONFIG = {
  urlEndpoint: (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/bk52vah91').replace(/\/+$/, ''),
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_qd0nT6p8pJj5rsx6d15MXhBndWw=',
  privateKey: import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || 'private_GSp9+JYpXdzfUoeSoMMF2SuY+2E='
};

/**
 * Checks whether ImageKit is properly configured
 */
export function isImageKitConfigured(): boolean {
  return Boolean(IMAGEKIT_CONFIG.urlEndpoint && IMAGEKIT_CONFIG.privateKey);
}

/**
 * Uploads an image (File or Blob) directly to ImageKit cloud storage
 * @param file The image file (PNG, JPG, SVG, WebP)
 * @param customName Optional custom filename
 * @param folder Subfolder in ImageKit (default: '/bpsc_questions')
 */
export async function uploadImageToImageKit(
  file: File | Blob,
  customName?: string,
  folder = '/bpsc_questions'
): Promise<ImageKitUploadResult> {
  const fileName = customName || (file instanceof File ? file.name : `img_${Date.now()}.png`);
  const authHeader = 'Basic ' + btoa(IMAGEKIT_CONFIG.privateKey + ':');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);
  formData.append('folder', folder);
  formData.append('useUniqueFileName', 'true');

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: authHeader
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `ImageKit Upload Error (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) message = parsed.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = await response.json();
  return {
    url: data.url,
    fileId: data.fileId,
    name: data.name,
    thumbnailUrl: data.thumbnailUrl || data.url,
    width: data.width,
    height: data.height,
    size: data.size
  };
}

/**
 * Generates an optimized ImageKit URL with responsive transformations
 */
export function getOptimizedImageUrl(
  urlOrPath: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  if (!urlOrPath) return '';
  if (!urlOrPath.includes('imagekit.io') && !urlOrPath.startsWith('/')) {
    return urlOrPath; // External non-ImageKit URL
  }

  const endpoint = IMAGEKIT_CONFIG.urlEndpoint;
  let path = urlOrPath;
  if (path.startsWith(endpoint)) {
    path = path.replace(endpoint, '');
  }
  path = path.replace(/^\/+/, '');

  const trs: string[] = [];
  if (options?.width) trs.push(`w-${options.width}`);
  if (options?.height) trs.push(`h-${options.height}`);
  if (options?.quality) trs.push(`q-${options.quality}`);

  const trParam = trs.length > 0 ? `tr:${trs.join(',')}/` : '';
  return `${endpoint}/${trParam}${path}`;
}
