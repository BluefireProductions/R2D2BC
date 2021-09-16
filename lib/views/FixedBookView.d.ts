import Store from "../store/Store";
import IFrameNavigator, { IFrameAttributes } from "../navigator/IFrameNavigator";
import BookView from "./BookView";
export default class FixedBookView implements BookView {
    layout: string;
    constructor(_store: Store);
    delegate: IFrameNavigator;
    name: string;
    label: string;
    iframe: HTMLIFrameElement;
    iframe2: HTMLIFrameElement;
    sideMargin: number;
    height: number;
    attributes: IFrameAttributes;
    start(): void;
    stop(): void;
    getCurrentPosition(): number;
    goToPosition(_position: number): void;
    goToCssSelector(_cssSelector: string, _relative?: boolean): void;
    goToFragment(_fragment: string, _relative?: boolean): void;
    snap(_element: HTMLElement, _relative?: boolean): void;
    getCurrentPage(): number;
    getPageCount(): number;
}
