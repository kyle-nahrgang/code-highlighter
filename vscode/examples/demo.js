"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greet = greet;
exports.sum = sum;
exports.warn = warn;
function secretFromEnv(name) {
    // !important:red
    return process.env[name];
    // !important
}
function greet(name) {
    // !important
    const message = `hello ${name}`;
    return message;
    // !important
}
function sum(values) {
    // !important:#22a05a
    return values.reduce((total, value) => total + value, 0);
    // !important
}
function warn() {
    const url = "https://example.com"; // not a marker
    console.log(url);
}
//# sourceMappingURL=demo.js.map