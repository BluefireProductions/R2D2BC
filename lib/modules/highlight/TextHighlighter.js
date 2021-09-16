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
exports._highlights = exports.CLASS_HIGHLIGHT_BOUNDING_AREA = exports.CLASS_HIGHLIGHT_AREA = exports.CLASS_HIGHLIGHT_CONTAINER = exports.ID_HIGHLIGHTS_CONTAINER = void 0;
const SHA256_1 = require("jscrypto/es6/SHA256");
const debounce_1 = require("debounce");
const styles_1 = require("./common/styles");
const rect_utils_1 = require("./common/rect-utils");
const selection_1 = require("./renderer/iframe/selection");
const cssselector2_1 = require("./renderer/common/cssselector2");
const Locator_1 = require("../../model/Locator");
const __1 = require("../..");
const IconLib_1 = require("../../utils/IconLib");
exports.ID_HIGHLIGHTS_CONTAINER = "R2_ID_HIGHLIGHTS_CONTAINER";
exports.CLASS_HIGHLIGHT_CONTAINER = "R2_CLASS_HIGHLIGHT_CONTAINER";
exports.CLASS_HIGHLIGHT_AREA = "R2_CLASS_HIGHLIGHT_AREA";
exports.CLASS_HIGHLIGHT_BOUNDING_AREA = "R2_CLASS_HIGHLIGHT_BOUNDING_AREA";
const DEFAULT_BACKGROUND_COLOR_OPACITY = 0.5;
const ALT_BACKGROUND_COLOR_OPACITY = 0.75;
const DEFAULT_BACKGROUND_COLOR = {
    blue: 100,
    green: 50,
    red: 230,
};
exports._highlights = [];
/**
 * Attribute added by default to every highlight.
 * @type {string}
 */
let DATA_ATTR = "data-highlighted";
/**
 * Attribute used to group highlight wrappers.
 * @type {string}
 */
let TIMESTAMP_ATTR = "data-timestamp";
let NODE_TYPE = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
};
const _blacklistIdClassForCssSelectors = [
    styles_1.POPUP_DIALOG_CLASS,
    styles_1.TTS_CLASS_INJECTED_SPAN,
    styles_1.TTS_CLASS_INJECTED_SUBSPAN,
    exports.ID_HIGHLIGHTS_CONTAINER,
    exports.CLASS_HIGHLIGHT_CONTAINER,
    exports.CLASS_HIGHLIGHT_AREA,
    exports.CLASS_HIGHLIGHT_BOUNDING_AREA,
    styles_1.TTS_ID_INJECTED_PARENT,
    styles_1.TTS_ID_SPEAKING_DOC_ELEMENT,
    styles_1.ROOT_CLASS_KEYBOARD_INTERACT,
    styles_1.ROOT_CLASS_INVISIBLE_MASK,
    styles_1.ROOT_CLASS_NO_FOOTNOTES,
];
let lastMouseDownX = -1;
let lastMouseDownY = -1;
let bodyEventListenersSet = false;
// TODO this needs to reflect layer name
let _highlightsContainer;
class TextHighlighter {
    constructor(delegate, properties, api, hasEventListener, options) {
        this.lastSelectedHighlight = undefined;
        this.isSelectionMenuOpen = false;
        this.selectionMenuOpened = debounce_1.debounce(() => {
            var _a, _b;
            if (!this.isSelectionMenuOpen) {
                this.isSelectionMenuOpen = true;
                if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.selectionMenuOpen)
                    (_b = this.api) === null || _b === void 0 ? void 0 : _b.selectionMenuOpen();
            }
        }, 100);
        this.selectionMenuClosed = debounce_1.debounce(() => {
            var _a, _b;
            if (this.isSelectionMenuOpen) {
                this.isSelectionMenuOpen = false;
                if ((_a = this.api) === null || _a === void 0 ? void 0 : _a.selectionMenuClose)
                    (_b = this.api) === null || _b === void 0 ? void 0 : _b.selectionMenuClose();
            }
        }, 100);
        this.getScrollingElement = (documant) => {
            if (documant.scrollingElement) {
                return documant.scrollingElement;
            }
            return documant.body;
        };
        this.recreateAllHighlightsDebounced = debounce_1.debounce((win) => {
            this.recreateAllHighlightsRaw(win);
        }, 500);
        this.delegate = delegate;
        this.properties = properties;
        this.api = api;
        this.hasEventListener = hasEventListener;
        this.options = this.defaults(options, {
            color: "#fce300",
            highlightedClass: "highlighted",
            contextClass: "highlighter-context",
            onBeforeHighlight: function () {
                return true;
            },
            onAfterHighlight: function () { },
        });
        this.delegate.highlighter = this;
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const module = new this(config.delegate, config, config.api, false, {});
            return new Promise((resolve) => resolve(module));
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dom(this.delegate.iframes[0].contentDocument.body).addClass(this.options.contextClass);
            this.bindEvents(this.delegate.iframes[0].contentDocument.body, this, this.hasEventListener);
            this.initializeToolbox();
            lastMouseDownX = -1;
            lastMouseDownY = -1;
            bodyEventListenersSet = false;
            var self = this;
            function unselect() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (self.lastSelectedHighlight === undefined) {
                        // self.delegate.api.highlightUnSelected().then(async () => {
                        //     if (IS_DEV) {console.log("highlightUnSelected,  click on existing")}
                        // })
                    }
                    else {
                        self.lastSelectedHighlight = undefined;
                    }
                });
            }
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield this.delegate.iframes[0].contentDocument.body.addEventListener("click", unselect);
            }), 100);
        });
    }
    /**
     * Returns true if elements a i b have the same color.
     * @param {Node} a
     * @param {Node} b
     * @returns {boolean}
     */
    haveSameColor(a, b) {
        return this.dom(a).color() === this.dom(b).color();
    }
    /**
     * Fills undefined values in obj with default properties with the same name from source object.
     * @param {object} obj - target object
     * @param {object} source - source object with default values
     * @returns {object}
     */
    defaults(obj, source) {
        obj = obj || {};
        for (let prop in source) {
            if (source.hasOwnProperty(prop) && obj[prop] === void 0) {
                obj[prop] = source[prop];
            }
        }
        return obj;
    }
    /**
     * Returns array without duplicated values.
     * @param {Array} arr
     * @returns {Array}
     */
    unique(arr) {
        return arr.filter(function (value, idx, self) {
            return self.indexOf(value) === idx;
        });
    }
    /**
     * Takes range object as parameter and refines it boundaries
     * @param range
     * @returns {object} refined boundaries and initial state of highlighting algorithm.
     */
    refineRangeBoundaries(range) {
        let startContainer = range.startContainer, endContainer = range.endContainer, ancestor = range.commonAncestorContainer, goDeeper = true;
        if (range.endOffset === 0) {
            while (!endContainer.previousSibling &&
                endContainer.parentNode !== ancestor) {
                endContainer = endContainer.parentNode;
            }
            endContainer = endContainer.previousSibling;
        }
        else if (endContainer.nodeType === NODE_TYPE.TEXT_NODE) {
            if (range.endOffset < endContainer.nodeValue.length) {
                endContainer.splitText(range.endOffset);
            }
        }
        else if (range.endOffset > 0) {
            endContainer = endContainer.childNodes.item(range.endOffset - 1);
        }
        if (startContainer.nodeType === NODE_TYPE.TEXT_NODE) {
            if (range.startOffset === startContainer.nodeValue.length) {
                goDeeper = false;
            }
            else if (range.startOffset > 0) {
                startContainer = startContainer.splitText(range.startOffset);
                if (endContainer === startContainer.previousSibling) {
                    endContainer = startContainer;
                }
            }
        }
        else if (range.startOffset < startContainer.childNodes.length) {
            startContainer = startContainer.childNodes.item(range.startOffset);
        }
        else {
            startContainer = startContainer.nextSibling;
        }
        return {
            startContainer: startContainer,
            endContainer: endContainer,
            goDeeper: goDeeper,
        };
    }
    /**
     * Sorts array of DOM elements by its depth in DOM tree.
     * @param {HTMLElement[]} arr - array to sort.
     * @param {boolean} descending - order of sort.
     */
    sortByDepth(arr, descending) {
        var self = this;
        arr.sort(function (a, b) {
            return (self.dom(descending ? b : a).parents().length -
                self.dom(descending ? a : b).parents().length);
        });
    }
    /**
     * Groups given highlights by timestamp.
     * @param {Array} highlights
     * @returns {Array} Grouped highlights.
     */
    groupHighlights(highlights) {
        var order = [], chunks = {}, grouped = [];
        highlights.forEach(function (hl) {
            let timestamp = hl.getAttribute(TIMESTAMP_ATTR);
            if (typeof chunks[timestamp] === "undefined") {
                chunks[timestamp] = [];
                order.push(timestamp);
            }
            chunks[timestamp].push(hl);
        });
        order.forEach(function (timestamp) {
            let group = chunks[timestamp];
            grouped.push({
                chunks: group,
                timestamp: timestamp,
                toString: function () {
                    return group
                        .map(function (h) {
                        return h.textContent;
                    })
                        .join("");
                },
            });
        });
        return grouped;
    }
    /**
     * Utility functions to make DOM manipulation easier.
     * @param {Node|HTMLElement} [el] - base DOM element to manipulate
     * @returns {object}
     */
    dom(el) {
        var self = this;
        return /** @lends dom **/ {
            /**
             * Adds class to element.
             * @param {string} className
             */
            addClass: function (className) {
                if (el.classList) {
                    el.classList.add(className);
                }
                else {
                    el.className += " " + className;
                }
            },
            /**
             * Removes class from element.
             * @param {string} className
             */
            removeClass: function (className) {
                if (el.classList) {
                    el.classList.remove(className);
                }
                else {
                    el.className = el.className.replace(new RegExp("(^|\\b)" + className + "(\\b|$)", "gi"), " ");
                }
            },
            /**
             * Prepends child nodes to base element.
             * @param {Node[]} nodesToPrepend
             */
            prepend: function (nodesToPrepend) {
                var nodes = Array.prototype.slice.call(nodesToPrepend), i = nodes.length;
                while (i--) {
                    el.insertBefore(nodes[i], el.firstChild);
                }
            },
            /**
             * Appends child nodes to base element.
             * @param {Node[]} nodesToAppend
             */
            append: function (nodesToAppend) {
                var nodes = Array.prototype.slice.call(nodesToAppend);
                for (var i = 0, len = nodes.length; i < len; ++i) {
                    el.appendChild(nodes[i]);
                }
            },
            /**
             * Inserts base element after refEl.
             * @param {Node} refEl - node after which base element will be inserted
             * @returns {Node} - inserted element
             */
            insertAfter: function (refEl) {
                return refEl.parentNode.insertBefore(el, refEl.nextSibling);
            },
            /**
             * Inserts base element before refEl.
             * @param {Node} refEl - node before which base element will be inserted
             * @returns {Node} - inserted element
             */
            insertBefore: function (refEl) {
                return refEl.parentNode.insertBefore(el, refEl);
            },
            /**
             * Removes base element from DOM.
             */
            remove: function () {
                el.parentNode.removeChild(el);
                el = null;
            },
            /**
             * Returns true if base element contains given child.
             * @param {Node|HTMLElement} child
             * @returns {boolean}
             */
            contains: function (child) {
                return el !== child && el.contains(child);
            },
            /**
             * Wraps base element in wrapper element.
             * @param {HTMLElement} wrapper
             * @returns {HTMLElement} wrapper element
             */
            wrap: function (wrapper) {
                if (el.parentNode) {
                    el.parentNode.insertBefore(wrapper, el);
                }
                wrapper.appendChild(el);
                return wrapper;
            },
            /**
             * Unwraps base element.
             * @returns {Node[]} - child nodes of unwrapped element.
             */
            unwrap: function () {
                var nodes = Array.prototype.slice.call(el.childNodes), wrapper;
                nodes.forEach(function (node) {
                    wrapper = node.parentNode;
                    self.dom(node).insertBefore(node.parentNode);
                    self.dom(wrapper).remove();
                });
                return nodes;
            },
            /**
             * Returns array of base element parents.
             * @returns {HTMLElement[]}
             */
            parents: function () {
                var parent, path = [];
                while (!!(parent = el.parentNode)) {
                    path.push(parent);
                    el = parent;
                }
                return path;
            },
            /**
             * Normalizes text nodes within base element, ie. merges sibling text nodes and assures that every
             * element node has only one text node.
             * It should does the same as standard element.normalize, but IE implements it incorrectly.
             */
            normalizeTextNodes: function () {
                if (!el) {
                    return;
                }
                if (el.nodeType === NODE_TYPE.TEXT_NODE) {
                    while (el.nextSibling &&
                        el.nextSibling.nodeType === NODE_TYPE.TEXT_NODE) {
                        el.nodeValue += el.nextSibling.nodeValue;
                        el.parentNode.removeChild(el.nextSibling);
                    }
                }
                else {
                    self.dom(el.firstChild).normalizeTextNodes();
                }
                self.dom(el.nextSibling).normalizeTextNodes();
            },
            /**
             * Returns element background color.
             * @returns {CSSStyleDeclaration.backgroundColor}
             */
            color: function () {
                return el.style.backgroundColor;
            },
            /**
             * Creates dom element from given html string.
             * @param {string} html
             * @returns {NodeList}
             */
            fromHTML: function (html) {
                var div = document.createElement("div");
                div.innerHTML = html;
                return div.childNodes;
            },
            /**
             * Returns first range of the window of base element.
             * @returns {Range}
             */
            getRange: function () {
                var selection = self.dom(el).getSelection(), range;
                if (selection.rangeCount > 0) {
                    range = selection.getRangeAt(0);
                }
                return range;
            },
            /**
             * Removes all ranges of the window of base element.
             */
            removeAllRanges: function () {
                var selection = self.dom(el).getSelection();
                selection.removeAllRanges();
                self.toolboxHide();
            },
            /**
             * Returns selection object of the window of base element.
             * @returns {Selection}
             */
            getSelection: function () {
                return self.dom(el).getWindow().getSelection();
            },
            /**
             * Returns window of the base element.
             * @returns {Window}
             */
            getWindow: function () {
                return self.dom(el).getDocument().defaultView;
            },
            /**
             * Returns document of the base element.
             * @returns {HTMLDocument}
             */
            getDocument: function () {
                // if ownerDocument is null then el is the document itself.
                return el.ownerDocument || el;
            },
        };
    }
    disableContext(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    bindEvents(el, _scope, hasEventListener) {
        var documant = el.ownerDocument;
        documant.addEventListener("keyup", this.toolboxShowDelayed.bind(this));
        el.addEventListener("mouseup", this.toolboxShowDelayed.bind(this));
        el.addEventListener("touchend", this.toolboxShowDelayed.bind(this));
        documant.addEventListener("selectstart", this.toolboxShowDelayed.bind(this));
        if (!hasEventListener) {
            window.addEventListener("resize", this.toolboxPlacement.bind(this));
        }
        documant.addEventListener("selectionchange", this.toolboxPlacement.bind(this));
        el.addEventListener("mousedown", this.toolboxHide.bind(this));
        el.addEventListener("touchstart", this.toolboxHide.bind(this));
        if (this.isAndroid()) {
            el.addEventListener("contextmenu", this.disableContext);
        }
        this.hasEventListener = true;
    }
    unbindEvents(el, _scope) {
        var documant = el.ownerDocument;
        documant.removeEventListener("keyup", this.toolboxShowDelayed.bind(this));
        el.removeEventListener("mouseup", this.toolboxShowDelayed.bind(this));
        el.removeEventListener("touchend", this.toolboxShowDelayed.bind(this));
        documant.removeEventListener("selectstart", this.toolboxShowDelayed.bind(this));
        window.removeEventListener("resize", this.toolboxPlacement.bind(this));
        documant.removeEventListener("selectionchange", this.toolboxPlacement.bind(this));
        el.removeEventListener("mousedown", this.toolboxHide.bind(this));
        el.removeEventListener("touchstart", this.toolboxHide.bind(this));
        if (this.isAndroid()) {
            el.removeEventListener("contextmenu", this.disableContext);
        }
        this.hasEventListener = false;
    }
    /**
     * Permanently disables highlighting.
     * Unbinds events and remove context element class.
     * @memberof TextHighlighter
     */
    destroy() {
        this.toolboxHide();
        this.unbindEvents(this.delegate.iframes[0].contentDocument.body, this);
        this.dom(this.delegate.iframes[0].contentDocument.body).removeClass(this.options.contextClass);
    }
    initializeToolbox() {
        var toolboxColorsOptions = document.getElementById("highlight-toolbox-mode-colors");
        var colors = [
            "#fce300",
            "#48e200",
            "#00bae5",
            "#157cf9",
            "#6a39b7",
            "#ea426a",
            "#ff8500",
        ];
        var colorIcon = document.getElementById("colorIcon");
        var dismissIcon = document.getElementById("dismissIcon");
        var self = this;
        if (dismissIcon) {
            dismissIcon.innerHTML = IconLib_1.icons.close;
            // Close toolbox color options
            dismissIcon.addEventListener("click", function () {
                self.toolboxMode("add");
            });
        }
        if (colorIcon) {
            colors.forEach((color) => {
                var colorButton = document.getElementById(color);
                if (toolboxColorsOptions.contains(colorButton)) {
                    toolboxColorsOptions.removeChild(colorButton);
                }
            });
            var colorElements = [];
            // Open toolbox color options
            colorIcon.addEventListener("click", function () {
                self.toolboxMode("colors");
            });
            // Generate color options
            colors.forEach((color) => {
                var colorButton = colorIcon.cloneNode(true);
                var colorButtonSymbol = colorButton.lastChild;
                colorButtonSymbol.style.backgroundColor = color;
                colorButton.id = color;
                colorButton.style.display = "unset";
                colorElements.push(colorButton);
                var highlightIcon = document.getElementById("highlightIcon");
                var underlineIcon = document.getElementById("underlineIcon");
                // Set color and close color options
                if (colorIcon) {
                    colorButton.addEventListener("click", function () {
                        self.setColor(color);
                        var colorIconSymbol = colorIcon.lastChild;
                        if (colorIconSymbol) {
                            colorIconSymbol.style.backgroundColor = color;
                        }
                        if (highlightIcon.getElementsByTagName("span").length > 0) {
                            highlightIcon.getElementsByTagName("span")[0].style.background = self.getColor();
                        }
                        if (underlineIcon.getElementsByTagName("span").length > 0) {
                            underlineIcon.getElementsByTagName("span")[0].style.borderBottomColor = self.getColor();
                        }
                        self.toolboxMode("add");
                    });
                }
                toolboxColorsOptions.insertBefore(colorButton, dismissIcon);
            });
        }
        // Hide color options by default
        self.toolboxMode("add");
    }
    toolboxMode(mode) {
        var toolboxColorsOptions = document.getElementById("highlight-toolbox-mode-colors");
        var toolboxAddOptions = document.getElementById("highlight-toolbox-mode-add");
        var toolboxEditOptions = document.getElementById("highlight-toolbox-mode-edit");
        switch (mode) {
            case "colors":
                if (toolboxColorsOptions)
                    toolboxColorsOptions.style.display = "unset";
                if (toolboxAddOptions)
                    toolboxAddOptions.style.display = "none";
                if (toolboxEditOptions)
                    toolboxEditOptions.style.display = "none";
                break;
            case "edit":
                if (toolboxColorsOptions)
                    toolboxColorsOptions.style.display = "none";
                if (toolboxAddOptions)
                    toolboxAddOptions.style.display = "none";
                if (toolboxEditOptions)
                    toolboxEditOptions.style.display = "unset";
                break;
            default:
                if (toolboxColorsOptions)
                    toolboxColorsOptions.style.display = "none";
                if (toolboxAddOptions)
                    toolboxAddOptions.style.display = "unset";
                if (toolboxEditOptions)
                    toolboxEditOptions.style.display = "none";
                break;
        }
    }
    toolboxHide() {
        var toolbox = document.getElementById("highlight-toolbox");
        if (toolbox)
            toolbox.style.display = "none";
        this.selectionMenuClosed();
    }
    // Use short timeout to let the selection updated to 'finish', otherwise some
    // browsers can get wrong or incomplete selection data.
    toolboxShowDelayed() {
        var self = this;
        setTimeout(function () {
            if (!self.isAndroid()) {
                self.snapSelectionToWord();
            }
            self.toolboxShow();
        }, 100);
    }
    snapSelectionToWord() {
        var self = this;
        // Check for existence of window.getSelection() and that it has a
        // modify() method. IE 9 has both selection APIs but no modify() method.
        if (self.dom(this.delegate.iframes[0].contentDocument.body)) {
            var selection = self
                .dom(this.delegate.iframes[0].contentDocument.body)
                .getWindow()
                .getSelection();
            if (!selection.isCollapsed) {
                // Detect if selection is backwards
                var range = document.createRange();
                range.setStart(selection.anchorNode, selection.anchorOffset);
                range.setEnd(selection.focusNode, selection.focusOffset);
                var backwards = range.collapsed;
                range.detach();
                // modify() works on the focus of the selection
                var endNode = selection.focusNode, endOffset = selection.focusOffset;
                selection.collapse(selection.anchorNode, selection.anchorOffset);
                let direction = ["forward", "backward"];
                if (backwards) {
                    direction = ["backward", "forward"];
                }
                selection.modify("move", direction[0], "character");
                selection.modify("move", direction[1], "word");
                selection.extend(endNode, endOffset);
                selection.modify("extend", direction[1], "character");
                selection.modify("extend", direction[0], "word");
            }
        }
        return selection;
    }
    toolboxShow() {
        var self = this;
        var toolboxAddOptions = document.getElementById("highlight-toolbox-mode-add");
        var range = this.dom(this.delegate.iframes[0].contentDocument.body).getRange();
        if ((!range || range.collapsed) && toolboxAddOptions) {
            // Only force hide for `toolboxMode('add')`
            if (getComputedStyle(toolboxAddOptions).display !== "none") {
                self.toolboxHide();
            }
            return;
        }
        // Hide the iOS Safari context menu
        // Reference: https://stackoverflow.com/a/30046936
        if (this.isIOS()) {
            this.delegate.iframes[0].contentDocument.body.removeEventListener("selectionchange", this.toolboxPlacement.bind(this));
            setTimeout(function () {
                var selection = self
                    .dom(self.delegate.iframes[0].contentDocument.body)
                    .getSelection();
                selection.removeAllRanges();
                setTimeout(function () {
                    selection.addRange(range);
                }, 5);
            }, 100);
        }
        this.toolboxPlacement();
        this.toolboxHandler();
    }
    toolboxPlacement() {
        var _a, _b;
        var range = this.dom(this.delegate.iframes[0].contentDocument.body).getRange();
        if (!range || range.collapsed) {
            return;
        }
        var rect = range.getBoundingClientRect();
        var toolbox = document.getElementById("highlight-toolbox");
        if (toolbox) {
            toolbox.style.top =
                rect.top + ((_b = (_a = this.delegate.attributes) === null || _a === void 0 ? void 0 : _a.navHeight) !== null && _b !== void 0 ? _b : 0) + "px";
            toolbox.style.left = (rect.right - rect.left) / 2 + rect.left + "px";
        }
    }
    toolboxHandler() {
        var _a, _b, _c, _d, _e, _f;
        var toolbox = document.getElementById("highlight-toolbox");
        if (toolbox) {
            if (getComputedStyle(toolbox).display === "none") {
                toolbox.style.display = "block";
                this.selectionMenuOpened();
                var self = this;
                self.toolboxMode("add");
                var highlightIcon = document.getElementById("highlightIcon");
                var underlineIcon = document.getElementById("underlineIcon");
                var colorIcon = document.getElementById("colorIcon");
                var speakIcon = document.getElementById("speakIcon");
                if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableAnnotations) {
                    if (highlightIcon) {
                        highlightIcon.style.display = "unset";
                        if (colorIcon) {
                            if (highlightIcon.getElementsByTagName("span").length > 0) {
                                highlightIcon.getElementsByTagName("span")[0].style.background = this.getColor();
                            }
                        }
                    }
                    if (underlineIcon) {
                        underlineIcon.style.display = "unset";
                        if (colorIcon) {
                            if (underlineIcon.getElementsByTagName("span").length > 0) {
                                underlineIcon.getElementsByTagName("span")[0].style.borderBottomColor = this.getColor();
                            }
                        }
                    }
                    if (colorIcon) {
                        colorIcon.style.display = "unset";
                        var colorIconSymbol = colorIcon.lastChild;
                        colorIconSymbol.style.backgroundColor = this.getColor();
                    }
                    if (highlightIcon) {
                        function highlightEvent() {
                            self.doHighlight(false, Locator_1.AnnotationMarker.Highlight);
                            self.toolboxHide();
                            highlightIcon.removeEventListener("click", highlightEvent);
                        }
                        highlightIcon.addEventListener("click", highlightEvent);
                    }
                    if (underlineIcon) {
                        function commentEvent() {
                            self.doHighlight(false, Locator_1.AnnotationMarker.Underline);
                            self.toolboxHide();
                            underlineIcon.removeEventListener("click", commentEvent);
                        }
                        underlineIcon.addEventListener("click", commentEvent);
                    }
                }
                else {
                    if (highlightIcon) {
                        highlightIcon.style.setProperty("display", "none");
                    }
                    if (underlineIcon) {
                        underlineIcon.style.setProperty("display", "none");
                    }
                    if (colorIcon) {
                        colorIcon.style.setProperty("display", "none");
                    }
                }
                if ((_b = this.delegate.rights) === null || _b === void 0 ? void 0 : _b.enableTTS) {
                    if (speakIcon) {
                        function speakEvent() {
                            speakIcon.removeEventListener("click", speakEvent);
                            self.speak();
                        }
                        speakIcon.addEventListener("click", speakEvent);
                    }
                }
                else {
                    if (speakIcon) {
                        speakIcon.style.setProperty("display", "none");
                    }
                }
                if ((_d = (_c = this.properties) === null || _c === void 0 ? void 0 : _c.selectionMenuItems) !== null && _d !== void 0 ? _d : []) {
                    ((_f = (_e = this.properties) === null || _e === void 0 ? void 0 : _e.selectionMenuItems) !== null && _f !== void 0 ? _f : []).forEach((menuItem) => {
                        var itemElement = document.getElementById(menuItem.id);
                        var self = this;
                        function itemEvent() {
                            itemElement.removeEventListener("click", itemEvent);
                            function getCssSelector(element) {
                                const options = {
                                    className: (str) => {
                                        return _blacklistIdClassForCssSelectors.indexOf(str) < 0;
                                    },
                                    idName: (str) => {
                                        return _blacklistIdClassForCssSelectors.indexOf(str) < 0;
                                    },
                                };
                                return cssselector2_1.uniqueCssSelector(element, self.delegate.iframes[0].contentDocument, options);
                            }
                            const selectionInfo = selection_1.getCurrentSelectionInfo(self.delegate.iframes[0].contentWindow, getCssSelector);
                            if (selectionInfo !== undefined) {
                                menuItem.callback(selectionInfo.cleanText);
                            }
                            self.callbackComplete();
                        }
                        itemElement.addEventListener("click", itemEvent);
                    });
                }
            }
        }
    }
    /**
     * Highlights current range.
     * @param {boolean} keepRange - Don't remove range after highlighting. Default: false.
     * @param marker
     * @memberof TextHighlighter
     */
    doHighlight(keepRange, marker) {
        var _a;
        var self = this;
        function getCssSelector(element) {
            const options = {
                className: (str) => {
                    return _blacklistIdClassForCssSelectors.indexOf(str) < 0;
                },
                idName: (str) => {
                    return _blacklistIdClassForCssSelectors.indexOf(str) < 0;
                },
            };
            return cssselector2_1.uniqueCssSelector(element, self.delegate.iframes[0].contentDocument, options);
        }
        const selectionInfo = selection_1.getCurrentSelectionInfo(self.delegate.iframes[0].contentWindow, getCssSelector);
        if (selectionInfo) {
            if (this.options.onBeforeHighlight(selectionInfo) === true) {
                // Highlight color as string passthrough
                var createColor;
                createColor = this.getColor();
                if (TextHighlighter.isHexColor(createColor)) {
                    createColor = TextHighlighter.hexToRgbChannels(this.getColor());
                }
                var highlight = this.createHighlight(self.dom(self.delegate.iframes[0].contentDocument.body).getWindow(), selectionInfo, createColor, true, marker);
                this.options.onAfterHighlight(highlight, marker);
                if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableAnnotations) {
                    this.delegate.annotationModule.saveAnnotation(highlight, marker);
                }
            }
            if (!keepRange) {
                this.dom(this.delegate.iframes[0].contentDocument.body).removeAllRanges();
            }
        }
        else {
            if (!keepRange) {
                this.dom(this.delegate.iframes[0].contentDocument.body).removeAllRanges();
            }
        }
    }
    speak() {
        var _a, _b;
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
            var self = this;
            function getCssSelector(element) {
                const options = {
                    className: (str) => {
                        return _blacklistIdClassForCssSelectors.indexOf(str) < 0;
                    },
                    idName: (str) => {
                        return _blacklistIdClassForCssSelectors.indexOf(str) < 0;
                    },
                };
                return cssselector2_1.uniqueCssSelector(element, self.delegate.iframes[0].contentDocument, options);
            }
            const selectionInfo = selection_1.getCurrentSelectionInfo(self.delegate.iframes[0].contentWindow, getCssSelector);
            if (selectionInfo !== undefined) {
                // if (this.options.onBeforeHighlight(selectionInfo) === true) {
                //     var highlight = this.createHighlight(self.dom(self.el).getWindow(), selectionInfo,  TextHighlighter.hexToRgbString(this.getColor()),true, marker)
                //     this.options.onAfterHighlight(highlight, marker);
                // }
                this.delegate.ttsModule.speak(selectionInfo, true, () => { });
            }
            if ((_b = this.delegate.tts) === null || _b === void 0 ? void 0 : _b.enableSplitter) {
                const selection = self
                    .dom(self.delegate.iframes[0].contentDocument.body)
                    .getSelection();
                selection.removeAllRanges();
                var toolbox = document.getElementById("highlight-toolbox");
                toolbox.style.display = "none";
                this.selectionMenuClosed();
            }
        }
    }
    stopReadAloud() {
        var _a;
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
            this.doneSpeaking();
        }
    }
    speakAll() {
        var _a;
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
            var self = this;
            function getCssSelector(element) {
                const options = {
                    className: (str) => {
                        return _blacklistIdClassForCssSelectors.indexOf(str) < 0;
                    },
                    idName: (str) => {
                        return _blacklistIdClassForCssSelectors.indexOf(str) < 0;
                    },
                };
                return cssselector2_1.uniqueCssSelector(element, self.dom(self.delegate.iframes[0].contentDocument.body).getDocument(), options);
            }
            const selectionInfo = selection_1.getCurrentSelectionInfo(this.dom(this.delegate.iframes[0].contentDocument.body).getWindow(), getCssSelector);
            if (selectionInfo !== undefined) {
                self.speak();
            }
            else {
                var node = this.dom(self.delegate.iframes[0].contentDocument.body).getWindow().document.body;
                if (__1.IS_DEV)
                    console.log(self.delegate.iframes[0].contentDocument);
                const selection = self
                    .dom(self.delegate.iframes[0].contentDocument.body)
                    .getSelection();
                const range = this.dom(self.delegate.iframes[0].contentDocument.body)
                    .getWindow()
                    .document.createRange();
                range.selectNodeContents(node);
                selection.removeAllRanges();
                selection.addRange(range);
                const selectionInfo = selection_1.getCurrentSelectionInfo(this.delegate.iframes[0].contentWindow, getCssSelector);
                if (selectionInfo !== undefined && selectionInfo.cleanText) {
                    this.delegate.ttsModule.speak(selectionInfo, false, () => {
                        var selection = self
                            .dom(self.delegate.iframes[0].contentDocument.body)
                            .getSelection();
                        selection.removeAllRanges();
                        self.toolboxHide();
                    });
                }
                else {
                    self
                        .dom(self.delegate.iframes[0].contentDocument.body)
                        .getSelection()
                        .removeAllRanges();
                    self.toolboxHide();
                }
            }
        }
    }
    callbackComplete() {
        this.toolboxHide();
        this.dom(this.delegate.iframes[0].contentDocument.body).removeAllRanges();
    }
    doneSpeaking(reload = false) {
        var _a;
        if ((_a = this.delegate.rights) === null || _a === void 0 ? void 0 : _a.enableTTS) {
            this.toolboxHide();
            this.dom(this.delegate.iframes[0].contentDocument.body).removeAllRanges();
            this.delegate.ttsModule.cancel();
            if (reload) {
                this.delegate.reload();
            }
        }
    }
    /**
     * Normalizes highlights. Ensures that highlighting is done with use of the smallest possible number of
     * wrapping HTML elements.
     * Flattens highlights structure and merges sibling highlights. Normalizes text nodes within highlights.
     * @param {Array} highlights - highlights to normalize.
     * @returns {Array} - array of normalized highlights. Order and number of returned highlights may be different than
     * input highlights.
     * @memberof TextHighlighter
     */
    normalizeHighlights(highlights) {
        var normalizedHighlights;
        // this.flattenNestedHighlights(highlights);
        // this.mergeSiblingHighlights(highlights);
        // omit removed nodes
        normalizedHighlights = highlights.filter(function (hl) {
            return hl.parentElement ? hl : null;
        });
        normalizedHighlights = this.unique(normalizedHighlights);
        normalizedHighlights.sort(function (a, b) {
            return a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft;
        });
        return normalizedHighlights;
    }
    /**
     * Flattens highlights structure.
     * Note: this method changes input highlights - their order and number after calling this method may change.
     * @param {Array} highlights - highlights to flatten.
     * @memberof TextHighlighter
     */
    flattenNestedHighlights(highlights) {
        var again, self = this;
        self.sortByDepth(highlights, true);
        function flattenOnce() {
            var again = false;
            highlights.forEach(function (hl, i) {
                var parent = hl.parentElement, parentPrev = parent.previousSibling, parentNext = parent.nextSibling;
                if (self.isHighlight(parent)) {
                    if (!self.haveSameColor(parent, hl)) {
                        if (!hl.nextSibling) {
                            self.dom(hl).insertBefore(parentNext || parent);
                            again = true;
                        }
                        if (!hl.previousSibling) {
                            self.dom(hl).insertAfter(parentPrev || parent);
                            again = true;
                        }
                        if (!parent.hasChildNodes()) {
                            self.dom(parent).remove();
                        }
                    }
                    else {
                        parent.replaceChild(hl.firstChild, hl);
                        highlights[i] = parent;
                        again = true;
                    }
                }
            });
            return again;
        }
        do {
            again = flattenOnce();
        } while (again);
    }
    /**
     * Merges sibling highlights and normalizes descendant text nodes.
     * Note: this method changes input highlights - their order and number after calling this method may change.
     * @param highlights
     * @memberof TextHighlighter
     */
    mergeSiblingHighlights(highlights) {
        var self = this;
        function shouldMerge(current, node) {
            return (node &&
                node.nodeType === NODE_TYPE.ELEMENT_NODE &&
                self.haveSameColor(current, node) &&
                self.isHighlight(node));
        }
        highlights.forEach(function (highlight) {
            var prev = highlight.previousSibling, next = highlight.nextSibling;
            if (shouldMerge(highlight, prev)) {
                self.dom(highlight).prepend(prev.childNodes);
                self.dom(prev).remove();
            }
            if (shouldMerge(highlight, next)) {
                self.dom(highlight).append(next.childNodes);
                self.dom(next).remove();
            }
            self.dom(highlight).normalizeTextNodes();
        });
    }
    /**
     * Sets highlighting color.
     * @param {string} color - valid CSS color.
     * @memberof TextHighlighter
     */
    setColor(color) {
        this.options.color = color;
    }
    /**
     * Returns highlighting color.
     * @returns {string}
     * @memberof TextHighlighter
     */
    getColor() {
        return this.options.color;
    }
    /**
     * Returns highlights from given container.
     * @param params
     * @param {HTMLElement} [params.container] - return highlights from this element. Default: the element the
     * highlighter is applied to.
     * @param {boolean} [params.andSelf] - if set to true and container is a highlight itself, add container to
     * returned results. Default: true.
     * @param {boolean} [params.grouped] - if set to true, highlights are grouped in logical groups of highlights added
     * in the same moment. Each group is an object which has got array of highlights, 'toString' method and 'timestamp'
     * property. Default: false.
     * @returns {Array} - array of highlights.
     * @memberof TextHighlighter
     */
    getHighlights(params) {
        params = this.defaults(params, {
            container: this.delegate.iframes[0].contentDocument.body,
            andSelf: true,
            grouped: false,
        });
        var nodeList = params.container.querySelectorAll("[" + DATA_ATTR + "]"), highlights = Array.prototype.slice.call(nodeList);
        if (params.andSelf === true && params.container.hasAttribute(DATA_ATTR)) {
            highlights.push(params.container);
        }
        if (params.grouped) {
            highlights = this.groupHighlights(highlights);
        }
        return highlights;
    }
    /**
     * Returns true if element is a highlight.
     * All highlights have 'data-highlighted' attribute.
     * @param el - element to check.
     * @returns {boolean}
     * @memberof TextHighlighter
     */
    isHighlight(el) {
        return (el && el.nodeType === NODE_TYPE.ELEMENT_NODE && el.hasAttribute(DATA_ATTR));
    }
    /**
     * Serializes all highlights in the element the highlighter is applied to.
     * @returns {string} - stringified JSON with highlights definition
     * @memberof TextHighlighter
     */
    serializeHighlights() {
        var highlights = this.getHighlights(), refEl = this.delegate.iframes[0].contentDocument.body, hlDescriptors = [];
        function getElementPath(el, refElement) {
            var path = [], childNodes;
            do {
                childNodes = Array.prototype.slice.call(el.parentNode.childNodes);
                path.unshift(childNodes.indexOf(el));
                el = el.parentNode;
            } while (el !== refElement || !el);
            return path;
        }
        this.sortByDepth(highlights, false);
        highlights.forEach(function (highlight) {
            var offset = 0, // Hl offset from previous sibling within parent node.
            length = highlight.textContent.length, hlPath = getElementPath(highlight, refEl), wrapper = highlight.cloneNode(true);
            wrapper.innerHTML = "";
            wrapper = wrapper.outerHTML;
            if (highlight.previousSibling &&
                highlight.previousSibling.nodeType === NODE_TYPE.TEXT_NODE) {
                offset = highlight.previousSibling.length;
            }
            hlDescriptors.push([
                wrapper,
                highlight.textContent,
                hlPath.join(":"),
                offset,
                length,
            ]);
        });
        return JSON.stringify(hlDescriptors);
    }
    /**
     * Deserializes highlights.
     * @throws exception when can't parse JSON or JSON has invalid structure.
     * @param {object} json - JSON object with highlights definition.
     * @returns {Array} - array of deserialized highlights.
     * @memberof TextHighlighter
     */
    deserializeHighlights(json) {
        var hlDescriptors, highlights = [], self = this;
        if (!json) {
            return highlights;
        }
        try {
            hlDescriptors = JSON.parse(json);
        }
        catch (e) {
            throw "Can't parse JSON: " + e;
        }
        function deserializationFn(hlDescriptor) {
            var hl = {
                wrapper: hlDescriptor[0],
                text: hlDescriptor[1],
                path: hlDescriptor[2].split(":"),
                offset: hlDescriptor[3],
                length: hlDescriptor[4],
            }, elIndex = hl.path.pop(), node = self.delegate.iframes[0].contentDocument.body, hlNode, highlight, idx;
            while (!!(idx = hl.path.shift())) {
                node = node.childNodes[idx];
            }
            if (node.childNodes[elIndex - 1] &&
                node.childNodes[elIndex - 1].nodeType === NODE_TYPE.TEXT_NODE) {
                elIndex -= 1;
            }
            node = node.childNodes[elIndex];
            hlNode = node.splitText(hl.offset);
            hlNode.splitText(hl.length);
            if (hlNode.nextSibling && !hlNode.nextSibling.nodeValue) {
                self.dom(hlNode.nextSibling).remove();
            }
            if (hlNode.previousSibling && !hlNode.previousSibling.nodeValue) {
                self.dom(hlNode.previousSibling).remove();
            }
            highlight = self.dom(hlNode).wrap(self.dom().fromHTML(hl.wrapper)[0]);
            highlights.push(highlight);
        }
        hlDescriptors.forEach(function (hlDescriptor) {
            try {
                deserializationFn(hlDescriptor);
            }
            catch (e) {
                if (console && console.warn) {
                    console.warn("Can't deserialize highlight descriptor. Cause: " + e);
                }
            }
        });
        return highlights;
    }
    /**
     * Creates wrapper for highlights.
     * TextHighlighter instance calls this method each time it needs to create highlights and pass options retrieved
     * in constructor.
     * @returns {HTMLElement}
     * @memberof TextHighlighter
     * @static
     */
    createWrapper() {
        var span = document.createElement("mark");
        span.style.background =
            "linear-gradient(" +
                TextHighlighter.hexToRgbA(this.options.color) +
                ", " +
                TextHighlighter.hexToRgbA(this.options.color) +
                ")";
        span.className = this.options.highlightedClass;
        return span;
    }
    static isHexColor(hex) {
        return /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex);
    }
    static hexToRgbString(hex) {
        var c;
        c = hex.substring(1).split("");
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = "0x" + c.join("");
        return c;
    }
    static hexToRgbChannels(hex) {
        var c;
        if (this.isHexColor(hex)) {
            c = this.hexToRgbString(hex);
            return {
                red: (c >> 16) & 255,
                green: (c >> 8) & 255,
                blue: c & 255,
            };
        }
        throw new Error("Bad Hex");
    }
    static hexToRgbA(hex) {
        var c;
        if (this.isHexColor(hex)) {
            c = this.hexToRgbChannels(hex);
            return "rgba(" + [c.red, c.green, c.blue].join(",") + ",.5)";
        }
        throw new Error("Bad Hex");
    }
    static hexToRgbAWithOpacity(hex, opacity) {
        var c;
        if (this.isHexColor(hex)) {
            c = this.hexToRgbChannels(hex);
            return "rgba(" + [c.red, c.green, c.blue].join(",") + "," + opacity + ")";
        }
        throw new Error("Bad Hex");
    }
    resetHighlightBoundingStyle(_win, highlightBounding) {
        highlightBounding.style.outline = "none";
        highlightBounding.style.setProperty("background-color", "transparent", "important");
    }
    resetHighlightAreaStyle(_win, highlightArea) {
        const id = highlightArea.parentNode &&
            highlightArea.parentNode.nodeType === Node.ELEMENT_NODE &&
            highlightArea.parentNode.getAttribute
            ? highlightArea.parentNode.getAttribute("id")
            : undefined;
        if (id) {
            const highlight = exports._highlights.find((h) => {
                return h.id === id;
            });
            if (highlight) {
                if (highlight.marker === Locator_1.AnnotationMarker.Underline) {
                    // Highlight color as string check
                    if (typeof highlight.color === "object") {
                        highlightArea.style.setProperty("background-color", `rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${0})`, "important");
                        highlightArea.style.setProperty("border-bottom", `2px solid rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${1})`, "important");
                    }
                    else {
                        highlightArea.classList.remove("hover");
                    }
                }
                else {
                    // Highlight color as string check
                    if (typeof highlight.color === "object") {
                        highlightArea.style.setProperty("background-color", `rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${DEFAULT_BACKGROUND_COLOR_OPACITY})`, "important");
                    }
                    else {
                        highlightArea.classList.remove("hover");
                    }
                }
            }
        }
    }
    setHighlightAreaStyle(_win, highlightAreas, highlight) {
        for (const highlightArea of highlightAreas) {
            if (highlight.marker === Locator_1.AnnotationMarker.Underline) {
                // Highlight color as string check
                if (typeof highlight.color === "object") {
                    highlightArea.style.setProperty("background-color", `rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${0.1})`, "important");
                    highlightArea.style.setProperty("border-bottom", `2px solid rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${1})`, "important");
                }
                else {
                    highlightArea.classList.add("hover");
                }
            }
            else {
                // Highlight color as string check
                if (typeof highlight.color === "object") {
                    highlightArea.style.setProperty("background-color", `rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${ALT_BACKGROUND_COLOR_OPACITY})`, "important");
                }
                else {
                    highlightArea.classList.add("hover");
                }
            }
        }
    }
    setAndResetSearchHighlight(highlight, highlights) {
        const allHighlightAreas = Array.from(_highlightsContainer.querySelectorAll(`.${exports.CLASS_HIGHLIGHT_AREA}`));
        for (const highlighta of allHighlightAreas) {
            var highlightArea = highlighta;
            const id = highlightArea.parentNode &&
                highlightArea.parentNode.nodeType === Node.ELEMENT_NODE &&
                highlightArea.parentNode.getAttribute
                ? highlightArea.parentNode.getAttribute("id")
                : undefined;
            highlights.forEach((highlight) => {
                if (id === highlight.id) {
                    if (highlight) {
                        // Highlight color as string check
                        if (typeof highlight.color === "object") {
                            highlightArea.style.setProperty("background-color", `rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${DEFAULT_BACKGROUND_COLOR_OPACITY})`, "important");
                        }
                        else {
                            highlightArea.classList.remove("hover");
                        }
                    }
                }
            });
            if (id === highlight.id) {
                if (highlight) {
                    // Highlight color as string check
                    if (typeof highlight.color === "object") {
                        highlightArea.style.setProperty("background-color", `rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${DEFAULT_BACKGROUND_COLOR_OPACITY})`, "important");
                    }
                    else {
                        highlightArea.classList.remove("hover");
                    }
                }
            }
        }
    }
    isIOS() {
        // Second test is needed for iOS 13+
        return (navigator.userAgent.match(/iPhone|iPad|iPod/i) != null ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    }
    isAndroid() {
        return navigator.userAgent.match(/Android/i) != null;
    }
    processMouseEvent(win, ev) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const documant = win.document;
            // const scrollElement = getScrollingElement(documant);
            // relative to fixed window top-left corner
            // (unlike pageX/Y which is relative to top-left rendered content area, subject to scrolling)
            const x = ev.clientX;
            const y = ev.clientY;
            // const highlightsContainer = documant.getElementById(`${ID_HIGHLIGHTS_CONTAINER}`);
            if (!_highlightsContainer) {
                return;
            }
            const paginated = this.delegate.view.isPaginated();
            const bodyRect = documant.body.getBoundingClientRect();
            const scrollElement = this.getScrollingElement(documant);
            const xOffset = paginated ? -scrollElement.scrollLeft : bodyRect.left;
            const yOffset = paginated ? -scrollElement.scrollTop : bodyRect.top;
            let foundHighlight;
            let foundElement;
            // for (const highlight of _highlights) {
            for (let i = exports._highlights.length - 1; i >= 0; i--) {
                const highlight = exports._highlights[i];
                let highlightParent = documant.getElementById(`${highlight.id}`);
                if (!highlightParent) {
                    // ??!!
                    highlightParent = _highlightsContainer.querySelector(`#${highlight.id}`); // .${CLASS_HIGHLIGHT_CONTAINER}
                }
                if (!highlightParent) {
                    // what?
                    continue;
                }
                let hit = false;
                const highlightFragments = highlightParent.querySelectorAll(`.${exports.CLASS_HIGHLIGHT_AREA}`);
                for (const highlightFragment of highlightFragments) {
                    const withRect = highlightFragment;
                    const left = withRect.rect.left + xOffset; // (paginated ? withRect.xOffset : xOffset);
                    const top = withRect.rect.top + yOffset; // (paginated ? withRect.yOffset : yOffset);
                    if (x >= left &&
                        x < left + withRect.rect.width &&
                        y >= top &&
                        y < top + withRect.rect.height) {
                        hit = true;
                        break;
                    }
                }
                if (hit) {
                    foundHighlight = highlight;
                    foundElement = highlightParent;
                    break;
                }
            }
            if (!foundHighlight || !foundElement) {
                const highlightBoundings = _highlightsContainer.querySelectorAll(`.${exports.CLASS_HIGHLIGHT_BOUNDING_AREA}`);
                for (const highlightBounding of highlightBoundings) {
                    this.resetHighlightBoundingStyle(win, highlightBounding);
                }
                const allHighlightAreas = Array.from(_highlightsContainer.querySelectorAll(`.${exports.CLASS_HIGHLIGHT_AREA}`));
                for (const highlightArea of allHighlightAreas) {
                    this.resetHighlightAreaStyle(win, highlightArea);
                }
                return;
            }
            if (foundElement.getAttribute("data-click")) {
                if (ev.type === "mousemove" || ev.type === "touchmove") {
                    const foundElementHighlightAreas = Array.from(foundElement.querySelectorAll(`.${exports.CLASS_HIGHLIGHT_AREA}`));
                    const allHighlightAreas = _highlightsContainer.querySelectorAll(`.${exports.CLASS_HIGHLIGHT_AREA}`);
                    for (const highlightArea of allHighlightAreas) {
                        if (foundElementHighlightAreas.indexOf(highlightArea) < 0) {
                            this.resetHighlightAreaStyle(win, highlightArea);
                        }
                    }
                    this.setHighlightAreaStyle(win, foundElementHighlightAreas, foundHighlight);
                    const foundElementHighlightBounding = foundElement.querySelector(`.${exports.CLASS_HIGHLIGHT_BOUNDING_AREA}`);
                    const allHighlightBoundings = _highlightsContainer.querySelectorAll(`.${exports.CLASS_HIGHLIGHT_BOUNDING_AREA}`);
                    for (const highlightBounding of allHighlightBoundings) {
                        if (!foundElementHighlightBounding ||
                            highlightBounding !== foundElementHighlightBounding) {
                            this.resetHighlightBoundingStyle(win, highlightBounding);
                        }
                    }
                }
                else if (ev.type === "mouseup" ||
                    ev.type === "click" ||
                    ev.type === "touchup") {
                    const payload = {
                        highlight: foundHighlight,
                    };
                    if (__1.IS_DEV) {
                        console.log(payload);
                    }
                    var self = this;
                    var anno = (yield this.delegate.annotationModule.getAnnotation(payload.highlight));
                    // if(anno.comment) {
                    (_a = this.delegate.annotationModule.api) === null || _a === void 0 ? void 0 : _a.selectedAnnotation(anno).then(() => __awaiter(this, void 0, void 0, function* () { }));
                    if (__1.IS_DEV) {
                        console.log("selected highlight " + anno.id);
                    }
                    self.lastSelectedHighlight = anno.id;
                    // } else {
                    var toolbox = document.getElementById("highlight-toolbox");
                    // toolbox.style.top = ev.clientY + 74 + 'px';
                    toolbox.style.top =
                        ev.clientY + ((_c = (_b = this.delegate.attributes) === null || _b === void 0 ? void 0 : _b.navHeight) !== null && _c !== void 0 ? _c : 0) + "px";
                    toolbox.style.left = ev.clientX + "px";
                    if (getComputedStyle(toolbox).display === "none") {
                        toolbox.style.display = "block";
                        this.toolboxMode("edit");
                        var colorIcon = document.getElementById("colorIcon");
                        var highlightIcon = document.getElementById("highlightIcon");
                        // edhighlightIconitIcon.innerHTML = icons.highlight;
                        if (colorIcon) {
                            colorIcon.style.display = "none";
                        }
                        highlightIcon.style.display = "none";
                        // var commentIcon = document.getElementById("addCommentIcon");
                        // // commentIcon.innerHTML = icons.note;
                        // function addCommenH(){
                        //     // var position = parseInt((foundElement.childNodes[0] as HTMLDivElement).style.top.replace("px",""))
                        //     anno.comment = true
                        //     // self.delegate.api.addCommentToHighlight(anno, position).then(async () => {
                        //         if (IS_DEV) { console.log("add comment to existing highlight "+anno.id)}
                        //         toolbox.style.display = "none";
                        //         backdrop.style.display = "none";
                        //     // })
                        //     commentIcon.removeEventListener("click", addCommenH);
                        // }
                        // commentIcon.addEventListener("click", addCommenH);
                        function deleteH() {
                            self.delegate.annotationModule
                                .deleteSelectedHighlight(anno)
                                .then(() => __awaiter(this, void 0, void 0, function* () {
                                if (__1.IS_DEV) {
                                    console.log("delete highlight " + anno.id);
                                }
                                toolbox.style.display = "none";
                                self.selectionMenuClosed();
                            }));
                            deleteIcon.removeEventListener("click", deleteH);
                        }
                        var deleteIcon = document.getElementById("deleteIcon");
                        if (deleteIcon) {
                            deleteIcon.style.display = "unset";
                            deleteIcon.innerHTML = IconLib_1.icons.delete;
                            deleteIcon.addEventListener("click", deleteH);
                        }
                    }
                    else {
                        toolbox.style.display = "none";
                        this.selectionMenuClosed();
                        void toolbox.offsetWidth;
                        toolbox.style.display = "block";
                    }
                    // }
                }
            }
        });
    }
    ensureHighlightsContainer(win) {
        const documant = win.document;
        var self = this;
        if (!_highlightsContainer) {
            if (!bodyEventListenersSet) {
                bodyEventListenersSet = true;
                function mousedown(ev) {
                    return __awaiter(this, void 0, void 0, function* () {
                        lastMouseDownX = ev.clientX;
                        lastMouseDownY = ev.clientY;
                    });
                }
                function mouseup(ev) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (Math.abs(lastMouseDownX - ev.clientX) < 3 &&
                            Math.abs(lastMouseDownY - ev.clientY) < 3) {
                            self.processMouseEvent(win, ev);
                        }
                    });
                }
                function mousemove(ev) {
                    return __awaiter(this, void 0, void 0, function* () {
                        self.processMouseEvent(win, ev);
                    });
                }
                documant.body.addEventListener("mousedown", mousedown, false);
                documant.body.addEventListener("mouseup", mouseup, false);
                documant.body.addEventListener("mousemove", mousemove, false);
                documant.body.addEventListener("touchstart", mousedown, false);
                documant.body.addEventListener("touchend", mouseup, false);
                documant.body.addEventListener("touchmove", mousemove, false);
            }
            _highlightsContainer = documant.createElement("div");
            _highlightsContainer.setAttribute("id", exports.ID_HIGHLIGHTS_CONTAINER);
            _highlightsContainer.style.setProperty("pointer-events", "none");
            documant.body.append(_highlightsContainer);
        }
        return _highlightsContainer;
    }
    hideAllhighlights(_documant) {
        if (_highlightsContainer) {
            _highlightsContainer.remove();
            _highlightsContainer = null;
        }
    }
    destroyAllhighlights(documant) {
        this.hideAllhighlights(documant);
        exports._highlights.splice(0, exports._highlights.length);
    }
    destroyHighlight(documant, id) {
        let i = -1;
        const highlight = exports._highlights.find((h, j) => {
            i = j;
            return h.id === id;
        });
        if (highlight && i >= 0 && i < exports._highlights.length) {
            exports._highlights.splice(i, 1);
        }
        const highlightContainer = documant.getElementById(id);
        if (highlightContainer) {
            highlightContainer.remove();
        }
    }
    recreateAllHighlightsRaw(win) {
        this.hideAllhighlights(win.document);
        for (const highlight of exports._highlights) {
            this.createHighlightDom(win, highlight);
        }
    }
    recreateAllHighlights(win) {
        this.hideAllhighlights(win.document);
        this.recreateAllHighlightsDebounced(win);
    }
    createSearchHighlight(selectionInfo, color) {
        try {
            var createColor = color;
            if (TextHighlighter.isHexColor(createColor)) {
                createColor = TextHighlighter.hexToRgbChannels(createColor);
            }
            const uniqueStr = `${selectionInfo.rangeInfo.startContainerElementCssSelector}${selectionInfo.rangeInfo.startContainerChildTextNodeIndex}${selectionInfo.rangeInfo.startOffset}${selectionInfo.rangeInfo.endContainerElementCssSelector}${selectionInfo.rangeInfo.endContainerChildTextNodeIndex}${selectionInfo.rangeInfo.endOffset}`;
            const sha256Hex = SHA256_1.SHA256.hash(uniqueStr);
            const id = "R2_HIGHLIGHT_" + sha256Hex;
            this.destroyHighlight(this.delegate.iframes[0].contentDocument, id);
            var pointerInteraction = false;
            const highlight = {
                color: createColor ? createColor : DEFAULT_BACKGROUND_COLOR,
                id,
                pointerInteraction,
                selectionInfo,
                marker: Locator_1.AnnotationMarker.Highlight,
            };
            exports._highlights.push(highlight);
            let highlightDom = this.createHighlightDom(this.delegate.iframes[0].contentWindow, highlight);
            highlight.position = parseInt((highlightDom.hasChildNodes
                ? highlightDom.childNodes[0]
                : highlightDom).style.top.replace("px", ""));
            return highlight;
        }
        catch (e) {
            throw "Can't create highlight: " + e;
        }
    }
    createHighlight(win, selectionInfo, color, pointerInteraction, marker) {
        try {
            const uniqueStr = `${selectionInfo.rangeInfo.startContainerElementCssSelector}${selectionInfo.rangeInfo.startContainerChildTextNodeIndex}${selectionInfo.rangeInfo.startOffset}${selectionInfo.rangeInfo.endContainerElementCssSelector}${selectionInfo.rangeInfo.endContainerChildTextNodeIndex}${selectionInfo.rangeInfo.endOffset}`;
            // const unique = new Buffer(JSON.stringify(selectionInfo.rangeInfo, null, "")).toString("base64");
            // const unique = new Buffer(uniqueStr).toString("base64");
            // const id = "R2_HIGHLIGHT_" + unique.replace(/\+/, "_").replace(/=/, "-").replace(/\//, ".");
            const sha256Hex = SHA256_1.SHA256.hash(uniqueStr);
            const id = "R2_HIGHLIGHT_" + sha256Hex;
            this.destroyHighlight(win.document, id);
            const highlight = {
                color: color ? color : DEFAULT_BACKGROUND_COLOR,
                id,
                pointerInteraction,
                selectionInfo,
                marker: marker,
            };
            exports._highlights.push(highlight);
            let highlightDom = this.createHighlightDom(win, highlight);
            highlight.position = parseInt((highlightDom.hasChildNodes
                ? highlightDom.childNodes[0]
                : highlightDom).style.top.replace("px", ""));
            return highlight;
        }
        catch (e) {
            throw "Can't create highlight: " + e;
        }
    }
    createHighlightDom(win, highlight) {
        const documant = win.document;
        const range = selection_1.convertRangeInfo(documant, highlight.selectionInfo.rangeInfo);
        if (!range) {
            return undefined;
        }
        const highlightsContainer = this.ensureHighlightsContainer(win);
        const highlightParent = documant.createElement("div");
        highlightParent.setAttribute("id", highlight.id);
        highlightParent.setAttribute("class", exports.CLASS_HIGHLIGHT_CONTAINER);
        highlightParent.style.setProperty("pointer-events", "none");
        if (highlight.pointerInteraction) {
            highlightParent.setAttribute("data-click", "1");
        }
        const paginated = this.delegate.view.isPaginated();
        // Resize Sensor sets body position to "relative" (default static),
        // which may breaks things!
        // (e.g. highlights CSS absolute/fixed positioning)
        // Also note that ReadiumCSS default to (via stylesheet :root):
        if (paginated) {
            documant.body.style.position = "revert";
        }
        else {
            documant.body.style.position = "relative";
        }
        const bodyRect = documant.body.getBoundingClientRect();
        const scrollElement = this.getScrollingElement(documant);
        const xOffset = paginated ? -scrollElement.scrollLeft : bodyRect.left;
        const yOffset = paginated ? -scrollElement.scrollTop : bodyRect.top;
        const scale = 1;
        const drawUnderline = false;
        const drawStrikeThrough = false;
        const doNotMergeHorizontallyAlignedRects = drawUnderline || drawStrikeThrough;
        const clientRects = rect_utils_1.getClientRectsNoOverlap(range, doNotMergeHorizontallyAlignedRects);
        const roundedCorner = 3;
        const underlineThickness = 2;
        const strikeThroughLineThickness = 3;
        for (const clientRect of clientRects) {
            const opacity = DEFAULT_BACKGROUND_COLOR_OPACITY;
            const highlightArea = documant.createElement("div");
            highlightArea.setAttribute("class", exports.CLASS_HIGHLIGHT_AREA);
            highlightArea.dataset.marker = "" + highlight.marker;
            let extra = "";
            if (drawUnderline) {
                extra += `border-bottom: ${underlineThickness * scale}px solid rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${opacity}) !important`;
            }
            if (highlight.marker === Locator_1.AnnotationMarker.Underline) {
                // Highlight color as string check
                if (typeof highlight.color === "object") {
                    highlightArea.setAttribute("style", `mix-blend-mode: multiply; border-radius: ${roundedCorner}px !important; background-color: rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${0}) !important; ${extra}`);
                    highlightArea.style.setProperty("border-bottom", `2px solid rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${1})`, "important");
                }
                else {
                    highlightArea.setAttribute("style", `border-radius: ${roundedCorner}px !important; ${extra}`);
                }
            }
            else {
                // Highlight color as string check
                if (typeof highlight.color === "object") {
                    highlightArea.setAttribute("style", `mix-blend-mode: multiply; border-radius: ${roundedCorner}px !important; background-color: rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${opacity}) !important; ${extra}`);
                }
                else {
                    highlightArea.setAttribute("style", `border-radius: ${roundedCorner}px !important; ${extra}`);
                }
            }
            highlightArea.style.setProperty("pointer-events", "none");
            highlightArea.style.position = "absolute";
            highlightArea.scale = scale;
            highlightArea.rect = {
                height: clientRect.height,
                left: clientRect.left - xOffset,
                top: clientRect.top - yOffset,
                width: clientRect.width,
            };
            highlightArea.style.width = `${highlightArea.rect.width * scale}px`;
            highlightArea.style.height = `${highlightArea.rect.height * scale}px`;
            highlightArea.style.left = `${highlightArea.rect.left * scale}px`;
            highlightArea.style.top = `${highlightArea.rect.top * scale}px`;
            highlightParent.append(highlightArea);
            if (drawStrikeThrough) {
                const highlightAreaLine = documant.createElement("div");
                highlightAreaLine.setAttribute("class", exports.CLASS_HIGHLIGHT_AREA);
                highlightAreaLine.setAttribute("style", `background-color: rgba(${highlight.color.red}, ${highlight.color.green}, ${highlight.color.blue}, ${opacity}) !important;`);
                highlightAreaLine.style.setProperty("pointer-events", "none");
                highlightAreaLine.style.position = "absolute";
                highlightAreaLine.scale = scale;
                highlightAreaLine.rect = {
                    height: clientRect.height,
                    left: clientRect.left - xOffset,
                    top: clientRect.top - yOffset,
                    width: clientRect.width,
                };
                highlightAreaLine.style.width = `${highlightAreaLine.rect.width * scale}px`;
                highlightAreaLine.style.height = `${strikeThroughLineThickness * scale}px`;
                highlightAreaLine.style.left = `${highlightAreaLine.rect.left * scale}px`;
                highlightAreaLine.style.top = `${(highlightAreaLine.rect.top +
                    highlightAreaLine.rect.height / 2 -
                    strikeThroughLineThickness / 2) *
                    scale}px`;
                highlightParent.append(highlightAreaLine);
            }
        }
        const rangeBoundingClientRect = range.getBoundingClientRect();
        const highlightBounding = documant.createElement("div");
        highlightBounding.setAttribute("class", exports.CLASS_HIGHLIGHT_BOUNDING_AREA);
        highlightBounding.style.setProperty("pointer-events", "none");
        highlightBounding.style.position = "absolute";
        highlightBounding.scale = scale;
        highlightBounding.rect = {
            height: rangeBoundingClientRect.height,
            left: rangeBoundingClientRect.left - xOffset,
            top: rangeBoundingClientRect.top - yOffset,
            width: rangeBoundingClientRect.width,
        };
        highlightBounding.style.width = `${highlightBounding.rect.width * scale}px`;
        highlightBounding.style.height = `${highlightBounding.rect.height * scale}px`;
        highlightBounding.style.left = `${highlightBounding.rect.left * scale}px`;
        highlightBounding.style.top = `${highlightBounding.rect.top * scale}px`;
        highlightParent.append(highlightBounding);
        highlightsContainer.append(highlightParent);
        return highlightParent;
    }
}
exports.default = TextHighlighter;
//# sourceMappingURL=TextHighlighter.js.map