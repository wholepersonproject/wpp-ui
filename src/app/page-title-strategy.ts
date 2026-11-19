import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Site name, shown alone on the home page and after every other page's title */
export const SITE_NAME = 'Whole Person Physiome';

/** The part of a content page's YAML data that holds its header title */
interface PageHeaderData {
  headerContent?: { title?: string };
}

/**
 * Titles each page "<page> | Whole Person Physiome".
 *
 * The page name comes from the route's `title` or, on content pages, from the header title in the
 * page's YAML content, so content editors rename a page in one place. Pages with neither, such as
 * the home page, use the site name alone.
 */
@Injectable()
export class PageTitleStrategy extends TitleStrategy {
  /** Sets the document title */
  private readonly title = inject(Title);

  /**
   * Sets the document title after each navigation.
   *
   * @param snapshot Router state of the page navigated to
   */
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) ?? getHeaderTitle(snapshot.root);
    this.title.setTitle(pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME);
  }
}

/**
 * Reads the header title from the resolved content of the deepest active route.
 *
 * @param route Root of the router state
 * @returns The content page's header title, if the page has one
 */
function getHeaderTitle(route: ActivatedRouteSnapshot): string | undefined {
  let page = route;
  while (page.firstChild) {
    page = page.firstChild;
  }

  const data = page.data['data'] as PageHeaderData | undefined;
  return data?.headerContent?.title;
}
