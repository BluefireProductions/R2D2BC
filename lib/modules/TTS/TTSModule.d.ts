import ReaderModule from "../ReaderModule";
import { ISelectionInfo } from "../../model/Locator";
import { TTSSettings, TTSVoice } from "./TTSSettings";
import IFrameNavigator, { ReaderRights } from "../../navigator/IFrameNavigator";
import TextHighlighter from "../highlight/TextHighlighter";
export interface TTSModuleAPI {
    started: any;
    stopped: any;
    paused: any;
    resumed: any;
    finished: any;
    updateSettings: any;
}
export interface TTSModuleProperties {
    enableSplitter?: boolean;
    color?: string;
    autoScroll?: boolean;
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: TTSVoice;
}
export interface TTSModuleConfig extends TTSModuleProperties {
    delegate: IFrameNavigator;
    headerMenu: HTMLElement;
    rights: ReaderRights;
    tts: TTSSettings;
    highlighter: TextHighlighter;
    api: TTSModuleAPI;
}
export default class TTSModule implements ReaderModule {
    private tts;
    private splittingResult;
    private voices;
    private clean;
    private rights;
    private readonly highlighter;
    private delegate;
    private body;
    private hasEventListener;
    private readonly headerMenu;
    private readonly properties;
    private readonly api;
    initialize(body: any): void;
    private initVoices;
    cancel(): void;
    private handleResize;
    index: number;
    speak(selectionInfo: ISelectionInfo | undefined, partial: boolean, callback: () => void): Promise<any>;
    speakPause(): void;
    speakResume(): void;
    static create(config: TTSModuleConfig): Promise<TTSModule>;
    constructor(delegate: IFrameNavigator, tts: TTSSettings, headerMenu: HTMLElement, rights: ReaderRights, highlighter: TextHighlighter, properties?: TTSModuleProperties | null, api?: TTSModuleAPI | null);
    protected start(): Promise<void>;
    userScrolled: boolean;
    private wheel;
    stop(): Promise<void>;
}
