import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { KgExplorerFiltersService } from './kg-explorer-filters.service';

describe('KgExplorerFiltersService', () => {
  it('starts unavailable and closed', () => {
    const service = TestBed.inject(KgExplorerFiltersService);

    expect(service.available()).toBe(false);
    expect(service.open()).toBe(false);
  });

  it('toggles the filter menu', () => {
    const service = TestBed.inject(KgExplorerFiltersService);

    service.toggle();
    expect(service.open()).toBe(true);

    service.toggle();
    expect(service.open()).toBe(false);
  });
});
