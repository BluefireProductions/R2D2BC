import { ISelectionInfo } from "./selection";
import { AnnotationMarker } from "../../../model/Locator";
export interface IColor {
    red: number;
    green: number;
    blue: number;
}
export interface IHighlight {
    id: string;
    selectionInfo: ISelectionInfo;
    color: IColor;
    pointerInteraction: boolean;
    marker: AnnotationMarker;
    position?: number;
}
export interface IHighlightDefinition {
    selectionInfo: ISelectionInfo | undefined;
    color: IColor | undefined;
}
