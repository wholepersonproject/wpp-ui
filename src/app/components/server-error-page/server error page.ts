import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AnyLink, AnyLinkCommand } from '@atlasng/common';

@Component({
  selector: 'wpp-server-error-page',
  imports: [MatButtonModule, RouterModule, AnyLink],
  templateUrl: './server error page.html',
  styleUrl: './server error page.scss',
})
export class ServerErrorPage {
  readonly reportIssueLink = input<AnyLinkCommand>();
}
