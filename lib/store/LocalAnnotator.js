"use strict";
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
const SHA256_1 = require("jscrypto/es6/SHA256");
const Annotator_1 = require("./Annotator");
const TextHighlighter_1 = require("../modules/highlight/TextHighlighter");
/** Annotator that stores annotations locally, in the browser. */
class LocalAnnotator {
    constructor(config) {
        this.store = config.store;
    }
    getLastReadingPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            const positionString = yield this.store.get(LocalAnnotator.LAST_READING_POSITION);
            if (positionString) {
                const position = JSON.parse(positionString);
                return new Promise((resolve) => resolve(position));
            }
            return new Promise((resolve) => resolve());
        });
    }
    initLastReadingPosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof position === "string") {
                yield this.store.set(LocalAnnotator.LAST_READING_POSITION, position);
            }
            else {
                const positionString = JSON.stringify(position);
                yield this.store.set(LocalAnnotator.LAST_READING_POSITION, positionString);
            }
            return new Promise((resolve) => resolve());
        });
    }
    saveLastReadingPosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof position === "string") {
                yield this.store.set(LocalAnnotator.LAST_READING_POSITION, position);
            }
            else {
                const positionString = JSON.stringify(position);
                yield this.store.set(LocalAnnotator.LAST_READING_POSITION, positionString);
            }
            return new Promise((resolve) => resolve());
        });
    }
    initBookmarks(list) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof list === "string") {
                let savedBookmarksObj = JSON.parse(list);
                yield this.store.set(LocalAnnotator.BOOKMARKS, JSON.stringify(savedBookmarksObj));
                return new Promise((resolve) => resolve(list));
            }
            else {
                yield this.store.set(LocalAnnotator.BOOKMARKS, JSON.stringify(list));
                return new Promise((resolve) => resolve(list));
            }
        });
    }
    saveBookmark(bookmark) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedBookmarks = yield this.store.get(LocalAnnotator.BOOKMARKS);
            if (savedBookmarks) {
                let savedBookmarksObj = JSON.parse(savedBookmarks);
                savedBookmarksObj.push(bookmark);
                yield this.store.set(LocalAnnotator.BOOKMARKS, JSON.stringify(savedBookmarksObj));
            }
            else {
                let bookmarksAry = [];
                bookmarksAry.push(bookmark);
                yield this.store.set(LocalAnnotator.BOOKMARKS, JSON.stringify(bookmarksAry));
            }
            return new Promise((resolve) => resolve(bookmark));
        });
    }
    locatorExists(locator, type) {
        return __awaiter(this, void 0, void 0, function* () {
            let storeType;
            switch (type) {
                case Annotator_1.AnnotationType.Bookmark:
                    storeType = LocalAnnotator.BOOKMARKS;
                    break;
            }
            const locatorsString = yield this.store.get(storeType);
            if (locatorsString) {
                const locators = JSON.parse(locatorsString);
                const filteredLocators = locators.filter((el) => el.href === locator.href &&
                    el.locations.progression === locator.locations.progression);
                if (filteredLocators.length > 0) {
                    return new Promise((resolve) => resolve(locator));
                }
            }
            return new Promise((resolve) => resolve());
        });
    }
    deleteBookmark(bookmark) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedBookmarks = yield this.store.get(LocalAnnotator.BOOKMARKS);
            if (savedBookmarks) {
                let savedBookmarksObj = JSON.parse(savedBookmarks);
                savedBookmarksObj = savedBookmarksObj.filter((el) => el.id !== bookmark.id);
                yield this.store.set(LocalAnnotator.BOOKMARKS, JSON.stringify(savedBookmarksObj));
            }
            return new Promise((resolve) => resolve(bookmark));
        });
    }
    getBookmarks(href) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookmarksString = yield this.store.get(LocalAnnotator.BOOKMARKS);
            if (bookmarksString) {
                let bookmarks = JSON.parse(bookmarksString);
                if (href) {
                    let filteredResult = bookmarks.filter((el) => el.href === href);
                    filteredResult = filteredResult.sort((n1, n2) => n1.locations.progression - n2.locations.progression);
                    return new Promise((resolve) => resolve(filteredResult));
                }
                bookmarks = bookmarks.sort((n1, n2) => n1.locations.progression - n2.locations.progression);
                return new Promise((resolve) => resolve(bookmarks));
            }
            return new Promise((resolve) => resolve());
        });
    }
    initAnnotations(list) {
        return __awaiter(this, void 0, void 0, function* () {
            let annotations;
            if (typeof list === "string") {
                annotations = JSON.parse(list);
            }
            else {
                annotations = list;
            }
            let annotationsToStore = [];
            annotations.forEach((rangeRepresentation) => {
                const uniqueStr = `${rangeRepresentation.highlight.selectionInfo.rangeInfo.startContainerElementCssSelector}${rangeRepresentation.highlight.selectionInfo.rangeInfo.startContainerChildTextNodeIndex}${rangeRepresentation.highlight.selectionInfo.rangeInfo.startOffset}${rangeRepresentation.highlight.selectionInfo.rangeInfo.endContainerElementCssSelector}${rangeRepresentation.highlight.selectionInfo.rangeInfo.endContainerChildTextNodeIndex}${rangeRepresentation.highlight.selectionInfo.rangeInfo.endOffset}`;
                const sha256Hex = SHA256_1.SHA256.hash(uniqueStr);
                rangeRepresentation.highlight.id = "R2_HIGHLIGHT_" + sha256Hex;
                // Highlight color as string passthrough
                var rangeColor;
                rangeColor = rangeRepresentation.color;
                if (TextHighlighter_1.default.isHexColor(rangeColor)) {
                    rangeColor = TextHighlighter_1.default.hexToRgbString(rangeColor);
                }
                rangeRepresentation.highlight.color = rangeColor;
                rangeRepresentation.highlight.pointerInteraction = true;
                rangeRepresentation.highlight.selectionInfo.cleanText = rangeRepresentation.highlight.selectionInfo.rawText
                    .trim()
                    .replace(/\n/g, " ")
                    .replace(/\s\s+/g, " ");
                annotationsToStore.push(rangeRepresentation);
            });
            yield this.store.set(LocalAnnotator.ANNOTATIONS, JSON.stringify(annotationsToStore));
            return new Promise((resolve) => resolve(annotationsToStore));
        });
    }
    saveAnnotation(annotation) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedAnnotations = yield this.store.get(LocalAnnotator.ANNOTATIONS);
            if (savedAnnotations) {
                let annotations = JSON.parse(savedAnnotations);
                annotations.push(annotation);
                yield this.store.set(LocalAnnotator.ANNOTATIONS, JSON.stringify(annotations));
            }
            else {
                let annotations = [];
                annotations.push(annotation);
                yield this.store.set(LocalAnnotator.ANNOTATIONS, JSON.stringify(annotations));
            }
            return new Promise((resolve) => resolve(annotation));
        });
    }
    deleteAnnotation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedAnnotations = yield this.store.get(LocalAnnotator.ANNOTATIONS);
            if (savedAnnotations) {
                let annotations = JSON.parse(savedAnnotations);
                annotations = annotations.filter((el) => el.id !== id);
                yield this.store.set(LocalAnnotator.ANNOTATIONS, JSON.stringify(annotations));
            }
            return new Promise((resolve) => resolve(id));
        });
    }
    deleteSelectedAnnotation(annotation) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedAnnotations = yield this.store.get(LocalAnnotator.ANNOTATIONS);
            if (savedAnnotations) {
                let annotations = JSON.parse(savedAnnotations);
                annotations = annotations.filter((el) => el.highlight.id !== annotation.highlight.id);
                yield this.store.set(LocalAnnotator.ANNOTATIONS, JSON.stringify(annotations));
            }
            return new Promise((resolve) => resolve(annotation));
        });
    }
    getAnnotations() {
        return __awaiter(this, void 0, void 0, function* () {
            const savedAnnotations = yield this.store.get(LocalAnnotator.ANNOTATIONS);
            if (savedAnnotations) {
                let annotations = JSON.parse(savedAnnotations);
                annotations = annotations.sort((n1, n2) => n1.locations.progression - n2.locations.progression);
                return new Promise((resolve) => resolve(annotations));
            }
            return new Promise((resolve) => resolve());
        });
    }
    getAnnotationPosition(id, iframeWin) {
        return __awaiter(this, void 0, void 0, function* () {
            const savedAnnotations = yield this.store.get(LocalAnnotator.ANNOTATIONS);
            if (savedAnnotations) {
                const annotations = JSON.parse(savedAnnotations);
                const filtered = annotations.filter((el) => el.id === id);
                if (filtered.length > 0) {
                    let foundElement = iframeWin.document.getElementById(`${filtered[0].highlight.id}`);
                    if (foundElement) {
                        var position = parseInt((foundElement.hasChildNodes
                            ? foundElement.childNodes[0]
                            : foundElement).style.top.replace("px", ""));
                        return new Promise((resolve) => resolve(position));
                    }
                }
            }
            return new Promise((resolve) => resolve());
        });
    }
    getAnnotation(highlight) {
        return __awaiter(this, void 0, void 0, function* () {
            const savedAnnotations = yield this.store.get(LocalAnnotator.ANNOTATIONS);
            if (savedAnnotations) {
                const annotations = JSON.parse(savedAnnotations);
                const filtered = annotations.filter((el) => el.highlight.id === highlight.id);
                if (filtered.length > 0) {
                    return new Promise((resolve) => resolve(filtered[0]));
                }
            }
            return new Promise((resolve) => resolve());
        });
    }
}
exports.default = LocalAnnotator;
LocalAnnotator.LAST_READING_POSITION = "last-reading-position";
LocalAnnotator.BOOKMARKS = "bookmarks";
LocalAnnotator.ANNOTATIONS = "annotations";
//# sourceMappingURL=LocalAnnotator.js.map