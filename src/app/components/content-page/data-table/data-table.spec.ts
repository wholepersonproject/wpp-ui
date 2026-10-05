import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TableContent, TableRow, TableService } from '../table-service';
import { DataTable, TOTALS_ROW_LABEL } from './data-table';

/** Protected members of {@link DataTable} inspected by these tests. */
interface DataTableInternals {
  rows: Signal<TableRow[]>;
}

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
  { label: 'gamma', url: 'https://example.org/gamma', count: '', notes: 'third' },
];

async function setup(tableContent: TableContent = content) {
  await TestBed.configureTestingModule({
    imports: [DataTable],
    providers: [{ provide: TableService, useValue: { getTableRows: () => rows } }],
  }).compileComponents();

  const fixture = TestBed.createComponent(DataTable);
  fixture.componentRef.setInput('content', tableContent);
  fixture.detectChanges();
  await fixture.whenStable();

  const internals = fixture.componentInstance as unknown as DataTableInternals;
  const getLabels = () => internals.rows().map((row) => row['label']);
  const clickHeader = async (name: string) => {
    await userEvent.setup().click(screen.getByText(name));
    fixture.detectChanges();
    await fixture.whenStable();
  };

  return { internals, getLabels, clickHeader };
}

describe('DataTable', () => {
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
    const { clickHeader } = await setup();

    await clickHeader('System');

    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'alpha' })).not.toBeInTheDocument();
  });

  it('appends a totals row summing numeric columns', async () => {
    const { internals, getLabels } = await setup();

    expect(getLabels()).toEqual(['beta', 'alpha', 'gamma', TOTALS_ROW_LABEL]);
    expect(internals.rows().at(-1)).toEqual({ label: TOTALS_ROW_LABEL, count: 12, notes: '' });
  });

  it('omits the totals row when the footer is disabled', async () => {
    const { getLabels } = await setup({ ...content, footer: false });

    expect(getLabels()).toEqual(['beta', 'alpha', 'gamma']);
  });

  it('sorts text columns in both directions while keeping the totals row last', async () => {
    const { getLabels, clickHeader } = await setup();

    await clickHeader('System');
    expect(getLabels()).toEqual(['alpha', 'beta', 'gamma', TOTALS_ROW_LABEL]);

    await clickHeader('System');
    expect(getLabels()).toEqual(['gamma', 'beta', 'alpha', TOTALS_ROW_LABEL]);
  });

  it('sorts numeric columns numerically with empty values first', async () => {
    const { getLabels, clickHeader } = await setup();

    await clickHeader('Count');
    expect(getLabels()).toEqual(['gamma', 'beta', 'alpha', TOTALS_ROW_LABEL]);

    await clickHeader('Count');
    expect(getLabels()).toEqual(['alpha', 'beta', 'gamma', TOTALS_ROW_LABEL]);
  });

  it('restores the original order when sorting is cleared', async () => {
    const { getLabels, clickHeader } = await setup();

    await clickHeader('System');
    await clickHeader('System');
    await clickHeader('System');

    expect(getLabels()).toEqual(['beta', 'alpha', 'gamma', TOTALS_ROW_LABEL]);
  });
});
