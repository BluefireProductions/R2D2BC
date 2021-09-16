import { Publication } from "../../model/Publication";
import IFrameNavigator from "../../navigator/IFrameNavigator";
import ReaderModule from "../ReaderModule";
export interface TimelineModuleConfig {
    publication: Publication;
    delegate: IFrameNavigator;
}
export default class TimelineModule implements ReaderModule {
    private publication;
    private delegate;
    private timelineContainer;
    private positionSlider;
    static create(config: TimelineModuleConfig): Promise<TimelineModule>;
    private constructor();
    stop(): Promise<void>;
    protected start(): Promise<void>;
    initialize(): Promise<void>;
}
