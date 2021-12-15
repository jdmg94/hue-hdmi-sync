"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactRouter = require("react-router");
var _header = _interopRequireDefault(require("./components/Header"));
var _bridgeConfig = _interopRequireDefault(require("./features/BridgeConfig"));
var _lightsConfig = _interopRequireDefault(require("./features/LightsConfig"));
var _hueBridge = require("./context/hueBridge");
var _discoverBridges = _interopRequireDefault(require("./features/DiscoverBridges"));
var _entertainmentGroups = _interopRequireDefault(require("./features/EntertainmentGroups"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var App = function() {
    return(/*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/ _react.default.createElement(_header.default, null), /*#__PURE__*/ _react.default.createElement(_hueBridge.BridgeDataProvider, null, /*#__PURE__*/ _react.default.createElement(_reactRouter.MemoryRouter, null, /*#__PURE__*/ _react.default.createElement(_reactRouter.Routes, null, /*#__PURE__*/ _react.default.createElement(_reactRouter.Route, {
        path: "/",
        element: /*#__PURE__*/ _react.default.createElement(_discoverBridges.default, null)
    }), /*#__PURE__*/ _react.default.createElement(_reactRouter.Route, {
        path: "/setup",
        element: /*#__PURE__*/ _react.default.createElement(_bridgeConfig.default, null)
    }), /*#__PURE__*/ _react.default.createElement(_reactRouter.Route, {
        path: "/light-groups",
        element: /*#__PURE__*/ _react.default.createElement(_entertainmentGroups.default, null)
    }), /*#__PURE__*/ _react.default.createElement(_reactRouter.Route, {
        path: "/lights",
        element: /*#__PURE__*/ _react.default.createElement(_lightsConfig.default, null)
    }))))));
};
var _default = App;
exports.default = _default;
