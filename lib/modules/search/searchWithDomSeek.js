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
 * Developed on behalf of: Bibliotheca LLC (https://www.bibliotheca.com)
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
exports.searchDocDomSeek = exports.reset = exports.escapeRegExp = void 0;
const selection_1 = require("../highlight/renderer/iframe/selection");
const cssselector2_1 = require("../highlight/renderer/common/cssselector2");
const collapseWhitespaces = (str) => {
    return str.replace(/\n/g, " ").replace(/\s\s+/g, " ");
};
const cleanupStr = (str) => {
    return collapseWhitespaces(str).trim();
};
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);
function escapeRegExp(str) {
    return str && reHasRegExpChar.test(str)
        ? str.replace(reRegExpChar, "\\$&")
        : str || "";
}
exports.escapeRegExp = escapeRegExp;
var _counter = 0;
const counter = () => {
    // let _counter = 0;
    return () => {
        return Number.isSafeInteger(++_counter) ? _counter : (_counter = 1);
    };
};
const reset = () => {
    _counter = 0;
};
exports.reset = reset;
const getCount = counter();
const _getCssSelectorOptions = {
    className: (_str) => {
        return true;
    },
    idName: (_str) => {
        return true;
    },
    tagName: (_str) => {
        return true;
    },
};
const getCssSelector_ = (doc) => (element) => {
    try {
        return cssselector2_1.uniqueCssSelector(element, doc, _getCssSelectorOptions);
    }
    catch (err) {
        console.error("uniqueCssSelector:", err);
        return "";
    }
};
function searchDocDomSeek(searchInput, doc, href, title) {
    return __awaiter(this, void 0, void 0, function* () {
        const text = doc.body.textContent;
        if (!text) {
            return [];
        }
        searchInput = cleanupStr(searchInput);
        if (!searchInput.length) {
            return [];
        }
        const iter = doc.createNodeIterator(doc.body, NodeFilter.SHOW_TEXT, {
            acceptNode: (_node) => NodeFilter.FILTER_ACCEPT,
        });
        const regexp = new RegExp(escapeRegExp(searchInput).replace(/ /g, "\\s+"), "gim");
        const searchResults = [];
        const snippetLength = 100;
        const snippetLengthNormalized = 30;
        let accumulated = 0;
        let matches;
        while ((matches = regexp.exec(text))) {
            let i = Math.max(0, matches.index - snippetLength);
            let l = Math.min(snippetLength, matches.index);
            let textBefore = collapseWhitespaces(text.substr(i, l));
            textBefore = textBefore.substr(textBefore.length - snippetLengthNormalized);
            i = regexp.lastIndex;
            l = Math.min(snippetLength, text.length - i);
            const textAfter = collapseWhitespaces(text.substr(i, l)).substr(0, snippetLengthNormalized);
            const range = new Range();
            let offset = matches.index;
            while (accumulated <= offset) {
                const nextNode = iter.nextNode();
                accumulated += nextNode.nodeValue.length;
            }
            let localOffset = iter.referenceNode.nodeValue.length - (accumulated - offset);
            range.setStart(iter.referenceNode, localOffset);
            offset = matches.index + matches[0].length;
            while (accumulated <= offset) {
                const nextNode = iter.nextNode();
                accumulated += nextNode.nodeValue.length;
            }
            localOffset = iter.referenceNode.nodeValue.length - (accumulated - offset);
            range.setEnd(iter.referenceNode, localOffset);
            if (!doc.getCssSelector) {
                doc.getCssSelector = getCssSelector_(doc);
            }
            const rangeInfo = selection_1.convertRange(range, doc.getCssSelector); // computeElementCFI
            searchResults.push({
                textMatch: collapseWhitespaces(matches[0]),
                textBefore,
                textAfter,
                rangeInfo,
                href,
                title,
                uuid: getCount().toString(),
            });
        }
        return searchResults;
    });
}
exports.searchDocDomSeek = searchDocDomSeek;
//# sourceMappingURL=searchWithDomSeek.js.map