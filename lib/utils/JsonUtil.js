"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaJsonSerialize = exports.TaJsonDeserialize = void 0;
const ta_json_x_1 = require("ta-json-x");
function TaJsonDeserialize(json, type) {
    return ta_json_x_1.TaJson.deserialize(json, type);
}
exports.TaJsonDeserialize = TaJsonDeserialize;
function TaJsonSerialize(obj) {
    return ta_json_x_1.TaJson.serialize(obj);
}
exports.TaJsonSerialize = TaJsonSerialize;
//# sourceMappingURL=JsonUtil.js.map