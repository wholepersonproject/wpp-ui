import { Service, signal, TemplateRef } from '@angular/core';

/**
 * Hands the app footer to a page that scrolls inside its own scroll area, such as the knowledge graph explorer
 * table view. The page renders the footer at the end of its content, so the window gets no second scrollbar.
 *
 * @see https://github.com/cns-iu/AtlasNG/issues/411
 */
@Service()
export class PageFooterService {
  /** Footer declared by the app shell */
  readonly template = signal<TemplateRef<unknown> | undefined>(undefined);

  /** Whether the displayed page renders the footer, which hides the shell's copy */
  readonly inPage = signal(false);
}
