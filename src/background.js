'use strict';

import * as bkgd from './modules/background_utils.js';

chrome.runtime.onInstalled.addListener(function() {
    chrome.runtime.onConnect.addListener(function(port) {
        console.log('Incoming connection on port: ' + port.name);
        if(port.name == 'TVE-comms-port') {
            port.postMessage({type:'connAck', payload:'Background:connection established'});
            port.onMessage.addListener(function(msg) {
                console.log(msg);            
                // SHM - create requestFactory
                var factory = new Object();
                factory.create = function() {
                    return new XMLHttpRequest();
                };
                bkgd.processMessage(msg, factory);
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


