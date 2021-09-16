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
 * Developed on behalf of: DITA
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
const HTMLUtilities = require("../utils/HTMLUtilities");
const BrowserUtilities = require("../utils/BrowserUtilities");
const debounce_1 = require("debounce");
class ReflowableBookView {
    constructor(store) {
        this.layout = "reflowable";
        this.USERSETTINGS = "userSetting";
        this.sideMargin = 20;
        this.height = 0;
        this.attributes = { margin: 0 };
        // paginated functions
        this.hasFixedScrollWidth = false;
        this.store = store;
        if (this.isScrollMode()) {
            this.name = "readium-scroll-on";
            this.label = "Scrolling";
        }
        else {
            this.name = "readium-scroll-off";
            this.label = "Paginated";
        }
    }
    setMode(scroll) {
        // this.iframe.height = "0";
        // this.iframe.width = "0";
        var _a;
        // const body = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "body") as HTMLBodyElement;
        // const images = Array.prototype.slice.call(body.querySelectorAll("img"));
        // for (const image of images) {
        //     image.style.maxWidth = "";
        // }
        this.scrollMode = scroll;
        if (scroll === true) {
            this.name = "readium-scroll-on";
            this.label = "Scrolling";
            const head = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "head");
            if (head) {
                const viewport = HTMLUtilities.findElement(head, "meta[name=viewport]");
                if (viewport) {
                    viewport.remove();
                }
            }
            const html = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "html");
            html.style.setProperty("--USER__scroll", "readium-scroll-on");
            this.setSize();
            this.setIframeHeight(this.iframe);
        }
        else {
            this.name = "readium-scroll-off";
            this.label = "Paginated";
            // any is necessary because CSSStyleDeclaration type does not include
            // all the vendor-prefixed attributes.
            this.checkForFixedScrollWidth();
            const html = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "html");
            html.style.setProperty("--USER__scroll", "readium-scroll-off");
            this.setSize();
            this.setIframeHeight(this.iframe);
        }
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableContentProtection) {
            this.delegate.contentProtectionModule.recalculate();
        }
    }
    start() {
        if (this.isScrollMode()) {
            const head = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "head");
            if (head) {
                const viewport = HTMLUtilities.findElement(head, "meta[name=viewport]");
                if (viewport) {
                    viewport.remove();
                }
            }
            this.setSize();
        }
        else {
            this.iframe.height = "0";
            this.iframe.width = "0";
            const body = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "body");
            const images = Array.prototype.slice.call(body.querySelectorAll("img"));
            for (const image of images) {
                image.style.maxWidth = "";
            }
            // any is necessary because CSSStyleDeclaration type does not include
            // all the vendor-prefixed attributes.
            this.setSize();
            const viewportElement = document.createElement("meta");
            viewportElement.name = "viewport";
            viewportElement.content =
                "width=device-width, initial-scale=1, maximum-scale=1";
            this.checkForFixedScrollWidth();
        }
    }
    stop() {
        this.iframe.height = "0";
        this.iframe.width = "0";
        const body = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "body");
        const images = Array.prototype.slice.call(body.querySelectorAll("img"));
        for (const image of images) {
            image.style.maxWidth = "";
        }
    }
    getCurrentPosition() {
        if (this.isScrollMode()) {
            return (document.scrollingElement.scrollTop /
                this.iframe.contentDocument.scrollingElement.scrollHeight);
        }
        else {
            const width = this.getColumnWidth();
            const leftWidth = this.getLeftColumnsWidth();
            const rightWidth = this.getRightColumnsWidth();
            const totalWidth = leftWidth + width + rightWidth;
            return leftWidth / totalWidth;
        }
    }
    goToPosition(position) {
        if (this.isScrollMode()) {
            document.scrollingElement.scrollTop =
                this.iframe.contentDocument.scrollingElement.scrollHeight * position;
        }
        else {
            // If the window has changed size since the columns were set up,
            // we need to reset position so we can determine the new total width.
            const width = this.getColumnWidth();
            const leftWidth = this.getLeftColumnsWidth();
            const rightWidth = this.getRightColumnsWidth();
            const totalWidth = leftWidth + width + rightWidth;
            const newLeftWidth = position * totalWidth;
            // Round the new left width so it's a multiple of the column width.
            let roundedLeftWidth = Math.round(newLeftWidth / width) * width;
            if (roundedLeftWidth >= totalWidth) {
                // We've gone too far and all the columns are off to the left.
                // Move one column back into the viewport.
                roundedLeftWidth = roundedLeftWidth - width;
            }
            this.setLeftColumnsWidth(roundedLeftWidth);
        }
    }
    goToCssSelector(cssSelector, relative) {
        var element = this.iframe.contentDocument.querySelector(cssSelector);
        this.goToElement(element, relative);
    }
    goToFragment(fragment, relative) {
        const element = this.iframe.contentDocument.getElementById(fragment);
        this.goToElement(element, relative);
    }
    snap(element, _relative) {
        var _a;
        if (element) {
            if (this.isScrollMode()) {
                //     // Put the element as close to the top as possible.
                //     document.scrollingElement.scrollTop = element.offsetTop;
            }
            else {
                // Get the element's position in the iframe, and
                // round that to figure out the column it's in.
                // There is a bug in Safari when using getBoundingClientRect
                // on an element that spans multiple columns. Temporarily
                // set the element's height to fit it on one column so we
                // can determine the first column position.
                const originalHeight = element.style.height;
                element.style.height = "0";
                const width = this.getColumnWidth();
                const left = this.getLeftColumnsWidth() + element.getBoundingClientRect().left;
                let roundedLeftWidth = Math.floor(left / width) * width;
                // Restore element's original height.
                element.style.height = originalHeight;
                this.setLeftColumnsWidth(roundedLeftWidth);
                if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableContentProtection) {
                    this.delegate.contentProtectionModule.recalculate(0);
                }
            }
        }
    }
    goToElement(element, relative) {
        var _a;
        if (this.isScrollMode()) {
            if (element) {
                // Put the element as close to the top as possible.
                document.scrollingElement.scrollTop = element.offsetTop;
            }
        }
        else {
            if (element) {
                // Get the element's position in the iframe, and
                // round that to figure out the column it's in.
                // There is a bug in Safari when using getBoundingClientRect
                // on an element that spans multiple columns. Temporarily
                // set the element's height to fit it on one column so we
                // can determine the first column position.
                const originalHeight = element.style.height;
                element.style.height = "0";
                const left = element.getBoundingClientRect().left;
                const width = this.getColumnWidth();
                const diff = this.iframe.contentDocument.scrollingElement.scrollLeft - width;
                // let roundedLeftWidth = Math.ceil(left / width) * width;
                let roundedLeftWidth = Math.ceil(left / width) * width + diff;
                if (relative) {
                    const origin = this.getLeftColumnsWidth();
                    roundedLeftWidth = Math.ceil(left / width) * width + origin;
                }
                // Restore element's original height.
                element.style.height = originalHeight;
                this.setLeftColumnsWidth(roundedLeftWidth);
                if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableContentProtection) {
                    this.delegate.contentProtectionModule.recalculate(200);
                }
            }
        }
    }
    // at top in scrollmode
    atStart() {
        if (this.isScrollMode()) {
            return document.scrollingElement.scrollTop === 0;
        }
        else {
            const leftWidth = this.getLeftColumnsWidth();
            return leftWidth <= 0;
        }
    }
    // at bottom in scrollmode
    atEnd() {
        if (this.isScrollMode()) {
            return (Math.ceil(this.iframe.contentDocument.scrollingElement.scrollHeight -
                document.scrollingElement.scrollTop) -
                1 <=
                BrowserUtilities.getHeight());
        }
        else {
            // TODO: need to double check this, why sometimes we get "rightWidth 0.091064453125"
            const rightWidth = Math.floor(this.getRightColumnsWidth());
            return rightWidth <= 0;
        }
    }
    goToPreviousPage() {
        var _a;
        if (this.isScrollMode()) {
            const leftHeight = document.scrollingElement.scrollTop;
            const height = this.getScreenHeight();
            const offset = leftHeight - height;
            if (offset >= 0) {
                document.scrollingElement.scrollTop = offset;
            }
            else {
                document.scrollingElement.scrollTop = 0;
            }
        }
        else {
            const leftWidth = this.getLeftColumnsWidth();
            const width = this.getColumnWidth();
            const offset = leftWidth - width;
            if (offset >= 0) {
                this.setLeftColumnsWidth(offset);
            }
            else {
                this.setLeftColumnsWidth(0);
            }
            this.delegate.checkResourcePosition();
        }
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableContentProtection) {
            this.delegate.contentProtectionModule.recalculate();
        }
    }
    goToNextPage() {
        var _a;
        if (this.isScrollMode()) {
            const leftHeight = document.scrollingElement.scrollTop;
            const height = this.getScreenHeight();
            const scrollHeight = this.iframe.contentDocument.scrollingElement.scrollHeight;
            const offset = leftHeight + height;
            if (offset < scrollHeight) {
                document.scrollingElement.scrollTop = offset;
            }
            else {
                document.scrollingElement.scrollTop = scrollHeight;
            }
        }
        else {
            const leftWidth = this.getLeftColumnsWidth();
            const width = this.getColumnWidth();
            const scrollWidth = this.iframe.contentDocument.scrollingElement.scrollWidth;
            const offset = leftWidth + width;
            if (offset < scrollWidth) {
                this.setLeftColumnsWidth(offset);
            }
            else {
                this.setLeftColumnsWidth(scrollWidth);
            }
            this.delegate.checkResourcePosition();
        }
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableContentProtection) {
            this.delegate.contentProtectionModule.recalculate();
        }
    }
    // doesn't exist in scrollmode
    getCurrentPage() {
        if (this.isScrollMode()) {
            return 0;
        }
        else {
            return this.getCurrentPosition() * this.getPageCount() + 1;
        }
    }
    // doesn't exist in scrollmode
    getPageCount() {
        if (this.isScrollMode()) {
            return 0;
        }
        else {
            const width = this.getColumnWidth();
            return this.iframe.contentDocument.scrollingElement.scrollWidth / width;
        }
    }
    isPaginated() {
        if (this.iframe) {
            const html = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "html");
            const scroll = "readium-scroll-on" === html.style.getPropertyValue("--USER__scroll");
            return scroll === false;
        }
        return this.scrollMode === false;
    }
    isScrollMode() {
        if (this.iframe) {
            const html = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "html");
            const scroll = "readium-scroll-on" === html.style.getPropertyValue("--USER__scroll");
            return scroll === true;
        }
        return this.scrollMode === true;
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
    // scrolling functions
    getScreenHeight() {
        const windowTop = window.scrollY;
        const windowBottom = windowTop + window.innerHeight;
        return windowBottom - windowTop - 40 - this.attributes.margin;
    }
    setIframeHeight(iframe) {
        let d = debounce_1.debounce((iframe) => {
            if (iframe) {
                let iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
                if (iframeWin.document.body) {
                    const minHeight = BrowserUtilities.getHeight() - 40 - this.attributes.margin;
                    const bodyHeight = iframeWin.document.documentElement.scrollHeight ||
                        iframeWin.document.body.scrollHeight;
                    iframe.height = Math.max(minHeight, bodyHeight);
                }
            }
        }, 100);
        d(iframe);
    }
    checkForFixedScrollWidth() {
        // Determine if the scroll width changes when the left position
        // changes. This differs across browsers and sometimes across
        // books in the same browser.
        const body = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "body");
        const originalScrollWidth = body.scrollWidth;
        this.hasFixedScrollWidth = body.scrollWidth === originalScrollWidth;
    }
    setSize() {
        if (this.isPaginated()) {
            // any is necessary because CSSStyleDeclaration type does not include
            // all the vendor-prefixed attributes.
            const body = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "body");
            this.iframe.contentDocument.documentElement.style.height =
                this.height + "px";
            this.iframe.height = this.height + "px";
            this.iframe.width = BrowserUtilities.getWidth() + "px";
            const images = body.querySelectorAll("img");
            for (const image of images) {
                image.style.width = image.width + "px";
            }
        }
        else {
            // Remove previous iframe height so body scroll height will be accurate.
            this.iframe.height = "0";
            this.iframe.width = BrowserUtilities.getWidth() + "px";
            const body = HTMLUtilities.findRequiredIframeElement(this.iframe.contentDocument, "body");
            const width = BrowserUtilities.getWidth() - this.sideMargin * 2 + "px";
            const images = Array.prototype.slice.call(body.querySelectorAll("img"));
            for (const image of images) {
                if (image.hasAttribute("width")) {
                    image.style.width = image.width + "px";
                }
                if (image.hasAttribute("height")) {
                    image.style.height = image.height + "px";
                }
                if (image.width > width) {
                    image.style.maxWidth = width;
                }
            }
        }
    }
    // TODO: if we changed the following functions to handle screen size (height and wdith) we can use it for both paginated and reflowable.
    // For example: getColumnWidth would be renamed to something that gives us either the offsetWidth when in paginated mode and the offsetHeight when in scrollmode. etc.
    // Since theses are the only 4 functions right now that are specifically used for paginated mode but gives us nothing for scrollmode, it would make sense to make them more universal
    /** Returns the total width of the columns that are currently
       positioned to the left of the iframe viewport. */
    getLeftColumnsWidth() {
        return this.iframe.contentDocument.scrollingElement.scrollLeft;
    }
    /** Returns the total width of the columns that are currently
       positioned to the right of the iframe viewport. */
    getRightColumnsWidth() {
        const scrollWidth = this.iframe.contentDocument.scrollingElement.scrollWidth;
        const width = this.getColumnWidth();
        let rightWidth = scrollWidth - width;
        if (this.hasFixedScrollWidth) {
            // In some browsers (IE and Firefox with certain books),
            // scrollWidth doesn't change when some columns
            // are off to the left, so we need to subtract them.
            const leftWidth = this.getLeftColumnsWidth();
            rightWidth = Math.max(0, rightWidth - leftWidth);
        }
        return rightWidth;
    }
    /** Returns the width of one column. */
    getColumnWidth() {
        return this.iframe.contentDocument.scrollingElement.clientWidth;
    }
    /** Shifts the columns so that the specified width is positioned
       to the left of the iframe viewport. */
    setLeftColumnsWidth(width) {
        this.iframe.contentDocument.scrollingElement.scrollLeft = width;
    }
}
exports.default = ReflowableBookView;
//# sourceMappingURL=ReflowableBookView.js.map