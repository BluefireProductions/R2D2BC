import Store from "./Store";
/** Class that stores key/value pairs in memory. */
export default class MemoryStore implements Store {
    private readonly store;
    constructor();
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
}
