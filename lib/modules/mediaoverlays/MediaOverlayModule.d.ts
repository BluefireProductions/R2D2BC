import { Publication } from "../../model/Publication";
import IFrameNavigator from "../../navigator/IFrameNavigator";
import ReaderModule from "../ReaderModule";
import { Link } from "../../model/Link";
import { MediaOverlayNode } from "r2-shared-js/dist/es6-es2015/src/models/media-overlay";
import { MediaOverlaySettings } from "./MediaOverlaySettings";
export interface MediaOverlayModuleAPI {
    started: any;
    stopped: any;
    paused: any;
    resumed: any;
    finished: any;
    updateSettings: any;
}
export interface MediaOverlayModuleProperties {
    color?: string;
    autoScroll?: boolean;
    autoTurn?: boolean;
    volume?: number;
    wait?: number;
}
export interface MediaOverlayModuleConfig extends MediaOverlayModuleProperties {
    publication: Publication;
    delegate: IFrameNavigator;
    api: MediaOverlayModuleAPI;
    settings: MediaOverlaySettings;
}
export default class MediaOverlayModule implements ReaderModule {
    private publication;
    private delegate;
    private audioElement;
    private settings;
    private play;
    private pause;
    private currentAudioBegin;
    private currentAudioEnd;
    private currentLinks;
    private currentLinkIndex;
    private mediaOverlaysPlaybackRate;
    private currentAudioUrl;
    private previousAudioUrl;
    private previousAudioEnd;
    private mediaOverlayRoot;
    private mediaOverlayTextAudioPair;
    private pid;
    static create(config: MediaOverlayModuleConfig): Promise<MediaOverlayModule>;
    private constructor();
    stop(): Promise<void>;
    protected start(): Promise<void>;
    initialize(): Promise<void>;
    initializeResource(links: Array<Link>): Promise<void>;
    private playLink;
    startReadAloud(): Promise<void>;
    stopReadAloud(): void;
    pauseReadAloud(): void;
    resumeReadAloud(): Promise<void>;
    findDepthFirstTextAudioPair(textHref: string, mo: MediaOverlayNode, textFragmentIDChain: Array<string | null> | undefined): MediaOverlayNode | undefined | null;
    ontimeupdate: (ev: Event) => Promise<void>;
    ensureOnTimeUpdate: (remove: boolean) => void;
    mediaOverlaysNext(escape?: boolean): void;
    mediaOverlaysStop(): void;
    mediaOverlaysPause(): void;
    findNextTextAudioPair(mo: MediaOverlayNode, moToMatch: MediaOverlayNode, previousMo: {
        prev: MediaOverlayNode | undefined;
    }, escape: boolean): MediaOverlayNode | undefined | null;
    playMediaOverlaysAudio(moTextAudioPair: MediaOverlayNode, begin: number | undefined, end: number | undefined): Promise<void>;
    playMediaOverlays(textHref: string, rootMo: MediaOverlayNode, textFragmentIDChain: Array<string | null> | undefined): Promise<void>;
    mediaOverlayHighlight(href: string | undefined, id: string | undefined): void;
}
