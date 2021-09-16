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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publication = void 0;
const publication_1 = require("r2-shared-js/dist/es6-es2015/src/models/publication");
const ta_json_x_1 = require("ta-json-x");
let Publication = class Publication extends publication_1.Publication {
    get readingOrder() {
        return this.Spine;
    }
    get tableOfContents() {
        return this.TOC;
    }
    get landmarks() {
        return this.Landmarks;
    }
    get pageList() {
        return this.PageList;
    }
    getStartLink() {
        if (this.readingOrder.length > 0) {
            return this.readingOrder[0];
        }
        return null;
    }
    getPreviousSpineItem(href) {
        const index = this.getSpineIndex(href);
        if (index !== null && index > 0) {
            return this.readingOrder[index - 1];
        }
        return null;
    }
    getNextSpineItem(href) {
        const index = this.getSpineIndex(href);
        if (index !== null && index < this.readingOrder.length - 1) {
            return this.readingOrder[index + 1];
        }
        return null;
    }
    getSpineItem(href) {
        const index = this.getSpineIndex(href);
        if (index !== null) {
            return this.readingOrder[index];
        }
        return null;
    }
    getSpineIndex(href) {
        return this.readingOrder.findIndex((item) => item.Href && new URL(item.Href, this.manifestUrl.href).href === href);
    }
    getAbsoluteHref(href) {
        return new URL(href, this.manifestUrl.href).href;
    }
    getTOCItemAbsolute(href) {
        const absolute = this.getAbsoluteHref(href);
        const findItem = (href, links) => {
            for (let index = 0; index < links.length; index++) {
                const item = links[index];
                if (item.Href) {
                    const hrefAbsolutre = item.Href.indexOf("#") !== -1
                        ? item.Href.slice(0, item.Href.indexOf("#"))
                        : item.Href;
                    const itemUrl = new URL(hrefAbsolutre, this.manifestUrl.href).href;
                    if (itemUrl === href) {
                        return item;
                    }
                }
                if (item.Children) {
                    const childItem = findItem(href, item.Children);
                    if (childItem !== null) {
                        return childItem;
                    }
                }
            }
            return null;
        };
        let link = findItem(absolute, this.tableOfContents);
        if (link === null) {
            link = findItem(absolute, this.readingOrder);
        }
        return link;
    }
    getTOCItem(href) {
        const findItem = (href, links) => {
            for (let index = 0; index < links.length; index++) {
                const item = links[index];
                if (item.Href) {
                    const itemUrl = new URL(item.Href, this.manifestUrl.href).href;
                    if (itemUrl === href) {
                        return item;
                    }
                }
                if (item.Children) {
                    const childItem = findItem(href, item.Children);
                    if (childItem !== null) {
                        return childItem;
                    }
                }
            }
            return null;
        };
        let link = findItem(href, this.tableOfContents);
        if (link === null) {
            link = findItem(href, this.readingOrder);
        }
        if (link === null) {
            if (href.indexOf("#") !== -1) {
                const newResource = href.slice(0, href.indexOf("#"));
                link = findItem(newResource, this.tableOfContents);
                if (link === null) {
                    link = findItem(newResource, this.readingOrder);
                }
            }
        }
        return link;
    }
    /**
     * positionsByHref
     */
    positionsByHref(href) {
        var _a;
        const decodedHref = (_a = decodeURI(href)) !== null && _a !== void 0 ? _a : "";
        return this.positions.filter((p) => decodedHref.includes(p.href));
    }
    get hasMediaOverlays() {
        return this.readingOrder
            ? this.readingOrder.filter((el) => { var _a; return (_a = el.Properties) === null || _a === void 0 ? void 0 : _a.MediaOverlay; })
                .length > 0
            : false;
    }
};
Publication = __decorate([
    ta_json_x_1.JsonObject()
], Publication);
exports.Publication = Publication;
//# sourceMappingURL=Publication.js.map