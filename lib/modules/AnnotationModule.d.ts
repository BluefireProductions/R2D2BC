import Annotator from "../store/Annotator";
import IFrameNavigator, { ReaderRights } from "../navigator/IFrameNavigator";
import { Publication } from "../model/Publication";
import TextHighlighter from "./highlight/TextHighlighter";
import ReaderModule from "./ReaderModule";
import { IHighlight } from "./highlight/common/highlight";
import { Annotation, AnnotationMarker } from "../model/Locator";
export declare type Highlight = (highlight: Annotation) => Promise<Annotation>;
export interface AnnotationModuleAPI {
    addAnnotation: Highlight;
    deleteAnnotation: Highlight;
    selectedAnnotation: Highlight;
}
export interface AnnotationModuleProperties {
    initialAnnotationColor: string;
}
export interface AnnotationModuleConfig extends AnnotationModuleProperties {
    annotator: Annotator;
    headerMenu: HTMLElement;
    rights: ReaderRights;
    publication: Publication;
    delegate: IFrameNavigator;
    initialAnnotations?: any;
    api: AnnotationModuleAPI;
    highlighter: TextHighlighter;
}
export default class AnnotationModule implements ReaderModule {
    private readonly annotator;
    private rights;
    private publication;
    private highlightsView;
    private readonly headerMenu;
    private readonly highlighter;
    private readonly initialAnnotations;
    private delegate;
    properties: AnnotationModuleProperties;
    api: AnnotationModuleAPI;
    static create(config: AnnotationModuleConfig): Promise<AnnotationModule>;
    constructor(annotator: Annotator, headerMenu: HTMLElement, rights: ReaderRights, publication: Publication, delegate: IFrameNavigator, initialAnnotations: any | null, properties: AnnotationModuleProperties | null, api: AnnotationModuleAPI | null, highlighter: TextHighlighter);
    stop(): Promise<void>;
    protected start(): Promise<void>;
    handleResize(): void;
    initialize(): Promise<unknown>;
    scrollToHighlight(id: any): Promise<any>;
    deleteLocalHighlight(id: any): Promise<any>;
    deleteAnnotation(highlight: Annotation): Promise<any>;
    addAnnotation(highlight: Annotation): Promise<any>;
    deleteHighlight(highlight: Annotation): Promise<any>;
    deleteSelectedHighlight(highlight: Annotation): Promise<any>;
    saveAnnotation(highlight: IHighlight, marker: AnnotationMarker): Promise<any>;
    getAnnotations(): Promise<any>;
    showHighlights(): Promise<void>;
    drawHighlights(search?: boolean): Promise<void>;
    private createTree;
    private handleAnnotationLinkClick;
    private handleAnnotationLinkDeleteClick;
    private static readableTimestamp;
    getAnnotation(highlight: IHighlight): Promise<any>;
}
