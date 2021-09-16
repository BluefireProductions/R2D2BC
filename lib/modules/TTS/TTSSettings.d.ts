import Store from "../../store/Store";
import { UserProperty, UserProperties } from "../../model/user-settings/UserProperties";
import { TTSModuleAPI, TTSModuleProperties } from "./TTSModule";
export declare class TTSREFS {
    static readonly COLOR_REF = "color";
    static readonly AUTO_SCROLL_REF = "autoscroll";
    static readonly RATE_REF = "rate";
    static readonly PITCH_REF = "pitch";
    static readonly VOLUME_REF = "volume";
    static readonly VOICE_REF = "voice";
    static readonly COLOR_KEY: string;
    static readonly AUTO_SCROLL_KEY: string;
    static readonly RATE_KEY: string;
    static readonly PITCH_KEY: string;
    static readonly VOLUME_KEY: string;
    static readonly VOICE_KEY: string;
}
export interface TTSSettingsConfig {
    store: Store;
    initialTTSSettings: TTSModuleProperties;
    headerMenu: HTMLElement;
    api: TTSModuleAPI;
}
export interface TTSVoice {
    usePublication: boolean;
    name?: string;
    lang?: string;
}
export interface ITTSUserSettings {
    enableSplitter?: boolean;
    color?: string;
    autoScroll?: boolean;
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: TTSVoice;
}
export declare class TTSSettings implements ITTSUserSettings {
    private readonly store;
    private readonly TTSSETTINGS;
    color: string;
    autoScroll: boolean;
    rate: number;
    pitch: number;
    volume: number;
    voice: TTSVoice;
    userProperties: UserProperties;
    private rateButtons;
    private pitchButtons;
    private volumeButtons;
    private settingsChangeCallback;
    private settingsView;
    private readonly headerMenu;
    private speechRate;
    private speechPitch;
    private speechVolume;
    private speechAutoScroll;
    private readonly api;
    static create(config: TTSSettingsConfig): Promise<any>;
    protected constructor(store: Store, headerMenu: HTMLElement, api: TTSModuleAPI);
    enableSplitter?: boolean;
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
    private getTTSSettings;
    private saveProperty;
    getProperty(name: string): Promise<UserProperty>;
    resetTTSSettings(): Promise<void>;
    applyTTSSettings(ttsSettings: ITTSUserSettings): Promise<void>;
    applyPreferredVoice(value: any): Promise<void>;
    applyTTSSetting(key: any, value: any): Promise<void>;
    increase(incremental: string): Promise<void>;
    decrease(incremental: string): Promise<void>;
}
