if (!("XMLHttpRequest" in global)) {
  global.XMLHttpRequest = require('xhr2');
}