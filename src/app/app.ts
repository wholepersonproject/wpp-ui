import { Component, model } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from '@atlasng/labs/footer';
import {
  HeaderShell,
  HeaderShellNavigationItem,
  NavigationContainer,
} from '@atlasng/labs/header-shell';

@Component({
  imports: [RouterModule, Footer, HeaderShell, NavigationContainer],
  selector: 'wpp-website',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly navigationItems = model<HeaderShellNavigationItem[]>([
    { id: 'home', label: 'Home', link: '/', icon: 'home' },
    { id: 'data', label: 'Data', link: '/data', icon: 'database' },
    {
      id: 'visualizations',
      label: 'Visualizations',
      link: '/visualizations',
      icon: 'bar_chart',
    },
    { id: 'models', label: 'Models', link: '/models', icon: 'timeline' },
    {
      id: 'resources',
      label: 'Resources',
      link: '/resources',
      icon: 'quick_reference',
    },
  ]);

  readonly appMenuItems = model<HeaderShellNavigationItem[]>([
    { id: 'home', label: 'Home', link: '/' },
    { id: 'biomodels-explorer', label: 'BioModels Explorer', link: '/' },
    { id: 'kg-explorer', label: 'Knowledge Graph Explorer', link: '/' },
  ]);

  readonly socialMediaIds = model<string[]>([
    'youtube',
    'github',
    'bluesky',
    'x',
  ]);
}
