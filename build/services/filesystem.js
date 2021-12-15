"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.removeFile = exports.writeFile = exports.readFile = exports.access = exports.open = void 0;
var _util = require("util");
var fs = _interopRequireWildcard(require("fs"));
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
var noop = function() {
    return void 0;
};
var open = (0, _util).promisify(fs.open);
exports.open = open;
var access = (0, _util).promisify(fs.access);
exports.access = access;
var readFile = (0, _util).promisify(fs.readFile);
exports.readFile = readFile;
var writeFile = (0, _util).promisify(fs.writeFile);
exports.writeFile = writeFile;
var removeFile = (0, _util).promisify(fs.rm || fs.rmSync || noop);
exports.removeFile = removeFile;
