(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['./modules/background_utils.js'], factory);
    } else if (typeof exports !== "undefined") {
        factory(require('./modules/background_utils.js'));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.background_utils);
        global.background = mod.exports;
    }
})(this, function (_background_utils) {
    'use strict';

    var tvs = _interopRequireWildcard(_background_utils);

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

    chrome.runtime.onInstalled.addListener(function () {
        chrome.runtime.onConnect.addListener(function (port) {
            console.log('Incoming connection on port: ' + port.name);
            if (port.name == 'TVE-comms-port') {
                port.postMessage({ type: 'connAck', payload: 'Background:connection established' });
                port.onMessage.addListener(function (msg) {
                    console.log(msg);
                    processMessage(msg);
                });
            }
        });

        chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'uk.tradingview.com',
                        schemes: ['https'] },
                    css: ['div[class="layout__area--right"]']
                })],
                actions: [new chrome.declarativeContent.ShowPageAction(), new chrome.declarativeContent.RequestContentScript({ js: ['content.js'] })]
            }]);
        });
    });
});