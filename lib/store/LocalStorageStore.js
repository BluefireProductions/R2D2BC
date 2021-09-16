"use strict";
/*
 * Copyright 2018-2020 DITA (AM Consulting LLC)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Developed on behalf of: Bokbasen AS (https://www.bokbasen.no)
 * Licensed to: Bokbasen AS and CAST under one or more contributor license agreements.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const MemoryStore_1 = require("./MemoryStore");
/** Class that stores key/value pairs in localStorage if possible
    but falls back to an in-memory store. */
class LocalStorageStore {
    constructor(config) {
        this.prefix = config.prefix;
        this.useLocalStorage = config.useLocalStorage;
        try {
            // In some browsers (eg iOS Safari in private mode),
            // localStorage exists but throws an exception when
            // you try to write to it.
            const testKey = config.prefix + "-" + String(Math.random());
            if (this.useLocalStorage) {
                window.localStorage.setItem(testKey, "test");
                window.localStorage.removeItem(testKey);
            }
            else {
                window.sessionStorage.setItem(testKey, "test");
                window.sessionStorage.removeItem(testKey);
            }
            this.fallbackStore = null;
        }
        catch (e) {
            this.fallbackStore = new MemoryStore_1.default();
        }
    }
    getLocalStorageKey(key) {
        return this.prefix + "-" + key;
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let value = null;
            if (!this.fallbackStore) {
                if (this.useLocalStorage) {
                    value = window.localStorage.getItem(this.getLocalStorageKey(key));
                }
                else {
                    value = window.sessionStorage.getItem(this.getLocalStorageKey(key));
                }
            }
            else {
                value = yield this.fallbackStore.get(key);
            }
            return new Promise((resolve) => resolve(value));
        });
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.fallbackStore) {
                if (this.useLocalStorage) {
                    window.localStorage.setItem(this.getLocalStorageKey(key), value);
                }
                else {
                    window.sessionStorage.setItem(this.getLocalStorageKey(key), value);
                }
            }
            else {
                yield this.fallbackStore.set(key, value);
            }
            return new Promise((resolve) => resolve());
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.fallbackStore) {
                if (this.useLocalStorage) {
                    window.localStorage.removeItem(this.getLocalStorageKey(key));
                }
                else {
                    window.sessionStorage.removeItem(this.getLocalStorageKey(key));
                }
            }
            else {
                yield this.fallbackStore.remove(key);
            }
            return new Promise((resolve) => resolve());
        });
    }
}
exports.default = LocalStorageStore;
//# sourceMappingURL=LocalStorageStore.js.map