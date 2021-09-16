import Annotator, { AnnotationType } from "./Annotator";
import Store from "./Store";
import { ReadingPosition } from "../model/Locator";
import { IReadiumIFrameWindow } from "../modules/highlight/renderer/iframe/state";
import { IHighlight } from "../modules/highlight/common/highlight";
export interface LocalAnnotatorConfig {
    store: Store;
}
/** Annotator that stores annotations locally, in the browser. */
export default class LocalAnnotator implements Annotator {
    private readonly store;
    private static readonly LAST_READING_POSITION;
    private static readonly BOOKMARKS;
    private static readonly ANNOTATIONS;
    constructor(config: LocalAnnotatorConfig);
    getLastReadingPosition(): Promise<any>;
    initLastReadingPosition(position: ReadingPosition): Promise<void>;
    saveLastReadingPosition(position: any): Promise<void>;
    initBookmarks(list: any): Promise<any>;
    saveBookmark(bookmark: any): Promise<any>;
    locatorExists(locator: any, type: AnnotationType): Promise<any>;
    deleteBookmark(bookmark: any): Promise<any>;
    getBookmarks(href?: string): Promise<any>;
    initAnnotations(list: any): Promise<any>;
    saveAnnotation(annotation: any): Promise<any>;
    deleteAnnotation(id: any): Promise<any>;
    deleteSelectedAnnotation(annotation: any): Promise<any>;
    getAnnotations(): Promise<any>;
    getAnnotationPosition(id: any, iframeWin: IReadiumIFrameWindow): Promise<any>;
    getAnnotation(highlight: IHighlight): Promise<any>;
}
