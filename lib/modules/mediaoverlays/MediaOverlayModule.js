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
const __1 = require("../..");
const media_overlay_1 = require("r2-shared-js/dist/es6-es2015/src/models/media-overlay");
const JsonUtil_1 = require("../../utils/JsonUtil");
const MediaOverlaySettings_1 = require("./MediaOverlaySettings");
const HTMLUtilities = require("../../utils/HTMLUtilities");
class MediaOverlayModule {
    constructor(delegate, publication, settings) {
        this.play = HTMLUtilities.findElement(document, "#menu-button-play");
        this.pause = HTMLUtilities.findElement(document, "#menu-button-pause");
        this.currentLinkIndex = 0;
        this.mediaOverlaysPlaybackRate = 1;
        this.pid = undefined;
        this.ontimeupdate = (ev) => __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV)
                console.log("ontimeupdate");
            const currentAudioElement = ev.currentTarget;
            if (this.currentAudioEnd &&
                currentAudioElement.currentTime >= this.currentAudioEnd - 0.05) {
                if (__1.IS_DEV)
                    console.log("ontimeupdate - mediaOverlaysNext()");
                this.mediaOverlaysNext();
            }
        });
        this.ensureOnTimeUpdate = (remove) => {
            if (this.audioElement) {
                if (remove) {
                    if (this.audioElement.__ontimeupdate) {
                        this.audioElement.__ontimeupdate = false;
                        this.audioElement.removeEventListener("timeupdate", this.ontimeupdate);
                    }
                }
                else {
                    if (!this.audioElement.__ontimeupdate) {
                        this.audioElement.__ontimeupdate = true;
                        this.audioElement.addEventListener("timeupdate", this.ontimeupdate);
                    }
                }
            }
        };
        this.delegate = delegate;
        this.publication = publication;
        this.settings = settings;
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const mediaOverlay = new this(config.delegate, config.publication, config.settings);
            yield mediaOverlay.start();
            return mediaOverlay;
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV)
                console.log("MediaOverlay module stop");
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.delegate.mediaOverlayModule = this;
            if (__1.IS_DEV)
                console.log("MediaOverlay module start");
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield document.fonts.ready;
                this.settings.setControls();
                this.settings.onSettingsChange(() => {
                    this.audioElement.volume = this.settings.volume;
                });
                resolve();
            }));
        });
    }
    initializeResource(links) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentLinks = links;
            this.currentLinkIndex = 0;
            yield this.playLink();
        });
    }
    playLink() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let link = this.currentLinks[this.currentLinkIndex];
            if ((_a = link === null || link === void 0 ? void 0 : link.Properties) === null || _a === void 0 ? void 0 : _a.MediaOverlay) {
                console.log((_b = link.Properties) === null || _b === void 0 ? void 0 : _b.MediaOverlay);
                const moUrl = (_c = link.Properties) === null || _c === void 0 ? void 0 : _c.MediaOverlay;
                const moUrlObjFull = new URL(moUrl, this.publication.manifestUrl);
                const moUrlFull = moUrlObjFull.toString();
                let response;
                try {
                    response = yield fetch(moUrlFull);
                }
                catch (e) {
                    console.error(e, moUrlFull);
                    return;
                }
                if (!response.ok) {
                    if (__1.IS_DEV)
                        console.log("BAD RESPONSE?!");
                }
                let moJson;
                try {
                    moJson = yield response.json();
                }
                catch (e) {
                    console.error(e);
                }
                if (!moJson) {
                    if (__1.IS_DEV)
                        console.log("## moJson" + moJson);
                    return;
                }
                link.MediaOverlays = JsonUtil_1.TaJsonDeserialize(moJson, media_overlay_1.MediaOverlayNode);
                link.MediaOverlays.initialized = true;
                const href = link.HrefDecoded || link.Href;
                const hrefUrlObj = new URL("https://dita.digital/" + href);
                yield this.playMediaOverlays(hrefUrlObj.pathname.substr(1), link.MediaOverlays, undefined);
            }
            else {
                if (this.audioElement) {
                    yield this.audioElement.pause();
                }
                if (this.currentLinks.length > 1 && this.currentLinkIndex == 0) {
                    this.currentLinkIndex++;
                    yield this.playLink();
                }
                else {
                    if (this.settings.autoTurn && this.settings.playing) {
                        this.delegate.nextResource();
                    }
                }
            }
        });
    }
    startReadAloud() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableMediaOverlays) {
                this.settings.playing = true;
                const timeToSeekTo = this.currentAudioBegin ? this.currentAudioBegin : 0;
                this.audioElement.currentTime = timeToSeekTo;
                yield this.audioElement.play();
                this.audioElement.volume = this.settings.volume;
                if (this.play)
                    this.play.style.display = "none";
                if (this.pause)
                    this.pause.style.display = "block";
            }
        });
    }
    stopReadAloud() {
        var _a;
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableMediaOverlays) {
            this.settings.playing = false;
            this.audioElement.pause();
            if (this.play)
                this.play.style.display = "block";
            if (this.pause)
                this.pause.style.display = "none";
        }
    }
    pauseReadAloud() {
        var _a;
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableMediaOverlays) {
            this.settings.playing = false;
            this.audioElement.pause();
            this.play.style.display = "block";
            this.pause.style.display = "none";
        }
    }
    resumeReadAloud() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableMediaOverlays) {
                this.settings.playing = true;
                yield this.audioElement.play();
                if (this.play)
                    this.play.style.display = "none";
                if (this.pause)
                    this.pause.style.display = "block";
            }
        });
    }
    findDepthFirstTextAudioPair(textHref, mo, textFragmentIDChain) {
        if (__1.IS_DEV)
            console.log("findDepthFirstTextAudioPair()");
        let isTextUrlMatch;
        let isFragmentIDMatch;
        if (mo.Text) {
            const hrefUrlObj = new URL("https://dita.digital/" + mo.Text);
            if (hrefUrlObj.pathname.substr(1) === textHref) {
                isTextUrlMatch = true;
                if (hrefUrlObj.hash && textFragmentIDChain) {
                    isFragmentIDMatch = false;
                    const id = hrefUrlObj.hash.substr(1);
                    for (const frag of textFragmentIDChain) {
                        if (frag === id) {
                            isFragmentIDMatch = true;
                            break;
                        }
                    }
                }
            }
            else {
                isTextUrlMatch = false;
            }
        }
        if (__1.IS_DEV) {
            console.log("isFragmentIDMatch: " + isFragmentIDMatch);
            console.log("isTextUrlMatch: " + isTextUrlMatch);
        }
        if (!mo.Children || !mo.Children.length) {
            if (__1.IS_DEV)
                console.log("findDepthFirstTextAudioPair() - leaf text/audio pair");
            if (!isTextUrlMatch) {
                if (__1.IS_DEV)
                    console.log("findDepthFirstTextAudioPair() - leaf - !isTextUrlMatch");
                return undefined;
            }
            if (isFragmentIDMatch || (isTextUrlMatch && !textFragmentIDChain)) {
                if (__1.IS_DEV)
                    console.log("findDepthFirstTextAudioPair() - leaf - isFragmentIDMatch || (isTextUrlMatch && !textFragmentIDChain");
                return mo;
            }
            return undefined;
        }
        const textFragmentIDChainOriginal = textFragmentIDChain;
        let frags = textFragmentIDChain;
        for (const child of mo.Children) {
            if (__1.IS_DEV) {
                console.log("findDepthFirstTextAudioPair() - child");
                console.log(JSON.stringify(child));
            }
            const match = this.findDepthFirstTextAudioPair(textHref, child, frags);
            if (match === null) {
                if (__1.IS_DEV) {
                    console.log("findDepthFirstTextAudioPair() - child - match null (skip)");
                }
                frags = undefined;
            }
            if (match) {
                if (__1.IS_DEV) {
                    console.log("findDepthFirstTextAudioPair() - child - match");
                    console.log(JSON.stringify(match));
                }
                return match;
            }
        }
        if (isFragmentIDMatch) {
            if (__1.IS_DEV)
                console.log("findDepthFirstTextAudioPair() - post isFragmentIDMatch");
            const match = this.findDepthFirstTextAudioPair(textHref, mo, undefined);
            if (match) {
                if (__1.IS_DEV) {
                    console.log("findDepthFirstTextAudioPair() - post isFragmentIDMatch - match");
                    console.log(JSON.stringify(match));
                }
                return match;
            }
            else {
                return match;
            }
        }
        if (textFragmentIDChainOriginal && !frags) {
            return null;
        }
        return undefined;
    }
    mediaOverlaysNext(escape) {
        if (__1.IS_DEV)
            console.log("mediaOverlaysNext()");
        this.ensureOnTimeUpdate(true);
        if (this.mediaOverlayRoot && this.mediaOverlayTextAudioPair) {
            const nextTextAudioPair = this.findNextTextAudioPair(this.mediaOverlayRoot, this.mediaOverlayTextAudioPair, { prev: undefined }, escape ? true : false);
            if (!nextTextAudioPair) {
                if (__1.IS_DEV)
                    console.log("mediaOverlaysNext() - navLeftOrRight()");
                this.mediaOverlaysStop();
                if (this.currentLinks.length > 1 && this.currentLinkIndex == 0) {
                    this.currentLinkIndex++;
                    this.playLink();
                }
                else {
                    this.audioElement.pause();
                    if (this.settings.autoTurn && this.settings.playing) {
                        this.delegate.nextResource();
                    }
                }
            }
            else {
                let switchDoc = false;
                if (this.mediaOverlayTextAudioPair.Text && nextTextAudioPair.Text) {
                    const hrefUrlObj1 = new URL("https://dita.digital/" + this.mediaOverlayTextAudioPair.Text);
                    const hrefUrlObj2 = new URL("https://dita.digital/" + nextTextAudioPair.Text);
                    if (hrefUrlObj1.pathname !== hrefUrlObj2.pathname) {
                        if (__1.IS_DEV) {
                            console.log("mediaOverlaysNext() SWITCH! " +
                                hrefUrlObj1.pathname +
                                " != " +
                                hrefUrlObj2.pathname);
                        }
                        switchDoc = true;
                    }
                }
                if (switchDoc) {
                    this.mediaOverlaysStop();
                }
                else {
                    if (__1.IS_DEV)
                        console.log("mediaOverlaysNext() - playMediaOverlaysAudio()");
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        yield this.playMediaOverlaysAudio(nextTextAudioPair, undefined, undefined);
                    }), 0);
                }
            }
        }
        else {
            if (__1.IS_DEV)
                console.log("mediaOverlaysNext() - navLeftOrRight() 2");
            this.mediaOverlaysStop();
            if (this.currentLinks.length > 1 && this.currentLinkIndex == 0) {
                this.currentLinkIndex++;
                this.playLink();
            }
            else {
                this.audioElement.pause();
                if (this.settings.autoTurn && this.settings.playing) {
                    this.delegate.nextResource();
                }
            }
        }
    }
    mediaOverlaysStop() {
        if (__1.IS_DEV)
            console.log("mediaOverlaysStop()");
        this.mediaOverlaysPause();
        this.mediaOverlayRoot = undefined;
        this.mediaOverlayTextAudioPair = undefined;
    }
    mediaOverlaysPause() {
        if (__1.IS_DEV)
            console.log("mediaOverlaysPause()");
        this.mediaOverlayHighlight(undefined, undefined);
        this.ensureOnTimeUpdate(true);
        if (this.audioElement) {
            this.audioElement.pause();
        }
    }
    findNextTextAudioPair(mo, moToMatch, previousMo, escape) {
        if (!mo.Children || !mo.Children.length) {
            const i = mo.Text.lastIndexOf("#");
            const id = mo.Text.substr(i + 1);
            console.log("## " + this.currentLinkIndex);
            this.mediaOverlayHighlight(undefined, id);
            if ((previousMo === null || previousMo === void 0 ? void 0 : previousMo.prev) === moToMatch) {
                if (__1.IS_DEV)
                    console.log("findNextTextAudioPair() - prevMo === moToMatch");
                return mo;
            }
            if (__1.IS_DEV) {
                console.log("findNextTextAudioPair() - set previous");
                console.log(JSON.stringify(mo));
            }
            previousMo.prev = mo;
            return undefined;
        }
        for (const child of mo.Children) {
            if (__1.IS_DEV) {
                console.log("findNextTextAudioPair() - child");
                console.log(JSON.stringify(child));
            }
            const match = this.findNextTextAudioPair(child, moToMatch, previousMo, escape);
            if (match) {
                if (__1.IS_DEV) {
                    console.log("findNextTextAudioPair() - match");
                    console.log(JSON.stringify(match));
                }
                return match;
            }
        }
        return undefined;
    }
    playMediaOverlaysAudio(moTextAudioPair, begin, end) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV)
                console.log("playMediaOverlaysAudio()");
            this.mediaOverlayTextAudioPair = moTextAudioPair;
            if (!moTextAudioPair.Audio) {
                return; // TODO TTS
            }
            const urlObjFull = new URL(moTextAudioPair.Audio, this.publication.manifestUrl);
            const urlFull = urlObjFull.toString();
            const urlObjNoQuery = new URL(urlFull);
            urlObjNoQuery.hash = "";
            urlObjNoQuery.search = "";
            const urlNoQuery = urlObjNoQuery.toString();
            const hasBegin = typeof begin !== "undefined";
            const hasEnd = typeof end !== "undefined";
            this.previousAudioEnd = this.currentAudioEnd;
            this.currentAudioBegin = undefined;
            this.currentAudioEnd = undefined;
            if (!hasBegin && !hasEnd) {
                if (urlObjFull.hash) {
                    const matches = urlObjFull.hash.match(/t=([0-9\.]+)(,([0-9\.]+))?/);
                    if (matches && matches.length >= 1) {
                        const b = matches[1];
                        try {
                            this.currentAudioBegin = parseFloat(b);
                        }
                        catch (err) {
                            console.log(err);
                        }
                        if (matches.length >= 3) {
                            const e = matches[3];
                            try {
                                this.currentAudioEnd = parseFloat(e);
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                    }
                }
            }
            else {
                this.currentAudioBegin = begin;
                this.currentAudioEnd = end;
            }
            if (__1.IS_DEV) {
                console.log(`${urlFull} => [${this.currentAudioBegin}-${this.currentAudioEnd}]`);
            }
            const playClip = (initial) => __awaiter(this, void 0, void 0, function* () {
                if (!this.audioElement) {
                    return;
                }
                const timeToSeekTo = this.currentAudioBegin ? this.currentAudioBegin : 0;
                if (initial || this.audioElement.paused) {
                    if ((initial && !timeToSeekTo) ||
                        this.audioElement.currentTime === timeToSeekTo) {
                        if (__1.IS_DEV) {
                            console.log("playMediaOverlaysAudio() - playClip() - _currentAudioElement.play()");
                        }
                        this.ensureOnTimeUpdate(false);
                        this.audioElement.playbackRate = this.mediaOverlaysPlaybackRate;
                        this.audioElement.volume = this.settings.volume;
                        if (this.settings.playing) {
                            if (!initial) {
                                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                    yield this.audioElement.play();
                                }), this.settings.wait * 1200);
                            }
                            else {
                                yield this.audioElement.play();
                            }
                        }
                    }
                    else {
                        if (__1.IS_DEV) {
                            console.log("playMediaOverlaysAudio() - playClip() - ontimeupdateSeeked");
                        }
                        const ontimeupdateSeeked = (ev) => __awaiter(this, void 0, void 0, function* () {
                            const currentAudioElement = ev.currentTarget;
                            currentAudioElement.removeEventListener("timeupdate", ontimeupdateSeeked);
                            if (__1.IS_DEV) {
                                console.log("playMediaOverlaysAudio() - playClip() - ontimeupdateSeeked - .play()");
                            }
                            this.ensureOnTimeUpdate(false);
                            if (this.audioElement) {
                                this.audioElement.playbackRate = this.mediaOverlaysPlaybackRate;
                                this.audioElement.volume = this.settings.volume;
                                if (this.settings.playing) {
                                    if (!initial) {
                                        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                            yield this.audioElement.play();
                                        }), this.settings.wait * 1200);
                                    }
                                    else {
                                        yield this.audioElement.play();
                                    }
                                }
                            }
                        });
                        this.audioElement.addEventListener("timeupdate", ontimeupdateSeeked);
                        this.audioElement.currentTime = timeToSeekTo;
                    }
                }
                else {
                    const contiguous = this.previousAudioUrl === this.currentAudioUrl &&
                        typeof this.previousAudioEnd !== "undefined" &&
                        this.previousAudioEnd > timeToSeekTo - 0.02 &&
                        this.previousAudioEnd <= timeToSeekTo &&
                        this.audioElement.currentTime >= timeToSeekTo - 0.1;
                    this.ensureOnTimeUpdate(false);
                    if (contiguous) {
                        if (__1.IS_DEV) {
                            console.log("playMediaOverlaysAudio() - playClip() - ensureOnTimeUpdate");
                        }
                    }
                    else {
                        if (__1.IS_DEV) {
                            console.log("playMediaOverlaysAudio() - playClip() - currentTime = timeToSeekTo");
                        }
                        this.audioElement.currentTime = timeToSeekTo;
                    }
                }
            });
            this.previousAudioUrl = this.currentAudioUrl;
            if (!this.currentAudioUrl || urlNoQuery !== this.currentAudioUrl) {
                this.currentAudioUrl = urlNoQuery;
                if (__1.IS_DEV) {
                    console.log("playMediaOverlaysAudio() - RESET: " +
                        this.previousAudioUrl +
                        " => " +
                        this.currentAudioUrl);
                }
                this.audioElement = document.getElementById("AUDIO_MO_ID");
                this.ensureOnTimeUpdate(true);
                if (this.audioElement) {
                    this.audioElement.pause();
                    this.audioElement.setAttribute("src", "");
                    if (this.audioElement.parentNode) {
                        this.audioElement.parentNode.removeChild(this.audioElement);
                    }
                }
                this.audioElement = document.createElement("audio");
                this.audioElement.setAttribute("style", "display: none");
                this.audioElement.setAttribute("id", "AUDIO_MO_ID");
                this.audioElement.setAttribute("role", "media-overlays");
                this.audioElement.volume = this.settings.volume;
                document.body.appendChild(this.audioElement);
                this.audioElement.addEventListener("error", (ev) => {
                    console.log("-1) error: " +
                        (this.currentAudioUrl !== ev.currentTarget.src
                            ? this.currentAudioUrl + " -- "
                            : "") +
                        ev.currentTarget.src.substr(ev.currentTarget.src.lastIndexOf("/")));
                    if (this.audioElement && this.audioElement.error) {
                        // 1 === MEDIA_ERR_ABORTED
                        // 2 === MEDIA_ERR_NETWORK
                        // 3 === MEDIA_ERR_DECODE
                        // 4 === MEDIA_ERR_SRC_NOT_SUPPORTED
                        console.log(this.audioElement.error.code);
                        console.log(this.audioElement.error.message);
                    }
                });
                const oncanplaythrough = (ev) => __awaiter(this, void 0, void 0, function* () {
                    const currentAudioElement = ev.currentTarget;
                    currentAudioElement.removeEventListener("canplaythrough", oncanplaythrough);
                    if (__1.IS_DEV)
                        console.log("oncanplaythrough");
                    yield playClip(true);
                });
                this.audioElement.addEventListener("canplaythrough", oncanplaythrough);
                const onended = (_ev) => __awaiter(this, void 0, void 0, function* () {
                    if (__1.IS_DEV)
                        console.log("onended");
                    if (this.currentLinks.length > 1 && this.currentLinkIndex == 0) {
                        this.currentLinkIndex++;
                        yield this.playLink();
                    }
                    else {
                        if (this.settings.autoTurn && this.settings.playing) {
                            this.delegate.nextResource();
                        }
                    }
                });
                this.audioElement.addEventListener("ended", onended);
                this.audioElement.playbackRate = this.mediaOverlaysPlaybackRate;
                this.audioElement.setAttribute("src", this.currentAudioUrl);
            }
            else {
                if (__1.IS_DEV)
                    console.log("playMediaOverlaysAudio() - playClip()");
                yield playClip(false);
            }
        });
    }
    playMediaOverlays(textHref, rootMo, textFragmentIDChain) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV)
                console.log("playMediaOverlays()");
            let textFragmentIDChain_ = textFragmentIDChain
                ? textFragmentIDChain.filter((id) => id)
                : undefined;
            if (textFragmentIDChain_ && textFragmentIDChain_.length === 0) {
                textFragmentIDChain_ = undefined;
            }
            let moTextAudioPair = this.findDepthFirstTextAudioPair(textHref, rootMo, textFragmentIDChain_);
            if (!moTextAudioPair && textFragmentIDChain_) {
                if (__1.IS_DEV) {
                    console.log("playMediaOverlays() - findDepthFirstTextAudioPair() SECOND CHANCE ");
                    console.log(JSON.stringify(textFragmentIDChain_, null, 4));
                    console.log(JSON.stringify(rootMo, null, 4));
                }
                moTextAudioPair = this.findDepthFirstTextAudioPair(textHref, rootMo, undefined);
            }
            if (moTextAudioPair) {
                if (moTextAudioPair.Audio) {
                    if (__1.IS_DEV)
                        console.log("playMediaOverlays() - playMediaOverlaysAudio()");
                    this.mediaOverlayRoot = rootMo;
                    yield this.playMediaOverlaysAudio(moTextAudioPair, undefined, undefined);
                }
            }
            else {
                if (__1.IS_DEV)
                    console.log("playMediaOverlays() - !moTextAudioPair " + textHref);
            }
        });
    }
    mediaOverlayHighlight(href, id) {
        var _a, _b, _c, _d, _e, _f;
        if (__1.IS_DEV)
            console.log("moHighlight: " + href + " ## " + id);
        let classActive = (_b = (_a = this.publication.Metadata) === null || _a === void 0 ? void 0 : _a.MediaOverlay) === null || _b === void 0 ? void 0 : _b.ActiveClass;
        if (!classActive) {
            classActive = this.settings.color;
        }
        const styleAttr = this.delegate.iframes[0].contentDocument.documentElement.getAttribute("style");
        const isNight = styleAttr
            ? styleAttr.indexOf("readium-night-on") > 0
            : false;
        const isSepia = styleAttr
            ? styleAttr.indexOf("readium-sepia-on") > 0
            : false;
        if (((_d = (_c = this.publication.Metadata.Rendition) === null || _c === void 0 ? void 0 : _c.Layout) !== null && _d !== void 0 ? _d : "unknown") !== "fixed") {
            classActive =
                isNight || isSepia
                    ? MediaOverlaySettings_1.R2_MO_CLASS_ACTIVE
                    : classActive
                        ? classActive
                        : MediaOverlaySettings_1.R2_MO_CLASS_ACTIVE;
        }
        if (this.pid) {
            let prevElement;
            if (this.currentLinkIndex === 0) {
                prevElement = this.delegate.iframes[0].contentDocument.getElementById(this.pid);
            }
            else {
                prevElement = this.delegate.iframes[1].contentDocument.getElementById(this.pid);
            }
            if (prevElement) {
                prevElement.classList.remove(classActive);
            }
        }
        let current;
        if (this.currentLinkIndex === 0) {
            current = this.delegate.iframes[0].contentDocument.getElementById(id);
        }
        else {
            current = this.delegate.iframes[1].contentDocument.getElementById(id);
        }
        if (current) {
            current.classList.add(classActive);
        }
        this.pid = id;
        if (current &&
            ((_f = (_e = this.publication.Metadata.Rendition) === null || _e === void 0 ? void 0 : _e.Layout) !== null && _f !== void 0 ? _f : "unknown") !== "fixed") {
            current.scrollIntoView({
                block: "center",
                behavior: "smooth",
            });
        }
    }
}
exports.default = MediaOverlayModule;
//# sourceMappingURL=MediaOverlayModule.js.map