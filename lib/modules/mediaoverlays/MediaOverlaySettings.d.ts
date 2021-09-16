import Store from "../../store/Store";
import { UserProperty, UserProperties } from "../../model/user-settings/UserProperties";
import { MediaOverlayModuleAPI, MediaOverlayModuleProperties } from "./MediaOverlayModule";
export declare const R2_MO_CLASS_ACTIVE = "r2-mo-active";
export declare class MEDIAOVERLAYREFS {
    static readonly COLOR_REF = "color";
    static readonly AUTO_SCROLL_REF = "autoscroll";
    static readonly AUTO_TURN_REF = "autoturn";
    static readonly VOLUME_REF = "volume";
    static readonly COLOR_KEY: string;
    static readonly AUTO_SCROLL_KEY: string;
    static readonly AUTO_TURN_KEY: string;
    static readonly VOLUME_KEY: string;
}
export interface MediaOverlayConfig {
    store: Store;
    initialMediaOverlaySettings: MediaOverlayModuleProperties;
    headerMenu: HTMLElement;
    api: MediaOverlayModuleAPI;
}
export interface IMediaOverlayUserSettings {
    color?: string;
    autoScroll?: boolean;
    autoTurn?: boolean;
    volume?: number;
    playing?: boolean;
    wait?: number;
}
export declare class MediaOverlaySettings implements IMediaOverlayUserSettings {
    private readonly store;
    private readonly MEDIAOVERLAYSETTINGS;
    color: string;
    autoScroll: boolean;
    autoTurn: boolean;
    volume: number;
    playing: boolean;
    wait: number;
    userProperties: UserProperties;
    private settingsChangeCallback;
    private settingsView;
    private readonly headerMenu;
    private volumeButtons;
    private speechAutoScroll;
    private speechAutoTurn;
    private speechVolume;
    private readonly api;
    static create(config: MediaOverlayConfig): Promise<any>;
    protected constructor(store: Store, headerMenu: HTMLElement, api: MediaOverlayModuleAPI);
    stop(): Promise<void>;
    private initialise;
    private reset;
    private initializeSelections;
    setControls(): void;
    private renderControls;
    onSettingsChange(callback: () => void): void;
    private setupEvents;
    private storeProperty;
    private updateUserSettings;
    private getMediaOverlaySettings;
    private saveProperty;
    getProperty(name: string): Promise<UserProperty>;
    resetMediaOverlaySettings(): Promise<void>;
    applyMediaOverlaySettings(mediaOverlaySettings: IMediaOverlayUserSettings): Promise<void>;
    applyMediaOverlaySetting(key: any, value: any): Promise<void>;
    increase(incremental: string): Promise<void>;
    decrease(incremental: string): Promise<void>;
}
