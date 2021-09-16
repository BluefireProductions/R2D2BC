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
exports.sameSelections = exports.sameRanges = void 0;
const __1 = require("../../..");
function sameRanges(r1, r2) {
    if (!r1 || !r2) {
        return false;
    }
    if (r1.startContainerElementCssSelector !== r2.startContainerElementCssSelector) {
        return false;
    }
    if (r1.startContainerChildTextNodeIndex !== r2.startContainerChildTextNodeIndex) {
        return false;
    }
    if (r1.startOffset !== r2.startOffset) {
        return false;
    }
    if (r1.endContainerElementCssSelector !== r2.endContainerElementCssSelector) {
        return false;
    }
    if (r1.endContainerChildTextNodeIndex !== r2.endContainerChildTextNodeIndex) {
        return false;
    }
    return r1.endOffset === r2.endOffset;
}
exports.sameRanges = sameRanges;
function sameSelections(sel1, sel2) {
    if (!sel1 || !sel2) {
        return false;
    }
    if (!sameRanges(sel1.rangeInfo, sel2.rangeInfo)) {
        return false;
    }
    if (sel1.cleanText !== sel2.cleanText) {
        if (__1.IS_DEV) {
            console.log("SAME RANGES BUT DIFFERENT CLEAN TEXT??");
        }
        return false;
    }
    if (sel1.rawText !== sel2.rawText) {
        if (__1.IS_DEV) {
            console.log("SAME RANGES BUT DIFFERENT RAW TEXT??");
        }
        return false;
    }
    return true;
}
exports.sameSelections = sameSelections;
//# sourceMappingURL=selection.js.map