'use strict';

import * as tvs from '/modules/tvs_exports.js';

function createOrderParams(msg) {
    if(!(inst in msg && size in msg && side in msg 
        && type in msg && price in msg)) {
        throw 'Order message does not contain required parameters.';
    }

    var params = `
accountId=${tvs.accountId}&
instrument=${msg.inst}&
qty=${msg.size}&
side=${msg.side}&
type=${msg.type}&
limitPrice=${msg.price}&
${stop in msg ? `stopPrice=${msg.price + msg.stop}&` : ``}
${tif in msg ? `durationType=${msg.tif}&` : ``}
${goodTil in msg ? `durationDateTime=${msg.goodTil}&` : ``}
${stop in msg ? `stopLoss=${msg.price + msg.stop}&` : ``}
${take in msg ? `takeProfit=${msg.price + msg.take}&` : ``}
${digSig in msg ? `digitalSignature=${msg.digSig}&` : ``}
${id in msg? `requestId=${msg.id}&` : ``}
`;
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
        request.send(createOrderParams(msg));
    } else {
        console.log('Unhandled message type : ' + msg.type);
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
                css: ['div[class='layout__area--right']']
            })],
            actions: [
                new chrome.declarativeContent.ShowPageAction(),
                new chrome.declarativeContent.RequestContentScript({ js: ['content.js']})
            ]
        }]);
    });
});

