import testModels = require('../../../models/test_models');

var model = [
	new testModels.ReposContentModel({
		user: "utester",
		repo: "tracker",
		path: ".tracker/impediments.md",
		result: {
		      "type": "file",
			  "encoding": "base64",
			  "size": 5362,
			  "name": "impediments.md",
			  "path": ".tracker/impediments.md",
			  "content": "",
			  "sha": "3d21ec53a331a6f037a91c368710b99387d012c1",
			  "url": "https://api.github.com/repos/pengwynn/octokit/contents/.tracker/impediments.md",
			  "git_url": "https://api.github.com/repos/pengwynn/octokit/git/blobs/3d21ec53a331a6f037a91c368710b99387d012c1",
			  "html_url": "https://github.com/pengwynn/octokit/blob/master/.tracker/impediments.md",
			  "_links": {
			    "git": "https://api.github.com/repos/pengwynn/octokit/git/blobs/3d21ec53a331a6f037a91c368710b99387d012c1",
			    "self": "https://api.github.com/repos/pengwynn/octokit/contents/.tracker/impediments.md",
			    "html": "https://github.com/pengwynn/octokit/blob/master/.tracker/impediments.md"
			  }
		  }
		}
	)
];

export = model;