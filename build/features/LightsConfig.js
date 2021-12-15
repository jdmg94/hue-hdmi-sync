"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _ink = require("ink");
var _cv = require("../services/cv");
var _hueBridge = require("../context/hueBridge");
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
var LightsSetup = function() {
    var state = (0, _hueBridge).useBridgeContext().state;
    var selectedEntertainmentGroup = state.selectedEntertainmentGroup, credentials = state.credentials, bridgeNetworkDevice = state.bridgeNetworkDevice;
    (0, _react).useEffect(function() {
        // console.log("locations", selectedEntertainmentGroup.locations)
        (0, _cv).openVideoInput();
    // getVideoSources().then(sources => {
    //   console.log('how many sources', sources.length, sources)
    // })
    // getBridgeLights(bridgeNetworkDevice.internalipaddress, credentials).then(
    // (lights) => {
    // console.log("the lights", lights)
    // }
    // )
    }, []);
    return(/*#__PURE__*/ _react.default.createElement(_ink.Text, null, "Hello from lights setup"));
};
var _default = LightsSetup;
exports.default = _default;
