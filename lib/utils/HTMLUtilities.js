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
exports.removeStylesheet = exports.createStylesheet = exports.removeAttr = exports.setAttr = exports.findRequiredIframeElement = exports.findIframeElement = exports.findRequiredElement = exports.findElement = void 0;
/** Returns a single element matching the selector within the parentElement,
    or null if no element matches. */
function findElement(parentElement, selector) {
    return parentElement.querySelector(selector);
}
exports.findElement = findElement;
/** Returns a single element matching the selector within the parent element,
    or throws an exception if no element matches. */
function findRequiredElement(parentElement, selector) {
    const element = findElement(parentElement, selector);
    if (!element) {
        throw "required element " + selector + " not found";
    }
    else {
        return element;
    }
}
exports.findRequiredElement = findRequiredElement;
/** Returns a single element matching the selector within the parentElement in the iframe context,
    or null if no element matches. */
function findIframeElement(parentElement, selector) {
    if (parentElement === null) {
        throw "parent element is null";
    }
    else {
        return parentElement.querySelector(selector);
    }
}
exports.findIframeElement = findIframeElement;
/** Returns a single element matching the selector within the parent element in an iframe context,
        or throws an exception if no element matches. */
function findRequiredIframeElement(parentElement, selector) {
    const element = findIframeElement(parentElement, selector);
    if (!element) {
        throw "required element " + selector + " not found in iframe";
    }
    else {
        return element;
    }
}
exports.findRequiredIframeElement = findRequiredIframeElement;
/** Sets an attribute and its value for an HTML element */
function setAttr(element, attr, value) {
    element.setAttribute(attr, value);
}
exports.setAttr = setAttr;
/** Removes an attribute for an HTML element */
function removeAttr(element, attr) {
    element.removeAttribute(attr);
}
exports.removeAttr = removeAttr;
/** Creates an internal stylesheet in an HTML element */
function createStylesheet(element, id, cssStyles) {
    const head = element.querySelector("head");
    const stylesheet = document.createElement("style");
    stylesheet.id = id;
    stylesheet.textContent = cssStyles;
    head.appendChild(stylesheet);
}
exports.createStylesheet = createStylesheet;
/** Removes an existing internal stylesheet in an HTML element */
function removeStylesheet(element, id) {
    const head = element.querySelector("head");
    const stylesheet = head.querySelector("#" + id);
    head.removeChild(stylesheet);
}
exports.removeStylesheet = removeStylesheet;
//# sourceMappingURL=HTMLUtilities.js.map