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
exports.isZoomed = exports.getHeight = exports.getWidth = void 0;
/** Returns the current width of the document. */
function getWidth() {
    return document.documentElement.clientWidth;
}
exports.getWidth = getWidth;
/** Returns the current height of the document. */
function getHeight() {
    return document.documentElement.clientHeight;
}
exports.getHeight = getHeight;
/** Returns true if the browser is zoomed in with pinch-to-zoom on mobile. */
function isZoomed() {
    return getWidth() !== window.innerWidth;
}
exports.isZoomed = isZoomed;
//# sourceMappingURL=BrowserUtilities.js.map