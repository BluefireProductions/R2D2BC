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
const EventHandler_1 = require("../utils/EventHandler");
const BrowserUtilities = require("../utils/BrowserUtilities");
const HTMLUtilities = require("../utils/HTMLUtilities");
const HTMLTemplates_1 = require("../utils/HTMLTemplates");
const materialize_css_1 = require("materialize-css");
const __1 = require("..");
const splitting_1 = require("../modules/TTS/splitting");
const debounce_1 = require("debounce");
const TouchEventHandler_1 = require("../utils/TouchEventHandler");
const KeyboardEventHandler_1 = require("../utils/KeyboardEventHandler");
/** Class that shows webpub resources in an iframe, with navigation controls outside the iframe. */
class IFrameNavigator {
    constructor(settings, annotator = null, eventHandler = null, touchEventHandler = null, keyboardEventHandler = null, upLinkConfig = null, initialLastReadingPosition = null, publication, material, api, rights, tts, injectables, attributes, services) {
        this.iframes = [];
        this.sideNavExpanded = false;
        this.material = false;
        this.currentChapterLink = {};
        this.currentSpreadLinks = {};
        this.upLink = null;
        this.onResize = () => {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.handleResize.bind(this), 200);
        };
        this.reload = () => __awaiter(this, void 0, void 0, function* () {
            let lastReadingPosition = null;
            if (this.annotator) {
                lastReadingPosition = (yield this.annotator.getLastReadingPosition());
            }
            if (lastReadingPosition) {
                const linkHref = this.publication.getAbsoluteHref(lastReadingPosition.href);
                if (__1.IS_DEV)
                    console.log(lastReadingPosition.href);
                if (__1.IS_DEV)
                    console.log(linkHref);
                lastReadingPosition.href = linkHref;
                this.navigate(lastReadingPosition);
            }
        });
        this.checkResourcePosition = debounce_1.debounce(() => {
            var _a, _b, _c, _d, _e, _f;
            if (this.view.atStart() && this.view.atEnd()) {
                if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.resourceFitsScreen)
                    (_b = this.api) === null || _b === void 0 ? void 0 : _b.resourceFitsScreen();
            }
            else if (this.view.atEnd()) {
                if ((_c = this.api) === null || _c === void 0 ? void 0 : _c.resourceAtEnd)
                    (_d = this.api) === null || _d === void 0 ? void 0 : _d.resourceAtEnd();
            }
            else if (this.view.atStart()) {
                if ((_e = this.api) === null || _e === void 0 ? void 0 : _e.resourceAtStart)
                    (_f = this.api) === null || _f === void 0 ? void 0 : _f.resourceAtStart();
            }
        }, 200);
        this.settings = settings;
        this.annotator = annotator;
        this.view = settings.view;
        this.view.attributes = attributes;
        this.view.delegate = this;
        this.eventHandler = eventHandler || new EventHandler_1.default();
        this.touchEventHandler = touchEventHandler || new TouchEventHandler_1.default();
        this.keyboardEventHandler =
            keyboardEventHandler || new KeyboardEventHandler_1.default();
        this.upLinkConfig = upLinkConfig;
        this.initialLastReadingPosition = initialLastReadingPosition;
        this.publication = publication;
        this.material = material;
        this.api = api;
        this.rights = rights;
        this.tts = tts;
        this.injectables = injectables;
        this.attributes = attributes || { margin: 0 };
        this.services = services;
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const navigator = new this(config.settings, config.annotator || null, config.eventHandler || null, config.touchEventHandler || null, config.keyboardEventHandler || null, config.upLink || null, config.initialLastReadingPosition || null, config.publication, config.material, config.api, config.rights, config.tts, config.injectables, config.attributes || { margin: 0 }, config.services);
            yield navigator.start(config.mainElement, config.headerMenu, config.footerMenu);
            return new Promise((resolve) => resolve(navigator));
        });
    }
    stop() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("Iframe navigator stop");
            }
            EventHandler_1.removeEventListenerOptional(this.previousChapterAnchorElement, "click", this.handlePreviousChapterClick.bind(this));
            EventHandler_1.removeEventListenerOptional(this.nextChapterAnchorElement, "click", this.handleNextChapterClick.bind(this));
            EventHandler_1.removeEventListenerOptional(this.previousChapterTopAnchorElement, "click", this.handlePreviousPageClick.bind(this));
            EventHandler_1.removeEventListenerOptional(this.nextChapterBottomAnchorElement, "click", this.handleNextPageClick.bind(this));
            EventHandler_1.removeEventListenerOptional(this.previousPageAnchorElement, "click", this.handlePreviousPageClick.bind(this));
            EventHandler_1.removeEventListenerOptional(this.nextPageAnchorElement, "click", this.handleNextPageClick.bind(this));
            EventHandler_1.removeEventListenerOptional(this.tryAgainButton, "click", this.tryAgain.bind(this));
            EventHandler_1.removeEventListenerOptional(this.goBackButton, "click", IFrameNavigator.goBack.bind(this));
            EventHandler_1.removeEventListenerOptional(this.bookmarksControl, "keydown", this.hideBookmarksOnEscape.bind(this));
            EventHandler_1.removeEventListenerOptional(this.espandMenuIcon, "click", this.handleEditClick.bind(this));
            EventHandler_1.removeEventListenerOptional(window, "resize", this.onResize);
            this.iframes.forEach((iframe) => {
                EventHandler_1.removeEventListenerOptional(iframe, "resize", this.onResize);
            });
            if ((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableMaterial) {
                if (this.mDropdowns) {
                    this.mDropdowns.forEach((element) => {
                        element.destroy();
                    });
                }
                if (this.mCollapsibles) {
                    this.mCollapsibles.forEach((element) => {
                        element.destroy();
                    });
                }
                if (this.mSidenav) {
                    this.mSidenav.destroy();
                }
                if (this.mTabs) {
                    this.mTabs.forEach((element) => {
                        element.destroy();
                    });
                }
            }
        });
    }
    start(mainElement, headerMenu, footerMenu) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        return __awaiter(this, void 0, void 0, function* () {
            this.headerMenu = headerMenu;
            this.mainElement = mainElement;
            try {
                let iframe = HTMLUtilities.findElement(mainElement, "main#iframe-wrapper iframe");
                let iframe2 = HTMLUtilities.findElement(mainElement, "#second");
                if (iframe) {
                    this.iframes.push(iframe);
                }
                if (iframe2) {
                    this.iframes.push(iframe2);
                }
                if (this.iframes.length === 0) {
                    var wrapper = HTMLUtilities.findRequiredElement(mainElement, "main#iframe-wrapper");
                    let iframe = document.createElement("iframe");
                    iframe.setAttribute("SCROLLING", "no");
                    iframe.setAttribute("allowtransparency", "true");
                    this.iframes.push(iframe);
                    this.spreads = document.createElement("div");
                    this.firstSpread = document.createElement("div");
                    this.spreads.style.display = "flex";
                    this.spreads.style.alignItems = "center";
                    this.spreads.style.justifyContent = "center";
                    let info = document.getElementById("reader-info-bottom");
                    if (info) {
                        wrapper.insertBefore(this.spreads, info);
                    }
                    else {
                        wrapper.appendChild(this.spreads);
                    }
                    this.spreads.appendChild(this.firstSpread);
                    this.firstSpread.appendChild(this.iframes[0]);
                    if (((_b = (_a = this.publication.Metadata.Rendition) === null || _a === void 0 ? void 0 : _a.Layout) !== null && _b !== void 0 ? _b : "unknown") === "fixed") {
                        if (this.settings.columnCount !== 1) {
                            let secondSpread = document.createElement("div");
                            this.spreads.appendChild(secondSpread);
                            let iframe2 = document.createElement("iframe");
                            iframe2.setAttribute("SCROLLING", "no");
                            iframe2.setAttribute("allowtransparency", "true");
                            iframe2.style.opacity = "1";
                            this.iframes.push(iframe2);
                            secondSpread.appendChild(this.iframes[1]);
                            this.firstSpread.style.clipPath =
                                "polygon(0% -20%, 100% -20%, 100% 120%, -20% 120%)";
                            this.firstSpread.style.boxShadow = "0 0 8px 2px #ccc";
                            secondSpread.style.clipPath =
                                "polygon(0% -20%, 100% -20%, 120% 100%, 0% 120%)";
                            secondSpread.style.boxShadow = "0 0 8px 2px #ccc";
                        }
                        else {
                            this.firstSpread.style.clipPath =
                                "polygon(0% -20%, 100% -20%, 120% 100%, -20% 120%)";
                            this.firstSpread.style.boxShadow = "0 0 8px 2px #ccc";
                        }
                    }
                    else {
                        this.iframes[0].style.paddingTop =
                            ((_d = (_c = this.attributes) === null || _c === void 0 ? void 0 : _c.iframePaddingTop) !== null && _d !== void 0 ? _d : 0) + "px";
                    }
                }
                if (((_f = (_e = this.publication.Metadata.Rendition) === null || _e === void 0 ? void 0 : _e.Layout) !== null && _f !== void 0 ? _f : "unknown") === "fixed") {
                    var wrapper = HTMLUtilities.findRequiredElement(mainElement, "main#iframe-wrapper");
                    const minHeight = BrowserUtilities.getHeight() - 40 - this.attributes.margin;
                    wrapper.style.height = minHeight + 40 + "px";
                    var iframeParent = this.iframes[0].parentElement
                        .parentElement;
                    iframeParent.style.height = minHeight + 40 + "px";
                }
                else {
                    if (this.iframes.length == 2) {
                        this.iframes.pop();
                    }
                }
                this.loadingMessage = HTMLUtilities.findElement(mainElement, "#reader-loading");
                if (this.loadingMessage) {
                    this.loadingMessage.innerHTML = HTMLTemplates_1.readerLoading;
                    this.loadingMessage.style.display = "none";
                }
                this.errorMessage = HTMLUtilities.findElement(mainElement, "#reader-error");
                if (this.errorMessage) {
                    this.errorMessage.innerHTML = HTMLTemplates_1.readerError;
                    this.errorMessage.style.display = "none";
                }
                this.tryAgainButton = HTMLUtilities.findElement(mainElement, "button[class=try-again]");
                this.goBackButton = HTMLUtilities.findElement(mainElement, "button[class=go-back]");
                this.infoTop = HTMLUtilities.findElement(mainElement, "div[class='info top']");
                this.infoBottom = HTMLUtilities.findElement(mainElement, "div[class='info bottom']");
                if (this.headerMenu)
                    this.bookTitle = HTMLUtilities.findElement(this.headerMenu, "#book-title");
                if (this.infoBottom)
                    this.chapterTitle = HTMLUtilities.findElement(this.infoBottom, "span[class=chapter-title]");
                if (this.infoBottom)
                    this.chapterPosition = HTMLUtilities.findElement(this.infoBottom, "span[class=chapter-position]");
                if (this.infoBottom)
                    this.remainingPositions = HTMLUtilities.findElement(this.infoBottom, "span[class=remaining-positions]");
                if (this.headerMenu)
                    this.espandMenuIcon = HTMLUtilities.findElement(this.headerMenu, "#expand-menu");
                // Header Menu
                if (this.headerMenu)
                    this.links = HTMLUtilities.findElement(this.headerMenu, "ul.links.top");
                if (this.headerMenu)
                    this.linksTopLeft = HTMLUtilities.findElement(this.headerMenu, "#nav-mobile-left");
                if (this.headerMenu)
                    this.tocView = HTMLUtilities.findElement(this.headerMenu, "#container-view-toc");
                if (this.headerMenu)
                    this.landmarksView = HTMLUtilities.findElement(headerMenu, "#container-view-landmarks");
                if (this.headerMenu)
                    this.landmarksSection = HTMLUtilities.findElement(headerMenu, "#sidenav-section-landmarks");
                if (this.headerMenu)
                    this.pageListView = HTMLUtilities.findElement(headerMenu, "#container-view-pagelist");
                if (this.headerMenu)
                    this.goToPageView = HTMLUtilities.findElement(headerMenu, "#sidenav-section-gotopage");
                if (this.headerMenu)
                    this.goToPageNumberInput = HTMLUtilities.findElement(headerMenu, "#goToPageNumberInput");
                if (this.headerMenu)
                    this.goToPageNumberButton = HTMLUtilities.findElement(headerMenu, "#goToPageNumberButton");
                // Footer Menu
                if (footerMenu)
                    this.linksBottom = HTMLUtilities.findElement(footerMenu, "ul.links.bottom");
                if (footerMenu)
                    this.linksMiddle = HTMLUtilities.findElement(footerMenu, "ul.links.middle");
                if (this.headerMenu)
                    this.nextChapterAnchorElement = HTMLUtilities.findElement(this.headerMenu, "a[rel=next]");
                if (this.headerMenu)
                    this.nextChapterBottomAnchorElement = HTMLUtilities.findElement(mainElement, "#next-chapter");
                if (footerMenu)
                    this.nextPageAnchorElement = HTMLUtilities.findElement(footerMenu, "a[rel=next]");
                if (this.headerMenu)
                    this.previousChapterAnchorElement = HTMLUtilities.findElement(this.headerMenu, "a[rel=prev]");
                if (this.headerMenu)
                    this.previousChapterTopAnchorElement = HTMLUtilities.findElement(mainElement, "#previous-chapter");
                if (footerMenu)
                    this.previousPageAnchorElement = HTMLUtilities.findElement(footerMenu, "a[rel=prev]");
                if (this.nextChapterBottomAnchorElement)
                    this.nextChapterBottomAnchorElement.style.display = "none";
                if (this.previousChapterTopAnchorElement)
                    this.previousChapterTopAnchorElement.style.display = "none";
                this.newPosition = null;
                this.newElementId = null;
                this.isBeingStyled = true;
                this.isLoading = true;
                this.setupEvents();
                this.settings.setIframe(this.iframes[0]);
                this.settings.onSettingsChange(this.handleResize.bind(this));
                this.settings.onColumnSettingsChange(this.handleNumberOfIframes.bind(this));
                this.settings.onViewChange(this.updateBookView.bind(this));
                if (this.initialLastReadingPosition) {
                    this.annotator.initLastReadingPosition(this.initialLastReadingPosition);
                }
                var self = this;
                if (this.headerMenu) {
                    var menuSearch = HTMLUtilities.findElement(this.headerMenu, "#menu-button-search");
                    var menuTTS = HTMLUtilities.findElement(this.headerMenu, "#menu-button-tts");
                    var menuBookmark = HTMLUtilities.findElement(this.headerMenu, "#menu-button-bookmark");
                }
                if ((_g = this.rights) === null || _g === void 0 ? void 0 : _g.enableMaterial) {
                    let elements = document.querySelectorAll(".sidenav");
                    if (elements) {
                        self.mSidenav = materialize_css_1.Sidenav.init(elements, {
                            edge: "left",
                        });
                    }
                    let collapsible = document.querySelectorAll(".collapsible");
                    if (collapsible) {
                        self.mCollapsibles = materialize_css_1.Collapsible.init(collapsible, {
                            accordion: true,
                        });
                    }
                    let dropdowns = document.querySelectorAll(".dropdown-trigger");
                    if (dropdowns) {
                        self.mDropdowns = materialize_css_1.Dropdown.init(dropdowns, {
                            alignment: "right",
                            constrainWidth: false,
                            coverTrigger: false,
                            closeOnClick: false,
                            autoTrigger: false,
                            onOpenEnd: function () {
                                self.mTabs.forEach((element) => {
                                    element.updateTabIndicator();
                                });
                            },
                        });
                    }
                    let tabs = document.querySelectorAll(".tabs");
                    if (tabs) {
                        self.mTabs = materialize_css_1.Tabs.init(tabs);
                    }
                    if (this.headerMenu) {
                        if (!((_h = this.rights) === null || _h === void 0 ? void 0 : _h.enableBookmarks)) {
                            if (menuBookmark)
                                menuBookmark.parentElement.style.setProperty("display", "none");
                            var sideNavSectionBookmarks = HTMLUtilities.findElement(this.headerMenu, "#sidenav-section-bookmarks");
                            if (sideNavSectionBookmarks)
                                sideNavSectionBookmarks.style.setProperty("display", "none");
                        }
                        if (!((_j = this.rights) === null || _j === void 0 ? void 0 : _j.enableAnnotations)) {
                            var sideNavSectionHighlights = HTMLUtilities.findElement(this.headerMenu, "#sidenav-section-highlights");
                            if (sideNavSectionHighlights)
                                sideNavSectionHighlights.style.setProperty("display", "none");
                        }
                        if (!((_k = this.rights) === null || _k === void 0 ? void 0 : _k.enableTTS)) {
                            if (menuTTS)
                                menuTTS.parentElement.style.setProperty("display", "none");
                        }
                        if (!((_l = this.rights) === null || _l === void 0 ? void 0 : _l.enableSearch)) {
                            if (menuSearch)
                                menuSearch.parentElement.style.removeProperty("display");
                        }
                        if (menuSearch &&
                            ((_o = (_m = this.view.delegate.publication.Metadata.Rendition) === null || _m === void 0 ? void 0 : _m.Layout) !== null && _o !== void 0 ? _o : "unknown") === "fixed") {
                            menuSearch.parentElement.style.setProperty("display", "none");
                        }
                    }
                }
                else {
                    if (this.headerMenu) {
                        if (menuSearch)
                            menuSearch.parentElement.style.setProperty("display", "none");
                        if (menuTTS)
                            menuTTS.parentElement.style.setProperty("display", "none");
                        if (menuBookmark)
                            menuBookmark.parentElement.style.setProperty("display", "none");
                    }
                }
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    var _p;
                    if (self.annotationModule !== undefined) {
                        self.annotationModule.drawHighlights();
                        // self.annotationModule.drawIndicators()
                    }
                    else {
                        if ((_p = this.rights) === null || _p === void 0 ? void 0 : _p.enableSearch) {
                            yield this.highlighter.destroyAllhighlights(this.iframes[0].contentDocument);
                            self.searchModule.drawSearch();
                        }
                    }
                }), 300);
                return yield this.loadManifest();
            }
            catch (err) {
                // There's a mismatch between the template and the selectors above,
                // or we weren't able to insert the template in the element.
                console.error(err);
                this.abortOnError();
                return new Promise((_, reject) => reject(err)).catch(() => { });
            }
        });
    }
    setupEvents() {
        for (const iframe of this.iframes) {
            EventHandler_1.addEventListenerOptional(iframe, "load", this.handleIFrameLoad.bind(this));
        }
        EventHandler_1.addEventListenerOptional(this.previousChapterAnchorElement, "click", this.handlePreviousChapterClick.bind(this));
        EventHandler_1.addEventListenerOptional(this.nextChapterAnchorElement, "click", this.handleNextChapterClick.bind(this));
        EventHandler_1.addEventListenerOptional(this.previousChapterTopAnchorElement, "click", this.handlePreviousPageClick.bind(this));
        EventHandler_1.addEventListenerOptional(this.nextChapterBottomAnchorElement, "click", this.handleNextPageClick.bind(this));
        EventHandler_1.addEventListenerOptional(this.previousPageAnchorElement, "click", this.handlePreviousPageClick.bind(this));
        EventHandler_1.addEventListenerOptional(this.nextPageAnchorElement, "click", this.handleNextPageClick.bind(this));
        EventHandler_1.addEventListenerOptional(this.tryAgainButton, "click", this.tryAgain.bind(this));
        EventHandler_1.addEventListenerOptional(this.goBackButton, "click", IFrameNavigator.goBack.bind(this));
        EventHandler_1.addEventListenerOptional(this.bookmarksControl, "keydown", this.hideBookmarksOnEscape.bind(this));
        EventHandler_1.addEventListenerOptional(this.espandMenuIcon, "click", this.handleEditClick.bind(this));
        EventHandler_1.addEventListenerOptional(this.goToPageNumberInput, "keypress", this.goToPageNumber.bind(this));
        EventHandler_1.addEventListenerOptional(this.goToPageNumberButton, "click", this.goToPageNumber.bind(this));
        EventHandler_1.addEventListenerOptional(window, "resize", this.onResize);
        for (const iframe of this.iframes) {
            EventHandler_1.addEventListenerOptional(iframe, "resize", this.onResize);
        }
    }
    setupModalFocusTrap(modal, closeButton, lastFocusableElement) {
        // Trap keyboard focus in a modal dialog when it's displayed.
        const TAB_KEY = 9;
        // Going backwards from the close button sends you to the last focusable element.
        closeButton.addEventListener("keydown", (event) => {
            if (IFrameNavigator.isDisplayed(modal)) {
                const tab = event.keyCode === TAB_KEY;
                const shift = !!event.shiftKey;
                if (tab && shift) {
                    lastFocusableElement.focus();
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        });
        // Going forward from the last focusable element sends you to the close button.
        lastFocusableElement.addEventListener("keydown", (event) => {
            if (IFrameNavigator.isDisplayed(modal)) {
                const tab = event.keyCode === TAB_KEY;
                const shift = !!event.shiftKey;
                if (tab && !shift) {
                    closeButton.focus();
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        });
    }
    goToPageNumber(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.goToPageNumberInput.value &&
                (event.key === "Enter" || event.type === "click")) {
                var filteredPages = this.publication.pageList.filter((el) => el.href.slice(el.href.indexOf("#") + 1).replace(/[^0-9]/g, "") ===
                    this.goToPageNumberInput.value);
                if (filteredPages && filteredPages.length > 0) {
                    var firstPage = filteredPages[0];
                    let locations = {
                        progression: 0,
                    };
                    if (firstPage.Href.indexOf("#") !== -1) {
                        const elementId = firstPage.Href.slice(firstPage.Href.indexOf("#") + 1);
                        if (elementId !== null) {
                            locations = {
                                fragment: elementId,
                            };
                        }
                    }
                    const position = {
                        href: this.publication.getAbsoluteHref(firstPage.Href),
                        locations: locations,
                        type: firstPage.TypeLink,
                        title: firstPage.Title,
                    };
                    this.stopReadAloud(true);
                    this.navigate(position);
                }
            }
        });
    }
    updateBookView() {
        if (this.view.layout === "fixed") {
            if (this.nextPageAnchorElement)
                this.nextPageAnchorElement.style.display = "none";
            if (this.previousPageAnchorElement)
                this.previousPageAnchorElement.style.display = "none";
            if (this.nextChapterBottomAnchorElement)
                this.nextChapterBottomAnchorElement.style.display = "none";
            if (this.previousChapterTopAnchorElement)
                this.previousChapterTopAnchorElement.style.display = "none";
        }
        else {
            this.settings.isPaginated().then((paginated) => {
                if (paginated) {
                    this.view.height =
                        BrowserUtilities.getHeight() - 40 - this.attributes.margin;
                    if (this.infoBottom)
                        this.infoBottom.style.removeProperty("display");
                    document.body.onscroll = () => { };
                    if (this.nextChapterBottomAnchorElement)
                        this.nextChapterBottomAnchorElement.style.display = "none";
                    if (this.previousChapterTopAnchorElement)
                        this.previousChapterTopAnchorElement.style.display = "none";
                    if (this.nextPageAnchorElement)
                        this.nextPageAnchorElement.style.display = "unset";
                    if (this.previousPageAnchorElement)
                        this.previousPageAnchorElement.style.display = "unset";
                    if (this.chapterTitle)
                        this.chapterTitle.style.display = "inline";
                    if (this.chapterPosition)
                        this.chapterPosition.style.display = "inline";
                    if (this.remainingPositions)
                        this.remainingPositions.style.display = "inline";
                    if (this.eventHandler) {
                        this.eventHandler.onInternalLink = this.handleInternalLink.bind(this);
                        this.eventHandler.onClickThrough = this.handleClickThrough.bind(this);
                    }
                    if (this.touchEventHandler) {
                        this.touchEventHandler.onBackwardSwipe = this.handlePreviousPageClick.bind(this);
                        this.touchEventHandler.onForwardSwipe = this.handleNextPageClick.bind(this);
                    }
                    if (this.keyboardEventHandler) {
                        this.keyboardEventHandler.onBackwardSwipe = this.handlePreviousPageClick.bind(this);
                        this.keyboardEventHandler.onForwardSwipe = this.handleNextPageClick.bind(this);
                    }
                    if (!IFrameNavigator.isDisplayed(this.linksBottom)) {
                        this.toggleDisplay(this.linksBottom);
                    }
                    if (!IFrameNavigator.isDisplayed(this.linksMiddle)) {
                        this.toggleDisplay(this.linksMiddle);
                    }
                }
                else {
                    if (this.infoBottom)
                        this.infoBottom.style.display = "none";
                    if (this.nextPageAnchorElement)
                        this.nextPageAnchorElement.style.display = "none";
                    if (this.previousPageAnchorElement)
                        this.previousPageAnchorElement.style.display = "none";
                    if (this.view.layout === "fixed") {
                        if (this.nextChapterBottomAnchorElement)
                            this.nextChapterBottomAnchorElement.style.display = "none";
                        if (this.previousChapterTopAnchorElement)
                            this.previousChapterTopAnchorElement.style.display = "none";
                    }
                    else {
                        if (this.view.atStart() && this.view.atEnd()) {
                            if (this.nextChapterBottomAnchorElement)
                                this.nextChapterBottomAnchorElement.style.display = "unset";
                            if (this.previousChapterTopAnchorElement)
                                this.previousChapterTopAnchorElement.style.display = "unset";
                        }
                        else if (this.view.atEnd()) {
                            if (this.previousChapterTopAnchorElement)
                                this.previousChapterTopAnchorElement.style.display = "none";
                            if (this.nextChapterBottomAnchorElement)
                                this.nextChapterBottomAnchorElement.style.display = "unset";
                        }
                        else if (this.view.atStart()) {
                            if (this.nextChapterBottomAnchorElement)
                                this.nextChapterBottomAnchorElement.style.display = "none";
                            if (this.previousChapterTopAnchorElement)
                                this.previousChapterTopAnchorElement.style.display = "unset";
                        }
                        else {
                            if (this.nextChapterBottomAnchorElement)
                                this.nextChapterBottomAnchorElement.style.display = "none";
                            if (this.previousChapterTopAnchorElement)
                                this.previousChapterTopAnchorElement.style.display = "none";
                        }
                    }
                    const onDoScrolling = debounce_1.debounce(() => {
                        this.isScrolling = false;
                    }, 200);
                    // document.body.style.overflow = "auto";
                    document.body.onscroll = () => {
                        this.isScrolling = true;
                        this.saveCurrentReadingPosition();
                        if (this.view.atEnd()) {
                            // Bring up the bottom nav when you get to the bottom,
                            // if it wasn't already displayed.
                            if (!IFrameNavigator.isDisplayed(this.linksBottom)) {
                                this.toggleDisplay(this.linksBottom);
                            }
                            if (!IFrameNavigator.isDisplayed(this.linksMiddle)) {
                                this.toggleDisplay(this.linksMiddle);
                            }
                        }
                        else {
                            // Remove the bottom nav when you scroll back up,
                            // if it was displayed because you were at the bottom.
                            if (IFrameNavigator.isDisplayed(this.linksBottom) &&
                                !IFrameNavigator.isDisplayed(this.links)) {
                                this.toggleDisplay(this.linksBottom);
                            }
                        }
                        if (this.view.layout === "fixed") {
                            if (this.nextChapterBottomAnchorElement)
                                this.nextChapterBottomAnchorElement.style.display = "none";
                            if (this.previousChapterTopAnchorElement)
                                this.previousChapterTopAnchorElement.style.display = "none";
                        }
                        else {
                            this.settings.isPaginated().then((paginated) => {
                                if (!paginated) {
                                    if (this.view.atStart() && this.view.atEnd()) {
                                        if (this.nextChapterBottomAnchorElement)
                                            this.nextChapterBottomAnchorElement.style.display =
                                                "unset";
                                        if (this.previousChapterTopAnchorElement)
                                            this.previousChapterTopAnchorElement.style.display =
                                                "unset";
                                    }
                                    else if (this.view.atEnd()) {
                                        if (this.previousChapterTopAnchorElement)
                                            this.previousChapterTopAnchorElement.style.display =
                                                "none";
                                        if (this.nextChapterBottomAnchorElement)
                                            this.nextChapterBottomAnchorElement.style.display =
                                                "unset";
                                    }
                                    else if (this.view.atStart()) {
                                        if (this.nextChapterBottomAnchorElement)
                                            this.nextChapterBottomAnchorElement.style.display =
                                                "none";
                                        if (this.previousChapterTopAnchorElement)
                                            this.previousChapterTopAnchorElement.style.display =
                                                "unset";
                                    }
                                    else {
                                        if (this.nextChapterBottomAnchorElement)
                                            this.nextChapterBottomAnchorElement.style.display =
                                                "none";
                                        if (this.previousChapterTopAnchorElement)
                                            this.previousChapterTopAnchorElement.style.display =
                                                "none";
                                    }
                                }
                            });
                            this.checkResourcePosition();
                        }
                        onDoScrolling();
                    };
                    if (this.chapterTitle)
                        this.chapterTitle.style.display = "none";
                    if (this.chapterPosition)
                        this.chapterPosition.style.display = "none";
                    if (this.remainingPositions)
                        this.remainingPositions.style.display = "none";
                    if (this.eventHandler) {
                        this.eventHandler.onInternalLink = this.handleInternalLink.bind(this);
                        this.eventHandler.onClickThrough = this.handleClickThrough.bind(this);
                    }
                    if (this.touchEventHandler) {
                        this.touchEventHandler.onBackwardSwipe = this.handlePreviousPageClick.bind(this);
                        this.touchEventHandler.onForwardSwipe = this.handleNextPageClick.bind(this);
                    }
                    if (this.keyboardEventHandler) {
                        this.keyboardEventHandler.onBackwardSwipe = this.handlePreviousPageClick.bind(this);
                        this.keyboardEventHandler.onForwardSwipe = this.handleNextPageClick.bind(this);
                    }
                    if (!IFrameNavigator.isDisplayed(this.linksBottom)) {
                        this.toggleDisplay(this.linksBottom);
                    }
                    if (!IFrameNavigator.isDisplayed(this.linksMiddle)) {
                        this.toggleDisplay(this.linksMiddle);
                    }
                }
            });
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                var _a;
                this.updatePositionInfo();
                if (this.annotationModule !== undefined) {
                    this.annotationModule.drawHighlights();
                }
                else {
                    if ((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableSearch) {
                        for (const iframe of this.iframes) {
                            yield this.highlighter.destroyAllhighlights(iframe.contentDocument);
                        }
                        this.searchModule.drawSearch();
                    }
                }
            }), 200);
        }
    }
    loadManifest() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createSubmenu = (parentElement, links, control, ol = false) => {
                    var menuControl;
                    var mainElement;
                    if (control) {
                        menuControl = control;
                        if (parentElement instanceof HTMLDivElement) {
                            mainElement = parentElement;
                        }
                    }
                    var listElement = document.createElement("ul");
                    if (ol) {
                        listElement = document.createElement("ol");
                    }
                    listElement.className = "sidenav-toc";
                    let lastLink = null;
                    for (const link of links) {
                        const listItemElement = document.createElement("li");
                        const linkElement = document.createElement("a");
                        const spanElement = document.createElement("span");
                        linkElement.className = "chapter-link";
                        linkElement.tabIndex = -1;
                        let href = "";
                        if (link.Href) {
                            href = this.publication.getAbsoluteHref(link.Href);
                            linkElement.href = href;
                            linkElement.innerHTML = link.Title || "";
                            listItemElement.appendChild(linkElement);
                        }
                        else {
                            spanElement.innerHTML = link.Title || "";
                            spanElement.className = "chapter-title";
                            listItemElement.appendChild(spanElement);
                        }
                        if (link.Children && link.Children.length > 0) {
                            createSubmenu(listItemElement, link.Children, null, true);
                        }
                        listElement.appendChild(listItemElement);
                        lastLink = linkElement;
                    }
                    // Trap keyboard focus inside the TOC while it's open.
                    if (lastLink && menuControl) {
                        this.setupModalFocusTrap(mainElement, menuControl, lastLink);
                    }
                    EventHandler_1.addEventListenerOptional(listElement, "click", (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (event.target &&
                            event.target.tagName.toLowerCase() === "a") {
                            let linkElement = event.target;
                            if (linkElement.className.indexOf("active") !== -1) {
                                // This TOC item is already loaded. Hide the TOC
                                // but don't navigate.
                                this.hideView(mainElement, menuControl);
                            }
                            else {
                                // Set focus back to the contents toggle button so screen readers
                                // don't get stuck on a hidden link.
                                menuControl === null || menuControl === void 0 ? void 0 : menuControl.focus();
                                let locations = {
                                    progression: 0,
                                };
                                if (linkElement.href.indexOf("#") !== -1) {
                                    const elementId = linkElement.href.slice(linkElement.href.indexOf("#") + 1);
                                    if (elementId !== null) {
                                        locations = {
                                            fragment: elementId,
                                        };
                                    }
                                }
                                const position = {
                                    href: linkElement.href,
                                    locations: locations,
                                    type: linkElement.type,
                                    title: linkElement.title,
                                };
                                this.hideView(mainElement, menuControl);
                                this.navigate(position);
                            }
                        }
                    });
                    parentElement.appendChild(listElement);
                };
                const toc = this.publication.tableOfContents;
                const landmarks = this.publication.landmarks;
                const pageList = this.publication.pageList;
                if (this.tocView) {
                    if (toc.length) {
                        createSubmenu(this.tocView, toc);
                    }
                    else {
                        this.tocView.parentElement.parentElement.removeChild(this.tocView.parentElement);
                    }
                }
                if (this.pageListView) {
                    if (pageList === null || pageList === void 0 ? void 0 : pageList.length) {
                        createSubmenu(this.pageListView, pageList);
                    }
                    else {
                        this.pageListView.parentElement.parentElement.removeChild(this.pageListView.parentElement);
                    }
                }
                if (this.goToPageView) {
                    if (pageList === null || pageList === void 0 ? void 0 : pageList.length) {
                        //
                    }
                    else {
                        this.goToPageView.parentElement.removeChild(this.goToPageView);
                    }
                }
                if (this.landmarksView) {
                    if (landmarks === null || landmarks === void 0 ? void 0 : landmarks.length) {
                        createSubmenu(this.landmarksView, landmarks);
                    }
                    else {
                        this.landmarksSection.parentElement.removeChild(this.landmarksSection);
                    }
                }
                if ((this.links || this.linksTopLeft) &&
                    this.upLinkConfig &&
                    this.upLinkConfig.url) {
                    const upUrl = this.upLinkConfig.url;
                    const upLabel = this.upLinkConfig.label || "";
                    const upAriaLabel = this.upLinkConfig.ariaLabel || upLabel;
                    var upHTML = HTMLTemplates_1.simpleUpLinkTemplate(upUrl.href, upLabel, upAriaLabel);
                    const upParent = document.createElement("li");
                    upParent.classList.add("uplink-wrapper");
                    upParent.innerHTML = upHTML;
                    if (this.links) {
                        this.links.insertBefore(upParent, this.links.firstChild);
                        this.upLink = HTMLUtilities.findRequiredElement(this.links, "a[rel=up]");
                    }
                    else {
                        this.linksTopLeft.insertBefore(upParent, this.linksTopLeft.firstChild);
                        this.upLink = HTMLUtilities.findRequiredElement(this.linksTopLeft, "a[rel=up]");
                    }
                }
                let lastReadingPosition = null;
                if (this.annotator) {
                    lastReadingPosition = (yield this.annotator.getLastReadingPosition());
                }
                const startLink = this.publication.getStartLink();
                let startUrl = null;
                if (startLink && startLink.Href) {
                    startUrl = this.publication.getAbsoluteHref(startLink.Href);
                }
                if (lastReadingPosition) {
                    const linkHref = this.publication.getAbsoluteHref(lastReadingPosition.href);
                    if (__1.IS_DEV)
                        console.log(lastReadingPosition.href);
                    if (__1.IS_DEV)
                        console.log(linkHref);
                    lastReadingPosition.href = linkHref;
                    this.navigate(lastReadingPosition);
                }
                else if (startUrl) {
                    const position = {
                        href: startUrl,
                        locations: {
                            progression: 0,
                        },
                        created: new Date(),
                        title: startLink.Title,
                    };
                    this.navigate(position);
                }
                return new Promise((resolve) => resolve());
            }
            catch (err) {
                console.error(err);
                this.abortOnError();
                return new Promise((_, reject) => reject(err)).catch(() => { });
            }
        });
    }
    handleIFrameLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.errorMessage)
                this.errorMessage.style.display = "none";
            this.showLoadingMessageAfterDelay();
            try {
                let bookViewPosition = 0;
                if (this.newPosition) {
                    bookViewPosition = this.newPosition.locations.progression;
                }
                this.handleResize();
                this.updateBookView();
                this.settings.applyProperties();
                setTimeout(() => {
                    this.view.goToPosition(bookViewPosition);
                }, 200);
                let currentLocation = this.currentChapterLink.href;
                setTimeout(() => {
                    if (this.newElementId) {
                        const element = this.iframes[0]
                            .contentDocument.getElementById(this.newElementId);
                        this.view.goToElement(element);
                        this.newElementId = null;
                    }
                    else {
                        if (this.newPosition && this.newPosition.highlight) {
                            this.view.goToCssSelector(this.newPosition.highlight.selectionInfo.rangeInfo
                                .startContainerElementCssSelector);
                        }
                    }
                    this.newPosition = null;
                    this.updatePositionInfo();
                }, 200);
                const previous = this.publication.getPreviousSpineItem(currentLocation);
                if (previous && previous.Href) {
                    this.previousChapterLink = {
                        href: previous.Href,
                        title: previous.Title,
                        type: previous.TypeLink,
                    };
                }
                if (this.previousChapterAnchorElement) {
                    if (this.previousChapterLink) {
                        this.previousChapterAnchorElement.href = this.publication.getAbsoluteHref(this.previousChapterLink.href);
                        this.previousChapterAnchorElement.className = this.previousChapterAnchorElement.className.replace(" disabled", "");
                    }
                    else {
                        this.previousChapterAnchorElement.removeAttribute("href");
                        this.previousChapterAnchorElement.className += " disabled";
                    }
                }
                let res = this.publication.getNextSpineItem(currentLocation);
                if (res) {
                    this.nextChapterLink = {
                        href: res.Href,
                        title: res.Title,
                        type: res.TypeLink,
                    };
                }
                else {
                    this.nextChapterLink = undefined;
                }
                if (this.nextChapterAnchorElement) {
                    if (this.nextChapterLink) {
                        this.nextChapterAnchorElement.href = this.publication.getAbsoluteHref(this.nextChapterLink.href);
                        this.nextChapterAnchorElement.className = this.nextChapterAnchorElement.className.replace(" disabled", "");
                    }
                    else {
                        this.nextChapterAnchorElement.removeAttribute("href");
                        this.nextChapterAnchorElement.className += " disabled";
                    }
                }
                if (this.currentTocUrl !== null) {
                    this.setActiveTOCItem(this.currentTocUrl);
                }
                else {
                    this.setActiveTOCItem(currentLocation);
                }
                if (this.publication.Metadata.Title) {
                    if (this.bookTitle)
                        this.bookTitle.innerHTML = this.publication.Metadata.Title.toString();
                }
                const spineItem = this.publication.getSpineItem(currentLocation);
                if (spineItem !== null) {
                    this.currentChapterLink.title = spineItem.Title;
                    this.currentChapterLink.type = spineItem.TypeLink;
                }
                let tocItem = this.publication.getTOCItem(currentLocation);
                if (this.currentTocUrl !== null) {
                    tocItem = this.publication.getTOCItem(this.currentTocUrl);
                }
                if (!this.currentChapterLink.title && tocItem !== null && tocItem.Title) {
                    this.currentChapterLink.title = tocItem.Title;
                }
                if (!this.currentChapterLink.type &&
                    tocItem !== null &&
                    tocItem.TypeLink) {
                    this.currentChapterLink.title = tocItem.Title;
                }
                if (this.currentChapterLink.title) {
                    if (this.chapterTitle)
                        this.chapterTitle.innerHTML =
                            "(" + this.currentChapterLink.title + ")";
                }
                else {
                    if (this.chapterTitle)
                        this.chapterTitle.innerHTML = "(Current Chapter)";
                }
                yield this.injectInjectablesIntoIframeHead();
                if (this.annotator) {
                    yield this.saveCurrentReadingPosition();
                }
                this.hideLoadingMessage();
                this.showIframeContents();
                if (this.highlighter !== undefined) {
                    yield this.highlighter.initialize();
                }
                setTimeout(() => {
                    var _a, _b, _c;
                    const body = this.iframes[0].contentDocument.body;
                    if (((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) && ((_b = this.tts) === null || _b === void 0 ? void 0 : _b.enableSplitter)) {
                        splitting_1.default({
                            target: body,
                            by: "lines",
                        });
                    }
                    if ((_c = this.rights) === null || _c === void 0 ? void 0 : _c.enableContentProtection) {
                        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            if (this.contentProtectionModule !== undefined) {
                                yield this.contentProtectionModule.initialize();
                            }
                        }), 50);
                    }
                }, 50);
                setTimeout(() => {
                    var _a, _b;
                    if (this.eventHandler) {
                        for (const iframe of this.iframes) {
                            this.eventHandler.setupEvents(iframe.contentDocument);
                            this.touchEventHandler.setupEvents(iframe.contentDocument);
                            this.keyboardEventHandler.setupEvents(iframe.contentDocument);
                        }
                        this.keyboardEventHandler.delegate = this;
                        this.keyboardEventHandler.keydown(document);
                    }
                    if (this.view.layout !== "fixed") {
                        if ((_a = this.view) === null || _a === void 0 ? void 0 : _a.isScrollMode()) {
                            for (const iframe of this.iframes) {
                                this.view.setIframeHeight(iframe);
                            }
                        }
                    }
                    if (this.annotationModule !== undefined) {
                        this.annotationModule.initialize();
                    }
                    if ((_b = this.rights) === null || _b === void 0 ? void 0 : _b.enableTTS) {
                        setTimeout(() => {
                            for (const iframe of this.iframes) {
                                const body = iframe.contentDocument.body;
                                if (this.ttsModule !== undefined) {
                                    this.ttsModule.initialize(body);
                                }
                            }
                        }, 200);
                    }
                    for (const iframe of this.iframes) {
                        const body = iframe.contentDocument.body;
                        var pagebreaks = body.querySelectorAll('[*|type="pagebreak"]');
                        for (var i = 0; i < pagebreaks.length; i++) {
                            var img = pagebreaks[i];
                            if (__1.IS_DEV)
                                console.log(img);
                            if (img.innerHTML.length === 0) {
                                img.innerHTML = img.getAttribute("title");
                            }
                            img.className = "epubPageBreak";
                        }
                    }
                }, 100);
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    if (this.timelineModule !== undefined) {
                        yield this.timelineModule.initialize();
                    }
                }), 100);
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    if (this.mediaOverlayModule !== undefined) {
                        yield this.mediaOverlayModule.initialize();
                    }
                }), 100);
                return new Promise((resolve) => resolve());
            }
            catch (err) {
                console.error(err);
                this.abortOnError();
                return new Promise((_, reject) => reject(err)).catch(() => { });
            }
        });
    }
    injectInjectablesIntoIframeHead() {
        return __awaiter(this, void 0, void 0, function* () {
            // Inject Readium CSS into Iframe Head
            const injectablesToLoad = [];
            const addLoadingInjectable = (injectable) => {
                const loadPromise = new Promise((resolve) => {
                    injectable.onload = () => {
                        resolve(true);
                    };
                });
                injectablesToLoad.push(loadPromise);
            };
            for (const iframe of this.iframes) {
                const head = iframe.contentDocument.head;
                if (head) {
                    head.insertBefore(IFrameNavigator.createBase(this.currentChapterLink.href), head.firstChild);
                    this.injectables.forEach((injectable) => {
                        if (injectable.type === "style") {
                            if (injectable.fontFamily) {
                                // UserSettings.fontFamilyValues.push(injectable.fontFamily)
                                // this.settings.setupEvents()
                                // this.settings.addFont(injectable.fontFamily);
                                this.settings.initAddedFont();
                                if (!injectable.systemFont) {
                                    const link = IFrameNavigator.createCssLink(injectable.url);
                                    head.appendChild(link);
                                    addLoadingInjectable(link);
                                }
                            }
                            else if (injectable.r2before) {
                                const link = IFrameNavigator.createCssLink(injectable.url);
                                head.insertBefore(link, head.firstChild);
                                addLoadingInjectable(link);
                            }
                            else if (injectable.r2default) {
                                const link = IFrameNavigator.createCssLink(injectable.url);
                                head.insertBefore(link, head.childNodes[1]);
                                addLoadingInjectable(link);
                            }
                            else if (injectable.r2after) {
                                if (injectable.appearance) {
                                    // this.settings.addAppearance(injectable.appearance);
                                    this.settings.initAddedAppearance();
                                }
                                const link = IFrameNavigator.createCssLink(injectable.url);
                                head.appendChild(link);
                                addLoadingInjectable(link);
                            }
                            else {
                                const link = IFrameNavigator.createCssLink(injectable.url);
                                head.appendChild(link);
                                addLoadingInjectable(link);
                            }
                        }
                        else if (injectable.type === "script") {
                            const script = IFrameNavigator.createJavascriptLink(injectable.url, injectable.async);
                            head.appendChild(script);
                            addLoadingInjectable(script);
                        }
                    });
                }
            }
            if (injectablesToLoad.length === 0) {
                return;
            }
            yield Promise.all(injectablesToLoad);
        });
    }
    abortOnError() {
        if (this.errorMessage)
            this.errorMessage.style.display = "block";
        if (this.isLoading) {
            this.hideLoadingMessage();
        }
    }
    tryAgain() {
        this.precessContentForIframe();
    }
    precessContentForIframe() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const self = this;
        var index = this.publication.getSpineIndex(this.currentChapterLink.href);
        var even = index % 2 === 1;
        function writeIframeDoc(content, href) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "application/xhtml+xml");
            if (doc.head) {
                doc.head.insertBefore(IFrameNavigator.createBase(href), doc.head.firstChild);
            }
            const newHTML = doc.documentElement.outerHTML;
            const iframeDoc = self.iframes[0].contentDocument;
            iframeDoc.open();
            iframeDoc.write(newHTML);
            iframeDoc.close();
        }
        function writeIframe2Doc(content, href) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "application/xhtml+xml");
            if (doc.head) {
                doc.head.insertBefore(IFrameNavigator.createBase(href), doc.head.firstChild);
            }
            const newHTML = doc.documentElement.outerHTML;
            const iframeDoc = self.iframes[1].contentDocument;
            iframeDoc.open();
            iframeDoc.write(newHTML);
            iframeDoc.close();
        }
        const link = new URL(this.currentChapterLink.href);
        const isSameOrigin = window.location.protocol === link.protocol &&
            window.location.port === link.port &&
            window.location.hostname === link.hostname;
        if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.getContent) {
            if (((_c = (_b = this.publication.Metadata.Rendition) === null || _b === void 0 ? void 0 : _b.Layout) !== null && _c !== void 0 ? _c : "unknown") === "fixed") {
                if (this.settings.columnCount !== 1) {
                    if (even) {
                        this.currentSpreadLinks.left = {
                            href: this.currentChapterLink.href,
                        };
                        (_d = this.api) === null || _d === void 0 ? void 0 : _d.getContent(this.currentChapterLink.href).then((content) => {
                            if (content === undefined) {
                                if (isSameOrigin) {
                                    this.iframes[0].src = this.currentChapterLink.href;
                                }
                                else {
                                    fetch(this.currentChapterLink.href)
                                        .then((r) => r.text())
                                        .then((content) => __awaiter(this, void 0, void 0, function* () {
                                        writeIframeDoc.call(this, content, this.currentChapterLink.href);
                                    }));
                                }
                            }
                            else {
                                writeIframeDoc.call(this, content, this.currentChapterLink.href);
                            }
                        });
                        if (this.iframes.length == 2) {
                            if (index < this.publication.readingOrder.length - 1) {
                                const next = this.publication.getNextSpineItem(this.currentChapterLink.href);
                                var href = this.publication.getAbsoluteHref(next.Href);
                                this.currentSpreadLinks.right = {
                                    href: href,
                                };
                                (_e = this.api) === null || _e === void 0 ? void 0 : _e.getContent(href).then((content) => {
                                    if (content === undefined) {
                                        if (isSameOrigin) {
                                            this.iframes[1].src = href;
                                        }
                                        else {
                                            fetch(href)
                                                .then((r) => r.text())
                                                .then((content) => __awaiter(this, void 0, void 0, function* () {
                                                writeIframe2Doc.call(this, content, href);
                                                this.currentSpreadLinks.right = {
                                                    href: href,
                                                };
                                            }));
                                        }
                                    }
                                    else {
                                        writeIframe2Doc.call(this, content, href);
                                    }
                                });
                            }
                            else {
                                this.iframes[1].src = "about:blank";
                            }
                        }
                    }
                    else {
                        if (index > 0) {
                            const prev = this.publication.getPreviousSpineItem(this.currentChapterLink.href);
                            var href = this.publication.getAbsoluteHref(prev.Href);
                            this.currentSpreadLinks.left = {
                                href: href,
                            };
                            (_f = this.api) === null || _f === void 0 ? void 0 : _f.getContent(href).then((content) => {
                                if (content === undefined) {
                                    if (isSameOrigin) {
                                        this.iframes[0].src = href;
                                    }
                                    else {
                                        fetch(href)
                                            .then((r) => r.text())
                                            .then((content) => __awaiter(this, void 0, void 0, function* () {
                                            writeIframeDoc.call(this, content, href);
                                        }));
                                    }
                                }
                                else {
                                    writeIframeDoc.call(this, content, href);
                                }
                            });
                        }
                        else {
                            this.iframes[0].src = "about:blank";
                        }
                        if (this.iframes.length == 2 &&
                            ((_h = (_g = this.publication.Metadata.Rendition) === null || _g === void 0 ? void 0 : _g.Layout) !== null && _h !== void 0 ? _h : "unknown") ===
                                "fixed") {
                            this.currentSpreadLinks.right = {
                                href: this.currentChapterLink.href,
                            };
                            this.api
                                .getContent(this.currentChapterLink.href)
                                .then((content) => {
                                if (content === undefined) {
                                    if (isSameOrigin) {
                                        this.iframes[1].src = this.currentChapterLink.href;
                                    }
                                    else {
                                        fetch(this.currentChapterLink.href)
                                            .then((r) => r.text())
                                            .then((content) => __awaiter(this, void 0, void 0, function* () {
                                            writeIframe2Doc.call(this, content, this.currentChapterLink.href);
                                        }));
                                    }
                                }
                                else {
                                    writeIframe2Doc.call(this, content, this.currentChapterLink.href);
                                }
                            });
                        }
                    }
                }
                else {
                    this.currentSpreadLinks.left = {
                        href: this.currentChapterLink.href,
                    };
                    (_j = this.api) === null || _j === void 0 ? void 0 : _j.getContent(this.currentChapterLink.href).then((content) => {
                        if (content === undefined) {
                            if (isSameOrigin) {
                                this.iframes[0].src = this.currentChapterLink.href;
                            }
                            else {
                                fetch(this.currentChapterLink.href)
                                    .then((r) => r.text())
                                    .then((content) => __awaiter(this, void 0, void 0, function* () {
                                    writeIframeDoc.call(this, content, this.currentChapterLink.href);
                                }));
                            }
                        }
                        else {
                            writeIframeDoc.call(this, content, this.currentChapterLink.href);
                        }
                    });
                }
            }
            else {
                (_k = this.api) === null || _k === void 0 ? void 0 : _k.getContent(this.currentChapterLink.href).then((content) => {
                    this.currentSpreadLinks.left = {
                        href: this.currentChapterLink.href,
                    };
                    if (content === undefined) {
                        if (isSameOrigin) {
                            this.iframes[0].src = this.currentChapterLink.href;
                        }
                        else {
                            fetch(this.currentChapterLink.href)
                                .then((r) => r.text())
                                .then((content) => __awaiter(this, void 0, void 0, function* () {
                                writeIframeDoc.call(this, content, this.currentChapterLink.href);
                            }));
                        }
                    }
                    else {
                        writeIframeDoc.call(this, content, this.currentChapterLink.href);
                    }
                });
            }
        }
        else {
            if (((_m = (_l = this.publication.Metadata.Rendition) === null || _l === void 0 ? void 0 : _l.Layout) !== null && _m !== void 0 ? _m : "unknown") === "fixed") {
                if (this.settings.columnCount !== 1) {
                    if (even) {
                        if (isSameOrigin) {
                            this.iframes[0].src = this.currentChapterLink.href;
                            this.currentSpreadLinks.left = {
                                href: this.currentChapterLink.href,
                            };
                            if (this.iframes.length == 2) {
                                if (index < this.publication.readingOrder.length - 1) {
                                    const next = this.publication.getNextSpineItem(this.currentChapterLink.href);
                                    var href = this.publication.getAbsoluteHref(next.Href);
                                    this.iframes[1].src = href;
                                    this.currentSpreadLinks.right = {
                                        href: href,
                                    };
                                }
                                else {
                                    this.iframes[1].src = "about:blank";
                                }
                            }
                        }
                        else {
                            fetch(this.currentChapterLink.href)
                                .then((r) => r.text())
                                .then((content) => __awaiter(this, void 0, void 0, function* () {
                                writeIframeDoc.call(this, content, this.currentChapterLink.href);
                            }));
                            if (this.iframes.length == 2) {
                                if (index < this.publication.readingOrder.length - 1) {
                                    const next = this.publication.getNextSpineItem(this.currentChapterLink.href);
                                    var href = this.publication.getAbsoluteHref(next.Href);
                                    this.currentSpreadLinks.right = {
                                        href: href,
                                    };
                                    fetch(href)
                                        .then((r) => r.text())
                                        .then((content) => __awaiter(this, void 0, void 0, function* () {
                                        writeIframe2Doc.call(this, content, href);
                                    }));
                                }
                                else {
                                    this.iframes[1].src = "about:blank";
                                }
                            }
                        }
                    }
                    else {
                        if (index > 0) {
                            const prev = this.publication.getPreviousSpineItem(this.currentChapterLink.href);
                            var href = this.publication.getAbsoluteHref(prev.Href);
                            this.currentSpreadLinks.left = {
                                href: href,
                            };
                            if (isSameOrigin) {
                                this.iframes[0].src = href;
                                if (this.iframes.length == 2) {
                                    this.iframes[1].src = this.currentChapterLink.href;
                                }
                            }
                            else {
                                fetch(href)
                                    .then((r) => r.text())
                                    .then((content) => __awaiter(this, void 0, void 0, function* () {
                                    writeIframeDoc.call(this, content, href);
                                }));
                                if (this.iframes.length == 2) {
                                    this.currentSpreadLinks.right = {
                                        href: this.currentChapterLink.href,
                                    };
                                    fetch(this.currentChapterLink.href)
                                        .then((r) => r.text())
                                        .then((content) => __awaiter(this, void 0, void 0, function* () {
                                        writeIframe2Doc.call(this, content, this.currentChapterLink.href);
                                    }));
                                }
                            }
                        }
                        else {
                            this.iframes[0].src = "about:blank";
                        }
                        if (this.iframes.length == 2) {
                            this.currentSpreadLinks.right = {
                                href: this.currentChapterLink.href,
                            };
                            if (isSameOrigin) {
                                this.iframes[1].src = this.currentChapterLink.href;
                            }
                            else {
                                fetch(this.currentChapterLink.href)
                                    .then((r) => r.text())
                                    .then((content) => __awaiter(this, void 0, void 0, function* () {
                                    writeIframe2Doc.call(this, content, this.currentChapterLink.href);
                                }));
                            }
                        }
                    }
                }
                else {
                    this.currentSpreadLinks.left = {
                        href: href,
                    };
                    if (isSameOrigin) {
                        this.iframes[0].src = this.currentChapterLink.href;
                    }
                    else {
                        fetch(this.currentChapterLink.href)
                            .then((r) => r.text())
                            .then((content) => __awaiter(this, void 0, void 0, function* () {
                            writeIframeDoc.call(this, content, this.currentChapterLink.href);
                        }));
                    }
                }
            }
            else {
                this.currentSpreadLinks.left = {
                    href: this.currentChapterLink.href,
                };
                if (isSameOrigin) {
                    this.iframes[0].src = this.currentChapterLink.href;
                }
                else {
                    fetch(this.currentChapterLink.href)
                        .then((r) => r.text())
                        .then((content) => __awaiter(this, void 0, void 0, function* () {
                        writeIframeDoc.call(this, content, this.currentChapterLink.href);
                    }));
                }
            }
        }
        if (((_p = (_o = this.publication.Metadata.Rendition) === null || _o === void 0 ? void 0 : _o.Layout) !== null && _p !== void 0 ? _p : "unknown") === "fixed") {
            setTimeout(() => {
                let height = getComputedStyle(index === 0 && this.iframes.length == 2
                    ? this.iframes[1].contentDocument.body
                    : this.iframes[0].contentDocument.body).height;
                let width = getComputedStyle(index === 0 && this.iframes.length == 2
                    ? this.iframes[1].contentDocument.body
                    : this.iframes[0].contentDocument.body).width;
                if (parseInt(height.replace("px", "")) === 0 ||
                    parseInt(width.replace("px", "")) === 0) {
                    const head = HTMLUtilities.findRequiredIframeElement(index === 0 && this.iframes.length == 2
                        ? this.iframes[1].contentDocument
                        : this.iframes[0].contentDocument, "head");
                    if (head) {
                        const viewport = HTMLUtilities.findElement(head, "meta[name=viewport]");
                        if (viewport) {
                            var dimensionsStr = viewport.content;
                            var obj = dimensionsStr.split(",").reduce((obj, s) => {
                                var [key, value] = s.match(/[^\s;=]+/g);
                                obj[key] = isNaN(Number(value)) ? value : +value;
                                return obj;
                            }, {});
                            console.log("## " + obj);
                            height = obj["height"] + "px";
                            width = obj["width"] + "px";
                            console.log("## " + height);
                            console.log("## " + width);
                        }
                    }
                }
                var iframeParent = index === 0 && this.iframes.length == 2
                    ? this.iframes[1].parentElement.parentElement
                    : this.iframes[0].parentElement.parentElement;
                var widthRatio = (parseInt(getComputedStyle(iframeParent).width) - 100) /
                    (this.iframes.length == 2
                        ? parseInt(width.replace("px", "")) * 2 + 200
                        : parseInt(width.replace("px", "")));
                var heightRatio = (parseInt(getComputedStyle(iframeParent).height) - 100) /
                    parseInt(height.replace("px", ""));
                var scale = Math.min(widthRatio, heightRatio);
                iframeParent.style.transform = "scale(" + scale + ")";
                for (const iframe of this.iframes) {
                    iframe.style.height = height;
                    iframe.style.width = width;
                    iframe.parentElement.style.height = height;
                }
            }, 400);
        }
    }
    static goBack() {
        window.history.back();
    }
    static isDisplayed(element) {
        return element ? element.className.indexOf(" active") !== -1 : false;
    }
    static showElement(element, control) {
        if (element) {
            element.className = element.className.replace(" inactive", "");
            if (element.className.indexOf(" active") === -1) {
                element.className += " active";
            }
            element.setAttribute("aria-hidden", "false");
            if (control) {
                control.setAttribute("aria-expanded", "true");
                const openIcon = control.querySelector(".icon.open");
                if (openIcon &&
                    (openIcon.getAttribute("class") || "").indexOf(" inactive-icon") ===
                        -1) {
                    const newIconClass = (openIcon.getAttribute("class") || "") + " inactive-icon";
                    openIcon.setAttribute("class", newIconClass);
                }
                const closeIcon = control.querySelector(".icon.close");
                if (closeIcon) {
                    const newIconClass = (closeIcon.getAttribute("class") || "").replace(" inactive-icon", "");
                    closeIcon.setAttribute("class", newIconClass);
                }
            }
            // Add buttons and links in the element to the tab order.
            const buttons = Array.prototype.slice.call(element.querySelectorAll("button"));
            const links = Array.prototype.slice.call(element.querySelectorAll("a"));
            for (const button of buttons) {
                button.tabIndex = 0;
            }
            for (const link of links) {
                link.tabIndex = 0;
            }
        }
    }
    static hideElement(element, control) {
        if (element) {
            element.className = element.className.replace(" active", "");
            if (element.className.indexOf(" inactive") === -1) {
                element.className += " inactive";
            }
            element.setAttribute("aria-hidden", "true");
            if (control) {
                control.setAttribute("aria-expanded", "false");
                const openIcon = control.querySelector(".icon.open");
                if (openIcon) {
                    const newIconClass = (openIcon.getAttribute("class") || "").replace(" inactive-icon", "");
                    openIcon.setAttribute("class", newIconClass);
                }
                const closeIcon = control.querySelector(".icon.close");
                if (closeIcon &&
                    (closeIcon.getAttribute("class") || "").indexOf(" inactive-icon") ===
                        -1) {
                    const newIconClass = (closeIcon.getAttribute("class") || "") + " inactive-icon";
                    closeIcon.setAttribute("class", newIconClass);
                }
            }
            // Remove buttons and links in the element from the tab order.
            const buttons = Array.prototype.slice.call(element.querySelectorAll("button"));
            const links = Array.prototype.slice.call(element.querySelectorAll("a"));
            for (const button of buttons) {
                button.tabIndex = -1;
            }
            for (const link of links) {
                link.tabIndex = -1;
            }
        }
    }
    hideModal(modal, control) {
        // Restore the page for screen readers.
        for (const iframe of this.iframes) {
            iframe.setAttribute("aria-hidden", "false");
        }
        if (this.upLink)
            this.upLink.setAttribute("aria-hidden", "false");
        if (this.linksBottom)
            this.linksBottom.setAttribute("aria-hidden", "false");
        if (this.linksMiddle)
            this.linksMiddle.setAttribute("aria-hidden", "false");
        if (this.loadingMessage)
            this.loadingMessage.setAttribute("aria-hidden", "false");
        if (this.errorMessage)
            this.errorMessage.setAttribute("aria-hidden", "false");
        if (this.infoTop)
            this.infoTop.setAttribute("aria-hidden", "false");
        if (this.infoBottom)
            this.infoBottom.setAttribute("aria-hidden", "false");
        IFrameNavigator.hideElement(modal, control);
    }
    toggleDisplay(element, control) {
        var _a;
        if (!IFrameNavigator.isDisplayed(element)) {
            IFrameNavigator.showElement(element, control);
        }
        else {
            IFrameNavigator.hideElement(element, control);
        }
        if (element === this.linksMiddle) {
            if (this.view.layout !== "fixed") {
                if ((_a = this.view) === null || _a === void 0 ? void 0 : _a.isScrollMode()) {
                    IFrameNavigator.showElement(element, control);
                }
                else {
                    IFrameNavigator.hideElement(element, control);
                }
            }
        }
    }
    handleEditClick(event) {
        var element = event.target;
        var sidenav = HTMLUtilities.findElement(this.headerMenu, ".sidenav");
        if (element.className.indexOf(" active") === -1) {
            element.className += " active";
            sidenav.className += " expanded";
            element.innerText = "unfold_less";
            this.sideNavExpanded = true;
            this.bookmarkModule.showBookmarks();
            this.annotationModule.showHighlights();
        }
        else {
            element.className = element.className.replace(" active", "");
            sidenav.className = sidenav.className.replace(" expanded", "");
            element.innerText = "unfold_more";
            this.sideNavExpanded = false;
            this.bookmarkModule.showBookmarks();
            this.annotationModule.showHighlights();
        }
        event.preventDefault();
        event.stopPropagation();
    }
    get hasMediaOverlays() {
        return this.publication.hasMediaOverlays;
    }
    startReadAloud() {
        var _a, _b;
        if (((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableMediaOverlays) && this.publication.hasMediaOverlays) {
            this.mediaOverlayModule.startReadAloud();
        }
        else if ((_b = this.rights) === null || _b === void 0 ? void 0 : _b.enableTTS) {
            this.highlighter.speakAll();
        }
    }
    stopReadAloud(ttsOnly = false) {
        var _a, _b, _c;
        if (ttsOnly) {
            if ((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
                this.highlighter.stopReadAloud();
            }
        }
        else {
            if (((_b = this.rights) === null || _b === void 0 ? void 0 : _b.enableMediaOverlays) &&
                this.publication.hasMediaOverlays) {
                this.mediaOverlayModule.stopReadAloud();
            }
            else if ((_c = this.rights) === null || _c === void 0 ? void 0 : _c.enableTTS) {
                this.highlighter.stopReadAloud();
            }
        }
    }
    pauseReadAloud() {
        var _a, _b;
        if (((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableMediaOverlays) && this.publication.hasMediaOverlays) {
            this.mediaOverlayModule.pauseReadAloud();
        }
        else if ((_b = this.rights) === null || _b === void 0 ? void 0 : _b.enableTTS) {
            this.ttsModule.speakPause();
        }
    }
    resumeReadAloud() {
        var _a, _b;
        if (((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableMediaOverlays) && this.publication.hasMediaOverlays) {
            this.mediaOverlayModule.resumeReadAloud();
        }
        else if ((_b = this.rights) === null || _b === void 0 ? void 0 : _b.enableTTS) {
            this.ttsModule.speakResume();
        }
    }
    totalResources() {
        return this.publication.readingOrder.length;
    }
    mostRecentNavigatedTocItem() {
        return this.currentTOCRawLink;
    }
    currentResource() {
        let currentLocation = this.currentChapterLink.href;
        return this.publication.getSpineIndex(currentLocation);
    }
    currentLink() {
        if (this.settings.columnCount !== 1) {
            if (this.currentSpreadLinks.left !== undefined &&
                this.currentSpreadLinks.right !== undefined) {
                let left = this.publication.getSpineItem(this.currentSpreadLinks.left.href);
                let right = this.publication.getSpineItem(this.currentSpreadLinks.right.href);
                return [left, right];
            }
        }
        let currentLocation = this.currentChapterLink.href;
        return [this.publication.getSpineItem(currentLocation)];
    }
    tableOfContents() {
        return this.publication.tableOfContents;
    }
    readingOrder() {
        return this.publication.readingOrder;
    }
    atStart() {
        return this.view.atStart();
    }
    atEnd() {
        return this.view.atEnd();
    }
    previousPage() {
        this.handlePreviousPageClick(null);
    }
    nextPage() {
        this.handleNextPageClick(null);
    }
    previousResource() {
        this.handlePreviousChapterClick(null);
    }
    nextResource() {
        this.handleNextChapterClick(null);
    }
    goTo(locator) {
        let locations = locator.locations;
        if (locator.href.indexOf("#") !== -1) {
            const elementId = locator.href.slice(locator.href.indexOf("#") + 1);
            if (elementId !== null) {
                locations = {
                    fragment: elementId,
                };
            }
        }
        const position = Object.assign({}, locator);
        position.locations = locations;
        const linkHref = this.publication.getAbsoluteHref(locator.href);
        if (__1.IS_DEV)
            console.log(locator.href);
        if (__1.IS_DEV)
            console.log(linkHref);
        position.href = linkHref;
        this.stopReadAloud(true);
        this.navigate(position);
    }
    currentLocator() {
        var _a, _b;
        let position;
        if ((((_b = (_a = this.rights) === null || _a === void 0 ? void 0 : _a.autoGeneratePositions) !== null && _b !== void 0 ? _b : false) &&
            this.publication.positions) ||
            this.publication.positions) {
            let positions = this.publication.positionsByHref(this.currentChapterLink.href);
            let positionIndex = Math.ceil(this.view.getCurrentPosition() * (positions.length - 1));
            position = positions[positionIndex];
        }
        if (!position) {
            var tocItem = this.publication.getTOCItem(this.currentChapterLink.href);
            if (this.currentTocUrl !== null) {
                tocItem = this.publication.getTOCItem(this.currentTocUrl);
            }
            if (tocItem === null) {
                tocItem = this.publication.getTOCItemAbsolute(this.currentChapterLink.href);
            }
            position = {
                href: tocItem.Href,
                type: this.currentChapterLink.type,
                title: this.currentChapterLink.title,
                locations: {},
            };
        }
        position.locations.progression = this.view.getCurrentPosition();
        position.displayInfo = {
            resourceScreenIndex: Math.round(this.view.getCurrentPage()),
            resourceScreenCount: Math.round(this.view.getPageCount()),
        };
        return position;
    }
    positions() {
        return this.publication.positions ? this.publication.positions : [];
    }
    goToPosition(position) {
        if (this.publication.positions) {
            let locator = this.publication.positions.filter((el) => el.locations.position === parseInt(String(position)))[0];
            this.goTo(locator);
        }
    }
    snapToElement(element) {
        this.view.snap(element);
    }
    applyAttributes(attributes) {
        this.attributes = attributes;
        this.view.attributes = attributes;
        this.handleResize();
    }
    handlePreviousPageClick(event) {
        this.stopReadAloud(true);
        if (this.view.layout === "fixed") {
            this.handlePreviousChapterClick(event);
        }
        else {
            if (this.view.atStart()) {
                this.handlePreviousChapterClick(event);
            }
            else {
                this.view.goToPreviousPage();
                this.updatePositionInfo();
                this.saveCurrentReadingPosition();
            }
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }
    handleNextPageClick(event) {
        this.stopReadAloud(true);
        if (this.view.layout === "fixed") {
            this.handleNextChapterClick(event);
        }
        else {
            if (this.view.atEnd()) {
                this.handleNextChapterClick(event);
            }
            else {
                this.view.goToNextPage();
                this.updatePositionInfo();
                this.saveCurrentReadingPosition();
            }
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }
    handleClickThrough(_event) {
        if (this.mDropdowns) {
            this.mDropdowns.forEach((element) => {
                element.close();
            });
        }
    }
    handleInternalLink(event) {
        const element = event.target;
        let locations = {
            progression: 0,
        };
        const linkElement = element;
        if (linkElement.href.indexOf("#") !== -1) {
            const elementId = linkElement.href.slice(linkElement.href.indexOf("#") + 1);
            if (elementId !== null) {
                locations = {
                    fragment: elementId,
                };
            }
        }
        const position = {
            href: linkElement.href,
            locations: locations,
            type: linkElement.type,
            title: linkElement.title,
        };
        event.preventDefault();
        event.stopPropagation();
        this.stopReadAloud(true);
        this.navigate(position);
    }
    handleNumberOfIframes() {
        var _a, _b;
        if (((_b = (_a = this.publication.Metadata.Rendition) === null || _a === void 0 ? void 0 : _a.Layout) !== null && _b !== void 0 ? _b : "unknown") === "fixed") {
            if (this.settings.columnCount !== 1) {
                if (this.iframes.length === 1) {
                    var iframe = document.createElement("iframe");
                    iframe.setAttribute("SCROLLING", "no");
                    iframe.setAttribute("allowtransparency", "true");
                    iframe.style.opacity = "1";
                    this.iframes.push(iframe);
                }
                let secondSpread = document.createElement("div");
                this.spreads.appendChild(secondSpread);
                secondSpread.appendChild(this.iframes[1]);
                this.firstSpread.style.clipPath =
                    "polygon(0% -20%, 100% -20%, 100% 120%, -20% 120%)";
                this.firstSpread.style.boxShadow = "0 0 8px 2px #ccc";
                secondSpread.style.clipPath =
                    "polygon(0% -20%, 100% -20%, 120% 100%, 0% 120%)";
                secondSpread.style.boxShadow = "0 0 8px 2px #ccc";
            }
            else {
                if (this.iframes.length == 2) {
                    this.iframes.pop();
                    this.spreads.removeChild(this.spreads.lastChild);
                }
                this.firstSpread.style.clipPath =
                    "polygon(0% -20%, 100% -20%, 120% 100%, -20% 120%)";
                this.firstSpread.style.boxShadow = "0 0 8px 2px #ccc";
            }
            this.precessContentForIframe();
        }
    }
    handleResize() {
        var _a, _b;
        if (this.isScrolling) {
            return;
        }
        if (((_b = (_a = this.publication.Metadata.Rendition) === null || _a === void 0 ? void 0 : _a.Layout) !== null && _b !== void 0 ? _b : "unknown") === "fixed") {
            var index = this.publication.getSpineIndex(this.currentChapterLink.href);
            var wrapper = HTMLUtilities.findRequiredElement(this.mainElement, "main#iframe-wrapper");
            const minHeight = BrowserUtilities.getHeight() - 40 - this.attributes.margin;
            wrapper.style.height = minHeight + 40 + "px";
            var iframeParent = index === 0 && this.iframes.length == 2
                ? this.iframes[1].parentElement.parentElement
                : this.iframes[0].parentElement.parentElement;
            iframeParent.style.height = minHeight + 40 + "px";
            let height = getComputedStyle(index === 0 && this.iframes.length == 2
                ? this.iframes[1].contentDocument.body
                : this.iframes[0].contentDocument.body).height;
            let width = getComputedStyle(index === 0 && this.iframes.length == 2
                ? this.iframes[1].contentDocument.body
                : this.iframes[0].contentDocument.body).width;
            const head = HTMLUtilities.findRequiredIframeElement(index === 0 && this.iframes.length == 2
                ? this.iframes[1].contentDocument
                : this.iframes[0].contentDocument, "head");
            if (head) {
                const viewport = HTMLUtilities.findElement(head, "meta[name=viewport]");
                if (viewport) {
                    var dimensionsStr = viewport.content;
                    var obj = dimensionsStr.split(",").reduce((obj, s) => {
                        var [key, value] = s.match(/[^\s;=]+/g);
                        obj[key] = isNaN(Number(value)) ? value : +value;
                        return obj;
                    }, {});
                    if (parseInt(obj["height"]) !== 0 || parseInt(obj["width"]) !== 0) {
                        height = obj["height"] + "px";
                        width = obj["width"] + "px";
                    }
                }
            }
            var widthRatio = (parseInt(getComputedStyle(iframeParent).width) - 100) /
                (this.iframes.length == 2
                    ? parseInt(width.replace("px", "")) * 2 + 200
                    : parseInt(width.replace("px", "")));
            var heightRatio = (parseInt(getComputedStyle(iframeParent).height) - 100) /
                parseInt(height.replace("px", ""));
            var scale = Math.min(widthRatio, heightRatio);
            iframeParent.style.transform = "scale(" + scale + ")";
            for (const iframe of this.iframes) {
                iframe.style.height = height;
                iframe.style.width = width;
                iframe.parentElement.style.height = height;
            }
        }
        const selectedView = this.view;
        const oldPosition = selectedView.getCurrentPosition();
        this.settings.applyProperties();
        // If the links are hidden, show them temporarily
        // to determine the top and bottom heights.
        const linksHidden = !IFrameNavigator.isDisplayed(this.links);
        if (linksHidden) {
            this.toggleDisplay(this.links);
        }
        if (this.infoTop)
            this.infoTop.style.height = 0 + "px";
        if (this.infoTop)
            this.infoTop.style.minHeight = 0 + "px";
        if (linksHidden) {
            this.toggleDisplay(this.links);
        }
        const linksBottomHidden = !IFrameNavigator.isDisplayed(this.linksBottom);
        if (linksBottomHidden) {
            this.toggleDisplay(this.linksBottom);
        }
        // TODO paginator page info
        // 0 = hide , 40 = show
        if (this.infoBottom)
            this.infoBottom.style.height = this.attributes.bottomInfoHeight
                ? this.attributes.bottomInfoHeight + "px"
                : 40 + "px";
        if (linksBottomHidden) {
            this.toggleDisplay(this.linksBottom);
        }
        if (this.view.layout !== "fixed") {
            this.settings.isPaginated().then((paginated) => {
                if (paginated) {
                    this.view.height =
                        BrowserUtilities.getHeight() - 40 - this.attributes.margin;
                    if (this.infoBottom)
                        this.infoBottom.style.removeProperty("display");
                }
                else {
                    if (this.infoBottom)
                        this.infoBottom.style.display = "none";
                }
            });
        }
        setTimeout(() => {
            var _a;
            if (this.view.layout !== "fixed") {
                if ((_a = this.view) === null || _a === void 0 ? void 0 : _a.isScrollMode()) {
                    for (const iframe of this.iframes) {
                        this.view.setIframeHeight(iframe);
                    }
                }
            }
        }, 100);
        setTimeout(() => {
            var _a, _b;
            selectedView.goToPosition(oldPosition);
            this.updatePositionInfo();
            if (this.annotationModule !== undefined) {
                this.annotationModule.handleResize();
            }
            else {
                if ((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableSearch) {
                    this.searchModule.handleResize();
                }
            }
            if ((_b = this.rights) === null || _b === void 0 ? void 0 : _b.enableContentProtection) {
                if (this.contentProtectionModule !== undefined) {
                    this.contentProtectionModule.handleResize();
                }
            }
        }, 100);
    }
    updatePositionInfo() {
        var _a;
        if (this.view.layout === "fixed") {
            if (this.chapterPosition)
                this.chapterPosition.innerHTML = "";
            if (this.remainingPositions)
                this.remainingPositions.innerHTML = "";
        }
        else {
            if ((_a = this.view) === null || _a === void 0 ? void 0 : _a.isPaginated()) {
                const locator = this.currentLocator();
                const currentPage = locator.displayInfo.resourceScreenIndex;
                const pageCount = locator.displayInfo.resourceScreenCount;
                const remaining = locator.locations.remainingPositions;
                if (this.chapterPosition) {
                    if (remaining) {
                        this.chapterPosition.innerHTML =
                            "Page " + currentPage + " of " + pageCount;
                    }
                    else {
                        this.chapterPosition.innerHTML = "";
                    }
                }
                if (this.remainingPositions) {
                    if (remaining) {
                        this.remainingPositions.innerHTML = remaining + " left in chapter";
                    }
                    else {
                        this.remainingPositions.innerHTML =
                            "Page " + currentPage + " of " + pageCount;
                    }
                }
            }
            else {
                if (this.chapterPosition)
                    this.chapterPosition.innerHTML = "";
                if (this.remainingPositions)
                    this.remainingPositions.innerHTML = "";
            }
        }
        if (this.annotator) {
            this.saveCurrentReadingPosition();
        }
    }
    handlePreviousChapterClick(event) {
        if (this.view.layout === "fixed" && this.settings.columnCount !== 1) {
            var index = this.publication.getSpineIndex(this.currentChapterLink.href);
            index = index - 2;
            if (index < 0)
                index = 0;
            var previous = this.publication.readingOrder[index];
            const position = {
                href: this.publication.getAbsoluteHref(previous.Href),
                locations: {
                    progression: 0,
                },
                type: previous.TypeLink,
                title: previous.Title,
            };
            this.stopReadAloud(true);
            this.navigate(position);
        }
        else {
            if (this.previousChapterLink) {
                const position = {
                    href: this.publication.getAbsoluteHref(this.previousChapterLink.href),
                    locations: {
                        progression: 1,
                    },
                    type: this.previousChapterLink.type,
                    title: this.previousChapterLink.title,
                };
                this.stopReadAloud(true);
                this.navigate(position);
            }
        }
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    handleNextChapterClick(event) {
        if (this.view.layout === "fixed" && this.settings.columnCount !== 1) {
            var index = this.publication.getSpineIndex(this.currentChapterLink.href);
            index = index + 2;
            if (index >= this.publication.readingOrder.length - 1)
                index = this.publication.readingOrder.length - 1;
            var next = this.publication.readingOrder[index];
            const position = {
                href: this.publication.getAbsoluteHref(next.Href),
                locations: {
                    progression: 0,
                },
                type: next.TypeLink,
                title: next.Title,
            };
            this.stopReadAloud(true);
            this.navigate(position);
        }
        else {
            if (this.nextChapterLink) {
                const position = {
                    href: this.publication.getAbsoluteHref(this.nextChapterLink.href),
                    locations: {
                        progression: 0,
                    },
                    type: this.nextChapterLink.type,
                    title: this.nextChapterLink.title,
                };
                this.stopReadAloud(true);
                this.navigate(position);
            }
        }
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    hideBookmarksOnEscape(event) {
        const ESCAPE_KEY = 27;
        if (IFrameNavigator.isDisplayed(this.bookmarksView) &&
            event.keyCode === ESCAPE_KEY) {
            this.hideModal(this.bookmarksView, this.bookmarksControl);
        }
    }
    hideView(_view, _control) {
        var _a;
        if (this.view.layout !== "fixed") {
            if ((_a = this.view) === null || _a === void 0 ? void 0 : _a.isScrollMode()) {
                document.body.style.overflow = "auto";
            }
        }
    }
    setActiveTOCItem(resource) {
        if (this.tocView) {
            const allItems = Array.prototype.slice.call(this.tocView.querySelectorAll("li > a"));
            for (const item of allItems) {
                item.className = item.className.replace(" active", "");
            }
            const activeItem = this.tocView.querySelector('li > a[href^="' + resource + '"]');
            if (activeItem) {
                activeItem.className += " active";
            }
        }
    }
    navigate(locator) {
        const exists = this.publication.getTOCItem(locator.href);
        if (exists) {
            var isCurrentLoaded = false;
            if (locator.href.indexOf("#") !== -1) {
                const newResource = locator.href.slice(0, locator.href.indexOf("#"));
                if (newResource === this.currentChapterLink.href) {
                    isCurrentLoaded = true;
                }
                this.currentChapterLink.href = newResource;
                this.currentChapterLink.type = locator.type;
                this.currentChapterLink.title = locator.title;
            }
            else {
                if (locator.href === this.currentChapterLink.href) {
                    isCurrentLoaded = true;
                }
                this.currentChapterLink.href = locator.href;
                this.currentChapterLink.type = locator.type;
                this.currentChapterLink.title = locator.title;
            }
            if (this.currentSpreadLinks.left !== undefined &&
                this.currentSpreadLinks.right !== undefined) {
                if (locator.href === this.currentSpreadLinks.left.href ||
                    locator.href === this.currentSpreadLinks.right.href) {
                    return;
                }
            }
            if (isCurrentLoaded) {
                console.log("is currently loaded");
                console.log(locator.href);
                console.log(this.currentChapterLink.href);
                if (locator.href.indexOf("#") !== -1) {
                    const elementId = locator.href.slice(locator.href.indexOf("#") + 1);
                    locator.locations = {
                        fragment: elementId,
                    };
                }
                this.newPosition = locator;
                this.currentTOCRawLink = locator.href;
                if (locator.locations.fragment === undefined) {
                    this.currentTocUrl = null;
                }
                else {
                    this.newElementId = locator.locations.fragment;
                    this.currentTocUrl =
                        this.currentChapterLink.href + "#" + this.newElementId;
                }
                if (this.newElementId) {
                    for (const iframe of this.iframes) {
                        const element = iframe.contentDocument.getElementById(this.newElementId);
                        this.view.goToElement(element);
                    }
                    this.newElementId = null;
                }
                else {
                    if (locator.highlight) {
                        this.view.goToCssSelector(locator.highlight.selectionInfo.rangeInfo
                            .startContainerElementCssSelector);
                    }
                    else {
                        this.view.goToPosition(locator.locations.progression);
                    }
                }
                let currentLocation = this.currentChapterLink.href;
                this.updatePositionInfo();
                const previous = this.publication.getPreviousSpineItem(currentLocation);
                if (previous && previous.Href) {
                    this.previousChapterLink = {
                        href: previous.Href,
                        type: previous.TypeLink,
                        title: previous.Title,
                    };
                }
                if (this.previousChapterAnchorElement) {
                    if (this.previousChapterLink) {
                        this.previousChapterAnchorElement.href = this.publication.getAbsoluteHref(this.previousChapterLink.href);
                        this.previousChapterAnchorElement.className = this.previousChapterAnchorElement.className.replace(" disabled", "");
                    }
                    else {
                        this.previousChapterAnchorElement.removeAttribute("href");
                        this.previousChapterAnchorElement.className += " disabled";
                    }
                }
                let res = this.publication.getNextSpineItem(currentLocation);
                if (res) {
                    this.nextChapterLink = {
                        href: res.Href,
                        type: res.TypeLink,
                        title: res.Title,
                    };
                }
                else {
                    this.nextChapterLink = undefined;
                }
                if (this.nextChapterAnchorElement) {
                    if (this.nextChapterLink) {
                        this.nextChapterAnchorElement.href = this.publication.getAbsoluteHref(this.nextChapterLink.href);
                        this.nextChapterAnchorElement.className = this.nextChapterAnchorElement.className.replace(" disabled", "");
                    }
                    else {
                        this.nextChapterAnchorElement.removeAttribute("href");
                        this.nextChapterAnchorElement.className += " disabled";
                    }
                }
                if (this.currentTocUrl !== null) {
                    this.setActiveTOCItem(this.currentTocUrl);
                }
                else {
                    this.setActiveTOCItem(currentLocation);
                }
                if (this.publication.Metadata.Title) {
                    if (this.bookTitle)
                        this.bookTitle.innerHTML = this.publication.Metadata.Title.toString();
                }
                const spineItem = this.publication.getSpineItem(currentLocation);
                if (spineItem !== null) {
                    this.currentChapterLink.title = spineItem.Title;
                    this.currentChapterLink.type = spineItem.TypeLink;
                }
                let tocItem = this.publication.getTOCItem(currentLocation);
                if (this.currentTocUrl !== null) {
                    tocItem = this.publication.getTOCItem(this.currentTocUrl);
                }
                if (!this.currentChapterLink.title &&
                    tocItem !== null &&
                    tocItem.Title) {
                    this.currentChapterLink.title = tocItem.Title;
                }
                if (!this.currentChapterLink.type &&
                    tocItem !== null &&
                    tocItem.TypeLink) {
                    this.currentChapterLink.title = tocItem.Title;
                }
                if (this.currentChapterLink.title) {
                    if (this.chapterTitle)
                        this.chapterTitle.innerHTML =
                            "(" + this.currentChapterLink.title + ")";
                }
                else {
                    if (this.chapterTitle)
                        this.chapterTitle.innerHTML = "(Current Chapter)";
                }
                if (this.annotator) {
                    this.saveCurrentReadingPosition();
                }
            }
            else {
                if (this.searchModule !== undefined) {
                    this.searchModule.clearSearch();
                }
                this.hideIframeContents();
                this.showLoadingMessageAfterDelay();
                if (locator.locations === undefined) {
                    locator.locations = {
                        progression: 0,
                    };
                }
                this.newPosition = locator;
                this.currentTOCRawLink = locator.href;
                this.precessContentForIframe();
                if (locator.locations.fragment === undefined) {
                    this.currentTocUrl = null;
                }
                else {
                    this.newElementId = locator.locations.fragment;
                    this.currentTocUrl =
                        this.currentChapterLink.href + "#" + this.newElementId;
                }
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if ((_a = this.rights) === null || _a === void 0 ? void 0 : _a.enableContentProtection) {
                        this.contentProtectionModule.initializeResource();
                    }
                }), 200);
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    var _b, _c, _d, _e, _f, _g;
                    if ((_b = this.rights) === null || _b === void 0 ? void 0 : _b.enableContentProtection) {
                        this.contentProtectionModule.recalculate(300);
                    }
                    if (this.annotationModule !== undefined) {
                        this.annotationModule.drawHighlights();
                        this.annotationModule.showHighlights();
                    }
                    else {
                        if ((_c = this.rights) === null || _c === void 0 ? void 0 : _c.enableSearch) {
                            for (const iframe of this.iframes) {
                                yield this.highlighter.destroyAllhighlights(iframe.contentDocument);
                            }
                            this.searchModule.drawSearch();
                        }
                    }
                    if (this.view.layout === "fixed") {
                        if (this.nextChapterBottomAnchorElement)
                            this.nextChapterBottomAnchorElement.style.display = "none";
                        if (this.previousChapterTopAnchorElement)
                            this.previousChapterTopAnchorElement.style.display = "none";
                        if ((_d = this.api) === null || _d === void 0 ? void 0 : _d.resourceFitsScreen)
                            (_e = this.api) === null || _e === void 0 ? void 0 : _e.resourceFitsScreen();
                    }
                    else {
                        this.settings.isPaginated().then((paginated) => {
                            if (!paginated) {
                                if (this.view.atStart() && this.view.atEnd()) {
                                    if (this.nextChapterBottomAnchorElement)
                                        this.nextChapterBottomAnchorElement.style.display = "unset";
                                    if (this.previousChapterTopAnchorElement)
                                        this.previousChapterTopAnchorElement.style.display =
                                            "unset";
                                }
                                else if (this.view.atEnd()) {
                                    if (this.previousChapterTopAnchorElement)
                                        this.previousChapterTopAnchorElement.style.display = "none";
                                    if (this.nextChapterBottomAnchorElement)
                                        this.nextChapterBottomAnchorElement.style.display = "unset";
                                }
                                else if (this.view.atStart()) {
                                    if (this.nextChapterBottomAnchorElement)
                                        this.nextChapterBottomAnchorElement.style.display = "none";
                                    if (this.previousChapterTopAnchorElement)
                                        this.previousChapterTopAnchorElement.style.display =
                                            "unset";
                                }
                                else {
                                    if (this.nextChapterBottomAnchorElement)
                                        this.nextChapterBottomAnchorElement.style.display = "none";
                                    if (this.previousChapterTopAnchorElement)
                                        this.previousChapterTopAnchorElement.style.display = "none";
                                }
                            }
                        });
                        this.checkResourcePosition();
                    }
                    if ((_f = this.api) === null || _f === void 0 ? void 0 : _f.resourceReady)
                        (_g = this.api) === null || _g === void 0 ? void 0 : _g.resourceReady();
                }), 300);
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    var _h;
                    if ((_h = this.rights) === null || _h === void 0 ? void 0 : _h.enableMediaOverlays) {
                        this.mediaOverlayModule.initializeResource(this.currentLink());
                    }
                }), 200);
            }
        }
        else {
            const startLink = this.publication.getStartLink();
            let startUrl = null;
            if (startLink && startLink.Href) {
                startUrl = this.publication.getAbsoluteHref(startLink.Href);
            }
            if (startUrl) {
                const position = {
                    href: startUrl,
                    locations: {
                        progression: 0,
                    },
                    created: new Date(),
                    title: startLink.Title,
                };
                this.navigate(position);
            }
        }
    }
    showIframeContents() {
        this.isBeingStyled = false;
        // We set a timeOut so that settings can be applied when opacity is still 0
        setTimeout(() => {
            if (!this.isBeingStyled) {
                this.iframes.forEach((iframe) => {
                    iframe.style.opacity = "1";
                });
            }
        }, 150);
    }
    showLoadingMessageAfterDelay() {
        this.isLoading = true;
        if (this.isLoading && this.loadingMessage) {
            this.loadingMessage.style.display = "block";
            this.loadingMessage.classList.add("is-loading");
        }
    }
    hideIframeContents() {
        this.isBeingStyled = true;
        this.iframes.forEach((iframe) => {
            iframe.style.opacity = "0";
        });
    }
    hideLoadingMessage() {
        setTimeout(() => {
            this.isLoading = false;
            if (this.loadingMessage) {
                this.loadingMessage.style.display = "none";
                this.loadingMessage.classList.remove("is-loading");
            }
        }, 150);
    }
    saveCurrentReadingPosition() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.annotator) {
                var tocItem = this.publication.getTOCItem(this.currentChapterLink.href);
                if (this.currentTocUrl !== null) {
                    tocItem = this.publication.getTOCItem(this.currentTocUrl);
                }
                if (tocItem === null) {
                    tocItem = this.publication.getTOCItemAbsolute(this.currentChapterLink.href);
                }
                let locations = {
                    progression: this.view.getCurrentPosition(),
                };
                if (tocItem.Href.indexOf("#") !== -1) {
                    const elementId = tocItem.Href.slice(tocItem.Href.indexOf("#") + 1);
                    if (elementId !== null) {
                        locations = {
                            progression: this.view.getCurrentPosition(),
                            fragment: elementId,
                        };
                    }
                }
                let position;
                if ((((_b = (_a = this.rights) === null || _a === void 0 ? void 0 : _a.autoGeneratePositions) !== null && _b !== void 0 ? _b : false) &&
                    this.publication.positions) ||
                    this.publication.positions) {
                    const positions = this.publication.positionsByHref(tocItem.Href);
                    const positionIndex = Math.ceil(locations.progression * (positions.length - 1));
                    const locator = positions[positionIndex];
                    locator.locations.fragment = locations.fragment;
                    position = Object.assign(Object.assign({}, locator), { href: tocItem.Href, created: new Date(), title: this.currentChapterLink.title });
                }
                else {
                    position = {
                        href: tocItem.Href,
                        locations: locations,
                        created: new Date(),
                        type: this.currentChapterLink.type,
                        title: this.currentChapterLink.title,
                    };
                }
                if ((_c = this.api) === null || _c === void 0 ? void 0 : _c.updateCurrentLocation) {
                    (_d = this.api) === null || _d === void 0 ? void 0 : _d.updateCurrentLocation(position).then((_) => __awaiter(this, void 0, void 0, function* () {
                        if (__1.IS_DEV) {
                            console.log("api updated current location", position);
                        }
                        return this.annotator.saveLastReadingPosition(position);
                    }));
                }
                else {
                    if (__1.IS_DEV) {
                        console.log("save last reading position", position);
                    }
                    return this.annotator.saveLastReadingPosition(position);
                }
            }
            else {
                return new Promise((resolve) => resolve());
            }
        });
    }
    static createBase(href) {
        const base = document.createElement("base");
        base.target = "_self";
        base.href = href;
        return base;
    }
    static createCssLink(href) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.type = "text/css";
        cssLink.href = href;
        return cssLink;
    }
    static createJavascriptLink(href, isAsync) {
        const jsLink = document.createElement("script");
        jsLink.type = "text/javascript";
        jsLink.src = href;
        // Enforce synchronous behaviour of injected scripts
        // unless specifically marked async, as though they
        // were inserted using <script> tags
        //
        // See comment on differing default behaviour of
        // dynamically inserted script loading at https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#Attributes
        jsLink.async = isAsync;
        return jsLink;
    }
}
exports.default = IFrameNavigator;
//# sourceMappingURL=IFrameNavigator.js.map