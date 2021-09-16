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
 * Developed on behalf of: Bibliotheca LLC
 * Licensed to: Bibliotheca LLC under one or more contributor license agreements.
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
exports.MediaOverlaySettings = exports.MEDIAOVERLAYREFS = exports.R2_MO_CLASS_ACTIVE = void 0;
const UserProperties_1 = require("../../model/user-settings/UserProperties");
const HTMLUtilities = require("../../utils/HTMLUtilities");
const __1 = require("../..");
const EventHandler_1 = require("../../utils/EventHandler");
exports.R2_MO_CLASS_ACTIVE = "r2-mo-active";
class MEDIAOVERLAYREFS {
}
exports.MEDIAOVERLAYREFS = MEDIAOVERLAYREFS;
MEDIAOVERLAYREFS.COLOR_REF = "color";
MEDIAOVERLAYREFS.AUTO_SCROLL_REF = "autoscroll";
MEDIAOVERLAYREFS.AUTO_TURN_REF = "autoturn";
MEDIAOVERLAYREFS.VOLUME_REF = "volume";
MEDIAOVERLAYREFS.COLOR_KEY = "mediaoverlay-" + MEDIAOVERLAYREFS.COLOR_REF;
MEDIAOVERLAYREFS.AUTO_SCROLL_KEY = "mediaoverlay-" + MEDIAOVERLAYREFS.AUTO_SCROLL_REF;
MEDIAOVERLAYREFS.AUTO_TURN_KEY = "mediaoverlay-" + MEDIAOVERLAYREFS.AUTO_TURN_REF;
MEDIAOVERLAYREFS.VOLUME_KEY = "mediaoverlay-" + MEDIAOVERLAYREFS.VOLUME_REF;
class MediaOverlaySettings {
    constructor(store, headerMenu, api) {
        this.MEDIAOVERLAYSETTINGS = "mediaOverlaySetting";
        this.color = "r2-mo-active";
        this.autoScroll = true;
        this.autoTurn = true;
        this.volume = 1.0;
        this.playing = false;
        this.wait = 1;
        this.settingsChangeCallback = () => { };
        this.store = store;
        this.api = api;
        this.headerMenu = headerMenu;
        this.initialise();
        console.log(this.api);
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = new this(config.store, config.headerMenu, config.api);
            if (config.initialMediaOverlaySettings) {
                let initialSettings = config.initialMediaOverlaySettings;
                if (initialSettings === null || initialSettings === void 0 ? void 0 : initialSettings.color) {
                    settings.color = initialSettings.color;
                    if (__1.IS_DEV)
                        console.log(settings.color);
                }
                if (initialSettings === null || initialSettings === void 0 ? void 0 : initialSettings.autoScroll) {
                    settings.autoScroll = initialSettings.autoScroll;
                    if (__1.IS_DEV)
                        console.log(settings.autoScroll);
                }
                if (initialSettings === null || initialSettings === void 0 ? void 0 : initialSettings.autoTurn) {
                    settings.autoTurn = initialSettings.autoTurn;
                    if (__1.IS_DEV)
                        console.log(settings.autoTurn);
                }
                if (initialSettings === null || initialSettings === void 0 ? void 0 : initialSettings.volume) {
                    settings.volume = initialSettings.volume;
                    if (__1.IS_DEV)
                        console.log(settings.volume);
                }
                if (initialSettings === null || initialSettings === void 0 ? void 0 : initialSettings.wait) {
                    settings.wait = initialSettings.wait;
                    if (__1.IS_DEV)
                        console.log(settings.wait);
                }
            }
            yield settings.initializeSelections();
            return new Promise((resolve) => resolve(settings));
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("MediaOverlay settings stop");
            }
        });
    }
    initialise() {
        return __awaiter(this, void 0, void 0, function* () {
            this.autoScroll =
                (yield this.getProperty(MEDIAOVERLAYREFS.AUTO_SCROLL_KEY)) != null
                    ? (yield this.getProperty(MEDIAOVERLAYREFS.AUTO_SCROLL_KEY)).value
                    : this.autoScroll;
            this.autoTurn =
                (yield this.getProperty(MEDIAOVERLAYREFS.AUTO_TURN_KEY)) != null
                    ? (yield this.getProperty(MEDIAOVERLAYREFS.AUTO_TURN_KEY)).value
                    : this.autoTurn;
            this.color =
                (yield this.getProperty(MEDIAOVERLAYREFS.COLOR_KEY)) != null
                    ? (yield this.getProperty(MEDIAOVERLAYREFS.COLOR_KEY))
                        .value
                    : this.color;
            this.volume =
                (yield this.getProperty(MEDIAOVERLAYREFS.VOLUME_KEY)) != null
                    ? (yield this.getProperty(MEDIAOVERLAYREFS.VOLUME_KEY))
                        .value
                    : this.volume;
            this.userProperties = this.getMediaOverlaySettings();
        });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            this.color = "redtext";
            this.autoScroll = true;
            this.autoTurn = true;
            this.volume = 1.0;
            this.wait = 1;
            this.userProperties = this.getMediaOverlaySettings();
        });
    }
    initializeSelections() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.headerMenu)
                this.settingsView = HTMLUtilities.findElement(this.headerMenu, "#container-view-mediaoverlay-settings");
        });
    }
    setControls() {
        if (this.settingsView)
            this.renderControls(this.settingsView);
    }
    renderControls(element) {
        this.volumeButtons = {};
        for (const volumeName of ["decrease", "increase"]) {
            this.volumeButtons[volumeName] = HTMLUtilities.findElement(element, "#" + volumeName + "-volume");
        }
        if (this.headerMenu)
            this.speechAutoTurn = HTMLUtilities.findElement(this.headerMenu, "#mediaOverlayAutoTurn");
        if (this.headerMenu)
            this.speechAutoScroll = HTMLUtilities.findElement(this.headerMenu, "#mediaOverlayAutoScroll");
        if (this.headerMenu)
            this.speechVolume = HTMLUtilities.findElement(this.headerMenu, "#mediaOverlayVolume");
        this.setupEvents();
        if (this.speechAutoScroll)
            this.speechAutoScroll.checked = this.autoScroll;
        if (this.speechAutoTurn)
            this.speechAutoTurn.checked = this.autoTurn;
        if (this.speechVolume)
            this.speechVolume.value = this.volume.toString();
        // Clicking the settings view outside the ul hides it, but clicking inside the ul keeps it up.
        EventHandler_1.addEventListenerOptional(HTMLUtilities.findElement(element, "ul"), "click", (event) => {
            event.stopPropagation();
        });
    }
    onSettingsChange(callback) {
        this.settingsChangeCallback = callback;
    }
    setupEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            EventHandler_1.addEventListenerOptional(this.volumeButtons["decrease"], "click", (event) => {
                if (__1.IS_DEV)
                    console.log(MEDIAOVERLAYREFS.VOLUME_REF);
                this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF).decrement();
                this.storeProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF));
                this.settingsChangeCallback();
                event.preventDefault();
            });
            EventHandler_1.addEventListenerOptional(this.volumeButtons["increase"], "click", (event) => {
                if (__1.IS_DEV)
                    console.log(MEDIAOVERLAYREFS.VOLUME_REF);
                this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF).increment();
                this.storeProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF));
                this.settingsChangeCallback();
                event.preventDefault();
            });
        });
    }
    storeProperty(property) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateUserSettings();
            this.saveProperty(property);
        });
    }
    updateUserSettings() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            var syncSettings = {
                color: this.userProperties.getByRef(MEDIAOVERLAYREFS.COLOR_REF).value,
                autoScroll: this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_SCROLL_REF)
                    .value,
                autoTurn: this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_TURN_REF)
                    .value,
                volume: this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF).value,
            };
            this.applyMediaOverlaySettings(syncSettings);
            if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.updateSettings) {
                (_b = this.api) === null || _b === void 0 ? void 0 : _b.updateSettings(syncSettings).then((settings) => __awaiter(this, void 0, void 0, function* () {
                    if (__1.IS_DEV) {
                        console.log("api updated sync settings", settings);
                    }
                }));
            }
        });
    }
    getMediaOverlaySettings() {
        var userProperties = new UserProperties_1.UserProperties();
        userProperties.addSwitchable("mediaoverlay-auto-scroll-off", "mediaoverlay-auto-scroll-on", this.autoScroll, MEDIAOVERLAYREFS.AUTO_SCROLL_REF, MEDIAOVERLAYREFS.AUTO_SCROLL_KEY);
        userProperties.addSwitchable("mediaoverlay-auto-turn-off", "mediaoverlay-auto-turn-on", this.autoTurn, MEDIAOVERLAYREFS.AUTO_TURN_REF, MEDIAOVERLAYREFS.AUTO_TURN_KEY);
        userProperties.addStringable(this.color, MEDIAOVERLAYREFS.COLOR_REF, MEDIAOVERLAYREFS.COLOR_KEY);
        userProperties.addIncremental(this.volume, 0.1, 1, 0.1, "", MEDIAOVERLAYREFS.VOLUME_REF, MEDIAOVERLAYREFS.VOLUME_KEY);
        return userProperties;
    }
    saveProperty(property) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedProperties = yield this.store.get(this.MEDIAOVERLAYSETTINGS);
            if (savedProperties) {
                let array = JSON.parse(savedProperties);
                array = array.filter((el) => el.name !== property.name);
                array.push(property);
                yield this.store.set(this.MEDIAOVERLAYSETTINGS, JSON.stringify(array));
            }
            else {
                let array = [];
                array.push(property);
                yield this.store.set(this.MEDIAOVERLAYSETTINGS, JSON.stringify(array));
            }
            return new Promise((resolve) => resolve(property));
        });
    }
    getProperty(name) {
        return __awaiter(this, void 0, void 0, function* () {
            let array = yield this.store.get(this.MEDIAOVERLAYSETTINGS);
            if (array) {
                let properties = JSON.parse(array);
                properties = properties.filter((el) => el.name === name);
                if (properties.length === 0) {
                    return null;
                }
                return properties[0];
            }
            return null;
        });
    }
    resetMediaOverlaySettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.remove(this.MEDIAOVERLAYSETTINGS);
            yield this.reset();
            this.settingsChangeCallback();
        });
    }
    applyMediaOverlaySettings(mediaOverlaySettings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mediaOverlaySettings.color) {
                this.color = mediaOverlaySettings.color;
                this.userProperties.getByRef(MEDIAOVERLAYREFS.COLOR_REF).value =
                    this.color;
                yield this.saveProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.COLOR_REF));
                this.settingsChangeCallback();
            }
            if (mediaOverlaySettings.autoScroll !== undefined) {
                if (__1.IS_DEV)
                    console.log("autoScroll " + this.autoScroll);
                this.autoScroll = mediaOverlaySettings.autoScroll;
                this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_SCROLL_REF).value =
                    this.autoScroll;
                yield this.saveProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_SCROLL_REF));
                this.settingsChangeCallback();
            }
            if (mediaOverlaySettings.autoTurn !== undefined) {
                if (__1.IS_DEV)
                    console.log("autoTurn " + this.autoTurn);
                this.autoTurn = mediaOverlaySettings.autoTurn;
                this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_TURN_REF).value =
                    this.autoTurn;
                yield this.saveProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_TURN_REF));
                this.settingsChangeCallback();
            }
            if (mediaOverlaySettings.volume) {
                if (__1.IS_DEV)
                    console.log("volume " + this.volume);
                this.volume = mediaOverlaySettings.volume;
                this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF).value =
                    this.volume;
                yield this.saveProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF));
                this.settingsChangeCallback();
            }
        });
    }
    applyMediaOverlaySetting(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (key === MEDIAOVERLAYREFS.COLOR_REF) {
                this.color = value;
                this.userProperties.getByRef(MEDIAOVERLAYREFS.COLOR_REF).value =
                    this.color;
                yield this.saveProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.COLOR_REF));
                this.settingsChangeCallback();
            }
            else if (key === MEDIAOVERLAYREFS.AUTO_SCROLL_REF) {
                this.autoScroll = value;
                this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_SCROLL_REF).value =
                    this.autoScroll;
                yield this.saveProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_SCROLL_REF));
                this.settingsChangeCallback();
            }
            else if (key === MEDIAOVERLAYREFS.AUTO_TURN_REF) {
                this.autoTurn = value;
                this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_TURN_REF).value =
                    this.autoTurn;
                yield this.saveProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.AUTO_TURN_REF));
                this.settingsChangeCallback();
            }
        });
    }
    increase(incremental) {
        return __awaiter(this, void 0, void 0, function* () {
            if (incremental === "volume") {
                this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF).increment();
                this.storeProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF));
                this.settingsChangeCallback();
            }
        });
    }
    decrease(incremental) {
        return __awaiter(this, void 0, void 0, function* () {
            if (incremental === "volume") {
                this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF).decrement();
                this.storeProperty(this.userProperties.getByRef(MEDIAOVERLAYREFS.VOLUME_REF));
                this.settingsChangeCallback();
            }
        });
    }
}
exports.MediaOverlaySettings = MediaOverlaySettings;
//# sourceMappingURL=MediaOverlaySettings.js.map