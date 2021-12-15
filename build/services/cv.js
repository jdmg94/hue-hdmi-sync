"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.openVideoInput = exports.getVideoSources = void 0;
var _childProcess = require("child_process");
var cv2 = _interopRequireWildcard(require("opencv4nodejs"));
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
var getVideoSources = function() {
    return new Promise(function(resolve, reject) {
        var sanitizeOutput = function(output) {
            var buffer = null;
            var result = [];
            var videoDevicesRegex = /\/dev\/video\w/g;
            while(buffer = videoDevicesRegex.exec(output)){
                result.push(buffer[0]);
            }
            return result;
        };
        (0, _childProcess).exec("ls -ltrh /dev/video*", function(err, stdout) {
            if (err) {
                reject(err);
            } else {
                resolve(sanitizeOutput(stdout));
            }
        });
    });
};
exports.getVideoSources = getVideoSources;
var openVideoInput = function() {
    try {
        var capture = new cv2.VideoCapture(cv2.CAP_ANY);
        var height = capture.get(cv2.CAP_PROP_FRAME_HEIGHT);
        var width = capture.get(cv2.CAP_PROP_FRAME_WIDTH);
        capture.set(cv2.CAP_PROP_BUFFERSIZE, 0);
        capture.release();
        console.log("video capture dimensions", height, width);
    } catch (error) {
        console.log("the fuck man?", error);
    }
};
exports.openVideoInput = openVideoInput;
