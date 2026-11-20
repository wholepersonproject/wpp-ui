import { TestBed } from '@angular/core/testing';
import { screen } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileDownloadService } from './file-download.service';

const FILE_URL = 'https://cdn.example.org/reports/table%20info.csv';

function mockFetch(response: Response | Error): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response))),
  );
}

describe('FileDownloadService', () => {
  let openSpy: ReturnType<typeof vi.spyOn>;
  let clickedLinks: { href: string; download: string }[];

  beforeEach(() => {
    openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:file');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    clickedLinks = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clickedLinks.push({ href: this.href, download: this.download });
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('downloads the fetched file under the given name', async () => {
    mockFetch(new Response('a,b'));

    await TestBed.inject(FileDownloadService).download(FILE_URL, 'summary.csv');

    expect(clickedLinks).toEqual([{ href: 'blob:file', download: 'summary.csv' }]);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('removes the temporary link after the download starts', async () => {
    mockFetch(new Response('a,b'));

    await TestBed.inject(FileDownloadService).download(FILE_URL, 'summary.csv');

    expect(screen.queryByRole('link', { hidden: true })).not.toBeInTheDocument();
  });

  it('opens the file when the server responds with an error', async () => {
    mockFetch(new Response('missing', { status: 404 }));

    await TestBed.inject(FileDownloadService).download(FILE_URL, 'summary.csv');

    expect(clickedLinks).toEqual([]);
    expect(openSpy).toHaveBeenCalledWith(FILE_URL, '_blank', 'noopener');
  });

  it('opens the file when it cannot be fetched', async () => {
    mockFetch(new TypeError('Failed to fetch'));

    await TestBed.inject(FileDownloadService).download(FILE_URL, 'summary.csv');

    expect(openSpy).toHaveBeenCalledWith(FILE_URL, '_blank', 'noopener');
  });
});
