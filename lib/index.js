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
exports.load = exports.snapToElement = exports.applyAttributes = exports.goToPosition = exports.positions = exports.currentLocator = exports.scroll = exports.atEnd = exports.atStart = exports.previousPage = exports.nextPage = exports.previousResource = exports.nextResource = exports.goTo = exports.applyMediaOverlaySettings = exports.resetMediaOverlaySettings = exports.applyPreferredVoice = exports.applyTTSSetting = exports.applyTTSSettings = exports.resetTTSSettings = exports.decrease = exports.increase = exports.currentSettings = exports.applyUserSettings = exports.resetUserSettings = exports.publicationLanguage = exports.totalResources = exports.mostRecentNavigatedTocItem = exports.currentResource = exports.clearSearch = exports.goToSearchID = exports.goToSearchIndex = exports.search = exports.annotations = exports.bookmarks = exports.readingOrder = exports.tableOfContents = exports.addAnnotation = exports.deleteAnnotation = exports.deleteBookmark = exports.saveBookmark = exports.resumeReadAloud = exports.pauseReadAloud = exports.stopReadAloud = exports.startReadAloud = exports.hasMediaOverlays = exports.unload = exports.IS_DEV = void 0;
const LocalStorageStore_1 = require("./store/LocalStorageStore");
const IFrameNavigator_1 = require("./navigator/IFrameNavigator");
const LocalAnnotator_1 = require("./store/LocalAnnotator");
const BookmarkModule_1 = require("./modules/BookmarkModule");
const UserSettings_1 = require("./model/user-settings/UserSettings");
const AnnotationModule_1 = require("./modules/AnnotationModule");
const TTSModule_1 = require("./modules/TTS/TTSModule");
const TTSSettings_1 = require("./modules/TTS/TTSSettings");
const SearchModule_1 = require("./modules/search/SearchModule");
const ContentProtectionModule_1 = require("./modules/protection/ContentProtectionModule");
const TextHighlighter_1 = require("./modules/highlight/TextHighlighter");
const TimelineModule_1 = require("./modules/positions/TimelineModule");
const browserslist_useragent_regexp_1 = require("browserslist-useragent-regexp");
const MediaOverlayModule_1 = require("./modules/mediaoverlays/MediaOverlayModule");
const Publication_1 = require("./model/Publication");
const Link_1 = require("./model/Link");
const JsonUtil_1 = require("./utils/JsonUtil");
const utils_1 = require("./utils");
const MediaOverlaySettings_1 = require("./modules/mediaoverlays/MediaOverlaySettings");
const InspectorProtectionModule_1 = require("./modules/protection/InspectorProtectionModule");
let D2Settings;
let D2TTSSettings;
let D2MediaOverlaySettings;
let D2Navigator;
let D2Highlighter;
let BookmarkModuleInstance;
let AnnotationModuleInstance;
let TTSModuleInstance;
let SearchModuleInstance;
let ContentProtectionModuleInstance;
let TimelineModuleInstance;
let MediaOverlayModuleInstance;
exports.IS_DEV = true;
//process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev";
function unload() {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.IS_DEV) {
            console.log("unload reader");
        }
        document.body.onscroll = () => { };
        yield D2Navigator.stop();
        yield D2Settings.stop();
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
            yield D2TTSSettings.stop();
            yield TTSModuleInstance.stop();
        }
        if ((_b = D2Navigator.rights) === null || _b === void 0 ? void 0 : _b.enableBookmarks) {
            yield BookmarkModuleInstance.stop();
        }
        if ((_c = D2Navigator.rights) === null || _c === void 0 ? void 0 : _c.enableAnnotations) {
            yield AnnotationModuleInstance.stop();
        }
        if ((_d = D2Navigator.rights) === null || _d === void 0 ? void 0 : _d.enableSearch) {
            yield SearchModuleInstance.stop();
        }
        if ((_e = D2Navigator.rights) === null || _e === void 0 ? void 0 : _e.enableContentProtection) {
            yield ContentProtectionModuleInstance.stop();
        }
        if ((_f = D2Navigator.rights) === null || _f === void 0 ? void 0 : _f.enableTimeline) {
            yield TimelineModuleInstance.stop();
        }
        if ((_g = D2Navigator.rights) === null || _g === void 0 ? void 0 : _g.enableMediaOverlays) {
            yield D2MediaOverlaySettings.stop();
            yield MediaOverlayModuleInstance.stop();
        }
    });
}
exports.unload = unload;
exports.unload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield unload();
    });
};
function hasMediaOverlays() {
    if (exports.IS_DEV) {
        console.log("hasMediaOverlays");
    }
    return D2Navigator.hasMediaOverlays;
}
exports.hasMediaOverlays = hasMediaOverlays;
exports.hasMediaOverlays = function () {
    return hasMediaOverlays();
};
function startReadAloud() {
    if (exports.IS_DEV) {
        console.log("startReadAloud");
    }
    return D2Navigator.startReadAloud();
}
exports.startReadAloud = startReadAloud;
exports.startReadAloud = function () {
    return startReadAloud();
};
function stopReadAloud() {
    if (exports.IS_DEV) {
        console.log("stopReadAloud");
    }
    return D2Navigator.stopReadAloud();
}
exports.stopReadAloud = stopReadAloud;
exports.stopReadAloud = function () {
    return stopReadAloud();
};
function pauseReadAloud() {
    if (exports.IS_DEV) {
        console.log("pauseReadAloud");
    }
    return D2Navigator.pauseReadAloud();
}
exports.pauseReadAloud = pauseReadAloud;
exports.pauseReadAloud = function () {
    return pauseReadAloud();
};
function resumeReadAloud() {
    if (exports.IS_DEV) {
        console.log("resumeReadAloud");
    }
    return D2Navigator.resumeReadAloud();
}
exports.resumeReadAloud = resumeReadAloud;
exports.resumeReadAloud = function () {
    return resumeReadAloud();
};
function saveBookmark() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableBookmarks) {
            if (exports.IS_DEV) {
                console.log("saveBookmark");
            }
            return yield BookmarkModuleInstance.saveBookmark();
        }
    });
}
exports.saveBookmark = saveBookmark;
exports.saveBookmark = function () {
    return saveBookmark();
};
function deleteBookmark(bookmark) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableBookmarks) {
            if (exports.IS_DEV) {
                console.log("deleteBookmark");
            }
            return yield BookmarkModuleInstance.deleteBookmark(bookmark);
        }
    });
}
exports.deleteBookmark = deleteBookmark;
exports.deleteBookmark = function (bookmark) {
    return __awaiter(this, void 0, void 0, function* () {
        return deleteBookmark(bookmark);
    });
};
function deleteAnnotation(highlight) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableAnnotations) {
            if (exports.IS_DEV) {
                console.log("deleteAnnotation");
            }
            return yield AnnotationModuleInstance.deleteAnnotation(highlight);
        }
    });
}
exports.deleteAnnotation = deleteAnnotation;
exports.deleteAnnotation = function (highlight) {
    return __awaiter(this, void 0, void 0, function* () {
        return deleteAnnotation(highlight);
    });
};
function addAnnotation(highlight) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableAnnotations) {
            if (exports.IS_DEV) {
                console.log("addAnnotation");
            }
            return yield AnnotationModuleInstance.addAnnotation(highlight);
        }
    });
}
exports.addAnnotation = addAnnotation;
exports.addAnnotation = function (highlight) {
    return __awaiter(this, void 0, void 0, function* () {
        return addAnnotation(highlight);
    });
};
function tableOfContents() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.IS_DEV) {
            console.log("tableOfContents");
        }
        return yield Link_1.convertAndCamel(D2Navigator.tableOfContents());
    });
}
exports.tableOfContents = tableOfContents;
exports.tableOfContents = function () {
    return tableOfContents();
};
function readingOrder() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.IS_DEV) {
            console.log("readingOrder");
        }
        return yield Link_1.convertAndCamel(D2Navigator.readingOrder());
    });
}
exports.readingOrder = readingOrder;
exports.readingOrder = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return readingOrder();
    });
};
function bookmarks() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableBookmarks) {
            if (exports.IS_DEV) {
                console.log("bookmarks");
            }
            return yield BookmarkModuleInstance.getBookmarks();
        }
        else {
            return [];
        }
    });
}
exports.bookmarks = bookmarks;
exports.bookmarks = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return bookmarks();
    });
};
function annotations() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableAnnotations) {
            if (exports.IS_DEV) {
                console.log("annotations");
            }
            return yield AnnotationModuleInstance.getAnnotations();
        }
        else {
            return [];
        }
    });
}
exports.annotations = annotations;
exports.annotations = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return annotations();
    });
};
function search(term, current) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableSearch) {
            if (exports.IS_DEV) {
                console.log("search");
            }
            return yield SearchModuleInstance.search(term, current);
        }
        else {
            return [];
        }
    });
}
exports.search = search;
exports.search = function (term, current) {
    return __awaiter(this, void 0, void 0, function* () {
        return search(term, current);
    });
};
function goToSearchIndex(href, index, current) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableSearch) {
            if (exports.IS_DEV) {
                console.log("goToSearchIndex");
            }
            yield SearchModuleInstance.goToSearchIndex(href, index, current);
        }
    });
}
exports.goToSearchIndex = goToSearchIndex;
exports.goToSearchIndex = function (href, index, current) {
    return __awaiter(this, void 0, void 0, function* () {
        yield goToSearchIndex(href, index, current);
    });
};
function goToSearchID(href, index, current) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableSearch) {
            if (exports.IS_DEV) {
                console.log("goToSearchID");
            }
            yield SearchModuleInstance.goToSearchID(href, index, current);
        }
    });
}
exports.goToSearchID = goToSearchID;
exports.goToSearchID = function (href, index, current) {
    return __awaiter(this, void 0, void 0, function* () {
        yield goToSearchID(href, index, current);
    });
};
function clearSearch() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableSearch) {
            if (exports.IS_DEV) {
                console.log("clearSearch");
            }
            yield SearchModuleInstance.clearSearch();
        }
    });
}
exports.clearSearch = clearSearch;
exports.clearSearch = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearSearch();
    });
};
function currentResource() {
    if (exports.IS_DEV) {
        console.log("currentResource");
    }
    return D2Navigator.currentResource();
}
exports.currentResource = currentResource;
exports.currentResource = function () {
    return currentResource();
};
function mostRecentNavigatedTocItem() {
    if (exports.IS_DEV) {
        console.log("mostRecentNavigatedTocItem");
    }
    return D2Navigator.mostRecentNavigatedTocItem();
}
exports.mostRecentNavigatedTocItem = mostRecentNavigatedTocItem;
exports.mostRecentNavigatedTocItem = function () {
    return mostRecentNavigatedTocItem();
};
function totalResources() {
    if (exports.IS_DEV) {
        console.log("totalResources");
    }
    return D2Navigator.totalResources();
}
exports.totalResources = totalResources;
exports.totalResources = function () {
    return totalResources();
};
function publicationLanguage() {
    if (exports.IS_DEV) {
        console.log("publicationLanguage");
    }
    return D2Navigator.publication.Metadata.Language;
}
exports.publicationLanguage = publicationLanguage;
exports.publicationLanguage = function () {
    return publicationLanguage();
};
function resetUserSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.IS_DEV) {
            console.log("resetSettings");
        }
        yield D2Settings.resetUserSettings();
    });
}
exports.resetUserSettings = resetUserSettings;
exports.resetUserSettings = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield resetUserSettings();
    });
};
function applyUserSettings(userSettings) {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.IS_DEV) {
            console.log("applyUserSettings");
        }
        yield D2Settings.applyUserSettings(userSettings);
    });
}
exports.applyUserSettings = applyUserSettings;
exports.applyUserSettings = function (userSettings) {
    return __awaiter(this, void 0, void 0, function* () {
        yield applyUserSettings(userSettings);
    });
};
function currentSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.IS_DEV) {
            console.log("currentSettings");
        }
        return D2Settings.currentSettings();
    });
}
exports.currentSettings = currentSettings;
exports.currentSettings = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return currentSettings();
    });
};
function increase(incremental) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((incremental === "pitch" ||
            incremental === "rate" ||
            incremental === "volume") &&
            ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableTTS)) {
            if (exports.IS_DEV) {
                console.log("increase " + incremental);
            }
            yield D2TTSSettings.increase(incremental);
        }
        else {
            if (exports.IS_DEV) {
                console.log("increase " + incremental);
            }
            yield D2Settings.increase(incremental);
        }
    });
}
exports.increase = increase;
exports.increase = function (incremental) {
    return __awaiter(this, void 0, void 0, function* () {
        yield increase(incremental);
    });
};
function decrease(incremental) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((incremental === "pitch" ||
            incremental === "rate" ||
            incremental === "volume") &&
            ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableTTS)) {
            if (exports.IS_DEV) {
                console.log("decrease " + incremental);
            }
            yield D2TTSSettings.decrease(incremental);
        }
        else {
            if (exports.IS_DEV) {
                console.log("decrease " + incremental);
            }
            yield D2Settings.decrease(incremental);
        }
    });
}
exports.decrease = decrease;
exports.decrease = function (incremental) {
    return __awaiter(this, void 0, void 0, function* () {
        yield decrease(incremental);
    });
};
// export async function publisher(on) {
//   if (IS_DEV) {
//     console.log("publisher " + on);
//   }
//   R2Settings.publisher(on);
// }
function resetTTSSettings() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
            if (exports.IS_DEV) {
                console.log("resetSettings");
            }
            yield D2TTSSettings.resetTTSSettings();
        }
    });
}
exports.resetTTSSettings = resetTTSSettings;
exports.resetTTSSettings = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield resetTTSSettings();
    });
};
function applyTTSSettings(ttsSettings) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
            if (exports.IS_DEV) {
                console.log("applyTTSSettings");
            }
            yield D2TTSSettings.applyTTSSettings(ttsSettings);
        }
    });
}
exports.applyTTSSettings = applyTTSSettings;
exports.applyTTSSettings = function (ttsSettings) {
    return __awaiter(this, void 0, void 0, function* () {
        yield applyTTSSettings(ttsSettings);
    });
};
function applyTTSSetting(key, value) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
            if (exports.IS_DEV) {
                console.log("set " + key + " value " + value);
            }
            yield D2TTSSettings.applyTTSSetting(key, value);
        }
    });
}
exports.applyTTSSetting = applyTTSSetting;
exports.applyTTSSetting = function (key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield applyTTSSetting(key, value);
    });
};
function applyPreferredVoice(value) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
            yield D2TTSSettings.applyPreferredVoice(value);
        }
    });
}
exports.applyPreferredVoice = applyPreferredVoice;
exports.applyPreferredVoice = function (value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield applyPreferredVoice(value);
    });
};
function resetMediaOverlaySettings() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableMediaOverlays) {
            if (exports.IS_DEV) {
                console.log("resetMediaOverlaySettings");
            }
            yield D2MediaOverlaySettings.resetMediaOverlaySettings();
        }
    });
}
exports.resetMediaOverlaySettings = resetMediaOverlaySettings;
exports.resetMediaOverlaySettings = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield resetMediaOverlaySettings();
    });
};
function applyMediaOverlaySettings(setting) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ((_a = D2Navigator.rights) === null || _a === void 0 ? void 0 : _a.enableMediaOverlays) {
            if (exports.IS_DEV) {
                console.log("applyMediaOverlaySettings");
            }
            yield D2MediaOverlaySettings.applyMediaOverlaySettings(setting);
        }
    });
}
exports.applyMediaOverlaySettings = applyMediaOverlaySettings;
exports.applyMediaOverlaySettings = function (setting) {
    return __awaiter(this, void 0, void 0, function* () {
        yield applyMediaOverlaySettings(setting);
    });
};
function goTo(locator) {
    if (exports.IS_DEV) {
        console.log("goTo " + locator);
    }
    D2Navigator.goTo(locator);
}
exports.goTo = goTo;
exports.goTo = function (locator) {
    goTo(locator);
};
function nextResource() {
    if (exports.IS_DEV) {
        console.log("nextResource");
    }
    D2Navigator.nextResource();
}
exports.nextResource = nextResource;
exports.nextResource = function () {
    nextResource();
};
function previousResource() {
    if (exports.IS_DEV) {
        console.log("previousResource");
    }
    D2Navigator.previousResource();
}
exports.previousResource = previousResource;
exports.previousResource = function () {
    previousResource();
};
function nextPage() {
    if (exports.IS_DEV) {
        console.log("nextPage");
    }
    D2Navigator.nextPage();
}
exports.nextPage = nextPage;
exports.nextPage = function () {
    nextPage();
};
function previousPage() {
    if (exports.IS_DEV) {
        console.log("previousPage");
    }
    D2Navigator.previousPage();
}
exports.previousPage = previousPage;
exports.previousPage = function () {
    previousPage();
};
function atStart() {
    if (exports.IS_DEV) {
        console.log("atStart");
    }
    return D2Navigator.atStart();
}
exports.atStart = atStart;
exports.atStart = function () {
    return atStart();
};
function atEnd() {
    if (exports.IS_DEV) {
        console.log("atEnd");
    }
    return D2Navigator.atEnd();
}
exports.atEnd = atEnd;
exports.atEnd = function () {
    return atEnd();
};
function scroll(value) {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.IS_DEV) {
            console.log("scroll " + value);
        }
        yield D2Settings.scroll(value);
    });
}
exports.scroll = scroll;
exports.scroll = function (value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield scroll(value);
    });
};
function currentLocator() {
    if (exports.IS_DEV) {
        console.log("currentLocator");
    }
    return D2Navigator.currentLocator();
}
exports.currentLocator = currentLocator;
exports.currentLocator = function () {
    return currentLocator();
};
function positions() {
    if (exports.IS_DEV) {
        console.log("positions");
    }
    return D2Navigator.positions();
}
exports.positions = positions;
exports.positions = function () {
    return positions();
};
function goToPosition(value) {
    if (exports.IS_DEV) {
        console.log("goToPosition");
    }
    D2Navigator.goToPosition(value);
}
exports.goToPosition = goToPosition;
exports.goToPosition = function (value) {
    goToPosition(value);
};
function applyAttributes(value) {
    if (exports.IS_DEV) {
        console.log("applyAttributes");
    }
    D2Navigator.applyAttributes(value);
}
exports.applyAttributes = applyAttributes;
exports.applyAttributes = function (value) {
    applyAttributes(value);
};
// currently not used or functional
function snapToElement(value) {
    if (exports.IS_DEV) {
        console.log("snapToElement");
    }
    D2Navigator.snapToElement(value);
}
exports.snapToElement = snapToElement;
exports.snapToElement = function (value) {
    snapToElement(value);
};
function load(config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
    return __awaiter(this, void 0, void 0, function* () {
        let browsers = [];
        if ((_a = config.protection) === null || _a === void 0 ? void 0 : _a.enforceSupportedBrowsers) {
            ((_c = (_b = config.protection) === null || _b === void 0 ? void 0 : _b.supportedBrowsers) !== null && _c !== void 0 ? _c : []).forEach((browser) => {
                browsers.push("last 1 " + browser + " version");
            });
        }
        const supportedBrowsers = browserslist_useragent_regexp_1.getUserAgentRegExp({
            browsers: browsers,
            allowHigherVersions: true,
        });
        if ((((_d = config.protection) === null || _d === void 0 ? void 0 : _d.enforceSupportedBrowsers) &&
            supportedBrowsers.test(navigator.userAgent)) ||
            !((_e = config.protection) === null || _e === void 0 ? void 0 : _e.enforceSupportedBrowsers)) {
            if ((_f = config.protection) === null || _f === void 0 ? void 0 : _f.detectInspect) {
                InspectorProtectionModule_1.default.start({
                    api: (_h = (_g = config.protection) === null || _g === void 0 ? void 0 : _g.api) !== null && _h !== void 0 ? _h : {},
                    clearOnInspect: (_k = (_j = config.protection) === null || _j === void 0 ? void 0 : _j.clearOnInspect) !== null && _k !== void 0 ? _k : false,
                });
                yield utils_1.delay(1200);
            }
            let mainElement = document.getElementById("D2Reader-Container");
            let headerMenu = document.getElementById("headerMenu");
            let footerMenu = document.getElementById("footerMenu");
            let webpubManifestUrl = config.url;
            let store = new LocalStorageStore_1.default({
                prefix: webpubManifestUrl.href,
                useLocalStorage: config.useLocalStorage,
            });
            let settingsStore = new LocalStorageStore_1.default({
                prefix: "r2d2bc-reader",
                useLocalStorage: config.useLocalStorage,
            });
            let annotator = new LocalAnnotator_1.default({ store: store });
            let upLink;
            if (config.upLinkUrl) {
                upLink = config.upLinkUrl;
            }
            const response = yield window.fetch(webpubManifestUrl.href, {
                credentials: "same-origin",
            });
            const manifestJSON = yield response.json();
            let publication = JsonUtil_1.TaJsonDeserialize(manifestJSON, Publication_1.Publication);
            publication.manifestUrl = webpubManifestUrl;
            if (((_m = (_l = publication.Metadata.Rendition) === null || _l === void 0 ? void 0 : _l.Layout) !== null && _m !== void 0 ? _m : "unknown") === "fixed") {
                config.rights.enableAnnotations = false;
                config.rights.enableSearch = false;
                config.rights.enableTTS = false;
                // config.protection.enableObfuscation = false;
            }
            const getContentBytesLength = (href) => __awaiter(this, void 0, void 0, function* () {
                var _11;
                if ((_11 = config.api) === null || _11 === void 0 ? void 0 : _11.getContentBytesLength) {
                    return config.api.getContentBytesLength(href);
                }
                const r = yield fetch(href);
                const b = yield r.blob();
                return b.size;
            });
            if ((_p = (_o = config.rights) === null || _o === void 0 ? void 0 : _o.autoGeneratePositions) !== null && _p !== void 0 ? _p : true) {
                let startPosition = 0;
                let totalContentLength = 0;
                let positions = [];
                let weight = {};
                yield Promise.all(publication.readingOrder.map((link) => __awaiter(this, void 0, void 0, function* () {
                    var _12, _13;
                    if (((_13 = (_12 = publication.Metadata.Rendition) === null || _12 === void 0 ? void 0 : _12.Layout) !== null && _13 !== void 0 ? _13 : "unknown") === "fixed") {
                        const locator = {
                            href: link.Href,
                            locations: {
                                progression: 0,
                                position: startPosition + 1,
                            },
                            type: link.TypeLink,
                        };
                        if (exports.IS_DEV)
                            console.log(locator);
                        positions.push(locator);
                        startPosition = startPosition + 1;
                    }
                    else {
                        let href = publication.getAbsoluteHref(link.Href);
                        let length = yield getContentBytesLength(href);
                        link.contentLength = length;
                        totalContentLength += length;
                        let positionLength = 1024;
                        let positionCount = Math.max(1, Math.ceil(length / positionLength));
                        if (exports.IS_DEV)
                            console.log(length + " Bytes");
                        if (exports.IS_DEV)
                            console.log(positionCount + " Positions");
                        Array.from(Array(positionCount).keys()).map((_, position) => {
                            const locator = {
                                href: link.Href,
                                locations: {
                                    progression: position / positionCount,
                                    position: startPosition + (position + 1),
                                },
                                type: link.TypeLink,
                            };
                            if (exports.IS_DEV)
                                console.log(locator);
                            positions.push(locator);
                        });
                        startPosition = startPosition + positionCount;
                    }
                })));
                if (((_r = (_q = publication.Metadata.Rendition) === null || _q === void 0 ? void 0 : _q.Layout) !== null && _r !== void 0 ? _r : "unknown") !== "fixed") {
                    publication.readingOrder.map((link) => __awaiter(this, void 0, void 0, function* () {
                        if (exports.IS_DEV)
                            console.log(totalContentLength);
                        if (exports.IS_DEV)
                            console.log(link.contentLength);
                        link.contentWeight =
                            (100 / totalContentLength) * link.contentLength;
                        weight[link.Href] = link.contentWeight;
                        if (exports.IS_DEV)
                            console.log(link.contentWeight);
                    }));
                }
                positions.map((locator, _index) => {
                    let resource = positions.filter((el) => el.href === decodeURI(locator.href));
                    let positionIndex = Math.ceil(locator.locations.progression * (resource.length - 1));
                    locator.locations.totalProgression =
                        (locator.locations.position - 1) / positions.length;
                    locator.locations.remainingPositions = Math.abs(positionIndex - (resource.length - 1));
                    locator.locations.totalRemainingPositions = Math.abs(locator.locations.position - 1 - (positions.length - 1));
                });
                publication.positions = positions;
                if (exports.IS_DEV)
                    console.log(positions);
            }
            else {
                if ((_s = config.services) === null || _s === void 0 ? void 0 : _s.positions) {
                    yield fetch((_t = config.services) === null || _t === void 0 ? void 0 : _t.positions.href)
                        .then((r) => r.text())
                        .then((content) => __awaiter(this, void 0, void 0, function* () {
                        publication.positions = JSON.parse(content).positions;
                    }));
                }
                if ((_u = config.services) === null || _u === void 0 ? void 0 : _u.weight) {
                    yield fetch((_v = config.services) === null || _v === void 0 ? void 0 : _v.weight.href)
                        .then((r) => r.text())
                        .then((content) => __awaiter(this, void 0, void 0, function* () {
                        var _14, _15;
                        if (((_15 = (_14 = publication.Metadata.Rendition) === null || _14 === void 0 ? void 0 : _14.Layout) !== null && _15 !== void 0 ? _15 : "unknown") !== "fixed") {
                            let weight = JSON.parse(content);
                            publication.readingOrder.map((link) => __awaiter(this, void 0, void 0, function* () {
                                link.contentWeight = weight[link.Href];
                                if (exports.IS_DEV)
                                    console.log(link.contentWeight);
                            }));
                        }
                    }));
                }
            }
            // Settings
            D2Settings = yield UserSettings_1.UserSettings.create({
                store: settingsStore,
                initialUserSettings: config.userSettings,
                headerMenu: headerMenu,
                material: config.material,
                api: config.api,
                injectables: ((_x = (_w = publication.Metadata.Rendition) === null || _w === void 0 ? void 0 : _w.Layout) !== null && _x !== void 0 ? _x : "unknown") === "fixed"
                    ? config.injectablesFixed
                    : config.injectables,
                layout: ((_z = (_y = publication.Metadata.Rendition) === null || _y === void 0 ? void 0 : _y.Layout) !== null && _z !== void 0 ? _z : "unknown") === "fixed"
                    ? "fixed"
                    : "reflowable",
            });
            // Navigator
            D2Navigator = yield IFrameNavigator_1.default.create({
                mainElement: mainElement,
                headerMenu: headerMenu,
                footerMenu: footerMenu,
                publication: publication,
                settings: D2Settings,
                annotator: annotator,
                upLink: upLink,
                initialLastReadingPosition: config.lastReadingPosition,
                material: config.material,
                api: config.api,
                rights: config.rights,
                tts: config.tts,
                injectables: ((_1 = (_0 = publication.Metadata.Rendition) === null || _0 === void 0 ? void 0 : _0.Layout) !== null && _1 !== void 0 ? _1 : "unknown") === "fixed"
                    ? config.injectablesFixed
                    : config.injectables,
                attributes: config.attributes,
                services: config.services,
            });
            // Highlighter
            if (((_3 = (_2 = publication.Metadata.Rendition) === null || _2 === void 0 ? void 0 : _2.Layout) !== null && _3 !== void 0 ? _3 : "unknown") !== "fixed") {
                D2Highlighter = yield TextHighlighter_1.default.create(Object.assign({ delegate: D2Navigator }, config.highlighter));
            }
            // Bookmark Module
            if ((_4 = config.rights) === null || _4 === void 0 ? void 0 : _4.enableBookmarks) {
                BookmarkModuleInstance = yield BookmarkModule_1.default.create(Object.assign({ annotator: annotator, headerMenu: headerMenu, rights: config.rights, publication: publication, delegate: D2Navigator, initialAnnotations: config.initialAnnotations }, config.bookmarks));
            }
            // Annotation Module
            if ((_5 = config.rights) === null || _5 === void 0 ? void 0 : _5.enableAnnotations) {
                AnnotationModuleInstance = yield AnnotationModule_1.default.create(Object.assign({ annotator: annotator, headerMenu: headerMenu, rights: config.rights, publication: publication, delegate: D2Navigator, initialAnnotations: config.initialAnnotations, highlighter: D2Highlighter }, config.annotations));
            }
            // TTS Module
            if ((_6 = config.rights) === null || _6 === void 0 ? void 0 : _6.enableTTS) {
                D2TTSSettings = yield TTSSettings_1.TTSSettings.create(Object.assign({ store: settingsStore, initialTTSSettings: config.tts, headerMenu: headerMenu }, config.tts));
                TTSModuleInstance = yield TTSModule_1.default.create(Object.assign({ delegate: D2Navigator, tts: D2TTSSettings, headerMenu: headerMenu, rights: config.rights, highlighter: D2Highlighter }, config.tts));
            }
            // Search Module
            if ((_7 = config.rights) === null || _7 === void 0 ? void 0 : _7.enableSearch) {
                SearchModule_1.default.create(Object.assign({ headerMenu: headerMenu, delegate: D2Navigator, publication: publication, highlighter: D2Highlighter }, config.search)).then(function (searchModule) {
                    SearchModuleInstance = searchModule;
                });
            }
            // Timeline Module
            if ((_8 = config.rights) === null || _8 === void 0 ? void 0 : _8.enableTimeline) {
                TimelineModule_1.default.create({
                    publication: publication,
                    delegate: D2Navigator,
                }).then(function (timelineModule) {
                    TimelineModuleInstance = timelineModule;
                });
            }
            // Content Protection Module
            if ((_9 = config.rights) === null || _9 === void 0 ? void 0 : _9.enableContentProtection) {
                ContentProtectionModule_1.default.create(Object.assign({ delegate: D2Navigator }, config.protection)).then(function (contentProtectionModule) {
                    ContentProtectionModuleInstance = contentProtectionModule;
                });
            }
            // MediaOverlay Module
            if ((_10 = config.rights) === null || _10 === void 0 ? void 0 : _10.enableMediaOverlays) {
                D2MediaOverlaySettings = yield MediaOverlaySettings_1.MediaOverlaySettings.create(Object.assign({ store: settingsStore, initialMediaOverlaySettings: config.mediaOverlays, headerMenu: headerMenu }, config.mediaOverlays));
                MediaOverlayModuleInstance = yield MediaOverlayModule_1.default.create(Object.assign({ publication: publication, settings: D2MediaOverlaySettings, delegate: D2Navigator }, config.mediaOverlays));
            }
            return new Promise((resolve) => resolve(D2Navigator));
        }
        else {
            throw new Error("Browser not supported");
        }
    });
}
exports.load = load;
exports.load = function (config) {
    return __awaiter(this, void 0, void 0, function* () {
        return load(config);
    });
};
//# sourceMappingURL=index.js.map