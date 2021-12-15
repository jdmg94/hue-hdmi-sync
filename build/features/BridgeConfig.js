"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _regeneratorRuntime = _interopRequireDefault(require("regenerator-runtime"));
var _ink = require("ink");
var _inkSpinner = _interopRequireDefault(require("ink-spinner"));
var _reactRouter = require("react-router");
var _react = _interopRequireWildcard(require("react"));
var _status = require("../types/Status");
var _hueBridge = require("../context/hueBridge");
var _hue = require("../services/hue");
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
var isChristmas = function() {
    var today = new Date();
    return today.getMonth() === 11 && today.getDate() === 25;
};
var BridgeConfig = function() {
    var ref = (0, _hueBridge).useBridgeContext(), dispatch = ref.dispatch, bridgeNetworkDevice = ref.state.bridgeNetworkDevice;
    var navigate = (0, _reactRouter).useNavigate();
    var ref1 = _slicedToArray((0, _react).useState(_status.Status.IDLE), 2), status = ref1[0], updateStatus = ref1[1];
    var ref2 = _slicedToArray((0, _react).useState(false), 2), needsCredentials = ref2[0], updateCredentialNeeds = ref2[1];
    var submitCredentials = function(credentials) {
        dispatch({
            payload: credentials,
            type: _hueBridge.SET_CREDENTIALS
        });
        navigate("/light-groups");
    };
    (0, _react).useEffect(function() {
        function retrieveCredentials() {
            return _retrieveCredentials.apply(this, arguments);
        }
        function _retrieveCredentials() {
            _retrieveCredentials = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
                var savedCredentials;
                return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                    while(1)switch(_ctx.prev = _ctx.next){
                        case 0:
                            _ctx.next = 2;
                            return (0, _hue).getRegisteredCredentials();
                        case 2:
                            savedCredentials = _ctx.sent;
                            if (!savedCredentials) {
                                updateCredentialNeeds(true);
                            } else {
                                submitCredentials(savedCredentials);
                            }
                        case 4:
                        case "end":
                            return _ctx.stop();
                    }
                }, _callee);
            }));
            return _retrieveCredentials.apply(this, arguments);
        }
        retrieveCredentials();
    }, []);
    (0, _react).useEffect(function() {
        if (needsCredentials) {
            var interval = setInterval(function() {
                (0, _hue).requestAppRegisterOnBridge(bridgeNetworkDevice.internalipaddress).then(_asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(response) {
                    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                        while(1)switch(_ctx.prev = _ctx.next){
                            case 0:
                                clearInterval(interval);
                                _ctx.next = 3;
                                return (0, _hue).persistNewCredentials(response);
                            case 3:
                                submitCredentials(response);
                            case 4:
                            case "end":
                                return _ctx.stop();
                        }
                    }, _callee);
                }))).catch(function() {
                });
            }, 3000) // #NOTE: check every 3 seconds
            ;
            setTimeout(function() {
                clearInterval(interval);
                updateCredentialNeeds(false);
                updateStatus(_status.Status.ERROR);
            }, 30000) // #NOTE: timeout at 30 seconds
            ;
        }
    }, [
        needsCredentials
    ]);
    if (status === _status.Status.ERROR) return(/*#__PURE__*/ _react.default.createElement(_ink.Text, {
        color: "red"
    }, "link button not pressed, please try again"));
    return(/*#__PURE__*/ _react.default.createElement(_ink.Text, null, /*#__PURE__*/ _react.default.createElement(_ink.Text, {
        color: "green"
    }, /*#__PURE__*/ _react.default.createElement(_inkSpinner.default, {
        type: isChristmas() ? "christmas" : "dots"
    })), /*#__PURE__*/ _react.default.createElement(_ink.Text, null, " "), /*#__PURE__*/ _react.default.createElement(_ink.Text, null, !needsCredentials ? "Checking " : "Push the link button on Hue Bridge")));
};
var _default = BridgeConfig;
exports.default = _default;
