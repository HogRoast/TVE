'use strict'

class XMLHttpRequest {
    constructor() {
        this.headers = {};
    };

    open(method, url) {
        this.method = method;
        this.url = url;
    };

    setRequestHeader(header, value) {
        this.headers[header] = value;
    };

    send(body) {
        this.body = body;
    };
};

module.exports = {XMLHttpRequest};
