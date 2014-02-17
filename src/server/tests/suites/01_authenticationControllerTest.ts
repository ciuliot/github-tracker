/// <reference path='../../../../interfaces/node/node.d.ts'/>
/// <reference path='../../../../interfaces/locomotive/locomotive.d.ts'/>
/// <reference path='../../../../interfaces/should/should.d.ts'/>
/// <reference path='../../../../interfaces/async/async.d.ts'/>

import assert = require("assert");
import http = require("http");
import should = require("should");
import async = require("async");

import testApi = require("../test_api");

var vows = require('vows');

vows.describe("AuthenticationController").addBatch({
	"Server": {
		topic: testApi.startServerTopic(),
		"starts": (err: any) => {
			should.not.exist(err);
		},
		"Verify index authentication": {
			topic: function() {
				var self = this;
				var endpoints = ["/", "/index/test" ,"/user", "/labels", "/milestones", "/collaborators", "/issues"];

				async.forEachSeries(endpoints, (endpoint, callback) => {
					testApi.httpGet(endpoint, (err: any, response: http.ClientResponse) => {
						should.not.exist(err);
	    				should.exist(response);
	    				response.should.have.status(401);
				
	    				callback(null, null);
	    				
					}, null);
				}, self.callback);
			},
			"passed": (err: any) => {
				should.not.exist(err);
			}
		},
		"authenticate": {
			topic: testApi.httpGetTopic("/auth"),
			"is succesfull": function (err: any, response: http.ClientResponse) {
				should.not.exist(err);
		    	should.exist(response);
		    	response.should.have.status(200);
			}
		},
		"home page": {
			topic: testApi.httpGetTopic("/"),
			"is returned correctly": function (err: any, response: http.ClientResponse) {
				should.not.exist(err);
		    	should.exist(response);
		    	response.should.have.status(200);
			}
		},
		"Verify credentials": {
			topic: testApi.httpGetTopic("/user"),
		
			"is returned correctly": function (err: any, response: http.ClientResponse) {
				should.not.exist(err);
		    	should.exist(response);
		    	response.should.have.status(200);
			}

		}
	}
}).export(module);

