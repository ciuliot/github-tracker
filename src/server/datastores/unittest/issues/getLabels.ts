import testModels = require('../../../models/test_models');

var model = [
	new testModels.IssuesGetLabelsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/bug",
		    "name": "bug",
		    "color": "f29513"
		  }
	}),
	new testModels.IssuesGetLabelsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/feature",
		    "name": "feature",
		    "color": "0000ff"
		  }
	}),
	new testModels.IssuesGetLabelsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/#2 onhold",
		    "name": "#2 onhold",
		    "color": "000000"
		  }
	}),
	new testModels.IssuesGetLabelsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/#3 inprogress",
		    "name": "#3 inprogress",
		    "color": "000001"
		  }
	}),
	new testModels.IssuesGetLabelsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/#4 inreview",
		    "name": "#4 inreview",
		    "color": "000002"
		  }
	}),
	new testModels.IssuesGetLabelsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/#5 implemented",
		    "name": "#5 implemented",
		    "color": "000002"
		  }
	}),
	new testModels.IssuesGetLabelsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/@frontend",
		    "name": "@frontend",
		    "color": "ff0000"
		  }
	}),
	new testModels.IssuesGetLabelsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/@backend",
		    "name": "@backend",
		    "color": "00ff00"
		  }
	})
];

export = model;