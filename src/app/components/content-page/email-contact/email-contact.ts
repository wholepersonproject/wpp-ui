import { Clipboard } from '@angular/cdk/clipboard';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmailCopiedSnackbar } from './email-copied-snackbar';

export interface EmailContactContent {
  type: 'email-contact';
  description: string;
  email: string;
  copyButtonLabel: string;
  copiedMessage: string;
}

/** Presents an email contact action and confirms successful clipboard copies. */
@Component({
  selector: 'wpp-email-contact',
  imports: [MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './email-contact.html',
  styleUrl: './email-contact.scss',
})
export class EmailContact {
  /** Contact content loaded from the page YAML file. */
  readonly content = input.required<EmailContactContent>();

  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  /** Copies the configured email and confirms the action when it succeeds. */
  protected copyEmail(): void {
    if (!this.clipboard.copy(this.content().email)) {
      return;
    }

    this.snackBar.openFromComponent(EmailCopiedSnackbar, {
      announcementMessage: this.content().copiedMessage,
      data: { message: this.content().copiedMessage },
      duration: 3000,
      horizontalPosition: 'center',
      panelClass: 'wpp-email-copied-snackbar',
      politeness: 'polite',
      verticalPosition: 'top',
    });
  }
}
