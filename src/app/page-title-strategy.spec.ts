import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { PageTitleStrategy } from './page-title-strategy';

@Component({ template: '' })
class EmptyPage {}

describe('PageTitleStrategy', () => {
  let router: Router;
  let title: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: EmptyPage, resolve: { data: () => ({ splash: {} }) } },
          {
            path: 'about',
            component: EmptyPage,
            resolve: { data: () => ({ headerContent: { title: 'About' } }) },
          },
          { path: '**', component: EmptyPage, title: 'Page not found' },
        ]),
        { provide: TitleStrategy, useClass: PageTitleStrategy },
      ],
    });
    router = TestBed.inject(Router);
    title = TestBed.inject(Title);
  });

  it('uses the site name alone on the home page', async () => {
    await router.navigateByUrl('/');

    expect(title.getTitle()).toBe('Whole Person Physiome');
  });

  it("uses a content page's header title", async () => {
    await router.navigateByUrl('/about');

    expect(title.getTitle()).toBe('About | Whole Person Physiome');
  });

  it("uses the route's title", async () => {
    await router.navigateByUrl('/missing');

    expect(title.getTitle()).toBe('Page not found | Whole Person Physiome');
  });
});
