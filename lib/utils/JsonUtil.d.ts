export interface IStringMap {
    [key: string]: string;
}
export declare type AnyJson = JsonPrimitives | JsonArray | JsonMap;
export declare type JsonPrimitives = string | number | boolean | null;
export interface JsonMap {
    [key: string]: AnyJson;
}
export interface JsonArray extends Array<AnyJson> {
}
declare type TConstructor<T> = new (value?: any) => T;
export declare function TaJsonDeserialize<T>(json: any, type: TConstructor<T>): T;
export declare function TaJsonSerialize<T>(obj: T): JsonMap;
export {};
