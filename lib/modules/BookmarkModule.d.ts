import Annotator from "../store/Annotator";
import IFrameNavigator, { ReaderRights } from "../navigator/IFrameNavigator";
import { Publication } from "../model/Publication";
import ReaderModule from "./ReaderModule";
import { Bookmark } from "../model/Locator";
export interface BookmarkModuleAPI {
    addBookmark: (bookmark: Bookmark) => Promise<Bookmark>;
    deleteBookmark: (bookmark: Bookmark) => Promise<Bookmark>;
    getBookmarks: Array<any>;
}
export interface BookmarkModuleProperties {
}
export interface BookmarkModuleConfig {
    annotator: Annotator;
    headerMenu: HTMLElement;
    rights: ReaderRights;
    publication: Publication;
    delegate: IFrameNavigator;
    initialAnnotations?: any;
    properties: BookmarkModuleProperties;
    api: BookmarkModuleAPI;
}
export default class BookmarkModule implements ReaderModule {
    private readonly annotator;
    private rights;
    private publication;
    private bookmarksView;
    private sideNavSectionBookmarks;
    private readonly headerMenu;
    private readonly initialAnnotations;
    private delegate;
    private readonly properties;
    private readonly api;
    static create(config: BookmarkModuleConfig): Promise<any>;
    constructor(annotator: Annotator, headerMenu: HTMLElement, rights: ReaderRights, publication: Publication, delegate: IFrameNavigator, initialAnnotations?: any | null, properties?: BookmarkModuleProperties | null, api?: BookmarkModuleAPI | null);
    stop(): Promise<void>;
    protected start(): Promise<void>;
    deleteBookmark(bookmark: Bookmark): Promise<any>;
    saveBookmark(): Promise<any>;
    getBookmarks(): Promise<any>;
    showBookmarks(): Promise<void>;
    private createTree;
    private handleAnnotationLinkClick;
    private handleAnnotationLinkDeleteClick;
    private static readableTimestamp;
}
