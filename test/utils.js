'use strict';

const assert = require('assert');

// mocks
const {XMLHttpRequest} = require('../mock/xmlhttprequest');
const {debugLog, errorLog} = require('../mock/logger');

// modules under test
const bkgd = require('../es7/modules/background_utils');
const cont = require('../es7/modules/content_utils');
const math = require('../es7/modules/math_utils');

beforeEach(function() {
    debugLog.setup();
    errorLog.setup();
});

afterEach(function() {
    debugLog.tearDown();
    errorLog.tearDown();
});

describe('background_utils', function() {

    describe('#createOrderParams', function() {

        it('returns string of params with required fields', function() {
            var order = JSON.parse('{"inst":"USDGBP", "side":"buy","type":"limit","price":0.84,"size":100}');
            var params = bkgd.createOrderParams(order);
            var expected = 'accountId=accountId_example&instrument=USDGBP&qty=100&side=buy&type=limit&limitPrice=0.84&';
            assert.equal(params, expected);
            assert.equal(debugLog.count, 1);
            assert.equal(debugLog.lines[debugLog.count-1], expected);
        });

        it('returns string of params with required and optional fields', function() {
            var order = JSON.parse('{"ecn":"Binance","inst":"USDGBP", "side":"buy","type":"limit","tif":"GTC","goodTil":20180812,"price":0.84,"size":100,"take":0.05,"stop":-0.05,"digSig":897935849,"id":101}');
            var params = bkgd.createOrderParams(order);
            var expected = 'accountId=accountId_example&instrument=USDGBP&qty=100&side=buy&type=limit&limitPrice=0.84&stopPrice=0.79&durationType=GTC&durationDateTime=20180812&stopLoss=0.79&takeProfit=0.89&digitalSignature=897935849&requestId=101&';
            assert.equal(params, expected);
            assert.equal(debugLog.count, 1);
            assert.equal(debugLog.lines[debugLog.count-1], expected);
        });

        it('throws exception when inst field missing', function() {
            var order = JSON.parse('{"side":"buy","type":"limit","price":0.84,"size":100}');
            assert.throws(function() {bkgd.createOrderParams(order)}, Error, 'Order message does not contain required parameters.');
        });

        it('throws exception when side field missing', function() {
            var order = JSON.parse('{"inst":"USDGBP","type":"limit","price":0.84,"size":100}');
            assert.throws(function() {bkgd.createOrderParams(order)}, Error, 'Order message does not contain required parameters.');
        });

        it('throws exception when type field missing', function() {
            var order = JSON.parse('{"inst":"USDGBP","side":"buy","price":0.84,"size":100}');
            assert.throws(function() {bkgd.createOrderParams(order)}, Error, 'Order message does not contain required parameters.');
        });

        it('throws exception when price field missing', function() {
            var order = JSON.parse('{"inst":"USDGBP","side":"buy","type":"limit","size":100}');
            assert.throws(function() {bkgd.createOrderParams(order)}, Error, 'Order message does not contain required parameters.');
        });

        it('throws exception when size field missing', function() {
            var order = JSON.parse('{"inst":"USDGBP","side":"buy","type":"limit","price":0.84}');
            assert.throws(function() {bkgd.createOrderParams(order)}, Error, 'Order message does not contain required parameters.');
        });

        it('throws exception when empty dictionary', function() {
            var order = JSON.parse('{}');
            assert.throws(function() {bkgd.createOrderParams(order)}, Error, 'Order message does not contain required parameters.');
        });
    });

    describe('#processMessage', function() {

        it('throws exception when not order type', function() {
            var msg = { 'type' : 'foo', 'payload' : 'bar' };
            assert.throws(function() {bkgd.processMessage(msg)}, Error, 'Unhandled message type : foo');
        });

        it('creates POST request with order params', function(done) {
            var order = JSON.parse('{"inst":"USDGBP", "side":"buy","type":"limit","price":0.84,"size":100}');
            var msg = { 'type' : 'order', 'payload' : order };

            // SHM - create a request factory that returns our local mock 
            // request object
            var request = new XMLHttpRequest();
            var factory = new Object();
            factory.create = function() {
                return request;
            };

            bkgd.processMessage(msg, factory); 

            assert.equal(request.method, 'POST');
            assert.equal(request.url, 'http://localhost:8080/tradingview/v1/ui/accounts/accountId_example/orders');
            assert.equal(request.headers['Content-type'], 'application/x-www-form-urlencoded');
            var expected = 'accountId=accountId_example&instrument=USDGBP&qty=100&side=buy&type=limit&limitPrice=0.84&';
            assert.equal(request.body, expected);
            assert.equal(debugLog.count, 1)
            assert.equal(debugLog.lines[debugLog.count-1], expected)

            request.responseText = 'test';
            setTimeout(function() {
                request.onload();
                assert.equal(debugLog.count, 2)
                assert.equal(debugLog.lines[debugLog.count-1], 'test')
                done();
            }, 500);
        });
    });

});

describe('math_utils', function() {
    describe('#dps', function() {

        it('returns a foating point rounded to n decimal places', function() {
            assert.equal(math.dps(0.43433454, 3), 0.434);
            assert.equal(math.dps(0.43433454, 1), 0.4);
            assert.equal(math.dps(0.43433454, 6), 0.434335);
            assert.equal(math.dps(0, 6), 0);
        });
        
        it('does not work properly if n > my epsilon dps', function() {
            assert.notEqual(math.dps(0.23849874982789, 11), 0.238498749828);
            // 0.0000000001
            // 0.23849874982789
        });
    });
});

describe('content_utils', function() {
    describe('#correctTVDTS', function() {

        it('returns MMM DD HH:MM created date modified with the current year', function() {
            var tvDate = new Date('Aug 12 14:10');
            // SHM - Without specifying a year you always get a default 2001!
            assert.equal(tvDate.getFullYear(), 2001);
            var correction = cont.correctTVDTS(tvDate);
            var now = new Date();
            assert.equal(correction.getFullYear(), now.getFullYear());
        });
    });

    describe('#withinSeconds', function() {

        it('returns true if supplied time is within 1 second of now', function(done) {
            var now = new Date();
            setTimeout(function() { 
                assert(cont.withinSeconds(now, 1)); 
                assert.equal(debugLog.count, 3);
                done();
            }, 500);
        });

        it('returns false if supplied time is greater than 1 second of now', function(done) {
            var now = new Date();
            setTimeout(function() { 
                assert(!cont.withinSeconds(now, 1)); 
                assert.equal(debugLog.count, 3);
                done();
            }, 1500);
        });
    });

    describe('#extractOrder', function() {

        it('returns empty JSON object', function() {
            var sut = 'asdgj TVE:{}:EVT akjhfkjhdjk';
            var order = cont.extractOrder(sut);
            assert.equal(JSON.stringify(order), '{}');
            assert.equal(debugLog.count, 1);
            assert.equal(debugLog.lines[debugLog.count-1], order);
        });

        it('returns null if ill formed JSON', function() {
            var sut = 'sdjkhkdjh TVE:{"kdfh:"kdjh"}:EVT jkshfkj';
            var order = cont.extractOrder(sut);
            assert.equal(order, null);
            assert.equal(errorLog.count, 1);
            assert.equal(errorLog.lines[errorLog.count-1].substr(0, 26), 'Error parsing order text: ');
        });

        it('returns null if TVE:/:EVT bounds not found', function() {
            var sut = 'sdjkhkdjh TV:{}:EVT jkshfkj';
            var order = cont.extractOrder(sut);
            assert.equal(order, null);
            assert.equal(errorLog.count, 1);
            assert.equal(errorLog.lines[errorLog.count-1], 'Could not find TVE:/:EVT bounds in text: ' + sut);

            var sut = 'lfdsjk TVE:{}:VT dskhgh';
            var order = cont.extractOrder(sut);
            assert.equal(order, null);
            assert.equal(errorLog.count, 2);
            assert.equal(errorLog.lines[errorLog.count-1], 'Could not find TVE:/:EVT bounds in text: ' + sut);

            var sut = 'kjhdjk {}  ldshkjhk';
            var order = cont.extractOrder(sut);
            assert.equal(order, null);
            assert.equal(errorLog.count, 3);
            assert.equal(errorLog.lines[errorLog.count-1], 'Could not find TVE:/:EVT bounds in text: ' + sut);
        });
    });

    describe('#mutantMatch', function() {

        it('returns true when mutation matches conditions', function() {
            var mutation = {};
            mutation.target = {};
            mutation.target.localName = 'tbody';
            mutation.target.parentElement = {};
            mutation.target.parentElement.className = 'alert-list';
            mutation.target.previousElementSibling = {};
            mutation.target.previousElementSibling.textContent = 'SymbolDescriptionDate/Time';
            assert(cont.mutantMatch(mutation));
        });

        it('returns false when mutation does not match conditions', function() {
            var mutation = {};
            mutation.target = {};
            mutation.target.localName = 'tbod';
            mutation.target.parentElement = {};
            mutation.target.parentElement.className = 'alert-list';
            mutation.target.previousElementSibling = {};
            mutation.target.previousElementSibling.textContent = 'SymbolDescriptionDate/Time';
            assert(!cont.mutantMatch(mutation));

            mutation.target.localName = 'tbody';
            mutation.target.parentElement.className = 'alertlist';
            mutation.target.previousElementSibling.textContent = 'SymbolDescriptionDate/Time';
            assert(!cont.mutantMatch(mutation));

            mutation.target.localName = 'tbody';
            mutation.target.parentElement.className = 'alert-list';
            mutation.target.previousElementSibling.textContent = 'ymbolDescriptionDate/Time';
            assert(!cont.mutantMatch(mutation));
        });
    });
});
