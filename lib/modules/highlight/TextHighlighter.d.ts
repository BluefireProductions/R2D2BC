import { IColor, IHighlight } from "./common/highlight";
import { ISelectionInfo } from "./common/selection";
import { IRectSimple } from "./common/rect-utils";
import { IReadiumIFrameWindow } from "./renderer/iframe/state";
import { AnnotationMarker } from "../../model/Locator";
import IFrameNavigator, { SelectionMenuItem } from "../../navigator/IFrameNavigator";
export declare const ID_HIGHLIGHTS_CONTAINER = "R2_ID_HIGHLIGHTS_CONTAINER";
export declare const CLASS_HIGHLIGHT_CONTAINER = "R2_CLASS_HIGHLIGHT_CONTAINER";
export declare const CLASS_HIGHLIGHT_AREA = "R2_CLASS_HIGHLIGHT_AREA";
export declare const CLASS_HIGHLIGHT_BOUNDING_AREA = "R2_CLASS_HIGHLIGHT_BOUNDING_AREA";
export interface TextSelectorAPI {
    selectionMenuOpen: any;
    selectionMenuClose: any;
}
export declare const _highlights: IHighlight[];
interface IWithRect {
    rect: IRectSimple;
    scale: number;
}
export interface IHTMLDivElementWithRect extends HTMLDivElement, IWithRect {
}
export interface TextHighlighterProperties {
    selectionMenuItems: Array<SelectionMenuItem>;
}
export interface TextHighlighterConfig extends TextHighlighterProperties {
    delegate: IFrameNavigator;
    api: TextSelectorAPI;
}
export default class TextHighlighter {
    private options;
    private delegate;
    private lastSelectedHighlight;
    private properties;
    private api;
    private hasEventListener;
    static create(config: TextHighlighterConfig): Promise<any>;
    private constructor();
    initialize(): Promise<void>;
    /**
     * Returns true if elements a i b have the same color.
     * @param {Node} a
     * @param {Node} b
     * @returns {boolean}
     */
    haveSameColor(a: any, b: any): boolean;
    /**
     * Fills undefined values in obj with default properties with the same name from source object.
     * @param {object} obj - target object
     * @param {object} source - source object with default values
     * @returns {object}
     */
    defaults(obj: {
        [x: string]: any;
    }, source: {
        [x: string]: any;
        color?: string;
        highlightedClass?: string;
        contextClass?: string;
        onBeforeHighlight?: () => boolean;
        onAfterHighlight?: () => void;
        container?: any;
        andSelf?: boolean;
        grouped?: boolean;
        hasOwnProperty?: any;
    }): object;
    /**
     * Returns array without duplicated values.
     * @param {Array} arr
     * @returns {Array}
     */
    unique(arr: {
        filter: (arg0: (value: any, idx: any, self: any) => boolean) => void;
    }): void;
    /**
     * Takes range object as parameter and refines it boundaries
     * @param range
     * @returns {object} refined boundaries and initial state of highlighting algorithm.
     */
    refineRangeBoundaries(range: {
        startContainer: any;
        endContainer: any;
        commonAncestorContainer: any;
        endOffset: number;
        startOffset: number;
    }): object;
    /**
     * Sorts array of DOM elements by its depth in DOM tree.
     * @param {HTMLElement[]} arr - array to sort.
     * @param {boolean} descending - order of sort.
     */
    sortByDepth(arr: {
        sort: (arg0: (a: any, b: any) => number) => void;
    }, descending: boolean): void;
    /**
     * Groups given highlights by timestamp.
     * @param {Array} highlights
     * @returns {Array} Grouped highlights.
     */
    groupHighlights(highlights: {
        forEach: (arg0: (hl: any) => void) => void;
    }): Array<any>;
    /**
     * Utility functions to make DOM manipulation easier.
     * @param {Node|HTMLElement} [el] - base DOM element to manipulate
     * @returns {object}
     */
    dom(el?: any): any;
    disableContext(e: {
        preventDefault: () => void;
        stopPropagation: () => void;
    }): boolean;
    bindEvents(el: any, _scope: any, hasEventListener: boolean): void;
    unbindEvents(el: any, _scope: any): void;
    /**
     * Permanently disables highlighting.
     * Unbinds events and remove context element class.
     * @memberof TextHighlighter
     */
    destroy(): void;
    initializeToolbox(): void;
    toolboxMode(mode: "colors" | "edit" | "add"): void;
    toolboxHide(): void;
    toolboxShowDelayed(): void;
    snapSelectionToWord(): any;
    toolboxShow(): void;
    isSelectionMenuOpen: boolean;
    selectionMenuOpened: (() => void) & {
        clear(): void;
    };
    selectionMenuClosed: (() => void) & {
        clear(): void;
    };
    toolboxPlacement(): void;
    toolboxHandler(): void;
    /**
     * Highlights current range.
     * @param {boolean} keepRange - Don't remove range after highlighting. Default: false.
     * @param marker
     * @memberof TextHighlighter
     */
    doHighlight(keepRange?: boolean, marker?: AnnotationMarker): void;
    speak(): void;
    stopReadAloud(): void;
    speakAll(): void;
    callbackComplete(): void;
    doneSpeaking(reload?: boolean): void;
    /**
     * Normalizes highlights. Ensures that highlighting is done with use of the smallest possible number of
     * wrapping HTML elements.
     * Flattens highlights structure and merges sibling highlights. Normalizes text nodes within highlights.
     * @param {Array} highlights - highlights to normalize.
     * @returns {Array} - array of normalized highlights. Order and number of returned highlights may be different than
     * input highlights.
     * @memberof TextHighlighter
     */
    normalizeHighlights(highlights: any): any;
    /**
     * Flattens highlights structure.
     * Note: this method changes input highlights - their order and number after calling this method may change.
     * @param {Array} highlights - highlights to flatten.
     * @memberof TextHighlighter
     */
    flattenNestedHighlights(highlights: any): void;
    /**
     * Merges sibling highlights and normalizes descendant text nodes.
     * Note: this method changes input highlights - their order and number after calling this method may change.
     * @param highlights
     * @memberof TextHighlighter
     */
    mergeSiblingHighlights(highlights: any): void;
    /**
     * Sets highlighting color.
     * @param {string} color - valid CSS color.
     * @memberof TextHighlighter
     */
    setColor(color: any): void;
    /**
     * Returns highlighting color.
     * @returns {string}
     * @memberof TextHighlighter
     */
    getColor(): string;
    /**
     * Returns highlights from given container.
     * @param params
     * @param {HTMLElement} [params.container] - return highlights from this element. Default: the element the
     * highlighter is applied to.
     * @param {boolean} [params.andSelf] - if set to true and container is a highlight itself, add container to
     * returned results. Default: true.
     * @param {boolean} [params.grouped] - if set to true, highlights are grouped in logical groups of highlights added
     * in the same moment. Each group is an object which has got array of highlights, 'toString' method and 'timestamp'
     * property. Default: false.
     * @returns {Array} - array of highlights.
     * @memberof TextHighlighter
     */
    getHighlights(params?: any): Array<any>;
    /**
     * Returns true if element is a highlight.
     * All highlights have 'data-highlighted' attribute.
     * @param el - element to check.
     * @returns {boolean}
     * @memberof TextHighlighter
     */
    isHighlight(el: any): boolean;
    /**
     * Serializes all highlights in the element the highlighter is applied to.
     * @returns {string} - stringified JSON with highlights definition
     * @memberof TextHighlighter
     */
    serializeHighlights(): string;
    /**
     * Deserializes highlights.
     * @throws exception when can't parse JSON or JSON has invalid structure.
     * @param {object} json - JSON object with highlights definition.
     * @returns {Array} - array of deserialized highlights.
     * @memberof TextHighlighter
     */
    deserializeHighlights(json: any): Array<any>;
    /**
     * Creates wrapper for highlights.
     * TextHighlighter instance calls this method each time it needs to create highlights and pass options retrieved
     * in constructor.
     * @returns {HTMLElement}
     * @memberof TextHighlighter
     * @static
     */
    createWrapper(): HTMLElement;
    static isHexColor(hex: string): boolean;
    static hexToRgbString(hex: string): any;
    static hexToRgbChannels(hex: string): {
        red: number;
        green: number;
        blue: number;
    };
    static hexToRgbA(hex: string): string;
    static hexToRgbAWithOpacity(hex: string, opacity: number): string;
    resetHighlightBoundingStyle(_win: IReadiumIFrameWindow, highlightBounding: HTMLElement): void;
    resetHighlightAreaStyle(_win: IReadiumIFrameWindow, highlightArea: HTMLElement): void;
    setHighlightAreaStyle(_win: IReadiumIFrameWindow, highlightAreas: Array<HTMLElement>, highlight: IHighlight): void;
    setAndResetSearchHighlight(highlight: any, highlights: any): void;
    isIOS(): boolean;
    isAndroid(): boolean;
    getScrollingElement: (documant: Document) => Element;
    processMouseEvent(win: IReadiumIFrameWindow, ev: MouseEvent): Promise<void>;
    ensureHighlightsContainer(win: IReadiumIFrameWindow): HTMLElement;
    hideAllhighlights(_documant: Document): void;
    destroyAllhighlights(documant: Document): void;
    destroyHighlight(documant: Document, id: string): void;
    recreateAllHighlightsRaw(win: IReadiumIFrameWindow): void;
    recreateAllHighlightsDebounced: ((win: IReadiumIFrameWindow) => void) & {
        clear(): void;
    };
    recreateAllHighlights(win: IReadiumIFrameWindow): void;
    createSearchHighlight(selectionInfo: ISelectionInfo, color: string): IHighlight;
    createHighlight(win: IReadiumIFrameWindow, selectionInfo: ISelectionInfo, color: IColor | undefined, pointerInteraction: boolean, marker: AnnotationMarker): IHighlight;
    createHighlightDom(win: IReadiumIFrameWindow, highlight: IHighlight): HTMLDivElement | undefined;
}
export {};
