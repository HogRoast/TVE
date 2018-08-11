'use strict';

const assert = require('assert');
const tvs = require('../es7/modules/tvs_exports');
const bkgd = require('../es7/modules/background_utils');
const cont = require('../es7/modules/content_utils');

describe('background_utils', function() {
    describe('#createOrderParams', function() {
        it('returns string of params with required fields', function(done) {
            var order = JSON.parse('{"inst":"USDGBP", "side":"buy","type":"limit","price":0.84,"size":100}');
            var params = bkgd.createOrderParams(order);
            assert(params, 'accountId=accountId_example&instrument=USDGBP&qty=100&side=buy&type=limit&limitPrice=0.84&');
            done();
        });

        it('throws exception when inst field missing', function(done) {
            var order = JSON.parse('{"side":"buy","type":"limit","price":0.84,"size":100}');
            assert.throws(function() {bkgd.createOrderParams(order)}, Error, 'Order message does not contain required parameters.');
            done();
        });
    });
});

