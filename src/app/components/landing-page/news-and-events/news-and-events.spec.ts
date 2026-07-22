import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { NewsAndEvents, NewsAndEventsContent } from './news-and-events';

const content: NewsAndEventsContent = {
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
};

describe('NewsAndEvents', () => {
  it('renders accessible, data-driven event cards', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsAndEvents],
    }).compileComponents();
    const fixture = TestBed.createComponent(NewsAndEvents);
    fixture.componentRef.setInput('content', content);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const section = element.querySelector('section');
    const link = element.querySelector('article a');
    const tag = element.querySelector('.event-tag');
    const tagIcon = element.querySelector('mat-icon');

    expect(section?.getAttribute('aria-labelledby')).toBe(
      'news-and-events-title',
    );
    expect(element.querySelector('h2')?.textContent).toContain(content.title);
    expect(link?.getAttribute('href')).toBe(content.items[0].url);
    expect(tag?.getAttribute('aria-label')).toBe('Tag: Virtual');
    expect(tagIcon?.getAttribute('data-mat-icon-name')).toBe(
      content.items[0].tag.icon,
    );
  });

  it('renders the Material Symbol configured by YAML-shaped content', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsAndEvents],
    }).compileComponents();
    const fixture = TestBed.createComponent(NewsAndEvents);
    fixture.componentRef.setInput('content', {
      ...content,
      items: [
        {
          ...content.items[0],
          tag: { label: 'Announcement', icon: 'campaign' },
        },
      ],
    } satisfies NewsAndEventsContent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(
      element.querySelector('mat-icon')?.getAttribute('data-mat-icon-name'),
    ).toBe('campaign');
    expect(element.querySelector('.event-tag')?.textContent).toContain(
      'Announcement',
    );
  });
});
