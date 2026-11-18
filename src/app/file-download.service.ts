import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';

/**
 * Downloads remote files to the user's device instead of opening them in the browser.
 *
 * Browsers ignore the `download` attribute on cross-origin links, so the file is fetched and saved through a
 * same-origin object URL instead. Files must be served with CORS headers that allow the app's origin.
 */
@Service()
export class FileDownloadService {
  /** Document used to create the temporary download link and open fallback tabs */
  private readonly document = inject(DOCUMENT);

  /**
   * Downloads a file. Opens it in a new tab instead when it cannot be fetched, so the user can still get it.
   *
   * @param url URL of the file
   * @param fileName Name of the saved file
   * @returns Resolves once the download has started
   */
  async download(url: string, fileName: string): Promise<void> {
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
