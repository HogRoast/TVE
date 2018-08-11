(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./modules/content_utils.js"], factory);
    } else if (typeof exports !== "undefined") {
        factory(require("./modules/content_utils.js"));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.content_utils);
        global.content = mod.exports;
    }
})(this, function (_content_utils) {
    "use strict";

    var utils = _interopRequireWildcard(_content_utils);

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

    console.log("TVExtender Content...setting up comms port to background");
    var port = chrome.runtime.connect({ name: "TVE-comms-port" });

    port.onMessage.addListener(function (msg, sender) {
        if (msg.type == "connAck") {
            console.log(msg.payload);
            console.log("Setting up observer...");
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (utils.mutantMatch(mutation)) {
                        console.log(mutation); // really useful for debugging!
                        mutation.addedNodes.forEach(function (node) {
                            // Ensure alert message was generated within the last 1 minute.
                            // 1 minute is as granular as alert timestamps get and they seem to
                            // be rounded to the nearest minute, this is not foolproof!
                            var alertDTS = new Date(node.cells[2].innerText);
                            if (utils.withinSeconds(utils.correctTVDTS(alertDTS), 60)) {
                                var alertStr = new String(node.cells[1].innerText);
                                var order = utils.extractOrder(alertStr);
                                if (order != null) {
                                    // post the order to the background script for further processing
                                    port.postMessage({ type: "order", payload: order });
                                } else {
                                    alert("Could not extract TVE order from alert, ignoring");
                                }
                            } else {
                                // NOTE: not alerting this error as there will potentially be a lot of
                                // these stale alerts i.e. when the site is refreshed within the browser
                                // the alert list gets repopulated with all the previous alerts 
                                // generated in the session
                                console.log("Alert timestamp out of bounds, ignoring");
                            }
                        });
                    }
                });
            });

            var rhs = document.getElementsByClassName("layout__area--right")[0];
            var config = { attributes: false, characterData: false, subtree: true, childList: true };
            observer.observe(rhs, config);
        }
    });
});