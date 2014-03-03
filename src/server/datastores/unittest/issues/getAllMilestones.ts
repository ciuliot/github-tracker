import testModels = require('../../../models/test_models');

var model = [
	new testModels.IssuesGetAllMilestonesModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/milestones/1",
		    "number": 1,
		    "state": "closed",
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
		    "open_issues": 0,
		    "closed_issues": 15,
		    "created_at": "2011-04-10T20:09:31Z",
		    "due_on": null
		  }
	}),
	new testModels.IssuesGetAllMilestonesModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/milestones/2",
		    "number": 2,
		    "state": "open",
		    "title": "v2.0",
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
		    "open_issues": 10,
		    "closed_issues": 5,
		    "created_at": "2011-04-10T20:09:31Z",
		    "due_on": null
		  }
	})
];

export = model;