'use strict';

import * as tvs from './modules/tvs_exports.js';

function createOrderParams(order) {
    if(!('inst' in order && 'size' in order && 'side' in order 
        && 'type' in order && 'price' in order)) {
        throw 'Order message does not contain required parameters.';
    }
    var params = `accountId=${tvs.accountId}&instrument=${order.inst}&qty=${order.size}&side=${order.side}&type=${order.type}&limitPrice=${order.price}&${'stop' in order ? `stopPrice=${order.price + order.stop}&` : ``}${'tif' in order ? `durationType=${order.tif}&` : ``}${'goodTil' in order ? `durationDateTime=${order.goodTil}&` : ``}${'stop' in order ? `stopLoss=${order.price + order.stop}&` : ``}${'take' in order ? `takeProfit=${order.price + order.take}&` : ``}${'digSig' in order ? `digitalSignature=${order.digSig}&` : ``}${'id' in order? `requestId=${order.id}&` : ``}`;
    console.log(params);
    return params;
}

function processMessage(msg) {
    if(msg.type == "order") {
        // SHM - send order details to TVS...
        var request = new XMLHttpRequest();
        request.open('POST', tvs.sendOrderURL);
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.onload = function() {
            console.log(this.responseText)
        };
        request.send(createOrderParams(msg.payload));
    } else {
        throw 'Unhandled message type : ' + msg.type;
    }
    return;
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.runtime.onConnect.addListener(function(port) {
        console.log('Incoming connection on port: ' + port.name);
        if(port.name == 'TVE-comms-port') {
            port.postMessage({type:'connAck', payload:'Background:connection established'});
            port.onMessage.addListener(function(msg) {
                console.log(msg);            
                processMessage(msg);
            });
        }
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {  hostEquals: 'uk.tradingview.com',
                            schemes: ['https']},
                css: ['div[class="layout__area--right"]']
            })],
            actions: [
                new chrome.declarativeContent.ShowPageAction(),
                new chrome.declarativeContent.RequestContentScript({ js: ['content.js']})
            ]
        }]);
    });
});


