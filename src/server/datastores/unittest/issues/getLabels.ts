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
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/#onhold",
		    "name": "#onhold",
		    "color": "000000"
		  }
	}),
	new testModels.IssuesGetLabelsModel({
		user: "utester",
		repo: "tracker",
		result: {
		    "url": "https://api.github.com/repos/octocat/Hello-World/labels/#implemented",
		    "name": "#implemented",
		    "color": "000001"
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