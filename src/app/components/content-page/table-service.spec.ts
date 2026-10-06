import { TestBed } from '@angular/core/testing';
import { parse, ParseConfig, ParseResult } from 'papaparse';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TableContent, TableRow, TableService } from './table-service';

vi.mock('papaparse', () => ({ parse: vi.fn() }));

const content: TableContent = {
  type: 'table',
  url: 'assets/table.csv',
  columns: [
    { column: 'label', label: 'System', urlColumn: 'url' },
    { column: 'count', label: 'Count', numeric: true },
  ],
};

const rows: TableRow[] = [{ label: 'alpha', url: '', count: 1 }];

/** Config of the most recent papaparse call, including the parsing callbacks */
function lastParseConfig(): ParseConfig<TableRow> & {
  transform: (value: string) => string;
  dynamicTyping: (field: string) => boolean;
  complete: (result: ParseResult<TableRow>) => void;
} {
  return vi.mocked(parse).mock.lastCall?.[1] as never;
}

describe('TableService', () => {
  let service: TableService;

  beforeEach(() => {
    vi.mocked(parse).mockReset();
    service = TestBed.inject(TableService);
  });

  it('downloads the CSV with headers and skips empty lines', () => {
    void service.generateTableRows(content);

    expect(parse).toHaveBeenCalledWith(
      content.url,
      expect.objectContaining({ download: true, header: true, skipEmptyLines: 'greedy' }),
    );
  });

  it('trims values before typing', () => {
    void service.generateTableRows(content);

    expect(lastParseConfig().transform('  12 ')).toBe('12');
  });

  it('applies dynamic typing to numeric columns only', () => {
    void service.generateTableRows(content);

    const { dynamicTyping } = lastParseConfig();
    expect(dynamicTyping('count')).toBe(true);
    expect(dynamicTyping('label')).toBe(false);
    expect(dynamicTyping('url')).toBe(false);
  });

  it('caches parsed rows and shares pending requests', async () => {
    expect(service.getTableRows(content)).toEqual([]);

    const first = service.generateTableRows(content);
    const second = service.generateTableRows(content);
    expect(parse).toHaveBeenCalledTimes(1);

    lastParseConfig().complete({ data: rows } as ParseResult<TableRow>);
    await expect(first).resolves.toBe(rows);
    await expect(second).resolves.toBe(rows);

    expect(service.getTableRows(content)).toBe(rows);
    await expect(service.generateTableRows(content)).resolves.toBe(rows);
    expect(parse).toHaveBeenCalledTimes(1);
  });
});
