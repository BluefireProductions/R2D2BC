import ReaderModule from "../ReaderModule";
import IFrameNavigator from "../../navigator/IFrameNavigator";
export interface ContentProtectionModuleProperties {
    enforceSupportedBrowsers: boolean;
    enableEncryption: boolean;
    enableObfuscation: boolean;
    disablePrint: boolean;
    disableCopy: boolean;
    detectInspect: boolean;
    clearOnInspect: boolean;
    disableKeys: boolean;
    disableContextMenu: boolean;
    hideTargetUrl: boolean;
    disableDrag: boolean;
    supportedBrowsers: [];
}
export interface ContentProtectionModuleConfig extends ContentProtectionModuleProperties {
    delegate: IFrameNavigator;
    api: ContentProtectionModuleAPI;
}
export interface ContentProtectionModuleAPI {
    inspectDetected: any;
}
interface ContentProtectionRect {
    node: Element;
    height: number;
    top: number;
    width: number;
    left: number;
    textContent: string;
    scrambledTextContent: string;
    isObfuscated: boolean;
}
export default class ContentProtectionModule implements ReaderModule {
    private rects;
    private delegate;
    private properties;
    private hasEventListener;
    private isHacked;
    private securityContainer;
    private mutationObserver;
    static create(config: ContentProtectionModuleConfig): Promise<ContentProtectionModule>;
    constructor(delegate: IFrameNavigator, properties?: ContentProtectionModuleProperties | null);
    protected start(): Promise<void>;
    stop(): Promise<void>;
    observe(): any;
    deactivate(): Promise<void>;
    activate(): Promise<void>;
    private setupEvents;
    initializeResource(): void;
    initialize(): Promise<void>;
    handleScroll(): void;
    handleResize(): void;
    disableContext(e: {
        preventDefault: () => void;
        stopPropagation: () => void;
    }): boolean;
    disableSave(event: {
        keyCode: any;
        metaKey: any;
        ctrlKey: any;
        key: string;
        preventDefault: () => void;
        stopPropagation: () => void;
    }): boolean;
    preventCopy(event: {
        clipboardData: {
            setData: (arg0: string, arg1: any) => void;
        };
        preventDefault: () => void;
        stopPropagation: () => void;
    }): boolean;
    beforePrint(event: {
        preventDefault: () => void;
        stopPropagation: () => void;
    }): boolean;
    afterPrint(event: {
        preventDefault: () => void;
        stopPropagation: () => void;
    }): boolean;
    hideTargetUrls(activate: any): void;
    preventDrag(activate: any): void;
    recalculate(delay?: number): void;
    calcRects(rects: Array<ContentProtectionRect>): void;
    deactivateRect(rect: ContentProtectionRect, securityContainer: HTMLElement, isHacked: boolean): void;
    toggleRect(rect: ContentProtectionRect, securityContainer: HTMLElement, isHacked: boolean): void;
    findRects(parent: HTMLElement): Array<ContentProtectionRect>;
    obfuscateText(text: string): string;
    measureTextNode(node: Element): any;
    isBeingHacked(element: HTMLElement): boolean;
    isOutsideViewport(rect: ContentProtectionRect): boolean;
    findTextNodes(parentElement: Element, nodes?: Array<Element>): Array<Element>;
    scramble(str: any, letters?: boolean, paragraph?: boolean): any;
}
export {};
