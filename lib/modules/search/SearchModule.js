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
 * Developed on behalf of: DITA and Bibliotheca LLC (https://www.bibliotheca.com)
 * Licensed to: Bibliotheca LLC, Bokbasen AS and CAST under one or more contributor license agreements.
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
const __1 = require("../..");
const searchWithDomSeek_1 = require("./searchWithDomSeek");
const TextHighlighter_1 = require("../highlight/TextHighlighter");
class SearchModule {
    constructor(headerMenu, delegate, publication, properties, api, highlighter) {
        this.currentChapterSearchResult = [];
        this.bookSearchResult = [];
        this.currentHighlights = [];
        this.delegate = delegate;
        this.headerMenu = headerMenu;
        this.publication = publication;
        this.properties = properties;
        this.api = api;
        this.highlighter = highlighter;
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const search = new this(config.headerMenu, config.delegate, config.publication, config, config.api, config.highlighter);
            yield search.start();
            return search;
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("Search module stop");
            }
            EventHandler_1.removeEventListenerOptional(this.searchInput, "keypress", this.handleSearch.bind(this));
            EventHandler_1.removeEventListenerOptional(this.searchGo, "click", this.handleSearch.bind(this));
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.delegate.searchModule = this;
            if (this.headerMenu) {
                this.searchInput = HTMLUtilities.findElement(this.headerMenu, "#searchInput");
                EventHandler_1.addEventListenerOptional(this.searchInput, "keypress", this.handleSearch.bind(this));
                this.searchGo = HTMLUtilities.findElement(this.headerMenu, "#searchGo");
                EventHandler_1.addEventListenerOptional(this.searchGo, "click", this.handleSearch.bind(this));
                // CONTROL
                var menuSearch = HTMLUtilities.findElement(this.headerMenu, "#menu-button-search");
                if (menuSearch)
                    menuSearch.parentElement.style.removeProperty("display");
            }
        });
    }
    handleSearch(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.key === "Enter" || event.type === "click") {
                yield this.handleSearchChapter();
                yield this.handleSearchBook();
            }
        });
    }
    handleSearchChapter(index) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            var searchVal = this.searchInput.value;
            let currentLocation = this.delegate.currentChapterLink.href;
            const spineItem = this.publication.getSpineItem(currentLocation);
            var searchResultDiv = HTMLUtilities.findElement(this.headerMenu, "#searchResultChapter");
            self.currentChapterSearchResult = [];
            self.currentHighlights = [];
            var localSearchResultChapter = [];
            if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableContentProtection) {
                this.delegate.contentProtectionModule.deactivate();
            }
            yield this.searchAndPaintChapter(searchVal, index, (result) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                localSearchResultChapter = result;
                goToResultPage(1);
                if ((_b = this.delegate.rights) === null || _b === void 0 ? void 0 : _b.enableContentProtection) {
                    this.delegate.contentProtectionModule.recalculate(200);
                }
            }));
            function goToResultPage(page) {
                return __awaiter(this, void 0, void 0, function* () {
                    searchResultDiv.innerHTML = null;
                    var paginated;
                    paginated = self.paginate(localSearchResultChapter, page, 5);
                    if (paginated.total === 0) {
                        const linkElement = document.createElement("a");
                        linkElement.className = "collection-item";
                        linkElement.innerHTML = "nothing found"; //self.delegate.translateModule.reader_search_nothing_found
                        searchResultDiv.appendChild(linkElement);
                    }
                    else {
                        for (let index = 0; index < paginated.data.length; index++) {
                            const linkElement = document.createElement("a");
                            const element = paginated.data[index];
                            linkElement.className = "collection-item";
                            linkElement.href = spineItem.Href;
                            linkElement.innerHTML =
                                "..." +
                                    element.textBefore +
                                    "<mark>" +
                                    element.textMatch +
                                    "</mark>" +
                                    element.textAfter +
                                    "..."; //   element.chapter_highlight
                            EventHandler_1.addEventListenerOptional(linkElement, "click", (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                self.jumpToMark(index + page * 5 - 5);
                            });
                            searchResultDiv.appendChild(linkElement);
                        }
                        let div = document.createElement("div");
                        div.style.textAlign = "center";
                        div.style.marginTop = "10px";
                        let pagination = document.createElement("ul");
                        pagination.className = "pagination";
                        let previousResultPage = document.createElement("li");
                        previousResultPage.className = "disabled";
                        previousResultPage.innerHTML = '<a href="#!">left</a>';
                        if (paginated.pre_page != null) {
                            previousResultPage.className = "waves-effect";
                            EventHandler_1.addEventListenerOptional(previousResultPage, "click", (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                goToResultPage(paginated.pre_page);
                            });
                        }
                        pagination.appendChild(previousResultPage);
                        var activeElement;
                        for (let index = 1; index <= paginated.total_pages; index++) {
                            let element = document.createElement("li");
                            element.className = "waves-effect";
                            if (index === paginated.page) {
                                element.className = "active";
                                activeElement = element;
                            }
                            element.innerHTML = '<a href="#!">' + index + "</a>";
                            EventHandler_1.addEventListenerOptional(element, "click", (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                activeElement.className = "waves-effect";
                                element.className = "active";
                                activeElement = element;
                                goToResultPage(index);
                            });
                            pagination.appendChild(element);
                        }
                        let nextResultPage = document.createElement("li");
                        nextResultPage.className = "disabled";
                        nextResultPage.innerHTML = '<a href="#!">right</a>';
                        if (paginated.next_page != null) {
                            nextResultPage.className = "waves-effect";
                            EventHandler_1.addEventListenerOptional(nextResultPage, "click", (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                goToResultPage(paginated.next_page);
                            });
                        }
                        pagination.appendChild(nextResultPage);
                        div.appendChild(pagination);
                        searchResultDiv.appendChild(div);
                    }
                });
            }
        });
    }
    // Search Current Resource
    searchAndPaintChapter(term, index = 0, callback) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const linkHref = this.publication.getAbsoluteHref(this.publication.readingOrder[this.delegate.currentResource()].Href);
            let tocItem = this.publication.getTOCItem(linkHref);
            if (tocItem === null) {
                tocItem = this.publication.readingOrder[this.delegate.currentResource()];
            }
            var localSearchResultChapter = [];
            // clear search results // needs more works
            for (const iframe of this.delegate.iframes) {
                this.highlighter.destroyAllhighlights(iframe.contentDocument);
            }
            if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableAnnotations) {
                this.delegate.annotationModule.drawHighlights();
            }
            else {
                if ((_b = this.delegate.rights) === null || _b === void 0 ? void 0 : _b.enableSearch) {
                    this.drawSearch();
                }
            }
            var i = 0;
            var href = this.publication.getAbsoluteHref(tocItem.Href);
            yield fetch(href)
                .then((r) => r.text())
                .then((_data) => __awaiter(this, void 0, void 0, function* () {
                // ({ data, tocItem });
                // TODO: this seems to break with obfuscation
                // var parser = new DOMParser();
                // var doc = parser.parseFromString(data, "text/html");
                searchWithDomSeek_1.searchDocDomSeek(term, this.delegate.iframes[0].contentDocument, tocItem.Href, tocItem.Title).then((result) => {
                    // searchDocDomSeek(searchVal, doc, tocItem.href, tocItem.title).then(result => {
                    result.forEach((searchItem) => {
                        var selectionInfo = {
                            rangeInfo: searchItem.rangeInfo,
                            cleanText: null,
                            rawText: null,
                            range: null,
                        };
                        setTimeout(() => {
                            var _a, _b;
                            var highlight;
                            if (i === index) {
                                highlight = this.highlighter.createSearchHighlight(selectionInfo, (_a = this.properties) === null || _a === void 0 ? void 0 : _a.current);
                                this.jumpToMark(index);
                            }
                            else {
                                highlight = this.highlighter.createSearchHighlight(selectionInfo, (_b = this.properties) === null || _b === void 0 ? void 0 : _b.color);
                            }
                            searchItem.highlight = highlight;
                            localSearchResultChapter.push(searchItem);
                            this.currentChapterSearchResult.push(searchItem);
                            this.currentHighlights.push(highlight);
                            i++;
                        }, 500);
                    });
                    setTimeout(() => {
                        callback(localSearchResultChapter);
                    }, 500);
                });
            }));
        });
    }
    clearSearch() {
        var _a;
        this.currentChapterSearchResult = [];
        this.currentHighlights = [];
        for (const iframe of this.delegate.iframes) {
            this.highlighter.destroyAllhighlights(iframe.contentDocument);
        }
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableAnnotations) {
            this.delegate.annotationModule.drawHighlights();
        }
    }
    search(term, current) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentChapterSearchResult = [];
            this.currentHighlights = [];
            this.bookSearchResult = [];
            searchWithDomSeek_1.reset();
            this.searchAndPaintChapter(term, 0, () => __awaiter(this, void 0, void 0, function* () { }));
            var chapter = this.searchChapter(term);
            var book = this.searchBook(term);
            if (current) {
                return chapter;
            }
            else {
                return book;
            }
        });
    }
    goToSearchID(href, index, current) {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredIndex = index;
            var item;
            let currentLocation = this.delegate.currentChapterLink.href;
            var absolutehref = this.publication.getAbsoluteHref(href);
            let filteredIndexes = this.bookSearchResult.filter((el) => el.href === href);
            if (current) {
                item = this.currentChapterSearchResult.filter((el) => el.uuid === index)[0];
                filteredIndex = this.currentChapterSearchResult.findIndex((el) => el.uuid === index);
            }
            else {
                item = filteredIndexes.filter((el) => el.uuid === index)[0];
                filteredIndex = filteredIndexes.findIndex((el) => el.uuid === index);
            }
            if (item !== undefined) {
                if (currentLocation === absolutehref) {
                    this.jumpToMark(filteredIndex);
                }
                else {
                    let locations = {
                        progression: 0,
                    };
                    const position = {
                        href: absolutehref,
                        // type: link.type,
                        locations: locations,
                        title: "title",
                    };
                    // TODO search index and total progression.
                    // position.locations.totalProgression = self.delegate.calculateTotalProgresion(position)
                    // position.locations.index = filteredIndex
                    this.delegate.navigate(position);
                    // Navigate to new chapter and search only in new current chapter,
                    // this should refresh thesearch result of current chapter and highlight the selected index
                    setTimeout(() => {
                        this.searchAndPaintChapter(item.textMatch, filteredIndex, () => __awaiter(this, void 0, void 0, function* () { }));
                    }, 300);
                }
            }
        });
    }
    goToSearchIndex(href, index, current) {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredIndex = index;
            var item;
            let currentLocation = this.delegate.currentChapterLink.href;
            var absolutehref = this.publication.getAbsoluteHref(href);
            let filteredIndexes = this.bookSearchResult.filter((el) => el.href === href);
            if (current) {
                item = this.currentChapterSearchResult[filteredIndex];
            }
            else {
                item = filteredIndexes[filteredIndex];
            }
            if (item !== undefined) {
                if (currentLocation === absolutehref) {
                    this.jumpToMark(filteredIndex);
                }
                else {
                    let locations = {
                        progression: 0,
                    };
                    const position = {
                        href: absolutehref,
                        // type: link.type,
                        locations: locations,
                        title: "title",
                    };
                    // TODO search index and total progression.
                    // position.locations.totalProgression = self.delegate.calculateTotalProgresion(position)
                    // position.locations.index = filteredIndex
                    this.delegate.navigate(position);
                    // Navigate to new chapter and search only in new current chapter,
                    // this should refresh thesearch result of current chapter and highlight the selected index
                    setTimeout(() => {
                        this.searchAndPaintChapter(item.textMatch, filteredIndex, () => __awaiter(this, void 0, void 0, function* () { }));
                    }, 300);
                }
            }
        });
    }
    handleSearchBook() {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            var searchVal = this.searchInput.value;
            // var searchResult = undefined
            var searchResultBook = HTMLUtilities.findElement(self.headerMenu, "#searchResultBook");
            goToResultPage(1);
            function goToResultPage(page) {
                return __awaiter(this, void 0, void 0, function* () {
                    searchResultBook.innerHTML = null;
                    var paginated;
                    var localSearchResultBook = yield self.searchBook(searchVal);
                    paginated = self.paginate(localSearchResultBook, page, 5);
                    if (paginated.total === 0) {
                        const linkElement = document.createElement("a");
                        linkElement.className = "collection-item";
                        linkElement.innerHTML = "nothing found"; //self.delegate.translateModule.reader_search_nothing_found
                        searchResultBook.appendChild(linkElement);
                    }
                    else {
                        const paginatedGrouped = groupBy(paginated.data, (item) => item.href);
                        paginatedGrouped.forEach((chapter) => {
                            const divElement = document.createElement("div");
                            divElement.style.marginBottom = "10px";
                            if (chapter[0].title) {
                                const spanElement = document.createElement("span");
                                spanElement.className = "collection-item";
                                spanElement.style.display = "block";
                                spanElement.innerHTML = chapter[0].title;
                                divElement.appendChild(spanElement);
                            }
                            searchResultBook.appendChild(divElement);
                            chapter.forEach((searchItem) => {
                                const linkElement = document.createElement("a");
                                linkElement.className = "collection-item";
                                var href = self.publication.getAbsoluteHref(searchItem.href);
                                linkElement.innerHTML =
                                    "..." +
                                        searchItem.textBefore +
                                        "<mark>" +
                                        searchItem.textMatch +
                                        "</mark>" +
                                        searchItem.textAfter +
                                        "..."; //searchItem.chapter_highlight
                                EventHandler_1.addEventListenerOptional(linkElement, "click", (event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    let filteredIndexes = localSearchResultBook.filter((el) => el.href === searchItem.href);
                                    const filteredIndex = filteredIndexes.findIndex((el) => el === searchItem);
                                    let currentLocation = self.delegate.currentChapterLink.href;
                                    if (currentLocation === href) {
                                        self.jumpToMark(filteredIndex);
                                    }
                                    else {
                                        let locations = {
                                            progression: 0,
                                        };
                                        const position = {
                                            href: href,
                                            // type: link.type,
                                            locations: locations,
                                            title: "title",
                                        };
                                        // TODO search index and total progression.
                                        // position.locations.totalProgression = self.delegate.calculateTotalProgresion(position)
                                        // position.locations.index = filteredIndex
                                        self.delegate.navigate(position);
                                        // Navigate to new chapter and search only in new current chapter,
                                        // this should refresh thesearch result of current chapter and highlight the selected index
                                        setTimeout(() => {
                                            self.handleSearchChapter(filteredIndex);
                                        }, 300);
                                    }
                                });
                                divElement.appendChild(linkElement);
                            });
                        });
                        let div = document.createElement("div");
                        div.style.textAlign = "center";
                        div.style.marginTop = "10px";
                        let pagination = document.createElement("ul");
                        pagination.className = "pagination";
                        let previousResultPage = document.createElement("li");
                        previousResultPage.className = "disabled";
                        previousResultPage.innerHTML = '<a href="#!">left</a>';
                        if (paginated.pre_page != null) {
                            previousResultPage.className = "waves-effect";
                            EventHandler_1.addEventListenerOptional(previousResultPage, "click", (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                goToResultPage(paginated.pre_page);
                            });
                        }
                        pagination.appendChild(previousResultPage);
                        var activeElement;
                        for (let index = 1; index <= paginated.total_pages; index++) {
                            let element = document.createElement("li");
                            element.className = "waves-effect";
                            if (index === paginated.page) {
                                element.className = "active";
                                activeElement = element;
                            }
                            element.innerHTML = '<a href="#!">' + index + "</a>";
                            EventHandler_1.addEventListenerOptional(element, "click", (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                activeElement.className = "waves-effect";
                                element.className = "active";
                                activeElement = element;
                                goToResultPage(index);
                            });
                            pagination.appendChild(element);
                        }
                        let nextResultPage = document.createElement("li");
                        nextResultPage.className = "disabled";
                        nextResultPage.innerHTML = '<a href="#!">right</a>';
                        if (paginated.next_page != null) {
                            nextResultPage.className = "waves-effect";
                            EventHandler_1.addEventListenerOptional(nextResultPage, "click", (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                goToResultPage(paginated.next_page);
                            });
                        }
                        pagination.appendChild(nextResultPage);
                        div.appendChild(pagination);
                        searchResultBook.appendChild(div);
                    }
                });
            }
            function groupBy(list, getKey) {
                const map = new Map();
                list.forEach((item) => {
                    const key = getKey(item);
                    const collection = map.get(key);
                    if (!collection) {
                        map.set(key, [item]);
                    }
                    else {
                        collection.push(item);
                    }
                });
                return Array.from(map.values());
            }
        });
    }
    // Search Entire Book
    searchBook(term) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bookSearchResult = [];
            var localSearchResultBook = [];
            for (let index = 0; index < this.publication.readingOrder.length; index++) {
                const linkHref = this.publication.getAbsoluteHref(this.publication.readingOrder[index].Href);
                let tocItem = this.publication.getTOCItem(linkHref);
                if (tocItem === null) {
                    tocItem = this.publication.readingOrder[index];
                }
                var href = this.publication.getAbsoluteHref(tocItem.Href);
                yield fetch(href)
                    .then((r) => r.text())
                    .then((data) => __awaiter(this, void 0, void 0, function* () {
                    // ({ data, tocItem });
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(data, "application/xhtml+xml");
                    searchWithDomSeek_1.searchDocDomSeek(term, doc, tocItem.Href, tocItem.Title).then((result) => {
                        result.forEach((searchItem) => {
                            localSearchResultBook.push(searchItem);
                            this.bookSearchResult.push(searchItem);
                        });
                    });
                }));
                if (index === this.publication.readingOrder.length - 1) {
                    return localSearchResultBook;
                }
            }
        });
    }
    searchChapter(term) {
        return __awaiter(this, void 0, void 0, function* () {
            var localSearchResultBook = [];
            const linkHref = this.publication.getAbsoluteHref(this.publication.readingOrder[this.delegate.currentResource()].Href);
            let tocItem = this.publication.getTOCItem(linkHref);
            if (tocItem === null) {
                tocItem = this.publication.readingOrder[this.delegate.currentResource()];
            }
            var href = this.publication.getAbsoluteHref(tocItem.Href);
            yield fetch(href)
                .then((r) => r.text())
                .then((data) => __awaiter(this, void 0, void 0, function* () {
                // ({ data, tocItem });
                var parser = new DOMParser();
                var doc = parser.parseFromString(data, "application/xhtml+xml");
                searchWithDomSeek_1.searchDocDomSeek(term, doc, tocItem.Href, tocItem.Title).then((result) => {
                    result.forEach((searchItem) => {
                        localSearchResultBook.push(searchItem);
                    });
                });
            }));
            return localSearchResultBook;
        });
    }
    drawSearch() {
        setTimeout(() => {
            this.currentHighlights = [];
            this.currentChapterSearchResult.forEach((searchItem) => {
                var _a;
                var selectionInfo = {
                    rangeInfo: searchItem.rangeInfo,
                    cleanText: null,
                    rawText: null,
                    range: null,
                };
                var highlight = this.highlighter.createSearchHighlight(selectionInfo, (_a = this.properties) === null || _a === void 0 ? void 0 : _a.color);
                searchItem.highlight = highlight;
                this.currentHighlights.push(highlight);
            });
        }, 100);
    }
    handleResize() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const iframe of this.delegate.iframes) {
                yield this.highlighter.destroyAllhighlights(iframe.contentDocument);
            }
            this.drawSearch();
        });
    }
    jumpToMark(index) {
        setTimeout(() => {
            var _a;
            if (this.currentChapterSearchResult.length) {
                var current = this.currentChapterSearchResult[index];
                this.currentHighlights.forEach((highlight) => {
                    var _a;
                    var createColor = (_a = this.properties) === null || _a === void 0 ? void 0 : _a.color;
                    if (TextHighlighter_1.default.isHexColor(createColor)) {
                        createColor = TextHighlighter_1.default.hexToRgbChannels(createColor);
                    }
                    highlight.color = createColor;
                });
                var currentColor = (_a = this.properties) === null || _a === void 0 ? void 0 : _a.current;
                if (TextHighlighter_1.default.isHexColor(currentColor)) {
                    currentColor = TextHighlighter_1.default.hexToRgbChannels(currentColor);
                }
                current.highlight.color = currentColor;
                this.highlighter.setAndResetSearchHighlight(current.highlight, this.currentHighlights);
                this.delegate.view.goToCssSelector(current.rangeInfo.startContainerElementCssSelector);
                this.delegate.updatePositionInfo();
            }
        }, 200);
    }
    paginate(items, page, per_page) {
        var page = page || 1, per_page = per_page || 10, offset = (page - 1) * per_page, paginatedItems = items.slice(offset).slice(0, per_page), total_pages = Math.ceil(items.length / per_page);
        return {
            page: page,
            per_page: per_page,
            pre_page: page - 1 ? page - 1 : null,
            next_page: total_pages > page ? page + 1 : null,
            total: items.length,
            total_pages: total_pages,
            data: paginatedItems,
        };
    }
}
exports.default = SearchModule;
//# sourceMappingURL=SearchModule.js.map