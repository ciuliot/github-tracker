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

vows.describe("LabelsController").addBatch({
	"Server": {
		topic: testApi.startServerTopic(),
		"Index without user and repository": {
			topic: testApi.httpGetTopic("/labels"),

			"returns error": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyErrorJsonResponse(err, response, textBody);
				should.exist(result.error);
			}
		},
		"Index without user": {
			topic: testApi.httpGetTopic("/labels?repository=repo"),

			"returns error": (err: any, response: http.ClientResponse, textBody: string) => {
				testApi.verifyErrorJsonResponse(err, response, textBody);
			}
		},
		"Index without repository": {
			topic: testApi.httpGetTopic("/labels?user=test"),

			"returns error": (err: any, response: http.ClientResponse, textBody: string) => {
				testApi.verifyErrorJsonResponse(err, response, textBody);
			}
		},
		"Invalid user and repository": {
			topic: testApi.httpGetTopic("/labels?user=foo&repository=bar"),
		
			"returns empty array": (err: any, response: http.ClientResponse, textBody: string) => {
				testApi.verifyErrorJsonResponse(err, response, textBody);
			}
		},
		"Valid user and repository": {
			topic: testApi.httpGetTopic("/labels?user=utester&repository=tracker"),
		
			"returns milestones": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				result.should.eql({
					categories: 
					   [ { color: '#ff0000', id: '@frontend', name: 'frontend' },
					     { color: '#00ff00', id: '@backend', name: 'backend' },
					     { color: null, id: '@other', name: 'other' } ],
					phases: 
					   [ { color: null, id: '#backlog', name: 'backlog' },
					     { color: '#000000', id: '#onhold', name: 'onhold' },
					     { color: '#000001', id: '#inprogress', name: 'inprogress' },
					     { color: '#000002', id: '#implemented', name: 'implemented' },
					     { color: null, id: '#closed', name: 'closed' } ],
					types: 
					   [ { color: '#f29513', id: 'bug', name: 'bug' },
					     { color: '#0000ff', id: 'feature', name: 'feature' } ],
					declaration: 
					   { phases: 
					      { backlog: '#backlog',
					        onhold: '#onhold',
					        inprogress: '#inprogress',
					        implemented: '#implemented',
					        closed: '#closed' },
					     defaultCategory: '@other' 
					 	}
				});
			}

		}
	}
}).export(module);


