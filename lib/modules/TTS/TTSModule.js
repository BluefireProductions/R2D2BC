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
 * Developed on behalf of: CAST (http://www.cast.org) and DITA
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
const __1 = require("../..");
const HTMLUtilities = require("../../utils/HTMLUtilities");
const EventHandler_1 = require("../../utils/EventHandler");
const sanitize = require("sanitize-html");
class TTSModule {
    constructor(delegate, tts, headerMenu, rights, highlighter, properties = null, api = null) {
        this.voices = [];
        this.hasEventListener = false;
        this.index = 0;
        this.userScrolled = false;
        this.delegate = delegate;
        this.tts = tts;
        this.headerMenu = headerMenu;
        this.rights = rights;
        this.highlighter = highlighter;
        this.properties = properties;
        this.api = api;
    }
    initialize(body) {
        if (this.highlighter !== undefined) {
            this.tts.setControls();
            this.tts.onSettingsChange(this.handleResize.bind(this));
            this.body = body;
            this.clean = sanitize(this.body.innerHTML, {
                allowedTags: [],
                allowedAttributes: {},
            });
            let splittingResult = body.querySelectorAll("[data-word]");
            splittingResult.forEach((splittingWord) => {
                splittingWord.dataset.ttsColor = this.tts.color;
            });
            let whitespace = body.querySelectorAll("[data-whitespace]");
            whitespace.forEach((splittingWord) => {
                splittingWord.dataset.ttsColor = this.tts.color;
            });
            window.speechSynthesis.getVoices();
            this.initVoices(true);
            if (!this.hasEventListener) {
                this.hasEventListener = true;
                EventHandler_1.addEventListenerOptional(document, "wheel", this.wheel.bind(this));
                EventHandler_1.addEventListenerOptional(this.body, "wheel", this.wheel.bind(this));
                EventHandler_1.addEventListenerOptional(document, "keydown", this.wheel.bind(this));
                EventHandler_1.addEventListenerOptional(this.delegate.iframes[0].contentDocument, "keydown", this.wheel.bind(this));
            }
        }
    }
    initVoices(first) {
        function setSpeech() {
            return new Promise(function (resolve, _reject) {
                let synth = window.speechSynthesis;
                let id;
                id = setInterval(() => {
                    if (synth.getVoices().length !== 0) {
                        resolve(synth.getVoices());
                        clearInterval(id);
                    }
                }, 10);
            });
        }
        let s = setSpeech();
        s.then((voices) => __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV)
                console.log(voices);
            this.voices = [];
            voices.forEach((voice) => {
                if (voice.localService === true) {
                    this.voices.push(voice);
                }
            });
            if (__1.IS_DEV)
                console.log(this.voices);
            if (first) {
                // preferred-languages
                if (this.headerMenu) {
                    var preferredLanguageSelector = HTMLUtilities.findElement(this.headerMenu, "#preferred-languages");
                    if (preferredLanguageSelector) {
                        this.voices.forEach((voice) => {
                            var v = document.createElement("option");
                            v.value = voice.name + ":" + voice.lang;
                            v.innerHTML = voice.name + " (" + voice.lang + ")";
                            preferredLanguageSelector.add(v);
                        });
                    }
                }
            }
        }));
    }
    cancel() {
        var _a, _b, _c;
        if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.stopped)
            (_b = this.api) === null || _b === void 0 ? void 0 : _b.stopped();
        this.userScrolled = false;
        window.speechSynthesis.cancel();
        if (this.splittingResult && ((_c = this.delegate.tts) === null || _c === void 0 ? void 0 : _c.enableSplitter)) {
            this.splittingResult.forEach((splittingWord) => {
                splittingWord.dataset.ttsCurrentWord = "false";
                splittingWord.dataset.ttsCurrentLine = "false";
            });
        }
    }
    handleResize() {
        let splittingResult = this.body.querySelectorAll("[data-word]");
        splittingResult.forEach((splittingWord) => {
            splittingWord.dataset.ttsColor = this.tts.color;
            splittingWord.dataset.ttsCurrentWord = "false";
            splittingWord.dataset.ttsCurrentLine = "false";
        });
        let whitespace = this.body.querySelectorAll("[data-whitespace]");
        whitespace.forEach((splittingWord) => {
            splittingWord.dataset.ttsColor = this.tts.color;
            splittingWord.dataset.ttsCurrentWord = "false";
            splittingWord.dataset.ttsCurrentLine = "false";
        });
    }
    speak(selectionInfo, partial, callback) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.started)
                (_b = this.api) === null || _b === void 0 ? void 0 : _b.started();
            var self = this;
            this.userScrolled = false;
            this.cancel();
            if ((_c = this.delegate.tts) === null || _c === void 0 ? void 0 : _c.enableSplitter) {
                if (partial) {
                    var allWords = self.body.querySelectorAll("[data-word]");
                    var startNode = selectionInfo.range.startContainer
                        .parentElement;
                    if (startNode.tagName.toLowerCase() === "a") {
                        startNode = startNode.parentElement;
                    }
                    if (startNode.dataset === undefined) {
                        startNode = startNode.nextElementSibling;
                    }
                    var endNode = selectionInfo.range.endContainer
                        .parentElement;
                    if (endNode.tagName.toLowerCase() === "a") {
                        endNode = endNode.parentElement;
                    }
                    if (endNode.dataset === undefined) {
                        endNode = endNode.previousElementSibling;
                    }
                    var startWordIndex = parseInt(startNode.dataset.wordIndex);
                    var endWordIndex = parseInt(endNode.dataset.wordIndex) + 1;
                    let array = Array.from(allWords);
                    this.splittingResult = array.slice(startWordIndex, endWordIndex);
                }
                else {
                    document.scrollingElement.scrollTop = 0;
                    this.splittingResult = self.body.querySelectorAll("[data-word]");
                }
            }
            const utterance = partial
                ? new SpeechSynthesisUtterance(selectionInfo.cleanText)
                : new SpeechSynthesisUtterance(this.clean);
            utterance.rate = this.tts.rate;
            utterance.pitch = this.tts.pitch;
            utterance.volume = this.tts.volume;
            if (__1.IS_DEV)
                console.log("this.tts.voice.lang", this.tts.voice.lang);
            var initialVoiceHasHyphen = true;
            if (this.tts.voice && this.tts.voice.lang) {
                initialVoiceHasHyphen = this.tts.voice.lang.indexOf("-") !== -1;
                if (initialVoiceHasHyphen === false) {
                    this.tts.voice.lang = this.tts.voice.lang.replace("_", "-");
                    initialVoiceHasHyphen = true;
                }
            }
            if (__1.IS_DEV)
                console.log("initialVoiceHasHyphen", initialVoiceHasHyphen);
            if (__1.IS_DEV)
                console.log("voices", this.voices);
            var initialVoice;
            if (initialVoiceHasHyphen === true) {
                initialVoice =
                    this.tts.voice && this.tts.voice.lang && this.tts.voice.name
                        ? this.voices.filter((v) => {
                            var lang = v.lang.replace("_", "-");
                            return (lang === this.tts.voice.lang && v.name === this.tts.voice.name);
                        })[0]
                        : undefined;
                if (initialVoice === undefined) {
                    initialVoice =
                        this.tts.voice && this.tts.voice.lang
                            ? this.voices.filter((v) => v.lang.replace("_", "-") === this.tts.voice.lang)[0]
                            : undefined;
                }
            }
            else {
                initialVoice =
                    this.tts.voice && this.tts.voice.lang && this.tts.voice.name
                        ? this.voices.filter((v) => {
                            return (v.lang === this.tts.voice.lang && v.name === this.tts.voice.name);
                        })[0]
                        : undefined;
                if (initialVoice === undefined) {
                    initialVoice =
                        this.tts.voice && this.tts.voice.lang
                            ? this.voices.filter((v) => v.lang === this.tts.voice.lang)[0]
                            : undefined;
                }
            }
            if (__1.IS_DEV)
                console.log("initialVoice", initialVoice);
            var publicationVoiceHasHyphen = self.delegate.publication.Metadata.Language[0].indexOf("-") !== -1;
            if (__1.IS_DEV)
                console.log("publicationVoiceHasHyphen", publicationVoiceHasHyphen);
            var publicationVoice;
            if (publicationVoiceHasHyphen === true) {
                publicationVoice =
                    this.tts.voice && this.tts.voice.usePublication
                        ? this.voices.filter((v) => {
                            var lang = v.lang.replace("_", "-");
                            return (lang.startsWith(self.delegate.publication.Metadata.Language[0]) ||
                                lang.endsWith(self.delegate.publication.Metadata.Language[0].toUpperCase()));
                        })[0]
                        : undefined;
            }
            else {
                publicationVoice =
                    this.tts.voice && this.tts.voice.usePublication
                        ? this.voices.filter((v) => {
                            return (v.lang.startsWith(self.delegate.publication.Metadata.Language[0]) ||
                                v.lang.endsWith(self.delegate.publication.Metadata.Language[0].toUpperCase()));
                        })[0]
                        : undefined;
            }
            if (__1.IS_DEV)
                console.log("publicationVoice", publicationVoice);
            var defaultVoiceHasHyphen = navigator.language.indexOf("-") !== -1;
            if (__1.IS_DEV)
                console.log("defaultVoiceHasHyphen", defaultVoiceHasHyphen);
            var defaultVoice;
            if (defaultVoiceHasHyphen === true) {
                defaultVoice = this.voices.filter((voice) => {
                    var lang = voice.lang.replace("_", "-");
                    return lang === navigator.language && voice.localService === true;
                })[0];
            }
            else {
                defaultVoice = this.voices.filter((voice) => {
                    var lang = voice.lang;
                    return lang === navigator.language && voice.localService === true;
                })[0];
            }
            if (defaultVoice === undefined) {
                defaultVoice = this.voices.filter((voice) => {
                    var lang = voice.lang;
                    return lang.includes(navigator.language) && voice.localService === true;
                })[0];
            }
            if (__1.IS_DEV)
                console.log("defaultVoice", defaultVoice);
            if (initialVoice) {
                if (__1.IS_DEV)
                    console.log("initialVoice");
                utterance.voice = initialVoice;
            }
            else if (publicationVoice) {
                if (__1.IS_DEV)
                    console.log("publicationVoice");
                utterance.voice = publicationVoice;
            }
            else if (defaultVoice) {
                if (__1.IS_DEV)
                    console.log("defaultVoice");
                utterance.voice = defaultVoice;
            }
            if (utterance.voice !== undefined && utterance.voice !== null) {
                utterance.lang = utterance.voice.lang;
                if (__1.IS_DEV)
                    console.log("utterance.voice.lang", utterance.voice.lang);
                if (__1.IS_DEV)
                    console.log("utterance.lang", utterance.lang);
            }
            if (__1.IS_DEV)
                console.log("navigator.language", navigator.language);
            window.speechSynthesis.speak(utterance);
            this.index = 0;
            var lastword = undefined;
            utterance.onboundary = function (e) {
                var _a;
                if (e.name === "sentence") {
                    if (__1.IS_DEV)
                        console.log("sentence boundary", e.charIndex, e.charLength, utterance.text.slice(e.charIndex, e.charIndex + e.charLength));
                }
                if (e.name === "word") {
                    function getWordAt(str, pos) {
                        // Perform type conversions.
                        str = String(str);
                        pos = Number(pos) >>> 0;
                        // Search for the word's beginning and end.
                        var left = str.slice(0, pos + 1).search(/\S+$/), right = str.slice(pos).search(/\s/);
                        // The last word in the string is a special case.
                        if (right < 0) {
                            return str.slice(left);
                        }
                        // Return the word, using the located bounds to extract it from the string.
                        return str.slice(left, right + pos);
                    }
                    const word = getWordAt(utterance.text, e.charIndex);
                    if (lastword === word) {
                        self.index--;
                    }
                    lastword = word;
                    if ((_a = self.delegate.tts) === null || _a === void 0 ? void 0 : _a.enableSplitter) {
                        processWord(word);
                    }
                }
            };
            function processWord(word) {
                return __awaiter(this, void 0, void 0, function* () {
                    var spokenWordCleaned = word.replace(/[^a-zA-Z0-9 ]/g, "");
                    if (__1.IS_DEV)
                        console.log("spokenWordCleaned", spokenWordCleaned);
                    let splittingWord = self.splittingResult[self.index];
                    var splittingWordCleaned = splittingWord === null || splittingWord === void 0 ? void 0 : splittingWord.dataset.word.replace(/[^a-zA-Z0-9 ]/g, "");
                    if (__1.IS_DEV)
                        console.log("splittingWordCleaned", splittingWordCleaned);
                    if (splittingWordCleaned.length === 0) {
                        self.index++;
                        splittingWord = self.splittingResult[self.index];
                        splittingWordCleaned = splittingWord === null || splittingWord === void 0 ? void 0 : splittingWord.dataset.word.replace(/[^a-zA-Z0-9 ]/g, "");
                        if (__1.IS_DEV)
                            console.log("splittingWordCleaned", splittingWordCleaned);
                    }
                    if (splittingWord) {
                        var isAnchorParent = splittingWord.parentElement.tagName.toLowerCase() === "a";
                        if (!isAnchorParent) {
                            if (spokenWordCleaned.length > 0 && splittingWordCleaned.length > 0) {
                                if (splittingWordCleaned.startsWith(spokenWordCleaned) ||
                                    splittingWordCleaned.endsWith(spokenWordCleaned) ||
                                    spokenWordCleaned.startsWith(splittingWordCleaned) ||
                                    spokenWordCleaned.endsWith(splittingWordCleaned)) {
                                    if (self.index > 0) {
                                        let splittingResult = self.body.querySelectorAll("[data-word]");
                                        splittingResult.forEach((splittingWord) => {
                                            splittingWord.dataset.ttsColor = self.tts.color;
                                            splittingWord.dataset.ttsCurrentWord = "false";
                                            splittingWord.dataset.ttsCurrentLine = "false";
                                        });
                                        let whitespace = self.body.querySelectorAll("[data-whitespace]");
                                        whitespace.forEach((splittingWord) => {
                                            splittingWord.dataset.ttsColor = self.tts.color;
                                            splittingWord.dataset.ttsCurrentWord = "false";
                                            splittingWord.dataset.ttsCurrentLine = "false";
                                        });
                                    }
                                    splittingWord.dataset.ttsCurrentWord = "true";
                                    if (self.delegate.view.isScrollMode() &&
                                        self.tts.autoScroll &&
                                        !self.userScrolled) {
                                        splittingWord.scrollIntoView({
                                            block: "center",
                                            behavior: "smooth",
                                        });
                                    }
                                }
                                else {
                                    self.index++;
                                }
                            }
                            else if (spokenWordCleaned.length === 0) {
                                self.index--;
                            }
                        }
                        self.index++;
                    }
                });
            }
            utterance.onend = function () {
                var _a, _b;
                if (__1.IS_DEV)
                    console.log("utterance ended");
                self.highlighter.doneSpeaking();
                if ((_a = self.delegate.tts) === null || _a === void 0 ? void 0 : _a.enableSplitter) {
                    let splittingResult = self.body.querySelectorAll("[data-word]");
                    splittingResult.forEach((splittingWord) => {
                        splittingWord.dataset.ttsColor = self.tts.color;
                        splittingWord.dataset.ttsCurrentWord = "false";
                        splittingWord.dataset.ttsCurrentLine = "false";
                    });
                    let whitespace = self.body.querySelectorAll("[data-whitespace]");
                    whitespace.forEach((splittingWord) => {
                        splittingWord.dataset.ttsColor = self.tts.color;
                        splittingWord.dataset.ttsCurrentWord = "false";
                        splittingWord.dataset.ttsCurrentLine = "false";
                    });
                }
                (_b = self.api) === null || _b === void 0 ? void 0 : _b.finished();
            };
            callback();
        });
    }
    speakPause() {
        var _a, _b;
        if (window.speechSynthesis.speaking) {
            if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.paused)
                (_b = this.api) === null || _b === void 0 ? void 0 : _b.paused();
            this.userScrolled = false;
            window.speechSynthesis.pause();
        }
    }
    speakResume() {
        var _a, _b;
        if (window.speechSynthesis.speaking) {
            if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.resumed)
                (_b = this.api) === null || _b === void 0 ? void 0 : _b.resumed();
            this.userScrolled = false;
            window.speechSynthesis.resume();
        }
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const tts = new this(config.delegate, config.tts, config.headerMenu, config.rights, config.highlighter, config, config.api);
            yield tts.start();
            return tts;
        });
    }
    start() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.delegate.ttsModule = this;
            if (this.headerMenu) {
                var menuTTS = HTMLUtilities.findElement(this.headerMenu, "#menu-button-tts");
                if ((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableMaterial) {
                    if (menuTTS)
                        menuTTS.parentElement.style.removeProperty("display");
                }
                else {
                    if (menuTTS)
                        menuTTS.parentElement.style.setProperty("display", "none");
                }
            }
        });
    }
    wheel(event) {
        if (event instanceof KeyboardEvent) {
            const key = event.key;
            switch (key) {
                case "ArrowUp":
                    this.userScrolled = true;
                    break;
                case "ArrowDown":
                    this.userScrolled = true;
                    break;
            }
        }
        else {
            this.userScrolled = true;
        }
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("TTS module stop");
            }
            EventHandler_1.removeEventListenerOptional(document, "wheel", this.wheel.bind(this));
            EventHandler_1.removeEventListenerOptional(this.body, "wheel", this.wheel.bind(this));
            EventHandler_1.removeEventListenerOptional(document, "keydown", this.wheel.bind(this));
            EventHandler_1.removeEventListenerOptional(this.delegate.iframes[0].contentDocument, "keydown", this.wheel.bind(this));
        });
    }
}
exports.default = TTSModule;
//# sourceMappingURL=TTSModule.js.map