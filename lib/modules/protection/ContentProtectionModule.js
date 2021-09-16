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
 * Developed on behalf of: DITA, Bokbasen AS (https://www.bokbasen.no), Bluefire Productions, LLC (https://www.bluefirereader.com/)
 * Licensed to: Bluefire Productions, LLC, Bibliotheca LLC, Bokbasen AS and CAST under one or more contributor license agreements.
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
const HTMLUtilities = require("../../utils/HTMLUtilities");
const EventHandler_1 = require("../../utils/EventHandler");
const debounce_1 = require("debounce");
const __1 = require("../..");
class ContentProtectionModule {
    constructor(delegate, properties = null) {
        this.hasEventListener = false;
        this.isHacked = false;
        this.delegate = delegate;
        this.properties = properties;
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const security = new this(config.delegate, config);
            yield security.start();
            return security;
        });
    }
    start() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.delegate.contentProtectionModule = this;
            if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.enableObfuscation) {
                this.securityContainer = HTMLUtilities.findElement(document, "#container-view-security");
                var self = this;
                // create an observer instance
                this.mutationObserver = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (__1.IS_DEV) {
                            console.log(mutation.type);
                        }
                        self.isHacked = true;
                    });
                });
            }
        });
    }
    stop() {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("Protection module stop");
            }
            this.mutationObserver.disconnect();
            if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.disableKeys) {
                EventHandler_1.removeEventListenerOptional(this.delegate.mainElement, "keydown", this.disableSave);
                EventHandler_1.removeEventListenerOptional(this.delegate.headerMenu, "keydown", this.disableSave);
                for (const iframe of this.delegate.iframes) {
                    EventHandler_1.removeEventListenerOptional(iframe.contentDocument, "keydown", this.disableSave);
                    EventHandler_1.removeEventListenerOptional(iframe.contentWindow, "keydown", this.disableSave);
                }
                EventHandler_1.removeEventListenerOptional(window, "keydown", this.disableSave);
                EventHandler_1.removeEventListenerOptional(document, "keydown", this.disableSave);
            }
            if ((_b = this.properties) === null || _b === void 0 ? void 0 : _b.disableCopy) {
                EventHandler_1.removeEventListenerOptional(this.delegate.mainElement, "copy", this.preventCopy);
                EventHandler_1.removeEventListenerOptional(this.delegate.headerMenu, "copy", this.preventCopy);
                for (const iframe of this.delegate.iframes) {
                    EventHandler_1.removeEventListenerOptional(iframe.contentDocument, "copy", this.preventCopy);
                    EventHandler_1.removeEventListenerOptional(iframe.contentWindow, "copy", this.preventCopy);
                }
                EventHandler_1.removeEventListenerOptional(window, "copy", this.preventCopy);
                EventHandler_1.removeEventListenerOptional(document, "copy", this.preventCopy);
                EventHandler_1.removeEventListenerOptional(this.delegate.mainElement, "cut", this.preventCopy);
                EventHandler_1.removeEventListenerOptional(this.delegate.headerMenu, "cut", this.preventCopy);
                for (const iframe of this.delegate.iframes) {
                    EventHandler_1.removeEventListenerOptional(iframe.contentDocument, "cut", this.preventCopy);
                    EventHandler_1.removeEventListenerOptional(iframe.contentWindow, "cut", this.preventCopy);
                }
                EventHandler_1.removeEventListenerOptional(window, "cut", this.preventCopy);
                EventHandler_1.removeEventListenerOptional(document, "cut", this.preventCopy);
            }
            if ((_c = this.properties) === null || _c === void 0 ? void 0 : _c.disablePrint) {
                EventHandler_1.removeEventListenerOptional(this.delegate.mainElement, "beforeprint", this.beforePrint.bind(this));
                EventHandler_1.removeEventListenerOptional(this.delegate.headerMenu, "beforeprint", this.beforePrint.bind(this));
                for (const iframe of this.delegate.iframes) {
                    EventHandler_1.removeEventListenerOptional(iframe.contentDocument, "beforeprint", this.beforePrint);
                    EventHandler_1.removeEventListenerOptional(iframe.contentWindow, "beforeprint", this.beforePrint);
                }
                EventHandler_1.removeEventListenerOptional(window, "beforeprint", this.beforePrint);
                EventHandler_1.removeEventListenerOptional(document, "beforeprint", this.beforePrint);
                EventHandler_1.removeEventListenerOptional(this.delegate.mainElement, "afterprint", this.afterPrint.bind(this));
                EventHandler_1.removeEventListenerOptional(this.delegate.headerMenu, "afterprint", this.afterPrint.bind(this));
                for (const iframe of this.delegate.iframes) {
                    EventHandler_1.removeEventListenerOptional(iframe.contentDocument, "afterprint", this.afterPrint.bind(this));
                    EventHandler_1.removeEventListenerOptional(iframe.contentWindow, "afterprint", this.afterPrint.bind(this));
                }
                EventHandler_1.removeEventListenerOptional(window, "afterprint", this.afterPrint.bind(this));
                EventHandler_1.removeEventListenerOptional(document, "afterprint", this.afterPrint.bind(this));
            }
            if ((_d = this.properties) === null || _d === void 0 ? void 0 : _d.disableContextMenu) {
                EventHandler_1.removeEventListenerOptional(this.delegate.mainElement, "contextmenu", this.disableContext);
                EventHandler_1.removeEventListenerOptional(this.delegate.headerMenu, "contextmenu", this.disableContext);
                for (const iframe of this.delegate.iframes) {
                    EventHandler_1.removeEventListenerOptional(iframe.contentDocument, "contextmenu", this.disableContext);
                    EventHandler_1.removeEventListenerOptional(iframe.contentWindow, "contextmenu", this.disableContext);
                }
                EventHandler_1.removeEventListenerOptional(window, "contextmenu", this.disableContext);
                EventHandler_1.removeEventListenerOptional(document, "contextmenu", this.disableContext);
            }
            if ((_e = this.properties) === null || _e === void 0 ? void 0 : _e.hideTargetUrl) {
                this.hideTargetUrls(false);
            }
            if ((_f = this.properties) === null || _f === void 0 ? void 0 : _f.disableDrag) {
                this.preventDrag(false);
            }
            EventHandler_1.removeEventListenerOptional(window, "scroll", this.handleScroll.bind(this));
        });
    }
    observe() {
        var _a;
        if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.enableObfuscation) {
            if (this.securityContainer.hasAttribute("style")) {
                this.isHacked = true;
            }
            // stop observing first
            this.mutationObserver.disconnect();
            // configuration of the observer:
            var config = { attributes: true, childList: true, characterData: true };
            // pass in the target node, as well as the observer options
            this.mutationObserver.observe(this.securityContainer, config);
        }
    }
    deactivate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.enableObfuscation) {
                this.observe();
                this.rects.forEach((rect) => this.deactivateRect(rect, this.securityContainer, this.isHacked));
            }
        });
    }
    activate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.enableObfuscation) {
                this.observe();
                for (const iframe of this.delegate.iframes) {
                    const body = HTMLUtilities.findRequiredIframeElement(iframe.contentDocument, "body");
                    this.rects = this.findRects(body);
                    this.rects.forEach((rect) => this.toggleRect(rect, this.securityContainer, this.isHacked));
                }
            }
        });
    }
    setupEvents() {
        var _a, _b, _c, _d;
        if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.disableKeys) {
            EventHandler_1.addEventListenerOptional(this.delegate.mainElement, "keydown", this.disableSave);
            EventHandler_1.addEventListenerOptional(this.delegate.headerMenu, "keydown", this.disableSave);
            for (const iframe of this.delegate.iframes) {
                EventHandler_1.addEventListenerOptional(iframe, "keydown", this.disableSave);
                EventHandler_1.addEventListenerOptional(iframe.ownerDocument, "keydown", this.disableSave);
                EventHandler_1.addEventListenerOptional(iframe.contentDocument, "keydown", this.disableSave);
                EventHandler_1.addEventListenerOptional(iframe.contentWindow, "keydown", this.disableSave);
                EventHandler_1.addEventListenerOptional(iframe.contentWindow.document, "keydown", this.disableSave);
            }
            EventHandler_1.addEventListenerOptional(window, "keydown", this.disableSave);
            EventHandler_1.addEventListenerOptional(document, "keydown", this.disableSave);
        }
        if ((_b = this.properties) === null || _b === void 0 ? void 0 : _b.disableCopy) {
            EventHandler_1.addEventListenerOptional(this.delegate.mainElement, "copy", this.preventCopy);
            EventHandler_1.addEventListenerOptional(this.delegate.headerMenu, "copy", this.preventCopy);
            for (const iframe of this.delegate.iframes) {
                EventHandler_1.addEventListenerOptional(iframe, "copy", this.preventCopy);
                EventHandler_1.addEventListenerOptional(iframe.ownerDocument, "copy", this.preventCopy);
                EventHandler_1.addEventListenerOptional(iframe.contentDocument, "copy", this.preventCopy);
                EventHandler_1.addEventListenerOptional(iframe.contentWindow, "copy", this.preventCopy);
                EventHandler_1.addEventListenerOptional(iframe.contentWindow.document, "copy", this.preventCopy);
            }
            EventHandler_1.addEventListenerOptional(window, "copy", this.preventCopy);
            EventHandler_1.addEventListenerOptional(document, "copy", this.preventCopy);
            EventHandler_1.addEventListenerOptional(this.delegate.mainElement, "cut", this.preventCopy);
            EventHandler_1.addEventListenerOptional(this.delegate.headerMenu, "cut", this.preventCopy);
            for (const iframe of this.delegate.iframes) {
                EventHandler_1.addEventListenerOptional(iframe, "cut", this.preventCopy);
                EventHandler_1.addEventListenerOptional(iframe.ownerDocument, "cut", this.preventCopy);
                EventHandler_1.addEventListenerOptional(iframe.contentDocument, "cut", this.preventCopy);
                EventHandler_1.addEventListenerOptional(iframe.contentWindow, "cut", this.preventCopy);
                EventHandler_1.addEventListenerOptional(iframe.contentWindow.document, "cut", this.preventCopy);
            }
            EventHandler_1.addEventListenerOptional(window, "cut", this.preventCopy);
            EventHandler_1.addEventListenerOptional(document, "cut", this.preventCopy);
        }
        if ((_c = this.properties) === null || _c === void 0 ? void 0 : _c.disablePrint) {
            EventHandler_1.addEventListenerOptional(this.delegate.mainElement, "beforeprint", this.beforePrint);
            EventHandler_1.addEventListenerOptional(this.delegate.headerMenu, "beforeprint", this.beforePrint);
            for (const iframe of this.delegate.iframes) {
                EventHandler_1.addEventListenerOptional(iframe, "beforeprint", this.beforePrint.bind(this));
                EventHandler_1.addEventListenerOptional(iframe.ownerDocument, "beforeprint", this.beforePrint.bind(this));
                EventHandler_1.addEventListenerOptional(iframe.contentDocument, "beforeprint", this.beforePrint.bind(this));
                EventHandler_1.addEventListenerOptional(iframe.contentWindow, "beforeprint", this.beforePrint.bind(this));
                EventHandler_1.addEventListenerOptional(iframe.contentWindow.document, "beforeprint", this.beforePrint.bind(this));
            }
            EventHandler_1.addEventListenerOptional(window, "beforeprint", this.beforePrint.bind(this));
            EventHandler_1.addEventListenerOptional(document, "beforeprint", this.beforePrint.bind(this));
            EventHandler_1.addEventListenerOptional(this.delegate.mainElement, "afterprint", this.afterPrint);
            EventHandler_1.addEventListenerOptional(this.delegate.headerMenu, "afterprint", this.afterPrint);
            for (const iframe of this.delegate.iframes) {
                EventHandler_1.addEventListenerOptional(iframe, "afterprint", this.afterPrint.bind(this));
                EventHandler_1.addEventListenerOptional(iframe.ownerDocument, "afterprint", this.afterPrint.bind(this));
                EventHandler_1.addEventListenerOptional(iframe.contentDocument, "afterprint", this.afterPrint.bind(this));
                EventHandler_1.addEventListenerOptional(iframe.contentWindow, "afterprint", this.afterPrint.bind(this));
                EventHandler_1.addEventListenerOptional(iframe.contentWindow.document, "afterprint", this.afterPrint.bind(this));
            }
            EventHandler_1.addEventListenerOptional(window, "afterprint", this.afterPrint.bind(this));
            EventHandler_1.addEventListenerOptional(document, "afterprint", this.afterPrint.bind(this));
        }
        if ((_d = this.properties) === null || _d === void 0 ? void 0 : _d.disableContextMenu) {
            EventHandler_1.addEventListenerOptional(this.delegate.mainElement, "contextmenu", this.disableContext);
            EventHandler_1.addEventListenerOptional(this.delegate.headerMenu, "contextmenu", this.disableContext);
            for (const iframe of this.delegate.iframes) {
                EventHandler_1.addEventListenerOptional(iframe, "contextmenu", this.disableContext);
                EventHandler_1.addEventListenerOptional(iframe.ownerDocument, "contextmenu", this.disableContext);
                EventHandler_1.addEventListenerOptional(iframe.contentDocument, "contextmenu", this.disableContext);
                EventHandler_1.addEventListenerOptional(iframe.contentWindow, "contextmenu", this.disableContext);
                EventHandler_1.addEventListenerOptional(iframe.contentWindow.document, "contextmenu", this.disableContext);
            }
            EventHandler_1.addEventListenerOptional(window, "contextmenu", this.disableContext);
            EventHandler_1.addEventListenerOptional(document, "contextmenu", this.disableContext);
        }
    }
    initializeResource() {
        var _a, _b;
        if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.hideTargetUrl) {
            this.hideTargetUrls(true);
        }
        if ((_b = this.properties) === null || _b === void 0 ? void 0 : _b.disableDrag) {
            this.preventDrag(true);
        }
    }
    initialize() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.enableObfuscation) {
                return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    yield document.fonts.ready;
                    for (const iframe of this.delegate.iframes) {
                        const body = HTMLUtilities.findRequiredIframeElement(iframe.contentDocument, "body");
                        this.observe();
                        setTimeout(() => {
                            this.rects = this.findRects(body);
                            this.rects.forEach((rect) => this.toggleRect(rect, this.securityContainer, this.isHacked));
                            this.setupEvents();
                            if (!this.hasEventListener) {
                                this.hasEventListener = true;
                                EventHandler_1.addEventListenerOptional(window, "scroll", this.handleScroll.bind(this));
                            }
                            resolve();
                        }, 10);
                    }
                }));
            }
        });
    }
    handleScroll() {
        this.rects.forEach((rect) => this.toggleRect(rect, this.securityContainer, this.isHacked));
    }
    handleResize() {
        var _a;
        if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.enableObfuscation) {
            const onDoResize = debounce_1.debounce(() => {
                this.calcRects(this.rects);
                if (this.rects !== undefined) {
                    this.rects.forEach((rect) => this.toggleRect(rect, this.securityContainer, this.isHacked));
                }
            }, 10);
            if (this.rects) {
                this.observe();
                onDoResize();
            }
        }
    }
    disableContext(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    disableSave(event) {
        if (navigator.platform === "MacIntel" || navigator.platform.match("Mac")
            ? event.metaKey
            : event.ctrlKey && (event.key === "s" || event.keyCode === 83)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        return true;
    }
    preventCopy(event) {
        if (__1.IS_DEV) {
            console.log("copy action initiated");
        }
        event.clipboardData.setData("text/plain", "copy not allowed");
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    beforePrint(event) {
        if (__1.IS_DEV) {
            console.log("before print");
        }
        this.delegate.headerMenu.style.display = "none";
        this.delegate.mainElement.style.display = "none";
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    afterPrint(event) {
        if (__1.IS_DEV) {
            console.log("before print");
        }
        this.delegate.headerMenu.style.removeProperty("display");
        this.delegate.mainElement.style.removeProperty("display");
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    hideTargetUrls(activate) {
        function onAElementClick(ev) {
            ev.preventDefault();
            const href = ev.currentTarget.getAttribute("data-href-resolved");
            const aElement = document.createElement("a");
            aElement.setAttribute("href", href);
            aElement.click();
        }
        for (const iframe of this.delegate.iframes) {
            const aElements = iframe.contentDocument.querySelectorAll("a");
            aElements.forEach((aElement) => {
                const dataHref = aElement.getAttribute("data-href");
                if (!dataHref) {
                    aElement.setAttribute("data-href", aElement.getAttribute("href"));
                    aElement.setAttribute("data-href-resolved", aElement.href);
                }
            });
            if (activate) {
                aElements.forEach((aElement) => {
                    aElement.setAttribute("href", "");
                    aElement.addEventListener("click", onAElementClick);
                });
            }
            else {
                aElements.forEach((aElement) => {
                    aElement.setAttribute("href", aElement.getAttribute("data-href"));
                    aElement.removeEventListener("click", onAElementClick);
                });
            }
        }
    }
    preventDrag(activate) {
        const dragStyle = "-webkit-user-drag: none; -khtml-user-drag: none; -moz-user-drag: none; -ms-user-drag: none; user-drag: none; -webkit-pointer-events: none; -khtml-pointer-events: none; -moz-pointer-events: none; -ms-pointer-events: none; pointer-events: none;";
        const onDragstart = (evt) => {
            evt.preventDefault();
        };
        for (const iframe of this.delegate.iframes) {
            const bodyStyle = iframe.contentDocument.body.getAttribute("style") || "";
            if (activate) {
                iframe.contentDocument.body.addEventListener("dragstart", onDragstart);
                iframe.contentDocument.body.setAttribute("style", bodyStyle + dragStyle);
            }
            else {
                iframe.contentDocument.body.removeEventListener("dragstart", onDragstart);
                iframe.contentDocument.body.setAttribute("style", bodyStyle.replace(dragStyle, ""));
            }
        }
    }
    recalculate(delay = 0) {
        var _a;
        if ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.enableObfuscation) {
            const onDoResize = debounce_1.debounce(() => {
                this.calcRects(this.rects);
                if (this.rects !== undefined) {
                    this.rects.forEach((rect) => this.toggleRect(rect, this.securityContainer, this.isHacked));
                }
            }, delay);
            if (this.rects) {
                this.observe();
                onDoResize();
            }
        }
    }
    calcRects(rects) {
        if (rects !== undefined) {
            rects.forEach((rect) => {
                try {
                    const { top, height, left, width } = this.measureTextNode(rect.node);
                    rect.top = top;
                    rect.height = height;
                    rect.width = width;
                    rect.left = left;
                }
                catch (error) {
                    if (__1.IS_DEV) {
                        console.log("error " + error);
                        console.log(rect);
                        console.log(rect.node);
                        console.log("scrambledTextContent " + rect.scrambledTextContent);
                        console.log("textContent " + rect.textContent);
                        console.log("isObfuscated " + rect.isObfuscated);
                    }
                }
            });
        }
    }
    deactivateRect(rect, securityContainer, isHacked) {
        const beingHacked = this.isBeingHacked(securityContainer);
        console.log("deactivate beingHacked " + beingHacked + " isHacked " + isHacked, "CPM");
        if (beingHacked || isHacked) {
            rect.node.textContent = rect.scrambledTextContent;
            rect.isObfuscated = true;
        }
        else {
            rect.node.textContent = rect.textContent;
            rect.isObfuscated = false;
        }
    }
    toggleRect(rect, securityContainer, isHacked) {
        const outsideViewport = this.isOutsideViewport(rect);
        const beingHacked = this.isBeingHacked(securityContainer);
        console.log("===TOGGLE=============================", "CPM");
        console.log("is obfuscated " + rect.isObfuscated + " outsideViewport " + outsideViewport + " beingHacked " + beingHacked + " isHacked " + isHacked, "CPM");
        // console.log("window inner height: " + window.innerHeight);
        // console.log("html client height: " + document.querySelectorAll("html")[0].clientHeight);
        // console.log("html bounding client rect: " + document.querySelectorAll("html")[0].getBoundingClientRect);
        // var htmlElement = document.querySelectorAll("html")[0];
        // htmlElement.style.height = "100%";
        // var computedHeight = window.getComputedStyle(htmlElement).getPropertyValue("height");
        // console.log("computedHeight: " + computedHeight);
        if (rect.isObfuscated && !outsideViewport && !beingHacked && !isHacked) {
            rect.node.textContent = rect.textContent;
            rect.isObfuscated = false;
            console.log("--vv-Descrambling-vv--", "CPM");
            console.log(rect.textContent, "CPM");
            console.log("--^^-Descrambled-^^--", "CPM");
        }
        if (!rect.isObfuscated && (outsideViewport || beingHacked || isHacked)) {
            rect.node.textContent = rect.scrambledTextContent;
            rect.isObfuscated = true;
            console.log("--vv-Scrambling this text:-vv--", "CPM");
            console.log(rect.textContent, "CPM");
            console.log("--vv-After Scrambling-vv--", "CPM");
            console.log(rect.scrambledTextContent, "CPM");
            console.log("--^^-SCRAMBLED-^^--", "CPM");
        }
    }
    findRects(parent) {
        const textNodes = this.findTextNodes(parent);
        return textNodes.map((node) => {
            const { top, height, left, width } = this.measureTextNode(node);
            const scrambled = node.parentElement.nodeName === "option" ||
                node.parentElement.nodeName === "script"
                ? node.textContent
                : this.obfuscateText(node.textContent);
            return {
                top,
                height,
                width,
                left,
                node,
                textContent: node.textContent,
                scrambledTextContent: scrambled,
                isObfuscated: false,
            };
        });
    }
    obfuscateText(text) {
        return this.scramble(text, true);
    }
    measureTextNode(node) {
        try {
            const range = document.createRange();
            range.selectNode(node);
            const rect = range.getBoundingClientRect();
            range.detach(); // frees up memory in older browsers
            return rect;
        }
        catch (error) {
            if (__1.IS_DEV) {
                console.log("measureTextNode " + error);
                console.log("measureTextNode " + node);
                console.log(node.textContent);
            }
        }
    }
    isBeingHacked(element) {
        if (element.style.animation ||
            element.style.transition ||
            element.style.position ||
            element.hasAttribute("style")) {
            if (__1.IS_DEV)
                console.log("content being hacked");
            return true;
        }
        return false;
    }
    isOutsideViewport(rect) {
        const windowLeft = window.scrollX;
        const windowRight = windowLeft + window.innerWidth;
        const right = rect.left + rect.width;
        const bottom = rect.top + rect.height;
        const windowTop = window.scrollY;
        const windowBottom = windowTop + window.innerHeight;
        const isAbove = bottom < windowTop;
        const isBelow = rect.top > windowBottom;
        const isLeft = right < windowLeft;
        const isRight = rect.left > windowRight;
        console.log("CPM isOutsideViewport" + (isAbove || isBelow || isLeft || isRight) +
            " isLeft " + isLeft + " isRight " + isRight, "CPM");
        console.log("CPM windowLeft " + windowLeft + " windowRight " + windowRight + " right " + right + " left " + rect.left, "CPM");
        return isAbove || isBelow || isLeft || isRight;
    }
    findTextNodes(parentElement, nodes = []) {
        let element = parentElement.firstChild;
        while (element) {
            if (element.nodeType === 1) {
                this.findTextNodes(element, nodes);
            }
            if (element.nodeType === 3) {
                if (element.textContent.trim()) {
                    nodes.push(element);
                }
            }
            element = element.nextSibling;
        }
        return nodes;
    }
    scramble(str, letters = false, paragraph = false) {
        var words = str.split(" ");
        function scramble(arr) {
            var len = arr.length;
            var swap;
            var i;
            while (len > 0) {
                i = Math.floor(Math.random() * len);
                len--;
                swap = arr[len];
                arr[len] = arr[i];
                arr[i] = swap;
            }
            return arr;
        }
        if (letters) {
            words = words.map(function (word) {
                return scramble(word.split("")).join("");
            });
        }
        return paragraph ? scramble(words).join(" ") : words.join(" ");
    }
}
exports.default = ContentProtectionModule;
//# sourceMappingURL=ContentProtectionModule.js.map