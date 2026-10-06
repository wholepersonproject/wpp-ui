import { TestBed } from '@angular/core/testing';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TableContent, TableRow, TableService } from '../table-service';
import { DataTable, TOTALS_ROW_LABEL } from './data-table';

const content: TableContent = {
  type: 'table',
  url: 'assets/table.csv',
  footer: true,
  columns: [
    { column: 'label', label: 'System', urlColumn: 'url', sticky: true },
    { column: 'count', label: 'Count\n', numeric: true },
    { column: 'notes', label: 'Notes' },
  ],
};

const rows: TableRow[] = [
  { label: 'beta', url: 'https://example.org/beta', count: 2, notes: 'second' },
  { label: 'alpha', url: '', count: 10, notes: 'first' },
  { label: 'gamma', url: 'https://example.org/gamma', count: null, notes: 'third' },
];

/** Viewport height reported to the table so its virtualized body renders every row */
const VIEWPORT_HEIGHT = 1000;

/** Reports a fixed border box for every observed element; jsdom has no layout to measure. */
class FixedSizeResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element): void {
    const entry = { target, borderBoxSize: [{ inlineSize: VIEWPORT_HEIGHT, blockSize: VIEWPORT_HEIGHT }] };
    this.callback([entry as unknown as ResizeObserverEntry], this as unknown as ResizeObserver);
  }

  unobserve(): void {
    // No-op: sizes never change
  }

  disconnect(): void {
    // No-op: sizes never change
  }
}

async function setup(tableContent: TableContent = content) {
  await TestBed.configureTestingModule({
    imports: [DataTable],
    providers: [{ provide: TableService, useValue: { getTableRows: () => rows } }],
  }).compileComponents();

  const fixture = TestBed.createComponent(DataTable);
  fixture.componentRef.setInput('content', tableContent);
  fixture.detectChanges();
  await fixture.whenStable();
  // Let the table's debounced resize handler apply the viewport size
  await vi.advanceTimersByTimeAsync(10);
  fixture.detectChanges();
  await fixture.whenStable();

  /** Notes column values in rendered order; notes are unique per row and never part of the summary */
  const getNotes = () => screen.getAllByText(/^(first|second|third)$/).map((cell) => cell.textContent?.trim());
  const clickHeader = async (name: string) => {
    await userEvent.setup().click(screen.getByText(name));
    fixture.detectChanges();
    await fixture.whenStable();
  };

  return { fixture, getNotes, clickHeader };
}

describe('DataTable', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('ResizeObserver', FixedSizeResizeObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders trimmed column headers', async () => {
    await setup();

    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders a link cell for rows with a link', async () => {
    await setup();

    const link = screen.getByRole('link', { name: 'beta' });
    expect(link).toHaveAttribute('href', 'https://example.org/beta');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders plain text for rows without a link', async () => {
    await setup();

    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'alpha' })).not.toBeInTheDocument();
  });

  it('renders a summary row totaling numeric columns', async () => {
    await setup();

    const summaryRow = screen.getByText(TOTALS_ROW_LABEL).closest<HTMLElement>('[role="row"]');
    expect(summaryRow).not.toBeNull();
    expect(within(summaryRow as HTMLElement).getByText('12')).toBeInTheDocument();
  });

  it('omits the summary row when the footer is disabled', async () => {
    await setup({ ...content, footer: false });

    expect(screen.queryByText(TOTALS_ROW_LABEL)).not.toBeInTheDocument();
  });

  it('sorts text columns in both directions and restores the original order when cleared', async () => {
    const { getNotes, clickHeader } = await setup();

    await clickHeader('System');
    expect(getNotes()).toEqual(['first', 'second', 'third']);

    await clickHeader('System');
    expect(getNotes()).toEqual(['third', 'second', 'first']);

    await clickHeader('System');
    expect(getNotes()).toEqual(['second', 'first', 'third']);
  });

  it('sorts numeric columns numerically with empty values first', async () => {
    const { getNotes, clickHeader } = await setup();

    await clickHeader('Count');
    expect(getNotes()).toEqual(['third', 'second', 'first']);

    await clickHeader('Count');
    expect(getNotes()).toEqual(['first', 'second', 'third']);
  });
});
