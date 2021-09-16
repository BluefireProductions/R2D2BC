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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullQualifiedSelector = void 0;
// tslint:disable-next-line:max-line-length
// https://github.com/fczbkk/css-selector-generator-benchmark/blob/master/README.md#chromiums-dompresentationutils
// tslint:disable-next-line:max-line-length
// https://chromium.googlesource.com/chromium/blink/+/master/Source/devtools/front_end/components/DOMPresentationUtils.js#259
const fullQualifiedSelector = (node, justSelector) => {
    var _a, _b;
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return ((_b = (_a = node) === null || _a === void 0 ? void 0 : _a.localName.toLowerCase()) !== null && _b !== void 0 ? _b : node.nodeName.toLowerCase());
    }
    return cssPath(node, justSelector);
};
exports.fullQualifiedSelector = fullQualifiedSelector;
// tslint:disable-next-line:max-line-length
// https://chromium.googlesource.com/chromium/blink/+/master/Source/devtools/front_end/components/DOMPresentationUtils.js#289
const cssPath = (node, optimized) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
    }
    const steps = [];
    let contextNode = node;
    while (contextNode) {
        const step = _cssPathStep(contextNode, !!optimized, contextNode === node);
        if (!step) {
            break; // Error - bail out early.
        }
        steps.push(step.value);
        if (step.optimized) {
            break;
        }
        contextNode = contextNode.parentNode;
    }
    steps.reverse();
    return steps.join(" > ");
};
// tslint:disable-next-line:max-line-length
// https://chromium.googlesource.com/chromium/blink/+/master/Source/devtools/front_end/components/DOMPresentationUtils.js#316
const _cssPathStep = (node, optimized, isTargetNode) => {
    const prefixedElementClassNames = (nd) => {
        const classAttribute = nd.getAttribute("class");
        if (!classAttribute) {
            return [];
        }
        return classAttribute
            .split(/\s+/g)
            .filter(Boolean)
            .map((nm) => {
            // The prefix is required to store "__proto__" in a object-based map.
            return "$" + nm;
        });
    };
    const idSelector = (idd) => {
        return "#" + escapeIdentifierIfNeeded(idd);
    };
    const escapeIdentifierIfNeeded = (ident) => {
        if (isCSSIdentifier(ident)) {
            return ident;
        }
        const shouldEscapeFirst = /^(?:[0-9]|-[0-9-]?)/.test(ident);
        const lastIndex = ident.length - 1;
        return ident.replace(/./g, (c, ii) => {
            return (shouldEscapeFirst && ii === 0) || !isCSSIdentChar(c)
                ? escapeAsciiChar(c, ii === lastIndex)
                : c;
        });
    };
    const escapeAsciiChar = (c, isLast) => {
        return "\\" + toHexByte(c) + (isLast ? "" : " ");
    };
    const toHexByte = (c) => {
        let hexByte = c.charCodeAt(0).toString(16);
        if (hexByte.length === 1) {
            hexByte = "0" + hexByte;
        }
        return hexByte;
    };
    const isCSSIdentChar = (c) => {
        if (/[a-zA-Z0-9_-]/.test(c)) {
            return true;
        }
        return c.charCodeAt(0) >= 0xa0;
    };
    const isCSSIdentifier = (value) => {
        return /^-?[a-zA-Z_][a-zA-Z0-9_-]*$/.test(value);
    };
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return undefined;
    }
    const lowerCaseName = (node.localName &&
        node.localName.toLowerCase()) ||
        node.nodeName.toLowerCase();
    const element = node;
    const id = element.getAttribute("id");
    if (optimized) {
        if (id) {
            return {
                optimized: true,
                value: idSelector(id),
            };
        }
        if (lowerCaseName === "body" ||
            lowerCaseName === "head" ||
            lowerCaseName === "html") {
            return {
                optimized: true,
                value: lowerCaseName, // node.nodeNameInCorrectCase(),
            };
        }
    }
    const nodeName = lowerCaseName; // node.nodeNameInCorrectCase();
    if (id) {
        return {
            optimized: true,
            value: nodeName + idSelector(id),
        };
    }
    const parent = node.parentNode;
    if (!parent || parent.nodeType === Node.DOCUMENT_NODE) {
        return {
            optimized: true,
            value: nodeName,
        };
    }
    const prefixedOwnClassNamesArray_ = prefixedElementClassNames(element);
    const prefixedOwnClassNamesArray = []; // .keySet()
    prefixedOwnClassNamesArray_.forEach((arrItem) => {
        if (prefixedOwnClassNamesArray.indexOf(arrItem) < 0) {
            prefixedOwnClassNamesArray.push(arrItem);
        }
    });
    let needsClassNames = false;
    let needsNthChild = false;
    let ownIndex = -1;
    let elementIndex = -1;
    const siblings = parent.children;
    for (let i = 0; (ownIndex === -1 || !needsNthChild) && i < siblings.length; ++i) {
        const sibling = siblings[i];
        if (sibling.nodeType !== Node.ELEMENT_NODE) {
            continue;
        }
        elementIndex += 1;
        if (sibling === node) {
            ownIndex = elementIndex;
            continue;
        }
        if (needsNthChild) {
            continue;
        }
        // sibling.nodeNameInCorrectCase()
        const siblingName = (sibling.localName && sibling.localName.toLowerCase()) ||
            sibling.nodeName.toLowerCase();
        if (siblingName !== nodeName) {
            continue;
        }
        needsClassNames = true;
        const ownClassNames = [];
        prefixedOwnClassNamesArray.forEach((arrItem) => {
            ownClassNames.push(arrItem);
        });
        let ownClassNameCount = ownClassNames.length;
        if (ownClassNameCount === 0) {
            needsNthChild = true;
            continue;
        }
        const siblingClassNamesArray_ = prefixedElementClassNames(sibling);
        const siblingClassNamesArray = []; // .keySet()
        siblingClassNamesArray_.forEach((arrItem) => {
            if (siblingClassNamesArray.indexOf(arrItem) < 0) {
                siblingClassNamesArray.push(arrItem);
            }
        });
        for (const siblingClass of siblingClassNamesArray) {
            const ind = ownClassNames.indexOf(siblingClass);
            if (ind < 0) {
                continue;
            }
            ownClassNames.splice(ind, 1); // delete ownClassNames[siblingClass];
            if (!--ownClassNameCount) {
                needsNthChild = true;
                break;
            }
        }
    }
    let result = nodeName;
    if (isTargetNode &&
        nodeName === "input" &&
        element.getAttribute("type") &&
        !element.getAttribute("id") &&
        !element.getAttribute("class")) {
        result += '[type="' + element.getAttribute("type") + '"]';
    }
    if (needsNthChild) {
        result += ":nth-child(" + (ownIndex + 1) + ")";
    }
    else if (needsClassNames) {
        for (const prefixedName of prefixedOwnClassNamesArray) {
            result += "." + escapeIdentifierIfNeeded(prefixedName.substr(1));
        }
    }
    return {
        optimized: false,
        value: result,
    };
};
//# sourceMappingURL=cssselector.js.map