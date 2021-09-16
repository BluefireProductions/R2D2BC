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
const __1 = require("../..");
const HTMLUtilities = require("../../utils/HTMLUtilities");
const EventHandler_1 = require("../../utils/EventHandler");
class TimelineModule {
    constructor(delegate, publication) {
        this.delegate = delegate;
        this.publication = publication;
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeline = new this(config.delegate, config.publication);
            yield timeline.start();
            return timeline;
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__1.IS_DEV) {
                console.log("Timeline module stop");
            }
        });
    }
    start() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.delegate.timelineModule = this;
            this.timelineContainer = HTMLUtilities.findElement(document, "#container-view-timeline");
            if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableMaterial) {
                this.positionSlider = HTMLUtilities.findElement(document, "#positionSlider");
            }
            if (!((_c = (_b = this.delegate.rights) === null || _b === void 0 ? void 0 : _b.autoGeneratePositions) !== null && _c !== void 0 ? _c : true) &&
                !this.publication.positions) {
                this.positionSlider.style.display = "none";
            }
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                yield document.fonts.ready;
                let locator = this.delegate.currentLocator();
                if (((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableMaterial) &&
                    ((((_c = (_b = this.delegate.rights) === null || _b === void 0 ? void 0 : _b.autoGeneratePositions) !== null && _c !== void 0 ? _c : true) &&
                        this.publication.positions) ||
                        this.publication.positions)) {
                    this.positionSlider.value = locator.locations.position.toString();
                    this.positionSlider.max = (locator.locations.totalRemainingPositions + locator.locations.position).toString();
                }
                this.timelineContainer.innerHTML = "";
                this.publication.readingOrder.forEach((link) => {
                    const linkHref = this.publication.getAbsoluteHref(link.Href);
                    const tocItemAbs = this.publication.getTOCItemAbsolute(linkHref);
                    const tocHref = tocItemAbs.Href.indexOf("#") !== -1
                        ? tocItemAbs.Href.slice(0, tocItemAbs.Href.indexOf("#"))
                        : tocItemAbs.Href;
                    const tocHrefAbs = this.publication.getAbsoluteHref(tocHref);
                    var chapterHeight;
                    if (this.publication.positions &&
                        this.delegate.view.layout !== "fixed") {
                        if (link.contentWeight) {
                            chapterHeight = link.contentWeight;
                        }
                        else {
                            chapterHeight = 1;
                        }
                    }
                    else {
                        chapterHeight = 100 / this.publication.readingOrder.length;
                    }
                    var chapter = document.createElement("div");
                    chapter.style.height = chapterHeight + "%";
                    chapter.style.width = "100%";
                    chapter.className = "chapter";
                    if (tocItemAbs.Title !== undefined) {
                        var tooltip = document.createElement("span");
                        tooltip.innerHTML = tocItemAbs.Title;
                        tooltip.className = "chapter-tooltip";
                        chapter.appendChild(tooltip);
                    }
                    EventHandler_1.addEventListenerOptional(chapter, "click", (event) => {
                        var _a, _b;
                        event.preventDefault();
                        event.stopPropagation();
                        var position;
                        if (this.publication.positions ||
                            (((_b = (_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.autoGeneratePositions) !== null && _b !== void 0 ? _b : true) &&
                                this.publication.positions)) {
                            position = Object.assign({}, this.publication.positions.filter((el) => el.href === link.Href)[0]);
                            position.href = this.publication.getAbsoluteHref(position.href);
                        }
                        else {
                            position = {
                                href: tocHrefAbs,
                                locations: {
                                    progression: 0,
                                },
                                type: link.TypeLink,
                                title: link.Title,
                            };
                        }
                        if (__1.IS_DEV)
                            console.log(position);
                        this.delegate.navigate(position);
                    });
                    if (tocHrefAbs === this.delegate.currentChapterLink.href) {
                        chapter.className += " active";
                    }
                    else {
                        chapter.className = chapter.className.replace(" active", "");
                    }
                    // append bookmarks indicator
                    // append notes indicator
                    // append highlights indicator
                    this.timelineContainer.appendChild(chapter);
                });
                resolve();
            }));
        });
    }
}
exports.default = TimelineModule;
//# sourceMappingURL=TimelineModule.js.map