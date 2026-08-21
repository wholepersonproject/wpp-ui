import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailCopiedSnackbar } from './email-copied-snackbar';
import { EmailContact, EmailContactContent } from './email-contact';

const content: EmailContactContent = {
  type: 'email-contact',
  description: 'Contact our team for more information.',
  email: 'contact@example.org',
  copyButtonLabel: 'Copy email address',
  copiedMessage: 'email copied',
};

describe('EmailContact', () => {
  const copy = vi.fn(() => true);
  const openFromComponent = vi.fn();

  beforeEach(() => {
    copy.mockReset();
    openFromComponent.mockReset();
  });

  it('renders an email link and an accessible copy action', async () => {
    await TestBed.configureTestingModule({
      imports: [EmailContact],
      providers: [{ provide: Clipboard, useValue: { copy } }],
    })
      .overrideProvider(MatSnackBar, { useValue: { openFromComponent } })
      .compileComponents();
    const fixture = TestBed.createComponent(EmailContact);
    fixture.componentRef.setInput('content', content);
    fixture.detectChanges();

    const description = screen.getByText(content.description, { exact: false });
    const emailLink = within(description).getByRole('link', { name: content.email });

    expect(description).toBeVisible();
    expect(emailLink).toHaveAttribute('href', `mailto:${content.email}`);
    expect(screen.getByRole('button', { name: content.copyButtonLabel })).toBeVisible();
  });

  it('copies the email and opens a top-center confirmation snackbar', async () => {
    copy.mockReturnValueOnce(true);
    const user = userEvent.setup();
    await TestBed.configureTestingModule({
      imports: [EmailContact],
      providers: [{ provide: Clipboard, useValue: { copy } }],
    })
      .overrideProvider(MatSnackBar, { useValue: { openFromComponent } })
      .compileComponents();
    const fixture = TestBed.createComponent(EmailContact);
    fixture.componentRef.setInput('content', content);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: content.copyButtonLabel }));

    expect(copy).toHaveBeenCalledWith(content.email);
    expect(copy).toHaveReturnedWith(true);
    expect(openFromComponent).toHaveBeenCalledWith(EmailCopiedSnackbar, {
      announcementMessage: content.copiedMessage,
      data: { message: content.copiedMessage },
      duration: 3000,
      horizontalPosition: 'center',
      panelClass: 'wpp-email-copied-snackbar',
      politeness: 'polite',
      verticalPosition: 'top',
    });
  });

  it('does not announce success when copying fails', async () => {
    copy.mockReturnValueOnce(false);
    const user = userEvent.setup();
    await TestBed.configureTestingModule({
      imports: [EmailContact],
      providers: [{ provide: Clipboard, useValue: { copy } }],
    })
      .overrideProvider(MatSnackBar, { useValue: { openFromComponent } })
      .compileComponents();
    const fixture = TestBed.createComponent(EmailContact);
    fixture.componentRef.setInput('content', content);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: content.copyButtonLabel }));

    expect(openFromComponent).not.toHaveBeenCalled();
  });
});
