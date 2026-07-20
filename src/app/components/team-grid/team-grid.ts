import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TextLink } from '@atlasng/design-system/text-link';

/** YAML-configurable information shown for one team member. */
export interface TeamMember {
  name: string;
  image: string;
  alt?: string;
  url?: string;
  details?: readonly string[];
  imagePosition?: string;
}

@Component({
  selector: 'wpp-team-grid',
  imports: [TextLink],
  templateUrl: './team-grid.html',
  styleUrl: './team-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamGrid {
  /** Team members, in the order they should appear in the grid. */
  readonly members = input.required<readonly TeamMember[]>();

  /** Preferred desktop column count. Responsive styles reduce it as needed. */
  readonly columns = input(3);

  /** Keep YAML mistakes from producing an unusable layout. */
  protected readonly columnCount = computed(() =>
    Math.min(Math.max(Math.round(this.columns()), 1), 4),
  );
}
