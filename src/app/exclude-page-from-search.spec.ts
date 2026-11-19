import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { excludePageFromSearch } from './exclude-page-from-search';

@Component({ template: '' })
class ErrorPage {
  constructor() {
    excludePageFromSearch();
  }
}

describe('excludePageFromSearch', () => {
  it('adds a noindex robots tag while the page is shown', () => {
    const fixture = TestBed.createComponent(ErrorPage);
    const meta = TestBed.inject(Meta);

    expect(meta.getTag('name="robots"')?.content).toBe('noindex');

    fixture.destroy();

    expect(meta.getTag('name="robots"')).toBeNull();
  });
});
