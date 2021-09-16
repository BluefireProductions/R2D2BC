"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
/**
 *
 * Timer function that you can 'await' on
 */
function delay(t, v) {
    return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, v), t);
    });
}
exports.delay = delay;
//# sourceMappingURL=index.js.map