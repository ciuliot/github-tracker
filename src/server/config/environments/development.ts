/// <reference path='../../../../interfaces/express/express.d.ts'/>

import express = require("express");

function configure(server: express.Application) {
    server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

function initialize() {
    var server = this;
    configure(server);
}

export = initialize;