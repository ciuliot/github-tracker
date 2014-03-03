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

vows.describe("ImpedimentsController").addBatch({
	"Server": {
		topic: testApi.startServerTopic(),
		"Index without user and repository": {
			topic: testApi.httpGetTopic("/impediments/0"),
			"returns error": testApi.verifyNoUserProvidedError()
		},
		"Index without user": {
			topic: testApi.httpGetTopic("/impediments/0?repository=repo"),
			"returns error": testApi.verifyNoUserProvidedError()
		},
		"Index without repository": {
			topic: testApi.httpGetTopic("/impediments/0?user=test"),

			"returns error": testApi.verifyNoRepositoryProvidedError()
		},
		// ToDo
		/*"Invalid user and repository": {
			topic: testApi.httpGetTopic("/impediments/0?user=foo&repository=bar"),
		
			"returns empty array": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				result.should.eql(0);
			}
		},*/
		"Valid user and repository": {
			topic: testApi.httpGetTopic("/impediments/0?user=utester&repository=tracker"),
		
			"returns impediments": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				// ToDo

			}

		},
		"Update without user": {
			topic: testApi.httpPutTopic("/impediments/0", { repository: "repo", description: "Doesn't work" }),
			"returns error": testApi.verifyNoUserProvidedError()
		},
		"Update without repository": {
			topic: testApi.httpPutTopic("/impediments/0", { user: "user", description: "Doesn't work" }),
			"returns error": testApi.verifyNoRepositoryProvidedError()
		},
		"Update without description": {
			topic: testApi.httpPutTopic("/impediments/0", { user: "user", repository: "repo" }),
			"returns error": testApi.verifyNoParameterProvidedError("description")
		},
		"Update": {
			topic: testApi.httpPutTopic("/impediments/1347", { user: "utester", repository: "tracker", description: "Waiting for customer" }),
			"returns response": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				// ToDo

			}
		}
	}
}).export(module);


