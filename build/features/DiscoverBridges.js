"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _regeneratorRuntime = _interopRequireDefault(require("regenerator-runtime"));
var _ink = require("ink");
var _inkSpinner = _interopRequireDefault(require("ink-spinner"));
var _inkSelectInput = _interopRequireDefault(require("ink-select-input"));
var _reactRouter = require("react-router");
var _react = _interopRequireWildcard(require("react"));
var _status = require("../types/Status");
var _hue = require("../services/hue");
var _hueBridge = require("../context/hueBridge");
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
var MIN_HUE_API_VERSION = 1.22;
var DiscoverBridges = function() {
    var navigate = (0, _reactRouter).useNavigate();
    var dispatch = (0, _hueBridge).useBridgeContext().dispatch;
    var ref = _slicedToArray((0, _react).useState(_status.Status.IDLE), 2), status = ref[0], updateStatus = ref[1];
    var ref1 = _slicedToArray((0, _react).useState([]), 2), bridges = ref1[0], setBridges = ref1[1];
    var ref2 = _slicedToArray((0, _react).useState("Something went wrong, please try again later"), 2), errorMessage = ref2[0], setErrorMessage = ref2[1];
    var submitBridgeSelection = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(bridge) {
        var config, currentAPIVersion;
        return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                    _ctx.next = 2;
                    return (0, _hue).getBridgeConfig(bridge.internalipaddress);
                case 2:
                    config = _ctx.sent;
                    currentAPIVersion = Number.parseFloat(config.apiversion);
                    if (currentAPIVersion > MIN_HUE_API_VERSION) {
                        dispatch({
                            payload: config,
                            type: _hueBridge.SET_BRIDGE_CONFIG
                        });
                        dispatch({
                            type: _hueBridge.SET_BRIDGE,
                            payload: bridge
                        });
                        navigate("/setup");
                    } else {
                        setErrorMessage("Bridge API version too old (".concat(currentAPIVersion, "), the minimum API version is ").concat(MIN_HUE_API_VERSION, ", please update your bridge throught the Hue App"));
                        updateStatus(_status.Status.ERROR);
                    }
                case 5:
                case "end":
                    return _ctx.stop();
            }
        }, _callee);
    }));
    (0, _react).useEffect(function() {
        function yahoo() {
            return _yahoo.apply(this, arguments);
        }
        function _yahoo() {
            _yahoo = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
                var buffer;
                return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                    while(1)switch(_ctx.prev = _ctx.next){
                        case 0:
                            _ctx.prev = 0;
                            updateStatus(_status.Status.LOADING);
                            _ctx.next = 4;
                            return (0, _hue).discoverHueBridges();
                        case 4:
                            buffer = _ctx.sent;
                            if ((buffer === null || buffer === void 0 ? void 0 : buffer.length) === 1) {
                                submitBridgeSelection(buffer[0]);
                            } else {
                                setBridges(buffer);
                                updateStatus(_status.Status.DONE);
                            }
                            _ctx.next = 11;
                            break;
                        case 8:
                            _ctx.prev = 8;
                            _ctx.t0 = _ctx["catch"](0);
                            updateStatus(_status.Status.ERROR);
                        case 11:
                        case "end":
                            return _ctx.stop();
                    }
                }, _callee, null, [
                    [
                        0,
                        8
                    ]
                ]);
            }));
            return _yahoo.apply(this, arguments);
        }
        yahoo();
    }, []);
    if (status === _status.Status.IDLE) {
        return(/*#__PURE__*/ _react.default.createElement(_ink.Text, null, "Loading..."));
    }
    if (status === _status.Status.LOADING) {
        return(/*#__PURE__*/ _react.default.createElement(_ink.Text, null, /*#__PURE__*/ _react.default.createElement(_ink.Text, {
            color: "green"
        }, /*#__PURE__*/ _react.default.createElement(_inkSpinner.default, {
            type: "dots"
        })), /*#__PURE__*/ _react.default.createElement(_ink.Text, null, " Looking for Hue Bridge(s) on the local network")));
    }
    if (status === _status.Status.ERROR) {
        return(/*#__PURE__*/ _react.default.createElement(_ink.Text, {
            color: "red"
        }, errorMessage));
    }
    if (status === _status.Status.DONE && bridges.length === 0) {
        return(/*#__PURE__*/ _react.default.createElement(_ink.Text, {
            color: "yellow"
        }, "No Hue Bridges Found!"));
    }
    return(/*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/ _react.default.createElement(_ink.Text, null, "Multiple Hue Bridges found! Select one below:"), /*#__PURE__*/ _react.default.createElement(_inkSelectInput.default, {
        onSelect: function(item) {
            return submitBridgeSelection(item.value);
        },
        items: bridges.map(function(item) {
            return {
                value: item,
                label: "".concat(item.id, "@").concat(item.internalipaddress)
            };
        })
    })));
};
var _default = DiscoverBridges;
exports.default = _default;
