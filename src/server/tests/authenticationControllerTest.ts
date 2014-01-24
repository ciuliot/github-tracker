/// <reference path='../../../interfaces/node/node.d.ts'/>
/// <reference path='../../../interfaces/locomotive/locomotive.d.ts'/>

import assert = require("assert");
import server = require("../server");
import testApi = require("./test_api");

var vows = require('vows');

function assertRedirect() {
    return function (err: any, client: http.ClientResponse) {
        assert.isNull(err);
		assert.isNotNull(client);
		assert.equal(client.statusCode, 302);
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
			assert.isUndefined(err);
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

