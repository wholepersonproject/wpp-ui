import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';

/**
 * Derives a file name from the last path segment of a URL
 *
 * @param url File URL
 * @returns Decoded file name, or `download` when the path has none
 */
export function getFileNameFromUrl(url: string): string {
  const path = new URL(url, 'http://localhost').pathname;
  return decodeURIComponent(path.slice(path.lastIndexOf('/') + 1)) || 'download';
}

/**
 * Downloads remote files to the user's device instead of opening them in the browser.
 *
 * Browsers ignore the `download` attribute on cross-origin links, so the file is fetched and saved through a
 * same-origin object URL instead. Files must be served with CORS headers that allow the app's origin.
 */
@Service()
export class FileDownloadService {
  private readonly document = inject(DOCUMENT);

  /**
   * Downloads a file. Opens it in a new tab instead when it cannot be fetched, so the user can still get it.
   *
   * @param url URL of the file
   * @param fileName Name of the saved file. Defaults to the last segment of the URL.
   * @returns Resolves once the download has started
   */
  async download(url: string, fileName = getFileNameFromUrl(url)): Promise<void> {
    let blob: Blob;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download of ${url} failed with status ${response.status}`);
      }
      blob = await response.blob();
    } catch {
      this.document.defaultView?.open(url, '_blank', 'noopener');
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.style.display = 'none';
    this.document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl));
    }
  }
}
