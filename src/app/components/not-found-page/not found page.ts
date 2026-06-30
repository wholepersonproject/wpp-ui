import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'wpp-not-found-page',
  imports: [MatButtonModule, RouterModule],
  templateUrl: './not found page.html',
  styleUrl: './not found page.scss',
})
export class NotFoundPage {}
