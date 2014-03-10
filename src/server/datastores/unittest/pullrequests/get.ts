import testModels = require('../../../models/test_models');

var model = [
	new testModels.PullRequestModel({
		user: "utester",
		repo: "tracker",
		number: 1350,
		state: "open",
		result: {
		      "url": "https://api.github.com/repos/octocat/Hello-World/pulls/1350",
			  "html_url": "https://github.com/octocat/Hello-World/pull/1350",
			  "diff_url": "https://github.com/octocat/Hello-World/pulls/1350.diff",
			  "patch_url": "https://github.com/octocat/Hello-World/pulls/1350.patch",
			  "issue_url": "https://api.github.com/repos/octocat/Hello-World/issues/1350",
			  "commits_url": "https://api.github.com/repos/octocat/Hello-World/pulls/1350/commits",
			  "review_comments_url": "https://api.github.com/repos/octocat/Hello-World/pulls/1350/comments",
			  "review_comment_url": "https://api.github.com/repos/octocat/Hello-World/pulls/comments/{number}",
			  "comments_url": "https://api.github.com/repos/octocat/Hello-World/issues/1/comments",
			  "statuses_url": "https://api.github.com/repos/octocat/Hello-World/statuses/6dcb09b5b57875f334f61aebed695e2e4193db5e",
			  "number": 1350,
			  "state": "open",
			  "title": "new-feature",
			  "body": "Please pull these awesome changes",
			  "created_at": "2011-01-26T19:01:12Z",
			  "updated_at": "2011-01-26T19:01:12Z",
			  "closed_at": "2011-01-26T19:01:12Z",
			  "merged_at": "2011-01-26T19:01:12Z"
		  }
	}),
	new testModels.PullRequestModel({
		user: "utester",
		repo: "tracker",
		number: 1351,
		state: "closed",
		result: {
		      "url": "https://api.github.com/repos/octocat/Hello-World/pulls/1351",
			  "html_url": "https://github.com/octocat/Hello-World/pull/1351",
			  "diff_url": "https://github.com/octocat/Hello-World/pulls/1351.diff",
			  "patch_url": "https://github.com/octocat/Hello-World/pulls/1351.patch",
			  "issue_url": "https://api.github.com/repos/octocat/Hello-World/issues/1351",
			  "commits_url": "https://api.github.com/repos/octocat/Hello-World/pulls/1351/commits",
			  "review_comments_url": "https://api.github.com/repos/octocat/Hello-World/pulls/1351/comments",
			  "review_comment_url": "https://api.github.com/repos/octocat/Hello-World/pulls/comments/{number}",
			  "comments_url": "https://api.github.com/repos/octocat/Hello-World/issues/1/comments",
			  "statuses_url": "https://api.github.com/repos/octocat/Hello-World/statuses/6dcb09b5b57875f334f61aebed695e2e4193db5e",
			  "number": 1351,
			  "state": "closed",
			  "title": "new-feature",
			  "body": "Please pull these awesome changes",
			  "created_at": "2011-01-26T19:01:12Z",
			  "updated_at": "2011-01-26T19:01:12Z",
			  "closed_at": "2011-01-26T19:01:12Z",
			  "merged_at": "2011-01-26T19:01:12Z"
		  }
	}),
new testModels.PullRequestModel({
		user: "utester",
		repo: "tracker",
		number: 1352,
		state: "closed",
		result: {
		      "url": "https://api.github.com/repos/octocat/Hello-World/pulls/1352",
			  "html_url": "https://github.com/octocat/Hello-World/pull/1352",
			  "diff_url": "https://github.com/octocat/Hello-World/pulls/1352.diff",
			  "patch_url": "https://github.com/octocat/Hello-World/pulls/1352.patch",
			  "issue_url": "https://api.github.com/repos/octocat/Hello-World/issues/1352",
			  "commits_url": "https://api.github.com/repos/octocat/Hello-World/pulls/1352/commits",
			  "review_comments_url": "https://api.github.com/repos/octocat/Hello-World/pulls/1352/comments",
			  "review_comment_url": "https://api.github.com/repos/octocat/Hello-World/pulls/comments/{number}",
			  "comments_url": "https://api.github.com/repos/octocat/Hello-World/issues/1/comments",
			  "statuses_url": "https://api.github.com/repos/octocat/Hello-World/statuses/6dcb09b5b57875f334f61aebed695e2e4193db5e",
			  "number": 1352,
			  "state": "closed",
			  "title": "new-feature",
			  "body": "Please pull these awesome changes",
			  "created_at": "2011-01-26T19:01:12Z",
			  "updated_at": "2011-01-26T19:01:12Z",
			  "closed_at": "2011-01-26T19:01:12Z",
			  "merged_at": "2011-01-26T19:01:12Z"
		  }
	})
];

export = model;