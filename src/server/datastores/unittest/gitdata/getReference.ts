import testModels = require('../../../models/test_models');

var model = [
	new testModels.GitDataGetReferenceModel({
		user: "utester",
		repo: "tracker",
		ref: "heads/issue/1348",
		result: {
			"ref": "refs/heads/issue/1348",
		  	"url": "https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1348",
		  	"object": {
		    	"type": "commit",
		    	"sha": "aa218f56b14c9653891f9e74264a383fa43fefbd",
		    	"url": "https://api.github.com/repos/octocat/Hello-World/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd"
		  	}
		}
	}),
	new testModels.GitDataGetReferenceModel({
		user: "utester",
		repo: "tracker",
		ref: "heads/issue/1349",
		result: {
			"ref": "refs/heads/issue/1349",
		  	"url": "https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1349",
		  	"object": {
		    	"type": "commit",
		    	"sha": "aa218f56b14c9653891f9e74264a383fa43fefbd",
		    	"url": "https://api.github.com/repos/octocat/Hello-World/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd"
		  	}
		}
	}),
	new testModels.GitDataGetReferenceModel({
		user: "utester",
		repo: "tracker",
		ref: "heads/issue/1350",
		result: {
			"ref": "refs/heads/issue/1350",
		  	"url": "https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1350",
		  	"object": {
		    	"type": "commit",
		    	"sha": "aa218f56b14c9653891f9e74264a383fa43fefbd",
		    	"url": "https://api.github.com/repos/octocat/Hello-World/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd"
		  	}
		}
	}),
	new testModels.GitDataGetReferenceModel({
		user: "utester",
		repo: "tracker",
		ref: "heads/issue/1351",
		result: {
			"ref": "refs/heads/issue/1351",
		  	"url": "https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1351",
		  	"object": {
		    	"type": "commit",
		    	"sha": "aa218f56b14c9653891f9e74264a383fa43fefbd",
		    	"url": "https://api.github.com/repos/octocat/Hello-World/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd"
		  	}
		}
	}),
	new testModels.GitDataGetReferenceModel({
		user: "utester",
		repo: "tracker",
		ref: "heads/issue/1352",
		result: {
			"ref": "refs/heads/issue/1352",
		  	"url": "https://api.github.com/repos/octocat/Hello-World/git/refs/heads/issue/1352",
		  	"object": {
		    	"type": "commit",
		    	"sha": "aa218f56b14c9653891f9e74264a383fa43fefbd",
		    	"url": "https://api.github.com/repos/octocat/Hello-World/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd"
		  	}
		}
	}),
	new testModels.GitDataGetReferenceModel({
		user: "utester",
		repo: "tracker",
		ref: "heads/master",
		result: {
			"ref": "refs/heads/master",
		  	"url": "https://api.github.com/repos/octocat/Hello-World/git/refs/heads/master",
		  	"object": {
		    	"type": "commit",
		    	"sha": "aa218f56b14c9653891f9e74264a383fa43fefbd",
		    	"url": "https://api.github.com/repos/octocat/Hello-World/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd"
		  	}
		}
	})
];

export = model;