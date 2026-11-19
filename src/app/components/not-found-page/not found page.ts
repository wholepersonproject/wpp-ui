import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { excludePageFromSearch } from '../../exclude-page-from-search';

@Component({
  selector: 'wpp-not-found-page',
  imports: [MatButtonModule, RouterModule],
  templateUrl: './not found page.html',
  styleUrl: './not found page.scss',
})
export class NotFoundPage {
  constructor() {
    excludePageFromSearch();
  }
}
