"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setGroupStreamingMode = exports.getBridgeState = exports.getBridgeLights = exports.getBridgeGroups = exports.getBridgeConfig = exports.clearPersistedCredentials = exports.getRegisteredCredentials = exports.persistNewCredentials = exports.requestAppRegisterOnBridge = exports.discoverHueBridges = void 0;
var _regeneratorRuntime = _interopRequireDefault(require("regenerator-runtime"));
var _unfetch = _interopRequireDefault(require("unfetch"));
var _filesystem = require("./filesystem");
function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
var BridgeClientCredentialsPath = "./hue-bridge-client-credentials.json";
var discoverHueBridges = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
    var response, data;
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                _ctx.next = 2;
                return (0, _unfetch).default("https://discovery.meethue.com/");
            case 2:
                response = _ctx.sent;
                _ctx.next = 5;
                return response.json();
            case 5:
                data = _ctx.sent;
                return _ctx.abrupt("return", data || []);
            case 7:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
exports.discoverHueBridges = discoverHueBridges;
var requestAppRegisterOnBridge = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(url) {
    var endpoint, body, response, ref, ref1, error, success;
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                endpoint = "http://".concat(url, "/api");
                body = JSON.stringify({
                    devicetype: "huehdmisync",
                    generateclientkey: true
                });
                _ctx.next = 4;
                return (0, _unfetch).default(endpoint, {
                    body: body,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            case 4:
                response = _ctx.sent;
                _ctx.t0 = _slicedToArray;
                _ctx.next = 8;
                return response.json();
            case 8:
                _ctx.t1 = _ctx.sent;
                ref = (0, _ctx.t0)(_ctx.t1, 1);
                ref1 = ref[0];
                error = ref1.error;
                success = ref1.success;
                if (!error) {
                    _ctx.next = 15;
                    break;
                }
                throw error;
            case 15:
                return _ctx.abrupt("return", success);
            case 16:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
exports.requestAppRegisterOnBridge = requestAppRegisterOnBridge;
var persistNewCredentials = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(data) {
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                _ctx.prev = 0;
                _ctx.next = 3;
                return (0, _filesystem).writeFile(BridgeClientCredentialsPath, JSON.stringify(data));
            case 3:
                return _ctx.abrupt("return", true);
            case 6:
                _ctx.prev = 6;
                _ctx.t0 = _ctx["catch"](0);
                return _ctx.abrupt("return", false);
            case 9:
            case "end":
                return _ctx.stop();
        }
    }, _callee, null, [
        [
            0,
            6
        ]
    ]);
}));
exports.persistNewCredentials = persistNewCredentials;
var getRegisteredCredentials = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
    var clientData;
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                _ctx.prev = 0;
                _ctx.next = 3;
                return (0, _filesystem).access(BridgeClientCredentialsPath);
            case 3:
                _ctx.next = 5;
                return (0, _filesystem).readFile(BridgeClientCredentialsPath, {
                    encoding: "utf8"
                });
            case 5:
                clientData = _ctx.sent;
                return _ctx.abrupt("return", JSON.parse(clientData));
            case 9:
                _ctx.prev = 9;
                _ctx.t0 = _ctx["catch"](0);
                return _ctx.abrupt("return", null);
            case 12:
            case "end":
                return _ctx.stop();
        }
    }, _callee, null, [
        [
            0,
            9
        ]
    ]);
}));
exports.getRegisteredCredentials = getRegisteredCredentials;
var clearPersistedCredentials = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                _ctx.prev = 0;
                _ctx.next = 3;
                return (0, _filesystem).access(BridgeClientCredentialsPath);
            case 3:
                _ctx.next = 5;
                return (0, _filesystem).removeFile(BridgeClientCredentialsPath, {
                });
            case 5:
                _ctx.next = 9;
                break;
            case 7:
                _ctx.prev = 7;
                _ctx.t0 = _ctx["catch"](0);
            case 9:
            case "end":
                return _ctx.stop();
        }
    }, _callee, null, [
        [
            0,
            7
        ]
    ]);
}));
exports.clearPersistedCredentials = clearPersistedCredentials;
var getBridgeConfig = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(url) {
    var endpoint, response, data;
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                endpoint = "http://".concat(url, "/api/config");
                _ctx.next = 3;
                return (0, _unfetch).default(endpoint);
            case 3:
                response = _ctx.sent;
                if (!(response.status === 200)) {
                    _ctx.next = 9;
                    break;
                }
                _ctx.next = 7;
                return response.json();
            case 7:
                data = _ctx.sent;
                return _ctx.abrupt("return", data);
            case 9:
                return _ctx.abrupt("return", null);
            case 10:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
exports.getBridgeConfig = getBridgeConfig;
var getBridgeGroups = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(url, credentials) {
    var endpoint, response, data;
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                endpoint = "http://".concat(url, "/api/").concat(credentials.username, "/groups");
                _ctx.next = 3;
                return (0, _unfetch).default(endpoint);
            case 3:
                response = _ctx.sent;
                _ctx.next = 6;
                return response.json();
            case 6:
                data = _ctx.sent;
                return _ctx.abrupt("return", data);
            case 8:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
exports.getBridgeGroups = getBridgeGroups;
var getBridgeLights = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(url, credentials) {
    var endpoint, response, data;
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                endpoint = "http://".concat(url, "/api/").concat(credentials.username, "/lights");
                _ctx.next = 3;
                return (0, _unfetch).default(endpoint);
            case 3:
                response = _ctx.sent;
                _ctx.next = 6;
                return response.json();
            case 6:
                data = _ctx.sent;
                return _ctx.abrupt("return", data);
            case 8:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
exports.getBridgeLights = getBridgeLights;
var getBridgeState = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(url, credentials) {
    var endpoint, response, data;
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                endpoint = "http://".concat(url, "/api/").concat(credentials.username);
                _ctx.next = 3;
                return (0, _unfetch).default(endpoint);
            case 3:
                response = _ctx.sent;
                _ctx.next = 6;
                return response.json();
            case 6:
                data = _ctx.sent;
                _ctx.t0 = console;
                _ctx.next = 10;
                return getBridgeLights(url, credentials);
            case 10:
                _ctx.t1 = _ctx.sent;
                _ctx.t0.log.call(_ctx.t0, _ctx.t1);
                return _ctx.abrupt("return", data);
            case 13:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
exports.getBridgeState = getBridgeState;
var setGroupStreamingMode = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(url, credentials, groupId) {
    var active, body, endpoint, response, data, _args = arguments;
    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
        while(1)switch(_ctx.prev = _ctx.next){
            case 0:
                active = _args.length > 3 && _args[3] !== void 0 ? _args[3] : true;
                body = JSON.stringify({
                    stream: {
                        active: active
                    }
                });
                endpoint = "http://".concat(url, "/api/").concat(credentials.username, "/groups/").concat(groupId);
                _ctx.next = 5;
                return (0, _unfetch).default(endpoint, {
                    body: body,
                    method: "PUT"
                });
            case 5:
                response = _ctx.sent;
                _ctx.next = 8;
                return response.json();
            case 8:
                data = _ctx.sent;
                console.log("data");
            case 10:
            case "end":
                return _ctx.stop();
        }
    }, _callee);
}));
exports.setGroupStreamingMode = setGroupStreamingMode;
