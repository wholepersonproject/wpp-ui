import { TestBed } from '@angular/core/testing';
import { provideMarkdown } from 'ngx-markdown';
import { describe, expect, it } from 'vitest';
import { ContentCardGrid, ContentCardItem } from './content-card-grid';

const items: ContentCardItem[] = [
  {
    id: 'example-resource',
    title: 'Example resource',
    description: 'Read the **resource guide** before getting started.',
    actions: [
      {
        text: 'View the resource',
        url: '/resources/example',
        icon: 'visibility',
      },
      {
        text: 'View related guidance',
        url: '/resources/guidance',
        appearance: 'outlined',
        icon: 'description',
      },
    ],
  },
  {
    id: 'example-event',
    title: 'Example event',
    description: 'Find event details and registration information.',
    actions: [
      {
        text: 'View the event',
        url: '/events/example',
      },
    ],
  },
];

describe('ContentCardGrid', () => {
  it('renders reusable card content and same-tab actions', async () => {
    await TestBed.configureTestingModule({
      imports: [ContentCardGrid],
      providers: [provideMarkdown()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ContentCardGrid);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('headingLevel', 4);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll('mat-card');

    expect(element.querySelector('ul')).not.toBeNull();
    expect(cards).toHaveLength(items.length);
    expect(cards[0].querySelector('h4')?.textContent).toContain(items[0].title);
    expect(cards[0].querySelector('strong')?.textContent).toBe('resource guide');

    const actions = cards[0].querySelectorAll('mat-card-actions a');
    expect(actions).toHaveLength(items[0].actions.length);

    items[0].actions.forEach((action, index) => {
      expect(actions[index].textContent).toContain(action.text);
      expect(actions[index].getAttribute('href')).toBe(action.url);
      expect(actions[index].getAttribute('target')).toBeNull();
      expect(actions[index].querySelector('mat-icon')?.getAttribute('data-mat-icon-name')).toBe(action.icon);
      expect(actions[index].querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');
    });

    expect(cards[1].querySelector('mat-icon')).toBeNull();
  });
});
