import { Publication } from "../../model/Publication";
import IFrameNavigator from "../../navigator/IFrameNavigator";
import ReaderModule from "../ReaderModule";
import TextHighlighter from "../highlight/TextHighlighter";
export interface SearchModuleAPI {
}
export interface SearchModuleProperties {
    color: string;
    current: string;
}
export interface SearchModuleConfig extends SearchModuleProperties {
    api: SearchModuleAPI;
    publication: Publication;
    headerMenu: HTMLElement;
    delegate: IFrameNavigator;
    highlighter: TextHighlighter;
}
export default class SearchModule implements ReaderModule {
    private properties;
    private api;
    private publication;
    private readonly headerMenu;
    private delegate;
    private searchInput;
    private searchGo;
    private currentChapterSearchResult;
    private bookSearchResult;
    private currentHighlights;
    private highlighter;
    static create(config: SearchModuleConfig): Promise<SearchModule>;
    private constructor();
    stop(): Promise<void>;
    protected start(): Promise<void>;
    private handleSearch;
    handleSearchChapter(index?: number): Promise<void>;
    searchAndPaintChapter(term: string, index: number, callback: (result: any) => any): Promise<void>;
    clearSearch(): void;
    search(term: any, current: boolean): Promise<any>;
    goToSearchID(href: any, index: number, current: boolean): Promise<void>;
    goToSearchIndex(href: any, index: number, current: boolean): Promise<void>;
    private handleSearchBook;
    searchBook(term: string): Promise<any>;
    searchChapter(term: string): Promise<any>;
    drawSearch(): void;
    handleResize(): Promise<void>;
    jumpToMark(index: number): void;
    paginate(items: Array<any>, page: number, per_page: number): {
        page: number;
        per_page: number;
        pre_page: number;
        next_page: number;
        total: number;
        total_pages: number;
        data: any[];
    };
}
