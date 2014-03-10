import testModels = require('../../../models/test_models');

var model = [
	new testModels.IssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "open",
		number: 1347,
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1347",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1347",
		    "number": 1347,
		    "state": "open",
		    "title": "Issue in backlog",
		    "body": "I'm having a problem with this.",
		    "labels": [],
		    "milestone": {
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": null,
		      "diff_url": null,
		      "patch_url": null
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	}),
	new testModels.IssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "open",
		number: 1348,
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1348",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1348",
		    "number": 1348,
		    "state": "open",
		    "title": "Issue in progress",
		    "body": "__Estimate:__ XL\n***\nI'm working on it.",
		    "labels": [
		      {
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
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": null,
		      "diff_url": null,
		      "patch_url": null
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	}),
new testModels.IssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "open",
		number: 1349,
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1348",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1348",
		    "number": 1349,
		    "state": "open",
		    "title": "Issue on hold",
		    "body": "__Estimate:__ S\n***\nPaused.",
		    "labels": [
		      {
		      	"url": "https://api.github.com/repos/octocat/Hello-World/labels/@frontend",
		    	"name": "@frontend",
		    	"color": "ff0000"
		      }, {
		    	"url": "https://api.github.com/repos/octocat/Hello-World/labels/feature",
		    	"name": "feature",
		    	"color": "0000ff"
		      }, {
		      	"url": "https://api.github.com/repos/octocat/Hello-World/labels/#2 onhold",
		    	"name": "#onhold",
		    	"color": "000000"
		      }
		    ],
		    "assignee": {
		      "login": "octocat",
		      "id": 1,
		      "avatar_url": "https://github.com/images/error/octocat_happy.gif",
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": null,
		      "diff_url": null,
		      "patch_url": null
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	}),
	new testModels.IssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "open",
		number: 1350,
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1350",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1350",
		    "number": 1350,
		    "state": "open",
		    "title": "Bug in review",
		    "body": "__Estimate:__ S\n__Expected behavior:__ Works correctly\n__Environment:__ Browser***\n1. Doesn't really work\n2. And crashes",
		    "labels": [
		      {
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
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": "https://github.com/octocat/Hello-World/pull/1350",
		      "diff_url": "https://github.com/octocat/Hello-World/pull/1350.diff",
		      "patch_url": "https://github.com/octocat/Hello-World/pull/1350.patch"
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	}),
	new testModels.IssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "open",
		number: 1351,
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1351",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1351",
		    "number": 1351,
		    "state": "open",
		    "title": "Completed task",
		    "body": "Refactor",
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
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": "https://github.com/octocat/Hello-World/pull/1351",
		      "diff_url": "https://github.com/octocat/Hello-World/pull/1351.diff",
		      "patch_url": "https://github.com/octocat/Hello-World/pull/1351.patch"
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	}),
	new testModels.IssuesModel({
		user: "utester",
		repo: "tracker",
		milestone: "1",
		state: "closed",
		number: 1352,
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/issues/1352",
		    "html_url": "https://github.com/octocat/Hello-World/issues/1352",
		    "number": 1352,
		    "state": "closed",
		    "title": "Closed task",
		    "body": "__Estimate:__ M\n***\nAll done!",
		    "labels": [
		      {
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
		    },
		    "comments": 0,
		    "pull_request": {
		      "html_url": "https://github.com/octocat/Hello-World/pull/1352",
		      "diff_url": "https://github.com/octocat/Hello-World/pull/1352.diff",
		      "patch_url": "https://github.com/octocat/Hello-World/pull/1352.patch"
		    },
		    "closed_at": null,
		    "created_at": "2011-04-22T13:33:48Z",
		    "updated_at": "2011-04-22T13:33:48Z"
		}
	})
];

export = model;