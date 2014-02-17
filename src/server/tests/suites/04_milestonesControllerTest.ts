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

vows.describe("MilestonesController").addBatch({
	"Server": {
		topic: testApi.startServerTopic(),
		"Index without user and repository": {
			topic: testApi.httpGetTopic("/milestones"),

			"returns error": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyErrorJsonResponse(err, response, textBody);

				should.exist(result.error);
			}
		},
		"Index without user": {
			topic: testApi.httpGetTopic("/milestones?repository=repo"),

			"returns error": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyErrorJsonResponse(err, response, textBody);

				should.exist(result.error);
			}
		},
		"Index without repository": {
			topic: testApi.httpGetTopic("/milestones?user=test"),

			"returns error": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyErrorJsonResponse(err, response, textBody);

				should.exist(result.error);
			}
		},
		"Invalid user and repository": {
			topic: testApi.httpGetTopic("/milestones?user=foo&repository=bar"),
		
			"returns empty array": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				result.length.should.eql(0);
			}
		},
		"Valid user and repository": {
			topic: testApi.httpGetTopic("/milestones?user=utester&repository=tracker"),
		
			"returns milestones": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				result.length.should.eql(2);
				result[0].should.eql({ number: 1, state: "closed", title: "v1.0", open_issues: 0, closed_issues: 15 });
				result[1].should.eql({ number: 2, state: "open", title: "v2.0", open_issues: 10, closed_issues: 5 });
			}

		}
	}
}).export(module);


