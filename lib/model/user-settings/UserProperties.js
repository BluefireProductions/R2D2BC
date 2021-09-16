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
 * Developed on behalf of: CAST (http://www.cast.org)
 * Licensed to: Bokbasen AS and CAST under one or more contributor license agreements.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProperties = exports.Switchable = exports.Incremental = exports.Enumerable = exports.JSONable = exports.Stringable = exports.UserProperty = void 0;
class UserProperty {
    json() {
        return JSON.stringify(this);
    }
}
exports.UserProperty = UserProperty;
class Stringable extends UserProperty {
    constructor(value, ref, name) {
        super();
        this.value = value;
        this.ref = ref;
        this.name = name;
    }
    toString() {
        return this.value;
    }
}
exports.Stringable = Stringable;
class JSONable extends UserProperty {
    constructor(value, ref, name) {
        super();
        this.value = value;
        this.ref = ref;
        this.name = name;
    }
    toString() {
        return this.value;
    }
    toJson() {
        return JSON.parse(this.value);
    }
}
exports.JSONable = JSONable;
class Enumerable extends UserProperty {
    constructor(value, values, ref, name) {
        super();
        this.value = value;
        this.values = values;
        this.ref = ref;
        this.name = name;
    }
    toString() {
        return this.values[this.value];
    }
}
exports.Enumerable = Enumerable;
class Incremental extends UserProperty {
    constructor(value, min, max, step, suffix, ref, name) {
        super();
        this.value = value;
        this.min = min;
        this.max = max;
        this.step = step;
        this.suffix = suffix;
        this.ref = ref;
        this.name = name;
    }
    toString() {
        return this.value.toString() + this.suffix;
    }
    increment() {
        if (this.value <= this.max) {
            this.value += this.step;
        }
    }
    decrement() {
        if (this.value >= this.min) {
            this.value -= this.step;
        }
    }
}
exports.Incremental = Incremental;
class Switchable extends UserProperty {
    constructor(onValue, offValue, value, ref, name) {
        super();
        this.value = value;
        this.onValue = onValue;
        this.offValue = offValue;
        this.ref = ref;
        this.name = name;
    }
    toString() {
        return this.value ? this.onValue : this.offValue;
    }
    switch() {
        this.value = !this.value;
    }
}
exports.Switchable = Switchable;
class UserProperties {
    constructor() {
        this.properties = [];
    }
    addIncremental(nValue, min, max, step, suffix, ref, key) {
        this.properties.push(new Incremental(nValue, min, max, step, suffix, ref, key));
    }
    addStringable(nValue, ref, key) {
        this.properties.push(new Stringable(nValue, ref, key));
    }
    addJSONable(nValue, ref, key) {
        this.properties.push(new JSONable(nValue, ref, key));
    }
    addSwitchable(onValue, offValue, on, ref, key) {
        this.properties.push(new Switchable(onValue, offValue, on, ref, key));
    }
    addEnumerable(index, values, ref, key) {
        this.properties.push(new Enumerable(index, values, ref, key));
    }
    getByRef(ref) {
        let result = this.properties.filter((el) => el.ref === ref);
        if (result.length > 0) {
            return result[0];
        }
        return null;
    }
    getByKey(key) {
        let result = this.properties.filter((el) => el.key === key);
        if (result.length > 0) {
            return result[0];
        }
        return null;
    }
}
exports.UserProperties = UserProperties;
//# sourceMappingURL=UserProperties.js.map