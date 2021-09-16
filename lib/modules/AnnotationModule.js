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
const HTMLUtilities = require("../utils/HTMLUtilities");
const Annotator_1 = require("../store/Annotator");
const TextHighlighter_1 = require("./highlight/TextHighlighter");
const EventHandler_1 = require("../utils/EventHandler");
const Locator_1 = require("../model/Locator");
const __1 = require("..");
const materialize_css_1 = require("materialize-css");
const IconLib_1 = require("../utils/IconLib");
const uuid_1 = require("uuid");
class AnnotationModule {
    constructor(annotator, headerMenu, rights, publication, delegate, initialAnnotations = null, properties = null, api = null, highlighter) {
        this.annotator = annotator;
        this.rights = rights;
        this.publication = publication;
        this.headerMenu = headerMenu;
        this.delegate = delegate;
        this.initialAnnotations = initialAnnotations;
        this.highlighter = highlighter;
        this.properties = properties;
        this.api = api;
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const annotations = new this(config.annotator, config.headerMenu, config.rights || { enableAnnotations: false, enableTTS: false }, config.publication, config.delegate, config.initialAnnotations || null, config, config.api, config.highlighter);
            yield annotations.start();
            return annotations;
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("Annotation module stop");
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.delegate.annotationModule = this;
            if (this.headerMenu)
                this.highlightsView = HTMLUtilities.findElement(this.headerMenu, "#container-view-highlights");
            if (this.initialAnnotations) {
                var highlights = this.initialAnnotations["highlights"] || null;
                if (highlights) {
                    this.annotator.initAnnotations(highlights);
                }
            }
        });
    }
    handleResize() {
        setTimeout(() => {
            this.drawHighlights();
        }, 10);
    }
    initialize() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield document.fonts.ready;
            if ((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableAnnotations) {
                setTimeout(() => {
                    this.drawHighlights();
                }, 300);
            }
            resolve(null);
        }));
    }
    scrollToHighlight(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("still need to scroll to " + id);
            }
            var position = yield this.annotator.getAnnotationPosition(id, this.delegate.iframes[0].contentWindow);
            window.scrollTo(0, position - window.innerHeight / 3);
        });
    }
    deleteLocalHighlight(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.annotator) {
                var deleted = yield this.annotator.deleteAnnotation(id);
                if (__1.IS_DEV) {
                    console.log("Highlight deleted " + JSON.stringify(deleted));
                }
                yield this.showHighlights();
                yield this.drawHighlights();
                if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableMaterial) {
                    materialize_css_1.toast({ html: "highlight deleted" });
                }
                return deleted;
            }
            else {
                return new Promise((resolve) => resolve(null));
            }
        });
    }
    deleteAnnotation(highlight) {
        return __awaiter(this, void 0, void 0, function* () {
            this.deleteLocalHighlight(highlight.id);
        });
    }
    addAnnotation(highlight) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.annotator.saveAnnotation(highlight);
            yield this.showHighlights();
            yield this.drawHighlights();
        });
    }
    deleteHighlight(highlight) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.deleteAnnotation) {
                (_b = this.api) === null || _b === void 0 ? void 0 : _b.deleteAnnotation(highlight).then(() => __awaiter(this, void 0, void 0, function* () {
                    this.deleteLocalHighlight(highlight.id);
                }));
            }
            else {
                this.deleteLocalHighlight(highlight.id);
            }
        });
    }
    deleteSelectedHighlight(highlight) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.deleteAnnotation) {
                this.api.deleteAnnotation(highlight).then(() => __awaiter(this, void 0, void 0, function* () {
                    this.deleteLocalHighlight(highlight.id);
                }));
            }
            else {
                this.deleteLocalHighlight(highlight.id);
            }
        });
    }
    saveAnnotation(highlight, marker) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.annotator) {
                var tocItem = this.publication.getTOCItem(this.delegate.currentChapterLink.href);
                if (this.delegate.currentTocUrl !== null) {
                    tocItem = this.publication.getTOCItem(this.delegate.currentTocUrl);
                }
                if (tocItem === null) {
                    tocItem = this.publication.getTOCItemAbsolute(this.delegate.currentChapterLink.href);
                }
                const bookmarkPosition = this.delegate.view.getCurrentPosition();
                const body = HTMLUtilities.findRequiredIframeElement(this.delegate.iframes[0].contentDocument, "body");
                const progression = highlight.position
                    ? highlight.position / body.scrollHeight
                    : bookmarkPosition;
                const id = uuid_1.v4();
                let annotation;
                if ((((_b = (_a = this.rights) === null || _a === void 0 ? void 0 : _a.autoGeneratePositions) !== null && _b !== void 0 ? _b : true) &&
                    this.publication.positions) ||
                    this.publication.positions) {
                    const chptHref = this.delegate.currentChapterLink.href;
                    const positions = this.publication.positionsByHref(chptHref);
                    const positionIndex = Math.ceil(progression * (positions.length - 1));
                    const locator = positions[positionIndex];
                    annotation = Object.assign(Object.assign({}, locator), { id: id, href: tocItem.Href, created: new Date(), title: this.delegate.currentChapterLink.title, highlight: highlight, color: this.highlighter.getColor(), marker: marker, text: {
                            highlight: highlight.selectionInfo.cleanText,
                        } });
                }
                else {
                    annotation = {
                        id: id,
                        href: tocItem.Href,
                        locations: {
                            progression: progression,
                        },
                        created: new Date(),
                        type: this.delegate.currentChapterLink.type,
                        title: this.delegate.currentChapterLink.title,
                        highlight: highlight,
                        color: this.highlighter.getColor(),
                        marker: marker,
                        text: {
                            highlight: highlight.selectionInfo.cleanText,
                        },
                    };
                }
                if ((_c = this.api) === null || _c === void 0 ? void 0 : _c.addAnnotation) {
                    this.api.addAnnotation(annotation).then((result) => __awaiter(this, void 0, void 0, function* () {
                        annotation.id = result.id;
                        var saved = yield this.annotator.saveAnnotation(annotation);
                        yield this.showHighlights();
                        yield this.drawHighlights();
                        return saved;
                    }));
                }
                else {
                    var saved = yield this.annotator.saveAnnotation(annotation);
                    yield this.showHighlights();
                    yield this.drawHighlights();
                    return saved;
                }
            }
            else {
                return new Promise((resolve) => resolve(null));
            }
        });
    }
    getAnnotations() {
        return __awaiter(this, void 0, void 0, function* () {
            let highlights = [];
            if (this.annotator) {
                highlights = (yield this.annotator.getAnnotations());
            }
            return highlights;
        });
    }
    showHighlights() {
        return __awaiter(this, void 0, void 0, function* () {
            let highlights = [];
            if (this.annotator) {
                highlights = (yield this.annotator.getAnnotations());
                if (highlights) {
                    highlights.forEach((rangeRepresentation) => {
                        rangeRepresentation.highlight.marker = rangeRepresentation.marker;
                        TextHighlighter_1._highlights.push(rangeRepresentation.highlight);
                    });
                }
            }
            if (this.highlightsView)
                this.createTree(Annotator_1.AnnotationType.Annotation, highlights, this.highlightsView);
        });
    }
    drawHighlights(search = true) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableAnnotations) && this.highlighter) {
                if (this.api) {
                    let highlights = [];
                    if (this.annotator) {
                        highlights = (yield this.annotator.getAnnotations());
                    }
                    if (this.highlighter &&
                        highlights &&
                        this.delegate.iframes[0].contentDocument.readyState === "complete") {
                        yield this.highlighter.destroyAllhighlights(this.delegate.iframes[0].contentDocument);
                        highlights.forEach((rangeRepresentation) => __awaiter(this, void 0, void 0, function* () {
                            rangeRepresentation.highlight.marker = rangeRepresentation.marker;
                            TextHighlighter_1._highlights.push(rangeRepresentation.highlight);
                            const annotation = rangeRepresentation;
                            let currentLocation = this.delegate.currentChapterLink.href;
                            var tocItem = this.publication.getTOCItem(currentLocation);
                            if (this.delegate.currentTocUrl !== null) {
                                tocItem = this.publication.getTOCItem(this.delegate.currentTocUrl);
                            }
                            if (tocItem === null) {
                                tocItem = this.publication.getTOCItemAbsolute(this.delegate.currentChapterLink.href);
                            }
                            if (annotation.href === tocItem.Href) {
                                this.highlighter.setColor(annotation.color);
                                yield this.highlighter.createHighlightDom(this.delegate.iframes[0].contentWindow, rangeRepresentation.highlight);
                            }
                        }));
                    }
                }
                else {
                    let highlights = [];
                    if (this.annotator) {
                        highlights = (yield this.annotator.getAnnotations());
                    }
                    if (this.highlighter &&
                        highlights &&
                        this.delegate.iframes[0].contentDocument.readyState === "complete") {
                        yield this.highlighter.destroyAllhighlights(this.delegate.iframes[0].contentDocument);
                        highlights.forEach((rangeRepresentation) => __awaiter(this, void 0, void 0, function* () {
                            rangeRepresentation.highlight.marker = rangeRepresentation.marker;
                            TextHighlighter_1._highlights.push(rangeRepresentation.highlight);
                            const annotation = rangeRepresentation;
                            let currentLocation = this.delegate.currentChapterLink.href;
                            var tocItem = this.publication.getTOCItem(currentLocation);
                            if (this.delegate.currentTocUrl !== null) {
                                tocItem = this.publication.getTOCItem(this.delegate.currentTocUrl);
                            }
                            if (tocItem === null) {
                                tocItem = this.publication.getTOCItemAbsolute(this.delegate.currentChapterLink.href);
                            }
                            if (annotation.href === tocItem.Href) {
                                this.highlighter.setColor(annotation.color);
                                yield this.highlighter.createHighlightDom(this.delegate.iframes[0].contentWindow, rangeRepresentation.highlight);
                            }
                        }));
                    }
                }
                if ((_b = this.properties) === null || _b === void 0 ? void 0 : _b.initialAnnotationColor) {
                    this.highlighter.setColor((_c = this.properties) === null || _c === void 0 ? void 0 : _c.initialAnnotationColor);
                }
            }
            if (search && ((_d = this.rights) === null || _d === void 0 ? void 0 : _d.enableSearch)) {
                this.delegate.searchModule.drawSearch();
            }
        });
    }
    createTree(type, annotations, view) {
        if (annotations) {
            const self = this;
            const toc = this.publication.readingOrder;
            if (toc.length) {
                const createAnnotationTree = (parentElement, links) => {
                    let chapterList = document.createElement("ul");
                    chapterList.className = "sidenav-annotations";
                    for (const link of links) {
                        let chapterHeader = document.createElement("li");
                        const linkElement = document.createElement("a");
                        const spanElement = document.createElement("span");
                        linkElement.tabIndex = -1;
                        linkElement.className = "chapter-link";
                        if (link.Href) {
                            const linkHref = this.publication.getAbsoluteHref(link.Href);
                            const tocItemAbs = this.publication.getTOCItemAbsolute(linkHref);
                            linkElement.href = linkHref;
                            linkElement.innerHTML = tocItemAbs.Title || "";
                            chapterHeader.appendChild(linkElement);
                        }
                        else {
                            spanElement.innerHTML = link.Title || "";
                            spanElement.className = "chapter-title";
                            chapterHeader.appendChild(spanElement);
                        }
                        EventHandler_1.addEventListenerOptional(linkElement, "click", (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            const position = {
                                href: linkElement.href,
                                locations: {
                                    progression: 0,
                                },
                                type: link.TypeLink,
                                title: linkElement.title,
                            };
                            this.delegate.stopReadAloud();
                            this.delegate.navigate(position);
                        });
                        const bookmarkList = document.createElement("ol");
                        annotations.forEach(function (locator) {
                            var _a, _b;
                            const href = link.Href.indexOf("#") !== -1
                                ? link.Href.slice(0, link.Href.indexOf("#"))
                                : link.Href;
                            if (link.Href && locator.href.endsWith(href)) {
                                let bookmarkItem = document.createElement("li");
                                bookmarkItem.className = "annotation-item";
                                let bookmarkLink = document.createElement("a");
                                bookmarkLink.setAttribute("href", locator.href);
                                if (type === Annotator_1.AnnotationType.Annotation) {
                                    bookmarkLink.className = "highlight-link";
                                    let title = document.createElement("span");
                                    let marker = document.createElement("span");
                                    title.className = "title";
                                    marker.innerHTML = locator.highlight.selectionInfo.cleanText;
                                    if (locator.marker ===
                                        Locator_1.AnnotationMarker.Underline) {
                                        if (typeof locator.color === "object") {
                                            marker.style.setProperty("border-bottom", `2px solid ${TextHighlighter_1.default.hexToRgbA(locator.color)}`, "important");
                                        }
                                        else {
                                            marker.style.setProperty("border-bottom", `2px solid ${locator.color}`, "important");
                                        }
                                    }
                                    else {
                                        if (typeof locator.color === "object") {
                                            marker.style.backgroundColor = TextHighlighter_1.default.hexToRgbA(locator.color);
                                        }
                                        else {
                                            marker.style.backgroundColor = locator.color;
                                        }
                                    }
                                    title.appendChild(marker);
                                    bookmarkLink.appendChild(title);
                                    let subtitle = document.createElement("span");
                                    let formattedProgression = Math.round(locator.locations.progression * 100) +
                                        "% " +
                                        "through resource";
                                    subtitle.className = "subtitle";
                                    subtitle.innerHTML = formattedProgression;
                                    bookmarkLink.appendChild(subtitle);
                                }
                                let timestamp = document.createElement("span");
                                timestamp.className = "timestamp";
                                timestamp.innerHTML = AnnotationModule.readableTimestamp(locator.created);
                                bookmarkLink.appendChild(timestamp);
                                EventHandler_1.addEventListenerOptional(bookmarkLink, "click", (event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    self.handleAnnotationLinkClick(event, locator);
                                });
                                bookmarkItem.appendChild(bookmarkLink);
                                if ((self.delegate.sideNavExpanded &&
                                    ((_a = self.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableMaterial)) ||
                                    !((_b = self.delegate.rights) === null || _b === void 0 ? void 0 : _b.enableMaterial)) {
                                    let bookmarkDeleteLink = document.createElement("button");
                                    bookmarkDeleteLink.className = "delete";
                                    bookmarkDeleteLink.innerHTML = IconLib_1.icons.delete;
                                    EventHandler_1.addEventListenerOptional(bookmarkDeleteLink, "click", (event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        self.handleAnnotationLinkDeleteClick(type, event, locator);
                                    });
                                    bookmarkItem.appendChild(bookmarkDeleteLink);
                                }
                                bookmarkList.appendChild(bookmarkItem);
                            }
                        });
                        if (bookmarkList.children.length > 0) {
                            chapterList.appendChild(chapterHeader);
                            chapterList.appendChild(bookmarkList);
                        }
                        if (chapterList.children.length > 0) {
                            parentElement.appendChild(chapterList);
                        }
                        if (link.Children && link.Children.length > 0) {
                            createAnnotationTree(parentElement, link.Children);
                        }
                    }
                };
                view.innerHTML = "";
                createAnnotationTree(view, toc);
            }
        }
    }
    handleAnnotationLinkClick(event, locator) {
        if (locator) {
            locator.href = this.publication.getAbsoluteHref(locator.href);
            this.delegate.stopReadAloud();
            this.delegate.navigate(locator);
        }
        else {
            if (__1.IS_DEV) {
                console.log("annotation data missing: ", event);
            }
        }
    }
    handleAnnotationLinkDeleteClick(type, event, locator) {
        if (__1.IS_DEV) {
            console.log("annotation data locator: ", locator);
        }
        if (locator) {
            if (type === Annotator_1.AnnotationType.Annotation) {
                this.deleteHighlight(locator);
            }
        }
        else {
            if (__1.IS_DEV) {
                console.log("annotation data missing: ", event);
            }
        }
    }
    static readableTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toDateString() + " " + date.toLocaleTimeString();
    }
    getAnnotation(highlight) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.annotator.getAnnotation(highlight);
        });
    }
}
exports.default = AnnotationModule;
//# sourceMappingURL=AnnotationModule.js.map