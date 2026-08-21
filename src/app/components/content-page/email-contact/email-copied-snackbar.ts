import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

interface EmailCopiedSnackbarData {
  message: string;
}

/** Displays email-copy confirmation content within a Material snackbar. */
@Component({
  selector: 'wpp-email-copied-snackbar',
  imports: [MatIconModule],
  templateUrl: './email-copied-snackbar.html',
  styleUrl: './email-copied-snackbar.scss',
})
export class EmailCopiedSnackbar {
  /** Confirmation content supplied by the email contact action. */
  protected readonly data = inject<EmailCopiedSnackbarData>(MAT_SNACK_BAR_DATA);
}
