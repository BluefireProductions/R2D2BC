import { Locator } from "./Locator";
import { Link } from "./Link";
import { Publication as R2Publication } from "r2-shared-js/dist/es6-es2015/src/models/publication";
import { Link as R2Link } from "r2-shared-js/dist/es6-es2015/src/models/publication-link";
export declare class Publication extends R2Publication {
    manifestUrl: URL;
    positions: Array<Locator>;
    get readingOrder(): R2Link[];
    get tableOfContents(): R2Link[];
    get landmarks(): R2Link[];
    get pageList(): R2Link[];
    getStartLink(): Link | null;
    getPreviousSpineItem(href: string): Link | null;
    getNextSpineItem(href: string): Link | null;
    getSpineItem(href: string): Link | null;
    getSpineIndex(href: string): number | null;
    getAbsoluteHref(href: string): string | null;
    getTOCItemAbsolute(href: string): Link | null;
    getTOCItem(href: string): Link | null;
    /**
     * positionsByHref
     */
    positionsByHref(href: string): Locator[];
    get hasMediaOverlays(): boolean;
}
