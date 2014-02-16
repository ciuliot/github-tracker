/// <reference path='../../../interfaces/node/node.d.ts'/>
/// <reference path='../../../interfaces/locomotive/locomotive.d.ts'/>
/// <reference path='../../../interfaces/should/should.d.ts'/>
/// <reference path='../../../interfaces/async/async.d.ts'/>

import assert = require("assert");
import http = require("http");
import should = require("should");
import async = require("async");
//import process = require("process");

import server = require("../server");
import testApi = require("./test_api");

import abstractController = require("../controllers/abstractController");
import configuration = require("../config/configuration");

var vows = require('vows');
var nodemock = require("nodemock");

vows.describe("AuthenticationController").addBatch({
	"Server": {
		topic: function() {
			console.log("Starting server ...");
			configuration.loginStrategy = "basic";
			configuration.environment = "unittest";

			var self = this;
			new server().start((err?:any, server?:server) => {
				self.callback(err);
			});
		},
		"starts": (err: any) => {
			should.not.exist(err);
		},
		"Verify index authentication": {
			topic: function() {
				var self = this;
				var endpoints = ["/", "/index/test" ,"/user", "/labels", "/milestones", "/collaborators", "/issues"];

				async.forEachSeries(endpoints, (endpoint, callback) => {
					testApi.get(endpoint, (err: any, client: http.ClientResponse) => {
						should.not.exist(err);
	    				should.exist(client);
	    				client.should.have.status(401);
				
	    				callback(null, null);
	    				
					}, null);
				}, self.callback);
			},
			"passed": (err: any) => {
				should.not.exist(err);
			}
		},
		"authenticate": {
			topic: testApi.getTest("/auth"),
			"is succesfull": function (err: any, client: http.ClientResponse) {
				should.not.exist(err);
		    	should.exist(client);
		    	client.should.have.status(200);
			}
		},
		"home page": {
			topic: testApi.getTest("/"),
			"is returned correctly": function (err: any, client: http.ClientResponse) {
				should.not.exist(err);
		    	should.exist(client);
		    	client.should.have.status(200);
			}
		},
		"Verify credentials": {
			topic: testApi.getTest("/user"),
		
			"is returned correctly": function (err: any, client: http.ClientResponse) {
				should.not.exist(err);
		    	should.exist(client);
		    	client.should.have.status(200);
			}

		}
	}
}).export(module);

