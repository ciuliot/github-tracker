/// <reference path='../../../../interfaces/express/express.d.ts'/>

import express = require("express");
import configuration = require("../configuration");

var errorHandler = require('errorhandler');

function configure(server: express.Application) {
    server.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

function initialize() {
	configuration.logger.debug("Initializing debug environment");
    var server = this;
    configure(server);
}

export = initialize;