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
 * Developed on behalf of: CAST (http://www.cast.org)
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
exports.TTSSettings = exports.TTSREFS = void 0;
const UserProperties_1 = require("../../model/user-settings/UserProperties");
const HTMLUtilities = require("../../utils/HTMLUtilities");
const __1 = require("../..");
const EventHandler_1 = require("../../utils/EventHandler");
class TTSREFS {
}
exports.TTSREFS = TTSREFS;
TTSREFS.COLOR_REF = "color";
TTSREFS.AUTO_SCROLL_REF = "autoscroll";
TTSREFS.RATE_REF = "rate";
TTSREFS.PITCH_REF = "pitch";
TTSREFS.VOLUME_REF = "volume";
TTSREFS.VOICE_REF = "voice";
TTSREFS.COLOR_KEY = "tts-" + TTSREFS.COLOR_REF;
TTSREFS.AUTO_SCROLL_KEY = "tts-" + TTSREFS.AUTO_SCROLL_REF;
TTSREFS.RATE_KEY = "tts-" + TTSREFS.RATE_REF;
TTSREFS.PITCH_KEY = "tts-" + TTSREFS.PITCH_REF;
TTSREFS.VOLUME_KEY = "tts-" + TTSREFS.VOLUME_REF;
TTSREFS.VOICE_KEY = "tts-" + TTSREFS.VOICE_REF;
class TTSSettings {
    constructor(store, headerMenu, api) {
        this.TTSSETTINGS = "ttsSetting";
        this.color = "orange";
        this.autoScroll = true;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
        this.voice = {
            usePublication: true,
        };
        this.settingsChangeCallback = () => { };
        this.store = store;
        this.api = api;
        this.headerMenu = headerMenu;
        this.initialise();
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = new this(config.store, config.headerMenu, config.api);
            if (config.initialTTSSettings) {
                let initialTTSSettings = config.initialTTSSettings;
                if (initialTTSSettings === null || initialTTSSettings === void 0 ? void 0 : initialTTSSettings.rate) {
                    settings.rate = initialTTSSettings.rate;
                    if (__1.IS_DEV)
                        console.log(settings.rate);
                }
                if (initialTTSSettings === null || initialTTSSettings === void 0 ? void 0 : initialTTSSettings.pitch) {
                    settings.pitch = initialTTSSettings.pitch;
                    if (__1.IS_DEV)
                        console.log(settings.pitch);
                }
                if (initialTTSSettings === null || initialTTSSettings === void 0 ? void 0 : initialTTSSettings.volume) {
                    settings.volume = initialTTSSettings.volume;
                    if (__1.IS_DEV)
                        console.log(settings.volume);
                }
                if (initialTTSSettings === null || initialTTSSettings === void 0 ? void 0 : initialTTSSettings.color) {
                    settings.color = initialTTSSettings.color;
                    if (__1.IS_DEV)
                        console.log(settings.color);
                }
                if (initialTTSSettings === null || initialTTSSettings === void 0 ? void 0 : initialTTSSettings.autoScroll) {
                    settings.autoScroll = initialTTSSettings.autoScroll;
                    if (__1.IS_DEV)
                        console.log(settings.autoScroll);
                }
                if (initialTTSSettings === null || initialTTSSettings === void 0 ? void 0 : initialTTSSettings.voice) {
                    settings.voice = initialTTSSettings.voice;
                    if (__1.IS_DEV)
                        console.log(settings.voice);
                }
            }
            yield settings.initializeSelections();
            return new Promise((resolve) => resolve(settings));
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("tts settings stop");
            }
        });
    }
    initialise() {
        return __awaiter(this, void 0, void 0, function* () {
            this.autoScroll =
                (yield this.getProperty(TTSREFS.AUTO_SCROLL_KEY)) != null
                    ? (yield this.getProperty(TTSREFS.AUTO_SCROLL_KEY))
                        .value
                    : this.autoScroll;
            this.rate =
                (yield this.getProperty(TTSREFS.RATE_KEY)) != null
                    ? (yield this.getProperty(TTSREFS.RATE_KEY)).value
                    : this.rate;
            this.pitch =
                (yield this.getProperty(TTSREFS.PITCH_KEY)) != null
                    ? (yield this.getProperty(TTSREFS.PITCH_KEY)).value
                    : this.pitch;
            this.volume =
                (yield this.getProperty(TTSREFS.VOLUME_KEY)) != null
                    ? (yield this.getProperty(TTSREFS.VOLUME_KEY)).value
                    : this.volume;
            this.color =
                (yield this.getProperty(TTSREFS.COLOR_KEY)) != null
                    ? (yield this.getProperty(TTSREFS.COLOR_KEY)).value
                    : this.color;
            this.voice =
                (yield this.getProperty(TTSREFS.VOICE_REF)) != null
                    ? (yield this.getProperty(TTSREFS.VOICE_REF)).value
                    : this.voice;
            this.userProperties = this.getTTSSettings();
        });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            this.color = "orange";
            this.autoScroll = true;
            this.rate = 1.0;
            this.pitch = 1.0;
            this.volume = 1.0;
            this.voice = {
                usePublication: true,
            };
            this.userProperties = this.getTTSSettings();
        });
    }
    initializeSelections() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.headerMenu)
                this.settingsView = HTMLUtilities.findElement(this.headerMenu, "#container-view-tts-settings");
        });
    }
    setControls() {
        if (this.settingsView)
            this.renderControls(this.settingsView);
    }
    renderControls(element) {
        this.rateButtons = {};
        for (const rateName of ["decrease", "increase"]) {
            this.rateButtons[rateName] = HTMLUtilities.findElement(element, "#" + rateName + "-rate");
        }
        this.pitchButtons = {};
        for (const pitchName of ["decrease", "increase"]) {
            this.pitchButtons[pitchName] = HTMLUtilities.findElement(element, "#" + pitchName + "-pitch");
        }
        this.volumeButtons = {};
        for (const volumeName of ["decrease", "increase"]) {
            this.volumeButtons[volumeName] = HTMLUtilities.findElement(element, "#" + volumeName + "-volume");
        }
        if (this.headerMenu)
            this.speechRate = HTMLUtilities.findElement(this.headerMenu, "#speechRate");
        if (this.headerMenu)
            this.speechPitch = HTMLUtilities.findElement(this.headerMenu, "#speechPitch");
        if (this.headerMenu)
            this.speechVolume = HTMLUtilities.findElement(this.headerMenu, "#speechVolume");
        if (this.headerMenu)
            this.speechAutoScroll = HTMLUtilities.findElement(this.headerMenu, "#autoScroll");
        this.setupEvents();
        if (this.speechRate)
            this.speechRate.value = this.rate.toString();
        if (this.speechPitch)
            this.speechPitch.value = this.pitch.toString();
        if (this.speechVolume)
            this.speechVolume.value = this.volume.toString();
        if (this.speechAutoScroll)
            this.speechAutoScroll.checked = this.autoScroll;
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
            EventHandler_1.addEventListenerOptional(this.rateButtons["decrease"], "click", (event) => {
                if (__1.IS_DEV)
                    console.log(TTSREFS.RATE_REF);
                this.userProperties.getByRef(TTSREFS.RATE_REF).decrement();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.RATE_REF));
                this.settingsChangeCallback();
                event.preventDefault();
            });
            EventHandler_1.addEventListenerOptional(this.rateButtons["increase"], "click", (event) => {
                if (__1.IS_DEV)
                    console.log(TTSREFS.RATE_REF);
                this.userProperties.getByRef(TTSREFS.RATE_REF).increment();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.RATE_REF));
                this.settingsChangeCallback();
                event.preventDefault();
            });
            EventHandler_1.addEventListenerOptional(this.pitchButtons["decrease"], "click", (event) => {
                if (__1.IS_DEV)
                    console.log(TTSREFS.PITCH_REF);
                this.userProperties.getByRef(TTSREFS.PITCH_REF).decrement();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.PITCH_REF));
                this.settingsChangeCallback();
                event.preventDefault();
            });
            EventHandler_1.addEventListenerOptional(this.pitchButtons["increase"], "click", (event) => {
                if (__1.IS_DEV)
                    console.log(TTSREFS.PITCH_REF);
                this.userProperties.getByRef(TTSREFS.PITCH_REF).increment();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.PITCH_REF));
                this.settingsChangeCallback();
                event.preventDefault();
            });
            EventHandler_1.addEventListenerOptional(this.volumeButtons["decrease"], "click", (event) => {
                if (__1.IS_DEV)
                    console.log(TTSREFS.VOLUME_REF);
                this.userProperties.getByRef(TTSREFS.VOLUME_REF).decrement();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.VOLUME_REF));
                this.settingsChangeCallback();
                event.preventDefault();
            });
            EventHandler_1.addEventListenerOptional(this.volumeButtons["increase"], "click", (event) => {
                if (__1.IS_DEV)
                    console.log(TTSREFS.VOLUME_REF);
                this.userProperties.getByRef(TTSREFS.VOLUME_REF).increment();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.VOLUME_REF));
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
            var ttsSettings = {
                rate: this.userProperties.getByRef(TTSREFS.RATE_REF).value,
                pitch: this.userProperties.getByRef(TTSREFS.PITCH_REF).value,
                volume: this.userProperties.getByRef(TTSREFS.VOLUME_REF).value,
                voice: this.userProperties.getByRef(TTSREFS.VOLUME_REF).value,
                color: this.userProperties.getByRef(TTSREFS.COLOR_REF).value,
                autoScroll: this.userProperties.getByRef(TTSREFS.AUTO_SCROLL_REF).value,
            };
            this.applyTTSSettings(ttsSettings);
            if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.updateSettings) {
                (_b = this.api) === null || _b === void 0 ? void 0 : _b.updateSettings(ttsSettings).then((settings) => __awaiter(this, void 0, void 0, function* () {
                    if (__1.IS_DEV) {
                        console.log("api updated tts settings", settings);
                    }
                }));
            }
        });
    }
    getTTSSettings() {
        var userProperties = new UserProperties_1.UserProperties();
        userProperties.addSwitchable("tts-auto-scroll-off", "tts-auto-scroll-on", this.autoScroll, TTSREFS.AUTO_SCROLL_REF, TTSREFS.AUTO_SCROLL_KEY);
        userProperties.addIncremental(this.rate, 0.1, 10, 0.1, "", TTSREFS.RATE_REF, TTSREFS.RATE_KEY);
        userProperties.addIncremental(this.pitch, 0.1, 2, 0.1, "", TTSREFS.PITCH_REF, TTSREFS.PITCH_KEY);
        userProperties.addIncremental(this.volume, 0.1, 1, 0.1, "", TTSREFS.VOLUME_REF, TTSREFS.VOLUME_KEY);
        userProperties.addStringable(this.color, TTSREFS.COLOR_REF, TTSREFS.COLOR_KEY);
        userProperties.addJSONable(JSON.stringify(this.voice), TTSREFS.VOICE_REF, TTSREFS.VOICE_KEY);
        return userProperties;
    }
    saveProperty(property) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedProperties = yield this.store.get(this.TTSSETTINGS);
            if (savedProperties) {
                let array = JSON.parse(savedProperties);
                array = array.filter((el) => el.name !== property.name);
                array.push(property);
                yield this.store.set(this.TTSSETTINGS, JSON.stringify(array));
            }
            else {
                let array = [];
                array.push(property);
                yield this.store.set(this.TTSSETTINGS, JSON.stringify(array));
            }
            return new Promise((resolve) => resolve(property));
        });
    }
    getProperty(name) {
        return __awaiter(this, void 0, void 0, function* () {
            let array = yield this.store.get(this.TTSSETTINGS);
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
    resetTTSSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.remove(this.TTSSETTINGS);
            yield this.reset();
            this.settingsChangeCallback();
        });
    }
    applyTTSSettings(ttsSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ttsSettings.rate) {
                if (__1.IS_DEV)
                    console.log("rate " + this.rate);
                this.rate = ttsSettings.rate;
                this.userProperties.getByRef(TTSREFS.RATE_REF).value = this.rate;
                yield this.saveProperty(this.userProperties.getByRef(TTSREFS.RATE_REF));
                this.settingsChangeCallback();
            }
            if (ttsSettings.pitch) {
                if (__1.IS_DEV)
                    console.log("pitch " + this.pitch);
                this.pitch = ttsSettings.pitch;
                this.userProperties.getByRef(TTSREFS.PITCH_REF).value = this.pitch;
                yield this.saveProperty(this.userProperties.getByRef(TTSREFS.PITCH_REF));
                this.settingsChangeCallback();
            }
            if (ttsSettings.volume) {
                if (__1.IS_DEV)
                    console.log("volume " + this.volume);
                this.volume = ttsSettings.volume;
                this.userProperties.getByRef(TTSREFS.VOLUME_REF).value = this.volume;
                yield this.saveProperty(this.userProperties.getByRef(TTSREFS.VOLUME_REF));
                this.settingsChangeCallback();
            }
            if (ttsSettings.color) {
                this.color = ttsSettings.color;
                this.userProperties.getByRef(TTSREFS.COLOR_REF).value = this.color;
                yield this.saveProperty(this.userProperties.getByRef(TTSREFS.COLOR_REF));
                this.settingsChangeCallback();
            }
            if (ttsSettings.autoScroll !== undefined) {
                if (__1.IS_DEV)
                    console.log("autoScroll " + this.autoScroll);
                this.autoScroll = ttsSettings.autoScroll;
                this.userProperties.getByRef(TTSREFS.AUTO_SCROLL_REF).value =
                    this.autoScroll;
                yield this.saveProperty(this.userProperties.getByRef(TTSREFS.AUTO_SCROLL_REF));
                this.settingsChangeCallback();
            }
            if (ttsSettings.voice) {
                if (__1.IS_DEV)
                    console.log("voice " + this.voice);
                this.voice = ttsSettings.voice;
                this.userProperties.getByRef(TTSREFS.VOICE_REF).value = this.voice;
                yield this.saveProperty(this.userProperties.getByRef(TTSREFS.VOICE_REF));
                this.settingsChangeCallback();
            }
        });
    }
    applyPreferredVoice(value) {
        return __awaiter(this, void 0, void 0, function* () {
            var name = value.indexOf(":") !== -1
                ? value.slice(0, value.indexOf(":"))
                : undefined;
            var lang = value.indexOf(":") !== -1 ? value.slice(value.indexOf(":") + 1) : value;
            if (name !== undefined && lang !== undefined) {
                this.applyTTSSetting("voice", {
                    usePublication: true,
                    name: name,
                    lang: lang,
                });
            }
            else if (lang !== undefined && name === undefined) {
                this.applyTTSSetting("voice", { usePublication: true, lang: lang });
            }
        });
    }
    applyTTSSetting(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (key === TTSREFS.COLOR_REF) {
                this.color = value;
                this.userProperties.getByRef(TTSREFS.COLOR_REF).value = this.color;
                yield this.saveProperty(this.userProperties.getByRef(TTSREFS.COLOR_REF));
                this.settingsChangeCallback();
            }
            else if (key === TTSREFS.AUTO_SCROLL_REF) {
                this.autoScroll = value;
                this.userProperties.getByRef(TTSREFS.AUTO_SCROLL_REF).value =
                    this.autoScroll;
                yield this.saveProperty(this.userProperties.getByRef(TTSREFS.AUTO_SCROLL_REF));
                this.settingsChangeCallback();
            }
            else if (key === TTSREFS.VOICE_REF) {
                this.voice = value;
                this.userProperties.getByRef(TTSREFS.VOICE_REF).value = this.voice;
                yield this.saveProperty(this.userProperties.getByRef(TTSREFS.VOICE_REF));
                this.settingsChangeCallback();
            }
        });
    }
    increase(incremental) {
        return __awaiter(this, void 0, void 0, function* () {
            if (incremental === "rate") {
                this.userProperties.getByRef(TTSREFS.RATE_REF).increment();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.RATE_REF));
                this.settingsChangeCallback();
            }
            else if (incremental === "pitch") {
                this.userProperties.getByRef(TTSREFS.PITCH_REF).increment();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.PITCH_REF));
                this.settingsChangeCallback();
            }
            else if (incremental === "volume") {
                this.userProperties.getByRef(TTSREFS.VOLUME_REF).increment();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.VOLUME_REF));
                this.settingsChangeCallback();
            }
        });
    }
    decrease(incremental) {
        return __awaiter(this, void 0, void 0, function* () {
            if (incremental === "rate") {
                this.userProperties.getByRef(TTSREFS.RATE_REF).decrement();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.RATE_REF));
                this.settingsChangeCallback();
            }
            else if (incremental === "pitch") {
                this.userProperties.getByRef(TTSREFS.PITCH_REF).decrement();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.PITCH_REF));
                this.settingsChangeCallback();
            }
            else if (incremental === "volume") {
                this.userProperties.getByRef(TTSREFS.VOLUME_REF).decrement();
                this.storeProperty(this.userProperties.getByRef(TTSREFS.VOLUME_REF));
                this.settingsChangeCallback();
            }
        });
    }
}
exports.TTSSettings = TTSSettings;
//# sourceMappingURL=TTSSettings.js.map