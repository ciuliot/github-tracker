/// <reference path='../../../../interfaces/express/express.d.ts'/>
/// <reference path='../../../../interfaces/node/node.d.ts'/>

import configuration = require("../configuration");
import express = require("express");
import util = require("util");

var errorHandler = require('errorhandler');

function configure(server: express.Application): void {
    server.use(errorHandler());

    configuration.http_address = process.env.OPENSHIFT_NODEJS_IP;
    configuration.http_port = process.env.OPENSHIFT_NODEJS_PORT;
    configuration.databaseName = util.format("%sgittrack", process.env.OPENSHIFT_MONGODB_DB_URL);

    configuration.githubApplication.scope = ["user", "public_repo"];
    configuration.githubApplication.dnsName = process.env.OPENSHIFT_APP_DNS;
}

function initialize() {
    var server = this;
    configure(server);
};

export = initialize;
