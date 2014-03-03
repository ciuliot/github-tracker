import testModels = require('../../../models/test_models');

var model = [
	new testModels.ReposGetCollaboratorsModel({
		user: "utester",
		repo: "tracker",
		result: {
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
		  }
		}
	),
	new testModels.ReposGetCollaboratorsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "login": "octodog",
		    "id": 2,
		    "avatar_url": "https://github.com/images/error/octocat_sad.gif",
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
		  }
		}
	)
];

export = model;