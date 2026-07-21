import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LandingPage, LandingPageContent } from './landing-page';

const data: LandingPageContent = {
  splash: {
    backgroundImageUrl: './home-splash.png',
    title: 'Let’s map and model human physiology',
    description: 'Landing-page description.',
    funder: 'Funded by the National Institutes of Health',
  },
  newsAndEvents: {
    title: 'News and events',
    items: [
      {
        id: 'wpp-hackathon-2026-08-24',
        date: 'August 24-25, 2026',
        title: 'Whole Person Physiome Hackathon',
        summary: 'Organized by the WPP Research and Coordination Center',
        tag: {
          label: 'Virtual',
          icon: 'public',
        },
        url: '/events#wpp-hackathon-2026-08-24',
      },
    ],
  },
};

describe('LandingPage', () => {
  it('renders the complete YAML-shaped page content', async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage],
    }).compileComponents();
    const fixture = TestBed.createComponent(LandingPage);
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const splash = element.querySelector<HTMLElement>('.landing-page');

    expect(element.querySelector('h1')?.textContent).toContain(
      data.splash.title,
    );
    expect(splash?.style.backgroundImage).toContain(
      data.splash.backgroundImageUrl,
    );
    expect(element.querySelector('h2')?.textContent).toContain(
      data.newsAndEvents.title,
    );
  });
});
