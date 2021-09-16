import { IHighlight } from "../modules/highlight/common/highlight";
export interface Locator {
    href: string;
    type?: string;
    title?: string;
    locations: Locations;
    text?: LocatorText;
    displayInfo?: any;
}
export interface LocatorText {
    after?: string;
    before?: string;
    highlight?: string;
}
export interface Locations {
    fragment?: string;
    progression?: number;
    position?: number;
    totalProgression?: number;
    remainingPositions?: number;
    totalRemainingPositions?: number;
}
export interface ReadingPosition extends Locator {
    created: Date;
}
export interface Bookmark extends Locator {
    id?: any;
    created: Date;
}
export declare enum AnnotationMarker {
    Highlight = 0,
    Underline = 1
}
export interface Annotation extends Locator {
    id?: any;
    created: Date;
    highlight?: IHighlight;
    marker: AnnotationMarker;
    color: string;
}
export interface ISelectionInfo {
    rangeInfo: IRangeInfo;
    cleanText: string;
    rawText: string;
    color: string;
    range: Range;
}
export interface IRangeInfo {
    startContainerElementCssSelector: string;
    startContainerChildTextNodeIndex: number;
    startOffset: number;
    endContainerElementCssSelector: string;
    endContainerChildTextNodeIndex: number;
    endOffset: number;
}
export interface ChapterWeight {
    chapterHref: string;
    weight: number;
}
