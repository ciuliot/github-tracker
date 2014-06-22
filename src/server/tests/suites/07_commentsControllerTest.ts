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

vows.describe("CommentsController").addBatch({
	"Server": {
		topic: testApi.startServerTopic(),
		"Get without parameters": {
			topic: testApi.httpGetTopic("/comments/5"),

			"returns error": testApi.verifyNoUserProvidedError()
		},
		"Get without user": {
			topic: testApi.httpGetTopic("/comments/5?repository=repo"),

			"returns error": testApi.verifyNoUserProvidedError()
		},
		"Get without repository": {
			topic: testApi.httpGetTopic("/comments/5?user=test"),

			"returns error": testApi.verifyNoRepositoryProvidedError()
		},
		"Valid Get": {
			topic: testApi.httpGetTopic("/comments/1347?user=utester&repository=tracker"),

			"returns comment": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);

				result.length.should.eql(1);
				result[0].should.eql({
					"id": 1347,
				    "url": "https://api.github.com/repos/octocat/Hello-World/issues/comments/1347",
				    "html_url": "https://github.com/octocat/Hello-World/issues/1347#issuecomment-1347",
				    "body": "Me too",
				    "user": {
				      "login": "octocat",
				      "id": 1,
				      "avatar_url": "https://github.com/images/error/octocat_happy.gif",
				      "gravatar_id": "somehexcode",
				      "url": "https://api.github.com/users/octocat",
				      "html_url": "https://github.com/octocat",
				      "followers_url": "https://api.github.com/users/octocat/followers",
				      "following_url": "https://api.github.com/users/octocat/following{/other_user}",
				      "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
				      "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
				      "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
				      "organizations_url": "https://api.github.com/users/octocat/orgs",
				      "repos_url": "https://api.github.com/users/octocat/repos",
				      "events_url": "https://api.github.com/users/octocat/events{/privacy}",
				      "received_events_url": "https://api.github.com/users/octocat/received_events",
				      "type": "User",
				      "site_admin": false
				    },
				    "created_at": "2011-04-14T16:00:49Z",
				    "updated_at": "2011-04-14T16:00:49Z"
				});
			}
		},
		"Update without parameters": {
			topic: testApi.httpPutTopic("/comments/0"),

			"returns error": testApi.verifyNoUserProvidedError()
		},
		"Update without user": {
			topic: testApi.httpPutTopic("/comments/0", { repository: "repo", description: "test" }),

			"returns error": testApi.verifyNoUserProvidedError()
		},
		"Update without repository": {
			topic: testApi.httpPutTopic("/comments/0", { user: "test", description: "test" }),

			"returns error": testApi.verifyNoRepositoryProvidedError()
		},
		"Update without body": {
			topic: testApi.httpPutTopic("/comments/0", { user: "test", repository: "repo" }),

			"returns error": testApi.verifyNoParameterProvidedError("description")
		},
		"Valid update": {
			topic: testApi.httpPutTopic("/comments/1", { user: "test", repository: "repo", description: "Contents" }),
		
			"returns new comment": (err: any, response: http.ClientResponse, textBody: string) => {
				var result = testApi.verifyJsonResponse(err, response, textBody);
				//console.log(result);

				result.should.eql({ 
					id: '1',
					url: 'https://api.github.com/repos/octocat/Hello-World/issues/comments/1', 
					html_url: 'https://github.com/octocat/Hello-World/issues/1#issuecomment-1', 
				    body: 'Contents', 
				    user: { 
				    	login: 'octocat', 
				        id: 1, 
				        avatar_url: 'https://github.com/images/error/octocat_happy.gif', 
				        gravatar_id: 'somehexcode', 
				        url: 'https://api.github.com/users/octocat', 
				        html_url: 'https://github.com/octocat', 
				        followers_url: 'https://api.github.com/users/octocat/followers', 
				        following_url: 'https://api.github.com/users/octocat/following{/other_user}', 
				        gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}', 
				        starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}', 
				        subscriptions_url:  'https://api.github.com/users/octocat/subscriptions', 
				        organizations_url: 'https://api.github.com/users/octocat/orgs', 
				        repos_url: 'https://api.github.com/users/octocat/repos', 
				        events_url: 'https://api.github.com/users/octocat/events{/privacy}', 
				        received_events_url: 'https://api.github.com/users/octocat/received_events', 
				        type: 'User', 
				        site_admin: false }, 
				     created_at: '2011-04-14T16:00:49Z', 
				     updated_at: '2011-04-14T16:00:49Z' 
				});
			}
		}
	}
}).export(module);


