import { Component, input } from '@angular/core';
import { AnyLinkCommand } from '@atlasng/common';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  readonly backgroundImageUrl = input<AnyLinkCommand>('./home-splash.png');
}
