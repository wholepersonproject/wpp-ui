import { Component, ViewEncapsulation } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { ScrollArea } from '@atlasng/design-system/scroll-area';
import { CellTemplateContext } from '@atlasng/design-system/table';
import { CSV_FILE_FORMAT } from '@atlasng/design-system/version-control';
import { KgExplorerDownloadCellDefinition } from '@atlasng/kg-explorer';
import { KgFileFormat } from './kg-digital-objects';
import { KgExplorerItem } from './kg-terms';

/**
 * Whether a divider follows a format in the download menu: only a source CSV listed first, before other formats
 *
 * @param formats Formats in menu order
 * @param index Position of the format
 * @returns Whether to separate the format from the ones after it
 */
export function hasDividerAfter(formats: readonly KgFileFormat[], index: number): boolean {
  return index === 0 && formats.length > 1 && formats[0].label === CSV_FILE_FORMAT.label;
}

/**
 * Download cell that separates the source CSV from the other formats with a divider, and keeps its menu beside the
 * button. AtlasNG's download cell can't group formats, and its menu can cover the button, so this copies its
 * template and styles, adds the divider, and scrolls a long menu.
 *
 * TODO(cns-iu/AtlasNG#455, cns-iu/AtlasNG#520): use the table view's download column once it groups formats with
 * dividers and keeps its menu beside the button
 */
@Component({
  selector: 'wpp-kg-download-cell-definition',
  imports: [
    CellTemplateContext,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    ScrollArea,
  ],
  templateUrl: './kg-download-cell.html',
  styleUrl: './kg-download-cell.scss',
  encapsulation: ViewEncapsulation.None,
})
export class KgDownloadCellDefinition extends KgExplorerDownloadCellDefinition<KgExplorerItem, KgFileFormat> {
  /** Whether a divider follows a format in the download menu */
  protected readonly hasDividerAfter = hasDividerAfter;
}
