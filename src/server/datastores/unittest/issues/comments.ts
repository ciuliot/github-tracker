import testModels = require('../../../models/test_models');

var model = [
	new testModels.IssueCommentModel({
		user: "utester",
		repo: "tracker",
		number: 1348,
		result: {
		    "id": 1348,
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/comments/1348",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1348#issuecomment-1348",
		    "body": "I am using __markdown__.",
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
		  }
	})
];

export = model;