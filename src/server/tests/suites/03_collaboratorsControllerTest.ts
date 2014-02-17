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

function testCurrentUserMarker(result: any[]) {
	result[0].should.eql({ id: null, login: null, avatar_url: null });

}

vows.describe("CollaboratorsController").addBatch({
	"Server": {
		topic: testApi.startServerTopic(),
		"Index without user": {
			topic: testApi.httpGetTopic("/collaborators?repository=repo"),

			"returns error": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyErrorJsonResponse(err, response, textBody);

				should.exist(result.error);
			}
		},
		"Index without repository": {
			topic: testApi.httpGetTopic("/collaborators?user=test"),

			"returns error": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyErrorJsonResponse(err, response, textBody);

				should.exist(result.error);
			}
		},
		"Invalid user and repository": {
			topic: testApi.httpGetTopic("/collaborators?user=foo&repository=bar"),
		
			"returns only marker for logged in user": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				result.length.should.eql(1);
				testCurrentUserMarker(result);
			}
		},
		"Valid user and repository": {
			topic: testApi.httpGetTopic("/collaborators?user=utester&repository=tracker"),
		
			"returns collaborators and marker for logged in user": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				result.length.should.eql(3);
				testCurrentUserMarker(result);

				result[1].should.eql({ id: 1, login: "octocat", avatar_url: "https://github.com/images/error/octocat_happy.gif" });
				result[2].should.eql({ id: 2, login: "octodog", avatar_url: "https://github.com/images/error/octocat_sad.gif" });
			}

		}
	}
}).export(module);


