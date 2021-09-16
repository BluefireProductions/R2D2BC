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
const EventHandler_1 = require("../utils/EventHandler");
const IconLib_1 = require("../utils/IconLib");
const __1 = require("..");
const materialize_css_1 = require("materialize-css");
const uuid_1 = require("uuid");
class BookmarkModule {
    constructor(annotator, headerMenu, rights, publication, delegate, initialAnnotations = null, properties = null, api = null) {
        this.annotator = annotator;
        this.rights = rights;
        this.publication = publication;
        this.headerMenu = headerMenu;
        this.delegate = delegate;
        this.initialAnnotations = initialAnnotations;
        this.properties = properties;
        this.api = api;
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const module = new this(config.annotator, config.headerMenu, config.rights || { enableBookmarks: false }, config.publication, config.delegate, config.initialAnnotations || null, config.properties, config.api);
            yield module.start();
            return new Promise((resolve) => resolve(module));
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("Bookmark module stop");
            }
        });
    }
    start() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.delegate.bookmarkModule = this;
            if (this.headerMenu)
                this.bookmarksView = HTMLUtilities.findElement(this.headerMenu, "#container-view-bookmarks");
            if (this.headerMenu)
                this.sideNavSectionBookmarks = HTMLUtilities.findElement(this.headerMenu, "#sidenav-section-bookmarks");
            if (this.headerMenu) {
                var menuBookmark = HTMLUtilities.findElement(this.headerMenu, "#menu-button-bookmark");
                if ((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableMaterial) {
                    if (menuBookmark)
                        menuBookmark.parentElement.style.removeProperty("display");
                    if (menuBookmark)
                        EventHandler_1.addEventListenerOptional(menuBookmark, "click", this.saveBookmark.bind(this));
                }
                else {
                    if (menuBookmark)
                        menuBookmark.parentElement.style.setProperty("display", "none");
                    if (this.sideNavSectionBookmarks)
                        this.sideNavSectionBookmarks.style.setProperty("display", "none");
                }
            }
            if (this.initialAnnotations) {
                var bookmarks = this.initialAnnotations["bookmarks"] || null;
                if (bookmarks) {
                    this.annotator.initBookmarks(bookmarks);
                }
            }
            this.showBookmarks();
        });
    }
    deleteBookmark(bookmark) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.annotator) {
                if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.deleteBookmark) {
                    yield ((_b = this.api) === null || _b === void 0 ? void 0 : _b.deleteBookmark(bookmark));
                    let deleted = yield this.annotator.deleteBookmark(bookmark);
                    if (__1.IS_DEV) {
                        console.log("Bookmark deleted " + JSON.stringify(deleted));
                    }
                    yield this.showBookmarks();
                    if ((_c = this.delegate.rights) === null || _c === void 0 ? void 0 : _c.enableMaterial) {
                        materialize_css_1.toast({ html: "bookmark deleted" });
                    }
                    return deleted;
                }
                else {
                    let deleted = yield this.annotator.deleteBookmark(bookmark);
                    if (__1.IS_DEV) {
                        console.log("Bookmark deleted " + JSON.stringify(deleted));
                    }
                    yield this.showBookmarks();
                    if ((_d = this.delegate.rights) === null || _d === void 0 ? void 0 : _d.enableMaterial) {
                        materialize_css_1.toast({ html: "bookmark deleted" });
                    }
                    return deleted;
                }
            }
            else {
                return new Promise((resolve) => resolve(null));
            }
        });
    }
    saveBookmark() {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.annotator) {
                var tocItem = this.publication.getTOCItem(this.delegate.currentChapterLink.href);
                if (this.delegate.currentTocUrl !== null) {
                    tocItem = this.publication.getTOCItem(this.delegate.currentTocUrl);
                }
                if (tocItem === null) {
                    tocItem = this.publication.getTOCItemAbsolute(this.delegate.currentChapterLink.href);
                }
                const progression = this.delegate.view.getCurrentPosition();
                const id = uuid_1.v4();
                let bookmark;
                if ((((_b = (_a = this.rights) === null || _a === void 0 ? void 0 : _a.autoGeneratePositions) !== null && _b !== void 0 ? _b : true) &&
                    this.publication.positions) ||
                    this.publication.positions) {
                    const chptHref = this.delegate.currentChapterLink.href;
                    const positions = this.publication.positionsByHref(chptHref);
                    const positionIndex = Math.ceil(progression * (positions.length - 1));
                    const locator = positions[positionIndex];
                    bookmark = Object.assign(Object.assign({}, locator), { id: id, href: tocItem.Href, created: new Date(), title: this.delegate.currentChapterLink.title });
                }
                else {
                    bookmark = {
                        id: id,
                        href: tocItem.Href,
                        locations: {
                            progression: progression,
                        },
                        created: new Date(),
                        type: this.delegate.currentChapterLink.type,
                        title: this.delegate.currentChapterLink.title,
                    };
                }
                if (!(yield this.annotator.locatorExists(bookmark, Annotator_1.AnnotationType.Bookmark))) {
                    if ((_c = this.api) === null || _c === void 0 ? void 0 : _c.addBookmark) {
                        yield this.api.addBookmark(bookmark);
                        if (__1.IS_DEV)
                            console.log(bookmark);
                        let saved = yield this.annotator.saveBookmark(bookmark);
                        if (__1.IS_DEV) {
                            console.log("Bookmark added " + JSON.stringify(saved));
                        }
                        if ((_d = this.delegate.rights) === null || _d === void 0 ? void 0 : _d.enableMaterial) {
                            materialize_css_1.toast({ html: "bookmark added" });
                        }
                        yield this.showBookmarks();
                        return saved;
                    }
                    else {
                        let saved = yield this.annotator.saveBookmark(bookmark);
                        if (__1.IS_DEV) {
                            console.log("Bookmark added " + JSON.stringify(saved));
                        }
                        if ((_e = this.delegate.rights) === null || _e === void 0 ? void 0 : _e.enableMaterial) {
                            materialize_css_1.toast({ html: "bookmark added" });
                        }
                        yield this.showBookmarks();
                        return saved;
                    }
                }
                else {
                    if ((_f = this.delegate.rights) === null || _f === void 0 ? void 0 : _f.enableMaterial) {
                        materialize_css_1.toast({ html: "bookmark exists" });
                    }
                }
            }
            else {
                return new Promise((resolve) => resolve(null));
            }
        });
    }
    getBookmarks() {
        return __awaiter(this, void 0, void 0, function* () {
            let bookmarks = [];
            if (this.annotator) {
                bookmarks = (yield this.annotator.getBookmarks());
            }
            return bookmarks;
        });
    }
    showBookmarks() {
        return __awaiter(this, void 0, void 0, function* () {
            let bookmarks = [];
            if (this.annotator) {
                bookmarks = (yield this.annotator.getBookmarks());
            }
            if (this.bookmarksView)
                this.createTree(Annotator_1.AnnotationType.Bookmark, bookmarks, this.bookmarksView);
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
                                if (type === Annotator_1.AnnotationType.Bookmark) {
                                    bookmarkLink.className = "bookmark-link";
                                    let title = document.createElement("span");
                                    let formattedProgression = Math.round(locator.locations.progression * 100) +
                                        "% " +
                                        "through resource";
                                    title.className = "title";
                                    title.innerHTML = formattedProgression;
                                    bookmarkLink.appendChild(title);
                                }
                                let timestamp = document.createElement("span");
                                timestamp.className = "timestamp";
                                timestamp.innerHTML = BookmarkModule.readableTimestamp(locator.created);
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
                console.log("bookmark data missing: ", event);
            }
        }
    }
    handleAnnotationLinkDeleteClick(type, event, locator) {
        if (__1.IS_DEV) {
            console.log("bookmark data locator: ", locator);
        }
        if (locator) {
            if (type === Annotator_1.AnnotationType.Bookmark) {
                this.deleteBookmark(locator);
            }
        }
        else {
            if (__1.IS_DEV) {
                console.log("bookmark data missing: ", event);
            }
        }
    }
    static readableTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toDateString() + " " + date.toLocaleTimeString();
    }
}
exports.default = BookmarkModule;
//# sourceMappingURL=BookmarkModule.js.map