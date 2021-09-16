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
exports.normalizeRange = exports.convertRangeInfo = exports.convertRange = exports.createOrderedRange = exports.getCurrentSelectionInfo = exports.clearCurrentSelection = void 0;
const IS_DEV = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev";
// https://developer.mozilla.org/en-US/docs/Web/API/Selection
function clearCurrentSelection(win) {
    const selection = win.getSelection();
    if (!selection) {
        return;
    }
    selection.removeAllRanges();
}
exports.clearCurrentSelection = clearCurrentSelection;
function getCurrentSelectionInfo(win, getCssSelector) {
    const selection = win ? win.getSelection() : null;
    if (!selection) {
        return undefined;
    }
    if (selection.isCollapsed) {
        if (IS_DEV) {
            console.log("^^^ SELECTION COLLAPSED.");
        }
        return undefined;
    }
    const rawText = selection.toString();
    const cleanText = rawText.trim().replace(/\n/g, " ").replace(/\s\s+/g, " ");
    if (cleanText.length === 0) {
        if (IS_DEV) {
            console.log("^^^ SELECTION TEXT EMPTY.");
        }
        return undefined;
    }
    if (!selection.anchorNode || !selection.focusNode) {
        return undefined;
    }
    const r = selection.rangeCount === 1
        ? selection.getRangeAt(0)
        : createOrderedRange(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
    if (!r || r.collapsed) {
        if (IS_DEV) {
            console.log("$$$$$$$$$$$$$$$$$ CANNOT GET NON-COLLAPSED SELECTION RANGE?!");
        }
        return undefined;
    }
    const range = normalizeRange(r);
    if (IS_DEV) {
        if (range.startContainer !== r.startContainer) {
            if (IS_DEV) {
                console.log(">>>>>>>>>>>>>>>>>>>>>>> SELECTION RANGE NORMALIZE diff: startContainer");
                console.log(range.startContainer);
                console.log(r.startContainer);
            }
        }
        if (range.startOffset !== r.startOffset) {
            if (IS_DEV) {
                console.log(">>>>>>>>>>>>>>>>>>>>>>> SELECTION RANGE NORMALIZE diff: startOffset");
                console.log(`${range.startOffset} !== ${r.startOffset}`);
            }
        }
        if (range.endContainer !== r.endContainer) {
            if (IS_DEV) {
                console.log(">>>>>>>>>>>>>>>>>>>>>>> SELECTION RANGE NORMALIZE diff: endContainer");
                console.log(range.endContainer);
                console.log(r.endContainer);
            }
        }
        if (range.endOffset !== r.endOffset) {
            if (IS_DEV) {
                console.log(">>>>>>>>>>>>>>>>>>>>>>> SELECTION RANGE NORMALIZE diff: endOffset");
                console.log(`${range.endOffset} !== ${r.endOffset}`);
            }
        }
    }
    const rangeInfo = convertRange(range, getCssSelector);
    if (!rangeInfo) {
        if (IS_DEV) {
            console.log("^^^ SELECTION RANGE INFO FAIL?!");
        }
        return undefined;
    }
    // selection.removeAllRanges();
    //     // selection.addRange(range);
    return { rangeInfo, cleanText, rawText, range };
}
exports.getCurrentSelectionInfo = getCurrentSelectionInfo;
function createOrderedRange(startNode, startOffset, endNode, endOffset) {
    try {
        const range = new Range(); // document.createRange()
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        if (!range.collapsed) {
            if (IS_DEV) {
                console.log(">>> createOrderedRange RANGE OK");
            }
            return range;
        }
        if (IS_DEV) {
            console.log(">>> createOrderedRange COLLAPSED ... RANGE REVERSE?");
        }
        const rangeReverse = new Range(); // document.createRange()
        rangeReverse.setStart(endNode, endOffset);
        rangeReverse.setEnd(startNode, startOffset);
        if (!rangeReverse.collapsed) {
            if (IS_DEV) {
                console.log(">>> createOrderedRange RANGE REVERSE OK.");
            }
            return range;
        }
        if (IS_DEV) {
            console.log(">>> createOrderedRange RANGE REVERSE ALSO COLLAPSED?!");
        }
        return undefined;
    }
    catch (err) {
        console.warn(err.message);
        return undefined;
    }
}
exports.createOrderedRange = createOrderedRange;
function convertRange(range, getCssSelector) {
    // -----------------
    const startIsElement = range.startContainer.nodeType === Node.ELEMENT_NODE;
    const startContainerElement = startIsElement
        ? range.startContainer
        : range.startContainer.parentNode &&
            range.startContainer.parentNode.nodeType === Node.ELEMENT_NODE
            ? range.startContainer.parentNode
            : undefined;
    if (!startContainerElement) {
        return undefined;
    }
    const startContainerChildTextNodeIndex = startIsElement
        ? -1
        : Array.from(startContainerElement.childNodes).indexOf(range.startContainer);
    if (startContainerChildTextNodeIndex < -1) {
        return undefined;
    }
    const startContainerElementCssSelector = getCssSelector(startContainerElement);
    // -----------------
    const endIsElement = range.endContainer.nodeType === Node.ELEMENT_NODE;
    const endContainerElement = endIsElement
        ? range.endContainer
        : range.endContainer.parentNode &&
            range.endContainer.parentNode.nodeType === Node.ELEMENT_NODE
            ? range.endContainer.parentNode
            : undefined;
    if (!endContainerElement) {
        return undefined;
    }
    const endContainerChildTextNodeIndex = endIsElement
        ? -1
        : Array.from(endContainerElement.childNodes).indexOf(range.endContainer);
    if (endContainerChildTextNodeIndex < -1) {
        return undefined;
    }
    const endContainerElementCssSelector = getCssSelector(endContainerElement);
    // -----------------
    const commonElementAncestor = getCommonAncestorElement(range.startContainer, range.endContainer);
    if (!commonElementAncestor) {
        if (IS_DEV) {
            console.log("^^^ NO RANGE COMMON ANCESTOR?!");
        }
        return undefined;
    }
    if (range.commonAncestorContainer) {
        const rangeCommonAncestorElement = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
            ? range.commonAncestorContainer
            : range.commonAncestorContainer.parentNode;
        if (rangeCommonAncestorElement &&
            rangeCommonAncestorElement.nodeType === Node.ELEMENT_NODE) {
            if (commonElementAncestor !== rangeCommonAncestorElement) {
                if (IS_DEV) {
                    console.log(">>>>>> COMMON ANCESTOR CONTAINER DIFF??!");
                    console.log(getCssSelector(commonElementAncestor));
                    console.log(getCssSelector(rangeCommonAncestorElement));
                }
            }
        }
    }
    return {
        endContainerChildTextNodeIndex,
        endContainerElementCssSelector,
        endOffset: range.endOffset,
        startContainerChildTextNodeIndex,
        startContainerElementCssSelector,
        startOffset: range.startOffset,
    };
}
exports.convertRange = convertRange;
function convertRangeInfo(documant, rangeInfo) {
    const startElement = documant.querySelector(rangeInfo.startContainerElementCssSelector);
    if (!startElement) {
        if (IS_DEV) {
            console.log("^^^ convertRangeInfo NO START ELEMENT CSS SELECTOR?!");
        }
        return undefined;
    }
    let startContainer = startElement;
    if (rangeInfo.startContainerChildTextNodeIndex >= 0) {
        if (rangeInfo.startContainerChildTextNodeIndex >=
            startElement.childNodes.length) {
            if (IS_DEV) {
                console.log("^^^ convertRangeInfo rangeInfo.startContainerChildTextNodeIndex >= startElement.childNodes.length?!");
            }
            return undefined;
        }
        startContainer =
            startElement.childNodes[rangeInfo.startContainerChildTextNodeIndex];
        if (startContainer.nodeType !== Node.TEXT_NODE) {
            if (IS_DEV) {
                console.log("^^^ convertRangeInfo startContainer.nodeType !== Node.TEXT_NODE?!");
            }
            return undefined;
        }
    }
    const endElement = documant.querySelector(rangeInfo.endContainerElementCssSelector);
    if (!endElement) {
        if (IS_DEV) {
            console.log("^^^ convertRangeInfo NO END ELEMENT CSS SELECTOR?!");
        }
        return undefined;
    }
    let endContainer = endElement;
    if (rangeInfo.endContainerChildTextNodeIndex >= 0) {
        if (rangeInfo.endContainerChildTextNodeIndex >= endElement.childNodes.length) {
            if (IS_DEV) {
                console.log("^^^ convertRangeInfo rangeInfo.endContainerChildTextNodeIndex >= endElement.childNodes.length?!");
            }
            return undefined;
        }
        endContainer =
            endElement.childNodes[rangeInfo.endContainerChildTextNodeIndex];
        if (endContainer.nodeType !== Node.TEXT_NODE) {
            if (IS_DEV) {
                console.log("^^^ convertRangeInfo endContainer.nodeType !== Node.TEXT_NODE?!");
            }
            return undefined;
        }
    }
    return createOrderedRange(startContainer, rangeInfo.startOffset, endContainer, rangeInfo.endOffset);
}
exports.convertRangeInfo = convertRangeInfo;
function getCommonAncestorElement(node1, node2) {
    if (node1.nodeType === Node.ELEMENT_NODE && node1 === node2) {
        return node1;
    }
    if (node1.nodeType === Node.ELEMENT_NODE && node1.contains(node2)) {
        return node1;
    }
    if (node2.nodeType === Node.ELEMENT_NODE && node2.contains(node1)) {
        return node2;
    }
    const node1ElementAncestorChain = [];
    let parent = node1.parentNode;
    while (parent && parent.nodeType === Node.ELEMENT_NODE) {
        node1ElementAncestorChain.push(parent);
        parent = parent.parentNode;
    }
    const node2ElementAncestorChain = [];
    parent = node2.parentNode;
    while (parent && parent.nodeType === Node.ELEMENT_NODE) {
        node2ElementAncestorChain.push(parent);
        parent = parent.parentNode;
    }
    let commonAncestor = node1ElementAncestorChain.find((node1ElementAncestor) => {
        return node2ElementAncestorChain.indexOf(node1ElementAncestor) >= 0;
    });
    if (!commonAncestor) {
        commonAncestor = node2ElementAncestorChain.find((node2ElementAncestor) => {
            return node1ElementAncestorChain.indexOf(node2ElementAncestor) >= 0;
        });
    }
    return commonAncestor;
}
//  https://github.com/webmodules/range-normalize/pull/2
//  "Normalizes" the DOM Range instance, such that slight variations in the start
//  and end containers end up being normalized to the same "base" representation.
//  The aim is to always have `startContainer` and `endContainer` pointing to
//  TextNode instances.
//  Pseudo-logic is as follows:
//  - Expand the boundaries if they fall between siblings.
//  - Narrow the boundaries until they point at leaf nodes.
//  - Is the start container excluded by its offset?
//    - Move it to the next leaf Node, but not past the end container.
//    - Is the start container a leaf Node but not a TextNode?
//      - Set the start boundary to be before the Node.
//  - Is the end container excluded by its offset?
//    - Move it to the previous leaf Node, but not past the start container.
//    - Is the end container a leaf Node but not a TextNode?
//      - Set the end boundary to be after the Node.
//  @param {Range} range - DOM Range instance to "normalize"
//  @return {Range} returns a "normalized" clone of `range`
function normalizeRange(r) {
    const range = r.cloneRange(); // new Range(); // document.createRange()
    let sc = range.startContainer;
    let so = range.startOffset;
    let ec = range.endContainer;
    let eo = range.endOffset;
    // Move the start container to the last leaf before any sibling boundary.
    if (sc.childNodes.length && so > 0) {
        sc = lastLeaf(sc.childNodes[so - 1]);
        so = sc.length || 0;
    }
    // Move the end container to the first leaf after any sibling boundary.
    if (eo < ec.childNodes.length) {
        ec = firstLeaf(ec.childNodes[eo]);
        eo = 0;
    }
    // Move each container inward until it reaches a leaf Node.
    let start = firstLeaf(sc);
    let end = lastLeaf(ec);
    // Define a predicate to check if a Node is a leaf Node inside the Range.
    function isLeafNodeInRange(node) {
        if (node.childNodes.length) {
            return false;
        }
        const length = node.length || 0;
        if (node === sc && so === length) {
            return false;
        }
        return !(node === ec && eo === 0);
    }
    // Move the start container until it is included or collapses to the end.
    while (start && !isLeafNodeInRange(start) && start !== end) {
        start = documentForward(start);
    }
    if (start === sc) {
        range.setStart(sc, so);
    }
    else if (start !== null) {
        if (start.nodeType === 3) {
            range.setStart(start, 0);
        }
        else {
            range.setStartBefore(start);
        }
    }
    // Move the end container until it is included or collapses to the start.
    while (end && !isLeafNodeInRange(end) && end !== start) {
        end = documentReverse(end);
    }
    if (end === ec) {
        range.setEnd(ec, eo);
    }
    else if (end !== null) {
        if (end.nodeType === 3) {
            range.setEnd(end, end.length);
        }
        else {
            range.setEndAfter(end);
        }
    }
    return range;
}
exports.normalizeRange = normalizeRange;
// Return the next Node in a document order traversal.
// This order is equivalent to a classic pre-order.
function documentForward(node) {
    if (node.firstChild) {
        return node.firstChild;
    }
    let n = node;
    while (!n.nextSibling) {
        n = n.parentNode;
        if (!n) {
            return null;
        }
    }
    return n.nextSibling;
}
// Return the next Node in a reverse document order traversal.
// This order is equivalent to pre-order with the child order reversed.
function documentReverse(node) {
    if (node.lastChild) {
        return node.lastChild;
    }
    let n = node;
    while (!n.previousSibling) {
        n = n.parentNode;
        if (!n) {
            return null;
        }
    }
    return n.previousSibling;
}
function firstLeaf(node) {
    while (node.firstChild) {
        node = node.firstChild;
    }
    return node;
}
function lastLeaf(node) {
    while (node.lastChild) {
        node = node.lastChild;
    }
    return node;
}
//# sourceMappingURL=selection.js.map