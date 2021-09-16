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
 * Developed on behalf of: Bokbasen AS (https://www.bokbasen.no), CAST (http://www.cast.org)
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
exports.UserSettings = void 0;
const UserProperties_1 = require("./UserProperties");
const ReadiumCSS_1 = require("./ReadiumCSS");
const HTMLUtilities = require("../../utils/HTMLUtilities");
const __1 = require("../..");
const EventHandler_1 = require("../../utils/EventHandler");
const ReflowableBookView_1 = require("../../views/ReflowableBookView");
const FixedBookView_1 = require("../../views/FixedBookView");
class UserSettings {
    constructor(store, headerMenu, api, injectables, layout) {
        this.USERSETTINGS = "userSetting";
        this.fontSize = 100.0;
        this.fontOverride = false;
        this.fontFamily = 0;
        this.appearance = 0;
        this.verticalScroll = true;
        //Advanced settings
        // publisherDefaults = true;
        this.textAlignment = 0;
        this.columnCount = 0;
        this.wordSpacing = 0.0;
        this.letterSpacing = 0.0;
        this.pageMargins = 2.0;
        this.lineHeight = 1.0;
        this.settingsChangeCallback = () => { };
        this.settingsColumnsChangeCallback = () => { };
        this.viewChangeCallback = () => { };
        this.store = store;
        this.view =
            layout === "fixed"
                ? new FixedBookView_1.default(this.store)
                : new ReflowableBookView_1.default(this.store);
        this.headerMenu = headerMenu;
        this.api = api;
        this.injectables = injectables;
        this.injectables.forEach((injectable) => {
            if (injectable.type === "style") {
                if (injectable.fontFamily) {
                    this.addFont(injectable.fontFamily);
                }
                if (injectable.appearance) {
                    this.addAppearance(injectable.appearance);
                }
            }
        });
    }
    isPaginated() {
        return __awaiter(this, void 0, void 0, function* () {
            let scroll = yield this.getPropertyAndFallback("verticalScroll", ReadiumCSS_1.ReadiumCSS.SCROLL_KEY);
            return scroll === false;
        });
    }
    isScrollMode() {
        return __awaiter(this, void 0, void 0, function* () {
            return !(yield this.isPaginated());
        });
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = new this(config.store, config.headerMenu, config.api, config.injectables, config.layout);
            yield settings.initialise();
            if (config.initialUserSettings) {
                if (!settings.userProperties) {
                    settings.userProperties = settings.getUserSettings();
                }
                let initialUserSettings = config.initialUserSettings;
                if (initialUserSettings.verticalScroll !== undefined) {
                    settings.verticalScroll = this.parseScrollSetting(initialUserSettings.verticalScroll);
                    settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.SCROLL_REF).value =
                        settings.verticalScroll;
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.SCROLL_REF));
                    if (__1.IS_DEV)
                        console.log(settings.verticalScroll);
                }
                if (initialUserSettings.appearance) {
                    settings.appearance = UserSettings.appearanceValues.findIndex((el) => el === initialUserSettings.appearance);
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF));
                    if (__1.IS_DEV)
                        console.log(settings.appearance);
                }
                if (initialUserSettings.fontSize) {
                    settings.fontSize = initialUserSettings.fontSize;
                    settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF).value =
                        settings.fontSize;
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF));
                    if (__1.IS_DEV)
                        console.log(settings.fontSize);
                }
                if (initialUserSettings.fontFamily) {
                    settings.fontFamily = UserSettings.fontFamilyValues.findIndex((el) => el === initialUserSettings.fontFamily);
                    settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).value =
                        settings.fontFamily;
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF));
                    if (__1.IS_DEV)
                        console.log(settings.fontFamily);
                    if (settings.fontFamily !== 0) {
                        settings.fontOverride = true;
                    }
                }
                if (initialUserSettings.textAlignment) {
                    settings.textAlignment = UserSettings.textAlignmentValues.findIndex((el) => el === initialUserSettings.textAlignment);
                    settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_REF).value =
                        settings.textAlignment;
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_REF));
                    // settings.publisherDefaults = false;
                    if (__1.IS_DEV)
                        console.log(settings.textAlignment);
                }
                if (initialUserSettings.columnCount) {
                    settings.columnCount = UserSettings.columnCountValues.findIndex((el) => el === initialUserSettings.columnCount);
                    settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_REF).value =
                        settings.columnCount;
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_REF));
                    if (__1.IS_DEV)
                        console.log(settings.columnCount);
                }
                if (initialUserSettings.wordSpacing) {
                    settings.wordSpacing = initialUserSettings.wordSpacing;
                    settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF).value =
                        settings.wordSpacing;
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF));
                    // settings.publisherDefaults = false;
                    if (__1.IS_DEV)
                        console.log(settings.wordSpacing);
                }
                if (initialUserSettings.letterSpacing) {
                    settings.letterSpacing = initialUserSettings.letterSpacing;
                    settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF).value =
                        settings.letterSpacing;
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF));
                    // settings.publisherDefaults = false;
                    if (__1.IS_DEV)
                        console.log(settings.letterSpacing);
                }
                if (initialUserSettings.pageMargins) {
                    settings.pageMargins = initialUserSettings.pageMargins;
                    settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_REF).value =
                        settings.pageMargins;
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_REF));
                    // settings.publisherDefaults = false;
                    if (__1.IS_DEV)
                        console.log(settings.pageMargins);
                }
                if (initialUserSettings.lineHeight) {
                    settings.lineHeight = initialUserSettings.lineHeight;
                    settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF).value =
                        settings.lineHeight;
                    yield settings.saveProperty(settings.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF));
                    // settings.publisherDefaults = false;
                    if (__1.IS_DEV)
                        console.log(settings.lineHeight);
                }
                settings.userProperties = settings.getUserSettings();
                yield settings.initialise();
            }
            yield settings.initializeSelections();
            return new Promise((resolve) => resolve(settings));
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("book settings stop");
            }
        });
    }
    initialise() {
        return __awaiter(this, void 0, void 0, function* () {
            this.appearance = yield this.getPropertyAndFallback("appearance", ReadiumCSS_1.ReadiumCSS.APPEARANCE_KEY);
            this.verticalScroll = yield this.getPropertyAndFallback("verticalScroll", ReadiumCSS_1.ReadiumCSS.SCROLL_KEY);
            this.fontFamily = yield this.getPropertyAndFallback("fontFamily", ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_KEY);
            if (this.fontFamily !== 0) {
                this.fontOverride = true;
            }
            // this.publisherDefaults =
            //   (await this.getProperty(ReadiumCSS.PUBLISHER_DEFAULT_KEY)) != null
            //     ? ((await this.getProperty(
            //         ReadiumCSS.PUBLISHER_DEFAULT_KEY
            //       )) as Switchable).value
            //     : this.publisherDefaults;
            this.textAlignment = yield this.getPropertyAndFallback("textAlignment", ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_KEY);
            this.columnCount = yield this.getPropertyAndFallback("columnCount", ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_KEY);
            this.fontSize = yield this.getPropertyAndFallback("fontSize", ReadiumCSS_1.ReadiumCSS.FONT_SIZE_KEY);
            this.wordSpacing = yield this.getPropertyAndFallback("wordSpacing", ReadiumCSS_1.ReadiumCSS.WORD_SPACING_KEY);
            this.letterSpacing = yield this.getPropertyAndFallback("letterSpacing", ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_KEY);
            this.pageMargins = yield this.getPropertyAndFallback("pageMargins", ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_KEY);
            this.lineHeight = yield this.getPropertyAndFallback("lineHeight", ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_KEY);
        });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            this.appearance = 0;
            this.verticalScroll = true;
            this.fontSize = 100.0;
            this.fontOverride = false;
            this.fontFamily = 0;
            //Advanced settings
            // this.publisherDefaults = true;
            this.textAlignment = 0;
            this.columnCount = 0;
            this.wordSpacing = 0.0;
            this.letterSpacing = 0.0;
            this.pageMargins = 2.0;
            this.lineHeight = 1.0;
            this.userProperties = this.getUserSettings();
            const html = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "html");
            const rootElement = document.documentElement;
            const body = HTMLUtilities.findRequiredElement(rootElement, "body");
            // // Apply publishers default
            // html.style.removeProperty(ReadiumCSS.PUBLISHER_DEFAULT_KEY);
            // Apply font size
            html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_KEY);
            // Apply word spacing
            html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_KEY);
            // Apply letter spacing
            html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_KEY);
            // Apply column count
            html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_KEY);
            // Apply text alignment
            html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_KEY);
            // Apply line height
            html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_KEY);
            // Apply page margins
            html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_KEY);
            // Apply appearance
            html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.APPEARANCE_KEY);
            HTMLUtilities.setAttr(rootElement, "data-viewer-theme", "day");
            HTMLUtilities.setAttr(body, "data-viewer-theme", "day");
            // Apply font family
            html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_KEY);
            HTMLUtilities.setAttr(html, "data-viewer-font", "publisher");
            html.style.setProperty(ReadiumCSS_1.ReadiumCSS.FONT_OVERRIDE_KEY, "readium-font-off");
        });
    }
    // TODO not really needed
    initializeSelections() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.headerMenu)
                this.settingsView = HTMLUtilities.findElement(this.headerMenu, "#container-view-settings");
        });
    }
    applyProperties() {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            this.userProperties = this.getUserSettings();
            const html = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "html");
            const rootElement = document.documentElement;
            const body = HTMLUtilities.findRequiredElement(rootElement, "body");
            if (((_b = (_a = this.view.delegate.publication.Metadata.Rendition) === null || _a === void 0 ? void 0 : _a.Layout) !== null && _b !== void 0 ? _b : "unknown") !== "fixed") {
                // Apply font size
                if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_KEY)) {
                    html.style.setProperty(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF).toString());
                }
                // Apply word spacing
                if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_KEY)) {
                    // html.style.setProperty(
                    //   ReadiumCSS.PUBLISHER_DEFAULT_KEY,
                    //   "readium-advanced-on"
                    // );
                    html.style.setProperty(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF).toString());
                }
                // Apply letter spacing
                if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_KEY)) {
                    // html.style.setProperty(
                    //   ReadiumCSS.PUBLISHER_DEFAULT_KEY,
                    //   "readium-advanced-on"
                    // );
                    html.style.setProperty(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF).toString());
                }
            }
            // Apply column count
            if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_KEY)) {
                html.style.setProperty(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_REF).toString());
            }
            if (((_d = (_c = this.view.delegate.publication.Metadata.Rendition) === null || _c === void 0 ? void 0 : _c.Layout) !== null && _d !== void 0 ? _d : "unknown") !== "fixed") {
                // Apply text alignment
                if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_KEY)) {
                    if (this.userProperties
                        .getByRef(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_REF)
                        .toString() === "auto") {
                        html.style.removeProperty(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_KEY);
                    }
                    else {
                        // html.style.setProperty(
                        //   ReadiumCSS.PUBLISHER_DEFAULT_KEY,
                        //   "readium-advanced-on"
                        // );
                        html.style.setProperty(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_KEY, this.userProperties
                            .getByRef(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_REF)
                            .toString());
                    }
                }
                // Apply line height
                if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_KEY)) {
                    // html.style.setProperty(
                    //   ReadiumCSS.PUBLISHER_DEFAULT_KEY,
                    //   "readium-advanced-on"
                    // );
                    html.style.setProperty(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF).toString());
                }
                // Apply page margins
                if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_KEY)) {
                    // html.style.setProperty(
                    //   ReadiumCSS.PUBLISHER_DEFAULT_KEY,
                    //   "readium-advanced-on"
                    // );
                    html.style.setProperty(ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_REF).toString());
                }
            }
            // Apply appearance
            if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.APPEARANCE_KEY)) {
                html.style.setProperty(ReadiumCSS_1.ReadiumCSS.APPEARANCE_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF).toString());
                if (this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF).value === 0) {
                    HTMLUtilities.setAttr(rootElement, "data-viewer-theme", "day");
                    HTMLUtilities.setAttr(body, "data-viewer-theme", "day");
                }
                else if (this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF).value === 1) {
                    HTMLUtilities.setAttr(rootElement, "data-viewer-theme", "sepia");
                    HTMLUtilities.setAttr(body, "data-viewer-theme", "sepia");
                }
                else if (this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF).value === 2) {
                    HTMLUtilities.setAttr(rootElement, "data-viewer-theme", "night");
                    HTMLUtilities.setAttr(body, "data-viewer-theme", "night");
                }
            }
            else {
                html.style.setProperty(ReadiumCSS_1.ReadiumCSS.APPEARANCE_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF).toString());
                HTMLUtilities.setAttr(rootElement, "data-viewer-theme", "day");
                HTMLUtilities.setAttr(body, "data-viewer-theme", "day");
            }
            if (((_f = (_e = this.view.delegate.publication.Metadata.Rendition) === null || _e === void 0 ? void 0 : _e.Layout) !== null && _f !== void 0 ? _f : "unknown") !== "fixed") {
                // Apply font family
                if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_KEY)) {
                    html.style.setProperty(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).toString());
                    if (this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).value === 0) {
                        HTMLUtilities.setAttr(html, "data-viewer-font", "publisher");
                        html.style.setProperty(ReadiumCSS_1.ReadiumCSS.FONT_OVERRIDE_KEY, "readium-font-off");
                    }
                    else if (this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).value === 1) {
                        HTMLUtilities.setAttr(html, "data-viewer-font", "serif");
                        html.style.setProperty(ReadiumCSS_1.ReadiumCSS.FONT_OVERRIDE_KEY, "readium-font-on");
                    }
                    else if (this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).value === 2) {
                        HTMLUtilities.setAttr(html, "data-viewer-font", "sans");
                        html.style.setProperty(ReadiumCSS_1.ReadiumCSS.FONT_OVERRIDE_KEY, "readium-font-on");
                    }
                    else {
                        HTMLUtilities.setAttr(html, "data-viewer-font", this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).toString());
                        html.style.setProperty(ReadiumCSS_1.ReadiumCSS.FONT_OVERRIDE_KEY, "readium-font-on");
                    }
                }
                else {
                    html.style.setProperty(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_KEY, this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).toString());
                    HTMLUtilities.setAttr(html, "data-viewer-font", "publisher");
                    html.style.setProperty(ReadiumCSS_1.ReadiumCSS.FONT_OVERRIDE_KEY, "readium-font-off");
                }
                if (yield this.getProperty(ReadiumCSS_1.ReadiumCSS.SCROLL_KEY)) {
                    if (this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.SCROLL_REF).value === true) {
                        html.style.setProperty("--USER__scroll", "readium-scroll-on");
                    }
                    else {
                        html.style.setProperty("--USER__scroll", "readium-scroll-off");
                    }
                }
                else {
                    html.style.setProperty("--USER__scroll", "readium-scroll-on");
                }
                // Apply publishers default
                // if (await this.getProperty(ReadiumCSS.PUBLISHER_DEFAULT_KEY)) {
                //   if (
                //     this.userProperties.getByRef(ReadiumCSS.PUBLISHER_DEFAULT_REF)
                //       .value === true
                //   ) {
                //     html.style.setProperty(
                //       "--USER__advancedSettings",
                //       "readium-advanced-off"
                //     );
                //   } else {
                html.style.setProperty("--USER__advancedSettings", "readium-advanced-on");
                // }
                // } else {
                //   html.style.setProperty(
                //     "--USER__advancedSettings",
                //     "readium-advanced-off"
                //   );
                // }
                this.isScrollMode().then((scroll) => {
                    this.view.setMode(scroll);
                });
            }
        });
    }
    setIframe(iframe) {
        this.iframe = iframe;
        this.view.iframe = iframe;
        if (this.settingsView)
            this.renderControls(this.settingsView);
    }
    renderControls(element) {
        // Clicking the settings view outside the ul hides it, but clicking inside the ul keeps it up.
        EventHandler_1.addEventListenerOptional(HTMLUtilities.findElement(element, "ul"), "click", (event) => {
            event.stopPropagation();
        });
    }
    onSettingsChange(callback) {
        this.settingsChangeCallback = callback;
    }
    onColumnSettingsChange(callback) {
        this.settingsColumnsChangeCallback = callback;
    }
    onViewChange(callback) {
        this.viewChangeCallback = callback;
    }
    storeProperty(property) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateUserSettings();
            yield this.saveProperty(property);
        });
    }
    addAppearance(appearance) {
        if (!UserSettings.appearanceValues.includes(appearance)) {
            UserSettings.appearanceValues.push(appearance);
        }
    }
    initAddedAppearance() {
        this.applyProperties();
    }
    addFont(fontFamily) {
        if (!UserSettings.fontFamilyValues.includes(fontFamily)) {
            UserSettings.fontFamilyValues.push(fontFamily);
        }
    }
    initAddedFont() {
        this.applyProperties();
    }
    updateUserSettings() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let userSettings = {
                fontFamily: UserSettings.fontFamilyValues[yield this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).value],
                fontSize: this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF).value,
                appearance: UserSettings.appearanceValues[yield this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF).value],
                textAlignment: UserSettings.textAlignmentValues[yield this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_REF)
                    .value],
                columnCount: UserSettings.columnCountValues[yield this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_REF).value],
                wordSpacing: this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF)
                    .value,
                letterSpacing: this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF)
                    .value,
                // publisherDefault: this.userProperties.getByRef(
                //   ReadiumCSS.PUBLISHER_DEFAULT_REF
                // ).value,
                verticalScroll: this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.SCROLL_REF).value,
            };
            if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.updateSettings) {
                (_b = this.api) === null || _b === void 0 ? void 0 : _b.updateSettings(userSettings).then((_) => {
                    if (__1.IS_DEV) {
                        console.log("api updated user settings", userSettings);
                    }
                });
            }
        });
    }
    getUserSettings() {
        let userProperties = new UserProperties_1.UserProperties();
        // Publisher default system
        // userProperties.addSwitchable(
        //   "readium-advanced-off",
        //   "readium-advanced-on",
        //   this.publisherDefaults,
        //   ReadiumCSS.PUBLISHER_DEFAULT_REF,
        //   ReadiumCSS.PUBLISHER_DEFAULT_KEY
        // );
        // Font override
        userProperties.addSwitchable("readium-font-on", "readium-font-off", this.fontOverride, ReadiumCSS_1.ReadiumCSS.FONT_OVERRIDE_REF, ReadiumCSS_1.ReadiumCSS.FONT_OVERRIDE_KEY);
        // Column count
        userProperties.addEnumerable(this.columnCount, UserSettings.columnCountValues, ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_REF, ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_KEY);
        // Appearance
        userProperties.addEnumerable(this.appearance, UserSettings.appearanceValues, ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF, ReadiumCSS_1.ReadiumCSS.APPEARANCE_KEY);
        // Page margins
        userProperties.addIncremental(this.pageMargins, 0.5, 4, 0.25, "", ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_REF, ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_KEY);
        // Text alignment
        userProperties.addEnumerable(this.textAlignment, UserSettings.textAlignmentValues, ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_REF, ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_KEY);
        // Font family
        userProperties.addEnumerable(this.fontFamily, UserSettings.fontFamilyValues, ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF, ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_KEY);
        // Font size
        userProperties.addIncremental(this.fontSize, 100, 300, 25, "%", ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF, ReadiumCSS_1.ReadiumCSS.FONT_SIZE_KEY);
        // Line height
        userProperties.addIncremental(this.lineHeight, 1, 2, 0.25, "em", ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF, ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_KEY);
        // Word spacing
        userProperties.addIncremental(this.wordSpacing, 0, 1, 0.25, "rem", ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF, ReadiumCSS_1.ReadiumCSS.WORD_SPACING_KEY);
        // Letter spacing
        userProperties.addIncremental(this.letterSpacing, 0, 0.5, 0.0625, "em", ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF, ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_KEY);
        // Scroll
        userProperties.addSwitchable("readium-scroll-on", "readium-scroll-off", this.verticalScroll, ReadiumCSS_1.ReadiumCSS.SCROLL_REF, ReadiumCSS_1.ReadiumCSS.SCROLL_KEY);
        return userProperties;
    }
    saveProperty(property) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedProperties = yield this.store.get(this.USERSETTINGS);
            if (savedProperties) {
                let array = JSON.parse(savedProperties);
                array = array.filter((el) => el.name !== property.name);
                if (property.value !== undefined) {
                    array.push(property);
                }
                yield this.store.set(this.USERSETTINGS, JSON.stringify(array));
            }
            else {
                let array = [];
                array.push(property);
                yield this.store.set(this.USERSETTINGS, JSON.stringify(array));
            }
            return new Promise((resolve) => resolve(property));
        });
    }
    getProperty(name) {
        return __awaiter(this, void 0, void 0, function* () {
            let array = yield this.store.get(this.USERSETTINGS);
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
    /**
     * If the property doesn't exist in the store, will fall back to the value on this
     */
    getPropertyAndFallback(name, key) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            return (_b = (_a = (yield this.getProperty(key))) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this[name];
        });
    }
    resetUserSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.remove(this.USERSETTINGS);
            yield this.reset();
            this.settingsChangeCallback();
        });
    }
    currentSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                appearance: UserSettings.appearanceValues[this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF).value],
                fontFamily: UserSettings.fontFamilyValues[this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).value],
                textAlignment: UserSettings.textAlignmentValues[this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_REF).value],
                columnCount: UserSettings.columnCountValues[this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_REF).value],
                verticalScroll: this.verticalScroll,
                fontSize: this.fontSize,
                wordSpacing: this.wordSpacing,
                letterSpacing: this.letterSpacing,
                pageMargins: this.pageMargins,
                lineHeight: this.lineHeight,
            };
        });
    }
    applyUserSettings(userSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userSettings.appearance) {
                let a;
                if (userSettings.appearance === "day" ||
                    userSettings.appearance === "readium-default-on") {
                    a = UserSettings.appearanceValues[0];
                }
                else if (userSettings.appearance === "sepia" ||
                    userSettings.appearance === "readium-sepia-on") {
                    a = UserSettings.appearanceValues[1];
                }
                else if (userSettings.appearance === "night" ||
                    userSettings.appearance === "readium-night-on") {
                    a = UserSettings.appearanceValues[2];
                }
                else {
                    a = userSettings.appearance;
                }
                this.appearance = UserSettings.appearanceValues.findIndex((el) => el === a);
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF).value =
                    this.appearance;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.APPEARANCE_REF));
            }
            if (userSettings.fontSize) {
                this.fontSize = userSettings.fontSize;
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF).value =
                    this.fontSize;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF));
            }
            if (userSettings.fontFamily) {
                this.fontFamily = UserSettings.fontFamilyValues.findIndex((el) => el === userSettings.fontFamily);
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF).value =
                    this.fontFamily;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_FAMILY_REF));
            }
            if (userSettings.letterSpacing) {
                this.letterSpacing = userSettings.letterSpacing;
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF).value =
                    this.letterSpacing;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF));
            }
            if (userSettings.wordSpacing) {
                this.wordSpacing = userSettings.wordSpacing;
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF).value =
                    this.wordSpacing;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF));
            }
            if (userSettings.columnCount) {
                this.columnCount = UserSettings.columnCountValues.findIndex((el) => el === userSettings.columnCount);
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_REF).value =
                    this.columnCount;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.COLUMN_COUNT_REF));
                this.settingsColumnsChangeCallback();
            }
            if (userSettings.textAlignment) {
                this.textAlignment = UserSettings.textAlignmentValues.findIndex((el) => el === userSettings.textAlignment);
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_REF).value =
                    this.textAlignment;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.TEXT_ALIGNMENT_REF));
            }
            if (userSettings.lineHeight) {
                this.lineHeight = userSettings.lineHeight;
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF).value =
                    this.lineHeight;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF));
            }
            if (userSettings.pageMargins) {
                // await this.enableAdvancedSettings();
                this.pageMargins = userSettings.pageMargins;
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_REF).value =
                    this.pageMargins;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.PAGE_MARGINS_REF));
            }
            if (userSettings.verticalScroll !== undefined) {
                const position = this.view.getCurrentPosition();
                this.verticalScroll = UserSettings.parseScrollSetting(userSettings.verticalScroll);
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.SCROLL_REF).value =
                    this.verticalScroll;
                yield this.saveProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.SCROLL_REF));
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    this.view.setMode(this.verticalScroll);
                    this.view.goToPosition(position);
                    this.viewChangeCallback();
                }), 10);
            }
            yield this.applyProperties();
            this.settingsChangeCallback();
        });
    }
    /**
     * Parses a scroll setting from a variety of inputs to a simple boolean
     */
    static parseScrollSetting(inputSetting) {
        switch (inputSetting) {
            case true:
            case "scroll":
            case "readium-scroll-on":
                return true;
            case false:
            case "paginated":
            case "readium-scroll-off":
                return false;
        }
    }
    scroll(scroll) {
        return __awaiter(this, void 0, void 0, function* () {
            const position = this.view.getCurrentPosition();
            this.verticalScroll = scroll;
            this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.SCROLL_REF).value =
                this.verticalScroll;
            yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.SCROLL_REF));
            yield this.applyProperties();
            // if (this.material?.settings.scroll) {
            //   this.updateViewButtons();
            // }
            this.view.setMode(this.verticalScroll);
            this.view.goToPosition(position);
            this.viewChangeCallback();
        });
    }
    increase(incremental) {
        return __awaiter(this, void 0, void 0, function* () {
            if (incremental === "fontSize") {
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF).increment();
                this.fontSize = this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF).value;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF));
            }
            else if (incremental === "letterSpacing") {
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF).increment();
                this.letterSpacing = this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF).value;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF));
            }
            else if (incremental === "wordSpacing") {
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF).increment();
                this.wordSpacing = this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF).value;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF));
            }
            else if (incremental === "lineHeight") {
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF).increment();
                this.lineHeight = this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF).value;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF));
            }
            yield this.applyProperties();
            this.settingsChangeCallback();
        });
    }
    decrease(incremental) {
        return __awaiter(this, void 0, void 0, function* () {
            if (incremental === "fontSize") {
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF).decrement();
                this.fontSize = this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF).value;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.FONT_SIZE_REF));
            }
            else if (incremental === "letterSpacing") {
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF).decrement();
                this.letterSpacing = this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF).value;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LETTER_SPACING_REF));
            }
            else if (incremental === "wordSpacing") {
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF).decrement();
                this.wordSpacing = this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF).value;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.WORD_SPACING_REF));
            }
            else if (incremental === "lineHeight") {
                this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF).decrement();
                this.wordSpacing = this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF).value;
                yield this.storeProperty(this.userProperties.getByRef(ReadiumCSS_1.ReadiumCSS.LINE_HEIGHT_REF));
            }
            yield this.applyProperties();
            this.settingsChangeCallback();
        });
    }
}
exports.UserSettings = UserSettings;
UserSettings.appearanceValues = [
    "readium-default-on",
    "readium-sepia-on",
    "readium-night-on",
];
UserSettings.fontFamilyValues = ["Original", "serif", "sans-serif"];
UserSettings.textAlignmentValues = ["auto", "justify", "start"];
UserSettings.columnCountValues = ["auto", "1", "2"];
//# sourceMappingURL=UserSettings.js.map