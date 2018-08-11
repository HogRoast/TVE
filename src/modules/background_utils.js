'use strict';

import * as tvs from './tvs_exports.js';

// SHM - helper function - forces x to n decimal places and accounts for FP
// rounding issues
function dps(x, n) {
    // SHM - own def'n of epsilon, should really check to see if there is a
    // language constant and also that n < the number of dps in my constant
    var y = x + 0.00000000001; 
    y = Math.round(Math.pow(10, n) * x);
    return y / Math.pow(10, n);
};

function createOrderParams(order) {
    if(!('inst' in order && 'size' in order && 'side' in order 
        && 'type' in order && 'price' in order)) {
        throw new Error('Order message does not contain required parameters.');
    }
    var params = `accountId=${tvs.accountId}&instrument=${order.inst}&qty=${order.size}&side=${order.side}&type=${order.type}&limitPrice=${order.price}&${'stop' in order ? `stopPrice=${dps(order.price + order.stop, 2)}&` : ``}${'tif' in order ? `durationType=${order.tif}&` : ``}${'goodTil' in order ? `durationDateTime=${order.goodTil}&` : ``}${'stop' in order ? `stopLoss=${dps(order.price + order.stop, 2)}&` : ``}${'take' in order ? `takeProfit=${dps(order.price + order.take, 2)}&` : ``}${'digSig' in order ? `digitalSignature=${order.digSig}&` : ``}${'id' in order? `requestId=${order.id}&` : ``}`;
    console.log(params);
    return params;
}

// SHM - pass in the requestFactory so I can use a mock XMLHttpRequest 
// for testing
function processMessage(msg, requestFactory) {
    if(msg.type == "order") {
        // SHM - send order details to TVS...
        var request = requestFactory.create();
        request.open('POST', tvs.sendOrderURL);
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.onload = function() {
            console.log(this.responseText)
        };
        request.send(createOrderParams(msg.payload));
    } else {
        throw new Error('Unhandled message type : ' + msg.type);
    }
    return;
}

export {createOrderParams, processMessage};
