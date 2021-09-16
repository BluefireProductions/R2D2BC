export interface InspectorProtectionModuleConfig {
    clearOnInspect?: boolean;
    api: {
        inspectDetected?: () => void;
    };
}
export default class InspectorProtectionModule {
    static start(config: InspectorProtectionModuleConfig): void;
}
