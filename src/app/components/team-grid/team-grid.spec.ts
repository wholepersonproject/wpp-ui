import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamGrid, type TeamMember } from './team-grid';

describe('TeamGrid', () => {
  let fixture: ComponentFixture<TeamGrid>;

  const members: TeamMember[] = [
    {
      name: 'Ada Lovelace',
      image: 'ada-lovelace.jpg',
      url: 'https://example.org/ada',
      details: ['Research lead'],
    },
    {
      name: 'Alan Turing',
      image: 'alan-turing.jpg',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamGrid);
    fixture.componentRef.setInput('members', members);
    fixture.detectChanges();
  });

  it('renders each YAML-configured team member', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.team-member')).toHaveLength(2);
    expect(element.textContent).toContain('Ada Lovelace');
    expect(element.textContent).toContain('Research lead');
    expect(element.querySelectorAll('a')).toHaveLength(1);
    expect(element.querySelector('a')?.href).toBe('https://example.org/ada');
  });

  it('limits the configured desktop column count to four', () => {
    fixture.componentRef.setInput('columns', 9);
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector(
      '.team-grid',
    ) as HTMLElement;
    expect(grid.style.getPropertyValue('--team-grid-columns')).toBe('4');
  });
});
