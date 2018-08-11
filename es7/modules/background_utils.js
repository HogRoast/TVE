(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './tvs_exports.js'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./tvs_exports.js'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.tvs_exports);
        global.background_utils = mod.exports;
    }
})(this, function (exports, _tvs_exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.processMessage = exports.createOrderParams = undefined;

    var tvs = _interopRequireWildcard(_tvs_exports);

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

    function createOrderParams(order) {
        if (!('inst' in order && 'size' in order && 'side' in order && 'type' in order && 'price' in order)) {
            throw new Error('Order message does not contain required parameters.');
        }
        var params = 'accountId=' + tvs.accountId + '&instrument=' + order.inst + '&qty=' + order.size + '&side=' + order.side + '&type=' + order.type + '&limitPrice=' + order.price + '&' + ('stop' in order ? 'stopPrice=' + (order.price + order.stop) + '&' : '') + ('tif' in order ? 'durationType=' + order.tif + '&' : '') + ('goodTil' in order ? 'durationDateTime=' + order.goodTil + '&' : '') + ('stop' in order ? 'stopLoss=' + (order.price + order.stop) + '&' : '') + ('take' in order ? 'takeProfit=' + (order.price + order.take) + '&' : '') + ('digSig' in order ? 'digitalSignature=' + order.digSig + '&' : '') + ('id' in order ? 'requestId=' + order.id + '&' : '');
        console.log(params);
        return params;
    }

    function processMessage(msg) {
        if (msg.type == "order") {
            // SHM - send order details to TVS...
            var request = new XMLHttpRequest();
            request.open('POST', tvs.sendOrderURL);
            request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            request.onload = function () {
                console.log(this.responseText);
            };
            request.send(createOrderParams(msg.payload));
        } else {
            throw new Error('Unhandled message type : ' + msg.type);
        }
        return;
    }

    exports.createOrderParams = createOrderParams;
    exports.processMessage = processMessage;
});