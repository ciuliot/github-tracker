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

vows.describe("IssuesController").addBatch({
	"Server": {
		topic: testApi.startServerTopic(),
		"Index": {
			"without user, repository and milestone": {
				topic: testApi.httpGetTopic("/issues"),
				"returns error": testApi.verifyNoUserProvidedError()
			},
			"without user and milestone": {
				topic: testApi.httpGetTopic("/issues?repository=repo"),
				"returns error": testApi.verifyNoUserProvidedError()
			},
			"without repository and milestone": {
				topic: testApi.httpGetTopic("/issues?user=test"),
				"returns error": testApi.verifyNoRepositoryProvidedError()
			},
			"without repository": {
				topic: testApi.httpGetTopic("/issues?user=test&milestone=*"),

				"returns error": testApi.verifyNoRepositoryProvidedError()
			},
			"without user": {
				topic: testApi.httpGetTopic("/issues?repository=repo&milestone=*"),

				"returns error": testApi.verifyNoUserProvidedError()
			},
			"without milestone": {
				topic: testApi.httpGetTopic("/issues?user=test&repository=repo"),

				"returns error": testApi.verifyNoParameterProvidedError("milestone")
			},
			// ToDo
			/*"invalid user and repository": {
				topic: testApi.httpGetTopic("/issues?user=foo&repository=bar&milestone=*"),
			
				"returns empty array": testApi.verifyAccessDeniedError()
			},
			"invalid milestone": {
				topic: testApi.httpGetTopic("/issues?user=utester&repository=tracker&milestone=99"),
			
				"returns empty array": testApi.verifyAccessDeniedError()
			},*/
			"valid user and repository": {
				topic: testApi.httpGetTopic("/issues?user=utester&repository=tracker&milestone=1"),
			
				"returns milestones": (err: any, response: http.ClientResponse, textBody: string) => {
					var result = testApi.verifyJsonResponse(err, response, textBody);
					//console.log(JSON.stringify(result));

					result.should.eql({
						issues: [{
							title: 'Issue in backlog', 
					        category: { color: null, id: '@other', name: 'other' }, 
							phase: { color: null, id: '#backlog', name: 'backlog' }, 
					        type: { color: null, name: null, id: null }, 
					        number: 1347, 
					        compareUrl: null, 
					        description: 'I\'m having a problem with this.', 
					        branch: { name: null, url: null }, 
					        assignee: { login: null, avatar_url: null }
						}, {
							title: 'Issue in progress', 
					        category: { color: "#ff0000", id: '@frontend', name: 'frontend' }, 
							phase: { color: "#000001", id: '#inprogress', name: 'inprogress' }, 
					        type: { color: '#0000ff', name: 'feature', id: 'feature' }, 
					        number: 1348, 
					        compareUrl: 'https://github.com/utester/tracker/compare/master...issue/1348', 
					        description: 'I\'m working on it.', 
					        branch: { 
					        	ref: 'refs/heads/issue/1348', 
					        	name: 'issue/1348', 
					        	url: 'https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1348' 
					        },
					        assignee: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat_happy.gif' },
					        estimate: "XL"
						}, {
							title: 'Implemented bug', 
					        category: { color: '#00ff00', id: '@backend', name: 'backend' },
							phase: { color: '#000002', id: '#implemented', name: 'implemented' }, 
					        type: { color: '#f29513', id: 'bug', name: 'bug' }, 
					        number: 1349, 
					        compareUrl: null, 
					        description: '1. Doesn\'t really work\n2. And crashes', 
					        branch: { name: null, url: null }, 
					        assignee: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat_happy.gif' },
					        estimate: "S",
					        expectedBehavior: 'Works correctly', 
					        environment: 'Browser'
						}, {
							title: 'Completed task', 
					        category: { color: '#00ff00', id: '@backend', name: 'backend' },
							phase: { color: null, id: '#closed', name: 'closed' }, 
					        type: { name: null, id: null, color: null }, 
					        number: 1350, 
					        compareUrl: null, 
					        description: 'Refactor', 
					        branch: { name: null, url: null }, 
					        assignee: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat_happy.gif' }
						}],
						meta: {
							estimateSizes: { XS: 1, SM: 2, M: 3, L: 5, XL: 8 },
							branchNameFormat: 'issue/%d',
							priorityTypes: [ 'bug' ] 
						}
					});
				}
			}
		},
		"Create": {
			"without parameters": {
				topic: testApi.httpPostTopic("/issues"),

				"returns error": testApi.verifyNoUserProvidedError()
			},
			"without user": {
				topic: testApi.httpPostTopic("/issues", { repository: "repo", title: "title", body: "body" }),

				"returns error": testApi.verifyNoUserProvidedError()
			},
			"without repository": {
				topic: testApi.httpPostTopic("/issues", { user: "user", title: "title", body: "body" }),

				"returns error": testApi.verifyNoRepositoryProvidedError()
			},
			"without title": {
				topic: testApi.httpPostTopic("/issues", { user: "user", repository: "repo", body: "body" }),

				"returns error": testApi.verifyNoParameterProvidedError("title")
			},
			"without body": {
				topic: testApi.httpPostTopic("/issues", { user: "user", repository: "repo", title: "title" }),

				"returns error": testApi.verifyNoParameterProvidedError("body")
			},
			"without category and type": {
				topic: testApi.httpPostTopic("/issues", { 
					user: "utester", 
					repository: "tracker", 
					title: "new issue", 
					body: {
						description: "Check it out!"
					} 
				}),

				"returns valid issue": (err: any, response: http.ClientResponse, textBody: string) => {
					var result = testApi.verifyJsonResponse(err, response, textBody);
					should.exist(result.number);
					result.should.eql({
						title: "new issue",
						category: { color: null, id: '@other', name: 'other' },
						phase: { color: null, id: '#backlog', name: 'backlog' },
						type: { name: null, id: null, color: null }, 
						number: result.number,
						compareUrl: null,
						description: 'Check it out!', 
						assignee: { login: null, avatar_url: null }
					});
				}
			},
			"with category and type": {
				topic: testApi.httpPostTopic("/issues", { 
					user: "utester", 
					repository: "tracker", 
					title: "new bug", 
					body: {
						description: "Check it out!",
						type: { id: "bug" },
						category: { id: "@backend" },
						estimate: "S",
						expectedBehavior: "Will work",
						environment: "Browser"
					} 
				}),

				"returns valid issue": (err: any, response: http.ClientResponse, textBody: string) => {
					var result = testApi.verifyJsonResponse(err, response, textBody);
					should.exist(result.number);
					result.should.eql({
						title: "new bug",
						category: { color: '#00ff00', id: '@backend', name: 'backend' },
						phase: { color: null, id: '#backlog', name: 'backlog' },
						type: { name: 'bug', id: 'bug', color: '#f29513' }, 
						number: result.number,
						compareUrl: null,
						description: 'Check it out!', 
						assignee: { login: null, avatar_url: null }, 
						estimate: 'S',
						expectedBehavior: "Will work",
						environment: 'Browser'
					});
				}
			},
		},
		"Update": 
		{
			"without parameters": {
				topic: testApi.httpPutTopic("/issues/0"),

				"returns error": testApi.verifyNoUserProvidedError()
			},
			"without user": {
				topic: testApi.httpPutTopic("/issues/0", { repository: "repo" }),

				"returns error": testApi.verifyNoUserProvidedError()
			},
			"without repository": {
				topic: testApi.httpPutTopic("/issues/*", { user: "user" }),

				"returns error": testApi.verifyNoRepositoryProvidedError()
			},
			"without operation": {
				topic: testApi.httpPutTopic("/issues/*", { user: "user", repository: "repo" }),

				"returns error": testApi.verifyErrorJsonResponse("Operation not allowed")
			}
		}
	}
}).export(module);


