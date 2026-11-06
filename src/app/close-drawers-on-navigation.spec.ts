import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { closeDrawersOnNavigation } from './close-drawers-on-navigation';

@Component({ template: '' })
class EmptyPage {}

describe('closeDrawersOnNavigation', () => {
  let router: Router;
  const drawers = {
    leftMenuOpen: signal(false),
    rightMenuOpen: signal(false),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: EmptyPage },
          { path: 'about', component: EmptyPage },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    drawers.leftMenuOpen.set(true);
    drawers.rightMenuOpen.set(true);
  });

  it('closes both drawers after navigating to another page', async () => {
    TestBed.runInInjectionContext(() => closeDrawersOnNavigation(signal(drawers)));

    await router.navigateByUrl('/about');

    expect(drawers.leftMenuOpen()).toBe(false);
    expect(drawers.rightMenuOpen()).toBe(false);
  });

  it("closes both drawers after picking the current page's link", async () => {
    await router.navigateByUrl('/about');
    TestBed.runInInjectionContext(() => closeDrawersOnNavigation(signal(drawers)));

    await router.navigateByUrl('/about');

    expect(drawers.leftMenuOpen()).toBe(false);
    expect(drawers.rightMenuOpen()).toBe(false);
  });

  it('ignores navigation before the navigation container renders', async () => {
    TestBed.runInInjectionContext(() => closeDrawersOnNavigation(signal(undefined)));

    await expect(router.navigateByUrl('/about')).resolves.toBe(true);
  });
});
