/// <reference path='../../../../interfaces/express/express.d.ts'/>

import configuration = require("../configuration");
import express = require("express");

function configure(server: express.Application): void {
    server.use(express.errorHandler());
}

function initialize() {
    var server = this;
    configure(server);
};

export = initialize;
