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
	})
];

export = model;