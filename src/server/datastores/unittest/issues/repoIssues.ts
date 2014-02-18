import testModels = require('../../../models/test_models');

var model = [
	new testModels.IssuesRepoIssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "open",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1347",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1347",
		    "number": 1347,
		    "state": "open",
		    "title": "Issue in backlog",
		    "body": "I'm having a problem with this.",
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
		    "labels": [],
		    "milestone": {
		      "url": "https://api.github.com/repos/octocat/Hello-World/milestones/1",
		      "number": 1,
		      "state": "open",
		      "title": "v1.0",
		      "description": "",
		      "creator": {
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
		      "open_issues": 4,
		      "closed_issues": 8,
		      "created_at": "2011-04-10T20:09:31Z",
		      "due_on": null
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": "https://github.com/octocat/Hello-World/pull/1347",
		      "diff_url": "https://github.com/octocat/Hello-World/pull/1347.diff",
		      "patch_url": "https://github.com/octocat/Hello-World/pull/1347.patch"
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	}),
	new testModels.IssuesRepoIssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "open",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1348",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1348",
		    "number": 1348,
		    "state": "open",
		    "title": "Issue in progress",
		    "body": "__Estimate:__ XL\n***\nI'm working on it.",
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
		    "labels": [
		      {
		        "url": "https://api.github.com/repos/octocat/Hello-World/labels/#inprogress",
			    "name": "#inprogress",
			    "color": "000001"
		      }, {
		      	"url": "https://api.github.com/repos/octocat/Hello-World/labels/@frontend",
		    	"name": "@frontend",
		    	"color": "ff0000"
		      }, {
		    	"url": "https://api.github.com/repos/octocat/Hello-World/labels/feature",
		    	"name": "feature",
		    	"color": "0000ff"
		      }
		    ],
		    "assignee": {
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
		    "milestone": {
		      "url": "https://api.github.com/repos/octocat/Hello-World/milestones/1",
		      "number": 1,
		      "state": "open",
		      "title": "v1.0",
		      "description": "",
		      "creator": {
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
		      "open_issues": 4,
		      "closed_issues": 8,
		      "created_at": "2011-04-10T20:09:31Z",
		      "due_on": null
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": "https://github.com/octocat/Hello-World/pull/1347",
		      "diff_url": "https://github.com/octocat/Hello-World/pull/1347.diff",
		      "patch_url": "https://github.com/octocat/Hello-World/pull/1347.patch"
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	}),
	new testModels.IssuesRepoIssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "open",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1349",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1349",
		    "number": 1349,
		    "state": "open",
		    "title": "Implemented bug",
		    "body": "__Estimate:__ S\n__Expected behavior:__ Works correctly\n__Environment:__ Browser***\n1. Doesn't really work\n2. And crashes",
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
		    "labels": [
		      {
		        "url": "https://api.github.com/repos/octocat/Hello-World/labels/#implemented",
		   		"name": "#implemented",
		    	"color": "000002"
		      }, {
		      	"url": "https://api.github.com/repos/octocat/Hello-World/labels/@backend",
		    	"name": "@backend",
		    	"color": "00ff00"
		      }, {
		    	"url": "https://api.github.com/repos/octocat/Hello-World/labels/bug",
		    	"name": "bug",
		    	"color": "f29513"
		      }
		    ],
		    "assignee": {
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
		    "milestone": {
		      "url": "https://api.github.com/repos/octocat/Hello-World/milestones/1",
		      "number": 1,
		      "state": "open",
		      "title": "v1.0",
		      "description": "",
		      "creator": {
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
		      "open_issues": 4,
		      "closed_issues": 8,
		      "created_at": "2011-04-10T20:09:31Z",
		      "due_on": null
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": "https://github.com/octocat/Hello-World/pull/1347",
		      "diff_url": "https://github.com/octocat/Hello-World/pull/1347.diff",
		      "patch_url": "https://github.com/octocat/Hello-World/pull/1347.patch"
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	}),
	new testModels.IssuesRepoIssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "closed",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1350",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1350",
		    "number": 1350,
		    "state": "closed",
		    "title": "Completed task",
		    "body": "Refactor",
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
		    "labels": [
		      {
		      	"url": "https://api.github.com/repos/octocat/Hello-World/labels/@backend",
		    	"name": "@backend",
		    	"color": "00ff00"
		      }
		    ],
		    "assignee": {
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
		    "milestone": {
		      "url": "https://api.github.com/repos/octocat/Hello-World/milestones/1",
		      "number": 1,
		      "state": "open",
		      "title": "v1.0",
		      "description": "",
		      "creator": {
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
		      "open_issues": 4,
		      "closed_issues": 8,
		      "created_at": "2011-04-10T20:09:31Z",
		      "due_on": null
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": "https://github.com/octocat/Hello-World/pull/1347",
		      "diff_url": "https://github.com/octocat/Hello-World/pull/1347.diff",
		      "patch_url": "https://github.com/octocat/Hello-World/pull/1347.patch"
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	})
];

export = model;