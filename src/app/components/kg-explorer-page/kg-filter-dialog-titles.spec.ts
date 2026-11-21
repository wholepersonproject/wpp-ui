import { MultiSelectFilter } from '@atlasng/design-system/multi-select-filter';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { setFilterDialogTitles } from './kg-filter-dialog-titles';

setFilterDialogTitles([{ label: 'Organs', dialogTitle: 'Organ filters' }]);

/**
 * Renders a multi-select filter and opens its dialog, which is full screen in the test viewport
 *
 * @param inputs Filter label and optional dialog title
 */
async function openFilter(inputs: { label: string; dialogTitle?: string }): Promise<void> {
  await render(MultiSelectFilter, { inputs: { options: [], ...inputs } });
  await userEvent.click(screen.getByRole('button', { name: inputs.label }));
}

describe('setFilterDialogTitles', () => {
  it('titles the dialog of a listed filter', async () => {
    await openFilter({ label: 'Organs' });
    expect(screen.getByRole('dialog', { name: 'Organ filters' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Organ filters' })).toBeInTheDocument();
  });

  it('keeps the default title of other filters', async () => {
    await openFilter({ label: 'Cell types' });
    expect(screen.getByRole('heading', { name: 'Cell types filters' })).toBeInTheDocument();
  });

  it('keeps a dialog title set on the filter', async () => {
    await openFilter({ label: 'Organs', dialogTitle: 'Organs' });
    expect(screen.getByRole('heading', { name: 'Organs' })).toBeInTheDocument();
  });
});
