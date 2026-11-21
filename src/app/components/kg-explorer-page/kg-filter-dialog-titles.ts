import { computed, Signal } from '@angular/core';
import { MultiSelectFilter } from '@atlasng/design-system/multi-select-filter';

/** A filter label and the title of its full-screen dialog */
export interface FilterDialogTitle {
  /** Filter label */
  label: string;
  /** Title of the filter's full-screen dialog */
  dialogTitle: string;
}

/** Multi-select filter members that resolve the dialog title */
interface DialogTitleMembers {
  label: Signal<string>;
  dialogTitle: Signal<string | undefined>;
  resolvedDialogTitle: Signal<string>;
}

/** Factory Angular calls to create each multi-select filter */
type FilterFactory = (type?: unknown) => DialogTitleMembers;

/**
 * Titles the full-screen multi-select filter dialogs by filter label. The KG Explorer filter drawer doesn't pass
 * `dialogTitle` to its filters, so this wraps the filter's factory to fill it in. Filters with other labels keep
 * the default title. Call it once, before the first filter is created; Angular caches the factory on first use.
 *
 * TODO(cns-iu/AtlasNG#515): set `dialogTitle` on each KG Explorer filter and remove this workaround
 *
 * @param titles Dialog titles of the filters
 */
export function setFilterDialogTitles(titles: readonly FilterDialogTitle[]): void {
  const titlesByLabel = new Map(titles.map(({ label, dialogTitle }) => [label, dialogTitle]));
  const component = MultiSelectFilter as unknown as { ɵfac: FilterFactory };
  const create = component.ɵfac;
  component.ɵfac = (type) => {
    const filter = create(type);
    const defaultTitle = filter.resolvedDialogTitle;
    filter.resolvedDialogTitle = computed(
      () => filter.dialogTitle() ?? titlesByLabel.get(filter.label()) ?? defaultTitle(),
    );
    return filter;
  };
}
