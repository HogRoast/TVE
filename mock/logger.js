var debugLog = new Object();
var errorLog = new Object();

debugLog.setup = function() {
    debugLog.count = 0;
    debugLog.lines = {};
    debugLog.orig = console.debug;
    console.debug = function(x) { debugLog.lines[debugLog.count++] = x; };
}

errorLog.setup = function() {
    errorLog.count = 0;
    errorLog.lines = {};
    errorLog.orig = console.error;
    console.error = function(x) { errorLog.lines[errorLog.count++] = x; };
}

debugLog.tearDown = function() {
    console.debug = debugLog.orig;
}

errorLog.tearDown = function() {
    console.error = errorLog.orig;
}

module.exports = {debugLog, errorLog};

