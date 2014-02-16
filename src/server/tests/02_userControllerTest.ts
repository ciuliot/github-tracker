/// <reference path='../../../interfaces/node/node.d.ts'/>
/// <reference path='../../../interfaces/locomotive/locomotive.d.ts'/>
/// <reference path='../../../interfaces/should/should.d.ts'/>
/// <reference path='../../../interfaces/async/async.d.ts'/>

import assert = require("assert");
import http = require("http");
import should = require("should");
import async = require("async");

import testApi = require("./test_api");

var vows = require('vows');

vows.describe("UserController").addBatch({
	"Server": {
		topic: testApi.startServerTopic(),
		"User get data": {
			topic: testApi.httpGetTopic("/user"),
		
			"is returned correctly": function (err: any, response: http.ClientResponse, textBody: string) {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				result.name.should.be.exactly("Tester Unit");
				result.login.should.be.exactly("utester");
				result.avatar_url.should.be.exactly("http://void.com/image.gif");
			}

		}
	}
}).export(module);


