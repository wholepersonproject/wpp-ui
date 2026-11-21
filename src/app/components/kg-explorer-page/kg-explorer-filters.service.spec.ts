import { BreakpointObserver } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { KgExplorerFiltersService } from './kg-explorer-filters.service';

/**
 * Creates the service with a viewport that does or doesn't reach the dock breakpoint.
 *
 * @param docked Whether the viewport is wide enough to dock the filter menu
 * @returns The service
 */
function setup(docked = false): KgExplorerFiltersService {
  TestBed.configureTestingModule({
    providers: [{ provide: BreakpointObserver, useValue: { observe: () => of({ matches: docked, breakpoints: {} }) } }],
  });
  return TestBed.inject(KgExplorerFiltersService);
}

describe('KgExplorerFiltersService', () => {
  it('starts unavailable and closed', () => {
    const service = setup();

    expect(service.available()).toBe(false);
    expect(service.open()).toBe(false);
  });

  it('toggles the filter menu', () => {
    const service = setup();

    service.toggle();
    expect(service.open()).toBe(true);

    service.toggle();
    expect(service.open()).toBe(false);
  });

  it('closes a filter menu that slides over the page', () => {
    const service = setup(false);
    service.open.set(true);

    service.closeOverlay();

    expect(service.open()).toBe(false);
  });

  it('keeps a docked filter menu open', () => {
    const service = setup(true);
    service.open.set(true);

    service.closeOverlay();

    expect(service.open()).toBe(true);
  });
});
