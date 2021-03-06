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
			
				"returns issue": (err: any, response: http.ClientResponse, textBody: string) => {
					var result = testApi.verifyJsonResponse(err, response, textBody);
					//console.log(JSON.stringify(result));

					should.exist(result.issues);
					should.exist(result.issues.length);
					result.issues.length.should.eql(6);

					should.exist(result.meta);
					result.meta.should.eql({
							estimateSizes: { XS: 1, S: 2, M: 3, L: 5, XL: 8 },
							branchNameFormat: 'issue/%d',
							priorityTypes: [ 'bug' ] 
					});

					result.issues[0].should.eql({
						title: 'Issue in backlog', 
				        category: { color: null, id: '@other', name: 'other' }, 
						phase: { color: null, id: '#backlog', name: 'backlog' }, 
				        type: { color: null, name: null, id: null }, 
				        milestone: null,
				        number: 1347, 
				        compareUrl: null, 
				        updated_at: "2011-04-22T13:33:48Z",
				        description: 'I\'m having a problem with this.', 
				        pull_request: { html_url: null, state: null },
				        branch: { name: null, url: null }, 
				        assignee: { login: null, avatar_url: null }
					});

					result.issues[1].should.eql({
						title: 'Issue in progress', 
				        category: { color: "#ff0000", id: '@frontend', name: 'frontend' }, 
						phase: { color: null, id: '#inprogress', name: 'inprogress' }, 
				        type: { color: '#0000ff', name: 'feature', id: 'feature' }, 
				        milestone: "1",
				        number: 1348, 
				        updated_at: "2011-04-22T13:33:48Z",
				        compareUrl: 'https://github.com/utester/tracker/compare/master...issue/1348', 
				        description: 'I\'m working on it.', 
				        pull_request: { html_url: null, state: null },
				        branch: { 
				        	ref: 'refs/heads/issue/1348', 
				        	name: 'issue/1348', 
				        	url: 'https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1348' 
				        },
				        assignee: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat_happy.gif' },
				        estimate: "XL"
					});

					result.issues[2].should.eql({
						title: 'Issue on hold', 
				        category: { color: "#ff0000", id: '@frontend', name: 'frontend' }, 
				        milestone: "1",
						phase: { color: "#000000", id: '#onhold', name: 'onhold' }, 
				        type: { color: '#0000ff', name: 'feature', id: 'feature' }, 
				        number: 1349, 
				        updated_at: "2011-04-22T13:33:48Z",
				        compareUrl: 'https://github.com/utester/tracker/compare/master...issue/1349', 
				        description: 'Paused.', 
				        pull_request: { html_url: null, state: null },
				        branch: { 
				        	ref: 'refs/heads/issue/1349', 
				        	name: 'issue/1349', 
				        	url: 'https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1349' 
				        },
				        assignee: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat_happy.gif' },
				        estimate: "S"
					});

					result.issues[3].should.eql({
						title: 'Bug in review', 
				        category: { color: '#00ff00', id: '@backend', name: 'backend' },
						phase: { color: null, id: '#inreview', name: 'inreview' }, 
						milestone: "1",
				        type: { color: '#f29513', id: 'bug', name: 'bug' }, 
				        number: 1350,
				        updated_at: "2011-04-22T13:33:48Z", 
				        compareUrl: 'https://github.com/utester/tracker/compare/master...issue/1350', 
				        description: '1. Doesn\'t really work\n2. And crashes',
				        pull_request: { 
				        	html_url: "https://github.com/octocat/Hello-World/pull/1350", 
				        	state: "open" 
				        },
				        branch: { 
				        	ref: 'refs/heads/issue/1350', 
				        	name: 'issue/1350', 
				        	url: 'https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1350' 
				        },
				        assignee: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat_happy.gif' },
				        estimate: "S",
				        expectedBehavior: 'Works correctly', 
					    environment: 'Browser'
					});

					result.issues[4].should.eql({
						title: 'Completed task', 
				        category: { color: '#00ff00', id: '@backend', name: 'backend' },
						phase: { color: '#000001', id: '#implemented', name: 'implemented' }, 
						milestone: "1",
				        type: { color: null, id: null, name: null }, 
				        number: 1351, 
				        updated_at: "2011-04-22T13:33:48Z",
				        compareUrl: 'https://github.com/utester/tracker/compare/master...issue/1351', 
				        description: 'Refactor',
				        pull_request: { 
				        	html_url: "https://github.com/octocat/Hello-World/pull/1351", 
				        	state: "open" 
				        },
				        branch: { 
				        	ref: 'refs/heads/issue/1351', 
				        	name: 'issue/1351', 
				        	url: 'https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1351' 
				        },
				        assignee: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat_happy.gif' }
					});

					result.issues[5].should.eql({
						title: 'Closed task', 
				        category: { color: '#ff0000', id: '@frontend', name: 'frontend' },
				        milestone: "1",
						phase: { color: null, id: '#closed', name: 'closed' }, 
				        type: { color: '#0000ff', name: 'feature', id: 'feature' }, 
				        number: 1352, 
				        updated_at: "2011-04-22T13:33:48Z",
				        compareUrl: null, 
				        description: 'All done!',
				        pull_request: { html_url: null, state: null },
				        branch: { name: null, url: null },
				        assignee: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat_happy.gif' },
				        estimate: "M"
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
						milestone: 1,
						phase: { color: null, id: '#backlog', name: 'backlog' },
						type: { name: null, id: null, color: null }, 
						pull_request: { html_url: null, state: null }, 
						number: result.number,
						updated_at: "2011-04-22T13:33:48Z",
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
						milestone: 1,
						category: { color: '#00ff00', id: '@backend', name: 'backend' },
						phase: { color: null, id: '#backlog', name: 'backlog' },
						type: { name: 'bug', id: 'bug', color: '#f29513' }, 
						number: result.number,
						updated_at: "2011-04-22T13:33:48Z",
						compareUrl: null,
						pull_request: { html_url: null, state: null }, 
						description: 'Check it out!', 
						assignee: { login: null, avatar_url: null }, 
						estimate: 'S',
						expectedBehavior: "Will work",
						environment: 'Browser'
					});
				}
			}
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
				topic: testApi.httpPutTopic("/issues/0", { user: "user" }),

				"returns error": testApi.verifyNoRepositoryProvidedError()
			},
			"without operation": {
				topic: testApi.httpPutTopic("/issues/0", { user: "user", repository: "repo" }),

				"returns error": testApi.verifyErrorJsonResponse("Operation not allowed")
			},
			"collaborator": {
				topic: testApi.httpPostTopic("/issues", { 
					user: "utester", 
					repository: "tracker", 
					title: "new issue", 
					body: {
						description: "Check it out!"
					} 
				}),
				"update issue": {
					topic: function (response: http.ClientResponse, textBody: string) {
						var result = testApi.verifyJsonResponse(null, response, textBody);
						testApi.httpPut("/issues/" + result.number, this.callback, { user: "utester", repository: "tracker", collaborator: "other_user" });
					},
					"returns updated issue": (err: any, response: http.ClientResponse, textBody: string) => {
						var result = testApi.verifyJsonResponse(err, response, textBody);

						should.exist(result.assignee);
						result.assignee.login.should.eql("other_user");
					}
				}	
			},
			"phase": {
				topic: testApi.httpPostTopic("/issues", { 
					user: "utester", 
					repository: "tracker", 
					title: "new issue for phase update", 
					body: {
						description: "Check it out!"
					} 
				}),
				"start work": {
					topic: function (response: http.ClientResponse, textBody: string) {
						var result = testApi.verifyJsonResponse(null, response, textBody);
						testApi.httpPut("/issues/" + result.number, this.callback, { user: "utester", repository: "tracker", phase: "#inprogress" });
					},
					"returns updated issue": (err: any, response: http.ClientResponse, textBody: string) => {
						var result = testApi.verifyJsonResponse(err, response, textBody);

						should.exist(result.phase);
						result.phase.id.should.eql("#inprogress");
					},
					"complete work": {
						topic: function (response: http.ClientResponse, textBody: string) {
							var result = testApi.verifyJsonResponse(null, response, textBody);
							testApi.httpPut("/issues/" + result.number, this.callback, { user: "utester", repository: "tracker", phase: "#inreview" });
						},
						"returns reviewed issue": (err: any, response: http.ClientResponse, textBody: string) => {
							var result = testApi.verifyJsonResponse(err, response, textBody);

							should.exist(result.phase);
							result.phase.id.should.eql("#inreview");
						},
						"review work": {
							topic: function (response: http.ClientResponse, textBody: string) {
								var result = testApi.verifyJsonResponse(null, response, textBody);
								testApi.httpPut("/issues/" + result.number, this.callback, { user: "utester", repository: "tracker", phase: "#implemented" });
							},
							"returns implemented issue": (err: any, response: http.ClientResponse, textBody: string) => {
								var result = testApi.verifyJsonResponse(err, response, textBody);

								should.exist(result.phase);
								result.phase.id.should.eql("#implemented");
							},
							"accept work": {
								topic: function (response: http.ClientResponse, textBody: string) {
									var result = testApi.verifyJsonResponse(null, response, textBody);
									testApi.httpPut("/issues/" + result.number, this.callback, { user: "utester", repository: "tracker", phase: "#closed" });
								},
								"returns closed issue": (err: any, response: http.ClientResponse, textBody: string) => {
									var result = testApi.verifyJsonResponse(err, response, textBody);

									should.exist(result.phase);
									result.phase.id.should.eql("#closed");
								}
							}
						}
					}
				}
			},
			"body": {
				topic: testApi.httpPostTopic("/issues", { 
					user: "utester", 
					repository: "tracker", 
					title: "new feature", 
					body: {
						description: "Check it out!",
						type: { id: "feature" },
						estimate: "XL"
					} 
				}),
				"update issue": {
					topic: function (response: http.ClientResponse, textBody: string) {
						var result = testApi.verifyJsonResponse(null, response, textBody);
						testApi.httpPut("/issues/" + result.number, this.callback, { 
							user: "utester", 
							repository: "tracker", 
							body: {
								title: "new bug",
								description: "Woo!",
								type: { id: "bug" },
								category: { id: "@backend" },
								estimate: "S",
								expectedBehavior: "Will function properly",
								environment: "Desktop"
							} 
						});
					},
					"returns updated issue": (err: any, response: http.ClientResponse, textBody: string) => {
						var result = testApi.verifyJsonResponse(err, response, textBody);

						should.exist(result.number);
						console.log(JSON.stringify(result));
						result.should.eql({
							title: "new bug",
							category: { color: '#00ff00', id: '@backend', name: 'backend' },
							phase: { color: null, id: '#backlog', name: 'backlog' },
							type: { color: '#f29513', name: 'bug', id: 'bug' }, 
							branch: { name: null, url: null },
							milestone: 1,
							number: result.number,
							updated_at: "2011-04-22T13:33:48Z",
							compareUrl: null,
							description: 'Woo!', 
							assignee: { login: null, avatar_url: null }, 
							pull_request: { html_url: null, state: null },
							estimate: 'S',
							expectedBehavior: "Will function properly",
							environment: 'Desktop'
						});
					}
				}
			}
		}
	}
}).export(module);


