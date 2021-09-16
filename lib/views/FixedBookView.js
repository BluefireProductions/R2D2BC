"use strict";
/*
 * Copyright 2018-2021 DITA (AM Consulting LLC)
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
 * Licensed to: CAST under one or more contributor license agreements.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class FixedBookView {
    constructor(_store) {
        this.layout = "fixed";
        this.sideMargin = 20;
        this.height = 0;
        this.attributes = { margin: 0 };
    }
    start() { }
    stop() { }
    getCurrentPosition() {
        return 0;
    }
    goToPosition(_position) { }
    goToCssSelector(_cssSelector, _relative) { }
    goToFragment(_fragment, _relative) { }
    snap(_element, _relative) { }
    getCurrentPage() {
        return 0;
    }
    getPageCount() {
        return 1;
    }
}
exports.default = FixedBookView;
//# sourceMappingURL=FixedBookView.js.map