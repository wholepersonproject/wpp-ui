import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AnalyticsPermissionsManager } from '@atlasng/analytics/permissions';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { provideMarkdown } from 'ngx-markdown';
import { describe, expect, it, vi } from 'vitest';
import { ContentPage } from './content-page';

/** Renders a content page with a single section holding the given content blocks. */
async function renderPage(content: Record<string, unknown>[]): Promise<void> {
  await TestBed.configureTestingModule({
    imports: [ContentPage],
    providers: [
      provideMarkdown(),
      provideRouter([]),
      {
        provide: AnalyticsPermissionsManager,
        useValue: { permissions: () => ({ isCategoryEnabled: () => false }), updatePermissions: vi.fn() },
      },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(ContentPage);
  fixture.componentRef.setInput('data', {
    headerContent: { title: 'Example page', subtitle: 'Example subtitle', breadcrumbs: [] },
    content: [{ type: 'section', tagline: 'Example section', anchor: 'example-section', level: 2, content }],
  });
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('ContentPage', () => {
  it('renders a notice with its variant, tagline, and markdown body', async () => {
    await renderPage([
      {
        type: 'notice',
        variant: 'warning',
        tagline: 'Data re-curation in progress',
        data: 'The tables are being **re-populated**.',
      },
    ]);

    const notice = screen.getByRole('note');

    expect(notice).toHaveClass('ang-notice--variant-warning');
    expect(within(notice).getByText('Data re-curation in progress')).toBeVisible();
    expect(within(notice).getByText('re-populated').tagName).toBe('STRONG');
  });

  it('defaults a notice without a variant to info', async () => {
    await renderPage([{ type: 'notice', data: 'Values are rounded to two decimal places.' }]);

    const notice = screen.getByRole('note');

    expect(notice).toHaveClass('ang-notice--variant-info');
    expect(within(notice).getByText('Values are rounded to two decimal places.')).toBeVisible();
  });

  it('enables marketing cookies from a link-styled button under a disabled video', async () => {
    await renderPage([{ type: 'youtube', videoId: 'example-video' }]);
    const permissionsManager = TestBed.inject(AnalyticsPermissionsManager);
    const enableButton = screen.getByRole('button', { name: 'Enable cookies' });

    expect(enableButton).toHaveClass('wpp-text-link-button');
    expect(screen.getByText(/to watch videos/)).toHaveTextContent('Enable cookies to watch videos');

    await userEvent.click(enableButton);

    expect(permissionsManager.updatePermissions).toHaveBeenCalledOnce();
  });
});
