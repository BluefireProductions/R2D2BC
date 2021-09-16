import IFrameNavigator from "../navigator/IFrameNavigator";
export default class KeyboardEventHandler {
    delegate: IFrameNavigator;
    onBackwardSwipe: (event: UIEvent) => void;
    onForwardSwipe: (event: UIEvent) => void;
    setupEvents: (element: HTMLElement | Document) => void;
    focusin: (element: HTMLElement | Document) => void;
    keydown: (element: HTMLElement | Document) => void;
}
