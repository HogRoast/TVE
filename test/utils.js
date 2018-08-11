'use strict';

const assert = require('assert');
const bkgd = require('../es7/modules/background_utils');
const cont = require('../es7/modules/content_utils');

describe('background_utils', function() {

    describe('#createOrderParams', function() {

        it('returns string of params with required fields', function() {
            var order = JSON.parse('{"inst":"USDGBP", "side":"buy","type":"limit","price":0.84,"size":100}');
            var params = bkgd.createOrderParams(order);
            assert(params, 'accountId=accountId_example&instrument=USDGBP&qty=100&side=buy&type=limit&limitPrice=0.84&');
        });

        it('returns string of params with required and optional fields', function() {
            var order = JSON.parse('{"ecn":"Binance","inst":"USDGBP", "side":"buy","type":"limit","tif":"GTC","goodTil":20180812,"price":0.84,"size":100,"take":0.05,"stop":-0.05,"digSig":897935849,"id":101}');
            var params = bkgd.createOrderParams(order);
            assert(params, 'accountId=accountId_example&instrument=USDGBP&qty=100&side=buy&type=limit&limitPrice=0.84&stopPrice=0.79&durationType=GTC&durationDateTime=20180812&stopLoss=0.79&takeProfit=0.89&digitalSignature=897935849&requestId=101&');
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
            bkgd.processMessage(msg);
            done();
        });
    });
});

