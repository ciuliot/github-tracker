/// <reference path='../../../interfaces/node/node.d.ts'/>
/// <reference path='../../../interfaces/locomotive/locomotive.d.ts'/>
/// <reference path='../../../interfaces/should/should.d.ts'/>

import assert = require("assert");
import http = require("http");
import should = require("should");

import server = require("../server");
import testApi = require("./test_api");

//var expect = require("expect.js");
var vows = require('vows');

function assertRedirect() {
    return function (err: any, client: http.ClientResponse) {
    	should.not.exist(err);
    	should.exist(client);
    	client.should.have.status(302);
    };
}

vows.describe("AuthenticationController").addBatch({
	"Server": {
		topic: function() {
			var self = this;
			new server().start((err?:any, server?:server) => {
				self.callback(err);
			});
		},
		"starts": (err: any) => {
			should.not.exist(err);
		},
		"/": {
			topic: testApi.get("/"),
			"redirects to login": assertRedirect
		},
		"/index": {
			topic: testApi.get("/index"),
			"redirects to login": assertRedirect
		},
		"/repositories": {
			topic: testApi.get("/repositories"),
			"redirects to login": assertRedirect
		},
		"/labels": {
			topic: testApi.get("/labels"),
			"redirects to login": assertRedirect
		},
		"/milestones": {
			topic: testApi.get("/milestones"),
			"redirects to login": assertRedirect
		},
		"/issues": {
			topic: testApi.get("/issues"),
			"redirects to login": assertRedirect
		}

	}
}).export(module);

