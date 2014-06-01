/// <reference path='../../../../interfaces/express/express.d.ts'/>
/// <reference path='../../../../interfaces/node/node.d.ts'/>

import configuration = require("../configuration");
import express = require("express");
import util = require("util");

var errorHandler = require('errorhandler');

function configure(server: express.Application): void {
    server.use(errorHandler());

    configuration.http_address = "0.0.0.0";
    configuration.http_port = process.env.PORT;
    configuration.databaseName = process.env.MONGODB_URL;

    configuration.githubApplication.scope = ["user", "public_repo"];
    configuration.githubApplication.dnsName = process.env.HTTP_ADDRESS;
}

function initialize() {
    var server = this;
    configure(server);
};

export = initialize;
