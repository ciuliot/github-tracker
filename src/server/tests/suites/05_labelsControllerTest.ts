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

			"returns error": testApi.verifyNoUserProvidedError()
		},
		"Index without user": {
			topic: testApi.httpGetTopic("/labels?repository=repo"),

			"returns error": testApi.verifyNoUserProvidedError()
		},
		"Index without repository": {
			topic: testApi.httpGetTopic("/labels?user=test"),

			"returns error": testApi.verifyNoRepositoryProvidedError()
		},
		// ToDo
		/*"Invalid user and repository": {
			topic: testApi.httpGetTopic("/labels?user=foo&repository=bar"),
		
			"returns empty array": testApi.verifyAccessDeniedError()
		},*/
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
					   [ { color: null, id: '#1 backlog', name: 'backlog' },
					     { color: '#000000', id: '#2 onhold', name: 'onhold' },
					     { color: '#000001', id: '#3 inprogress', name: 'inprogress' },
					     { color: '#000002', id: '#4 inreview', name: 'inreview' },
					     { color: '#000002', id: '#5 implemented', name: 'implemented' },
					     { color: null, id: '#6 closed', name: 'closed' } ],
					types: 
					   [ { color: '#f29513', id: 'bug', name: 'bug' },
					     { color: '#0000ff', id: 'feature', name: 'feature' } ],
					declaration: 
					   { phases: 
					      { backlog: '#1 backlog',
					        onhold: '#2 onhold',
					        inprogress: '#3 inprogress',
					        inreview: '#4 inreview',
					        implemented: '#5 implemented',
					        closed: '#6 closed' },
					     defaultCategory: '@other' 
					 	}
				});
			}

		}
	}
}).export(module);


