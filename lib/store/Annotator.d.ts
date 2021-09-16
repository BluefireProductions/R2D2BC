import { ReadingPosition } from "../model/Locator";
import { IHighlight } from "../modules/highlight/common/highlight";
import { IReadiumIFrameWindow } from "../modules/highlight/renderer/iframe/state";
interface Annotator {
    initLastReadingPosition(position: ReadingPosition): Promise<void>;
    getLastReadingPosition(): Promise<any>;
    saveLastReadingPosition(position: any): Promise<void>;
    initBookmarks(list: any): Promise<any>;
    saveBookmark(bookmark: any): Promise<any>;
    deleteBookmark(bookmark: any): Promise<any>;
    getBookmarks(href?: string): Promise<any>;
    locatorExists(locator: any, type: AnnotationType): Promise<any>;
    initAnnotations(list: any): Promise<any>;
    saveAnnotation(annotation: any): Promise<any>;
    deleteAnnotation(id: any): Promise<any>;
    deleteSelectedAnnotation(annotation: any): Promise<any>;
    getAnnotations(): Promise<any>;
    getAnnotation(annotation: IHighlight): Promise<any>;
    getAnnotationPosition(id: any, iframeWin: IReadiumIFrameWindow): Promise<any>;
}
export declare enum AnnotationType {
    Bookmark = 0,
    Annotation = 1
}
export default Annotator;
