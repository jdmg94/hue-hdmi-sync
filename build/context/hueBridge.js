"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.useBridgeContext = exports.BridgeDataProvider = exports.SET_BRIDGE_CONFIG = exports.SET_lIGHT_GROUP = exports.SET_CREDENTIALS = exports.SET_BRIDGE = void 0;
var _react = _interopRequireWildcard(require("react"));
function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {
        };
        if (obj != null) {
            for(var key in obj){
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {
                    };
                    if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
        }
        newObj.default = obj;
        return newObj;
    }
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
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {
        };
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty(target, key, source[key]);
        });
    }
    return target;
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
var initialState = {
    credentials: null,
    bridgeConfig: null,
    bridgeNetworkDevice: null,
    selectedEntertainmentGroup: null
};
var SET_BRIDGE = "SET_BRIDGE";
exports.SET_BRIDGE = SET_BRIDGE;
var SET_CREDENTIALS = "SET_CREDENTIALS";
exports.SET_CREDENTIALS = SET_CREDENTIALS;
var SET_lIGHT_GROUP = "SET_lIGHT_GROUP";
exports.SET_lIGHT_GROUP = SET_lIGHT_GROUP;
var SET_BRIDGE_CONFIG = "SET_BRIDGE_CONFIG";
exports.SET_BRIDGE_CONFIG = SET_BRIDGE_CONFIG;
var _obj;
var reducer = function() {
    var state = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : initialState, action = arguments.length > 1 ? arguments[1] : void 0;
    var nextState = (_obj = {
    }, _defineProperty(_obj, SET_CREDENTIALS, function() {
        var payload = action.payload;
        return _objectSpread({
        }, state, {
            credentials: payload
        });
    }), _defineProperty(_obj, SET_lIGHT_GROUP, function() {
        var payload = action.payload;
        return _objectSpread({
        }, state, {
            selectedEntertainmentGroup: payload
        });
    }), _defineProperty(_obj, SET_BRIDGE, function() {
        var payload = action.payload;
        return _objectSpread({
        }, state, {
            bridgeNetworkDevice: payload
        });
    }), _defineProperty(_obj, SET_BRIDGE_CONFIG, function() {
        var payload = action.payload;
        return _objectSpread({
        }, state, {
            bridgeConfig: payload
        });
    }), _obj)[action.type];
    return (nextState === null || nextState === void 0 ? void 0 : nextState()) || state;
};
var BridgeDataContext = /*#__PURE__*/ (0, _react).createContext(null);
var BridgeDataProvider = function(param) {
    var children = param.children;
    var ref = _slicedToArray((0, _react).useReducer(reducer, initialState), 2), state = ref[0], dispatch = ref[1];
    return(/*#__PURE__*/ _react.default.createElement(BridgeDataContext.Provider, {
        value: {
            state: state,
            dispatch: dispatch
        }
    }, children));
};
exports.BridgeDataProvider = BridgeDataProvider;
var useBridgeContext = function() {
    return (0, _react).useContext(BridgeDataContext);
};
exports.useBridgeContext = useBridgeContext;
