/// <reference path='../../../../interfaces/express/express.d.ts'/>

import express = require("express");
import configuration = require("../configuration");

function initialize() {
	configuration.http_port = process.env.PORT;
	configuration.http_address = process.env.IP;
	
    configuration.githubApplication.dnsName = "github-tracker-c9-sharpiq.c9.io";
}

export = initialize;