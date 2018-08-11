(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.tvs_exports = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  // SHM - account id hardcoded for testing purposes
  var accountId = exports.accountId = "accountId_example";
  var baseURL = exports.baseURL = "http://localhost:8080/tradingview/v1/ui/";
  var sendOrderURL = exports.sendOrderURL = baseURL + ("/tradingview/v1/accounts/" + accountId + "/orders");
});