export declare function addEventListenerOptional(element: any, eventType: string, eventListener: any): void;
export declare function removeEventListenerOptional(element: any, eventType: string, eventListener: any): void;
export default class EventHandler {
    onInternalLink: (event: UIEvent) => void;
    onClickThrough: (event: UIEvent) => void;
    setupEvents(element: HTMLElement | Document | null): void;
    private checkForLink;
    private handleLinks;
}
