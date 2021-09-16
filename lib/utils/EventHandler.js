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
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEventListenerOptional = exports.addEventListenerOptional = void 0;
const __1 = require("..");
function addEventListenerOptional(element, eventType, eventListener) {
    if (element) {
        element.addEventListener(eventType, eventListener);
    }
}
exports.addEventListenerOptional = addEventListenerOptional;
function removeEventListenerOptional(element, eventType, eventListener) {
    if (element) {
        element.removeEventListener(eventType, eventListener);
    }
}
exports.removeEventListenerOptional = removeEventListenerOptional;
class EventHandler {
    constructor() {
        this.onInternalLink = () => { };
        this.onClickThrough = () => { };
        this.checkForLink = (event) => {
            let nextElement = event.target;
            while (nextElement && nextElement.tagName.toLowerCase() !== "body") {
                if (nextElement.tagName.toLowerCase() === "a" &&
                    nextElement.href) {
                    return nextElement;
                }
                else {
                    nextElement = nextElement.parentElement;
                }
            }
            return null;
        };
        this.handleLinks = (event) => {
            if (__1.IS_DEV)
                console.log("R2 Click Handler");
            const link = this.checkForLink(event);
            if (link) {
                // Open external links in new tabs.
                const isSameOrigin = window.location.protocol === link.protocol &&
                    window.location.port === link.port &&
                    window.location.hostname === link.hostname;
                const isInternal = link.href.indexOf("#");
                if (!isSameOrigin) {
                    window.open(link.href, "_blank");
                    event.preventDefault();
                    event.stopPropagation();
                }
                else {
                    event.target.href = link.href;
                    if (isSameOrigin && isInternal !== -1) {
                        this.onInternalLink(event);
                    }
                    else if (isSameOrigin && isInternal === -1) {
                        // TODO needs some more refactoring when handling other types of links or elements
                        // link.click();
                        this.onInternalLink(event);
                    }
                }
            }
            else {
                this.onClickThrough(event);
            }
        };
    }
    setupEvents(element) {
        if (element !== null) {
            // Most click handling is done in the touchend and mouseup event handlers,
            // but if there's a click on an external link we need to cancel the click
            // event to prevent it from opening in the iframe.
            element.addEventListener("click", this.handleLinks.bind(this));
        }
        else {
            throw "cannot setup events for null";
        }
    }
}
exports.default = EventHandler;
//# sourceMappingURL=EventHandler.js.map