"use client";

/**
 * Compress and resize an image (data URL or File) to reduce its size before
 * sending to the API and storing in localStorage.
 *
 * @param imageDataUrl - base64 data URL (e.g. "data:image/jpeg;base64,...")
 * @param maxWidth - max width in pixels (default 1024)
 * @param maxHeight - max height in pixels (default 1024)
 * @param quality - JPEG quality 0-1 (default 0.7)
 * @returns Promise<string> - compressed data URL (always JPEG)
 */
export async function compressImage(
  imageDataUrl: string,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.7
): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return imageDataUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG (smaller than PNG for photos)
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = () => {
      // If the image fails to load, return the original
      resolve(imageDataUrl);
    };
    img.src = imageDataUrl;
  });
}

/**
 * Estimate the byte size of a base64 data URL string.
 */
export function estimateBase64Size(dataUrl: string): number {
  // Remove the "data:image/...;base64," prefix
  const base64 = dataUrl.split(",")[1] ?? "";
  // Base64 encoding increases size by ~33%, so decoded size ≈ base64.length * 0.75
  return Math.round(base64.length * 0.75);
}

/**
 * Format bytes as a human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
