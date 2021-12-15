"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _ink = require("ink");
var _inkGradient = _interopRequireDefault(require("ink-gradient"));
var _inkBigText = _interopRequireDefault(require("ink-big-text"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var Header = function() {
    /*#__PURE__*/ return _react.default.createElement(_ink.Static, {
        items: [
            "Hue HDMI sync"
        ]
    }, function(label) {
        /*#__PURE__*/ return _react.default.createElement(_ink.Box, {
            key: label,
            borderStyle: "round",
            justifyContent: "center"
        }, /*#__PURE__*/ _react.default.createElement(_inkGradient.default, {
            name: "rainbow"
        }, /*#__PURE__*/ _react.default.createElement(_inkBigText.default, {
            text: label
        })));
    });
};
var _default = Header;
exports.default = _default;
