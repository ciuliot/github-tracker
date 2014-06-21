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
			  "content": "IyMgSW1wZWRpbWVudHMNCg0KX18jMjggLSBbTWlsZXN0b25lIGluZGljYXRvciBpbiBxdWVyeSBzdHJpbmcgYWx3YXlzIHR1cm5zIHRvIG5vbmUgYWZ0ZXIgcmVsb2FkXShodHRwczovL2dpdGh1Yi5jb20vY2l1bGlvdC9naXRodWItdHJhY2tlci9pc3N1ZXMvMjgpX18NCg0KKiAyMDE0LTAyLTEzIC0gMjEzMTMxMjMNCiogMjAxNC0wMi0xMyAtIDMyNDMyNDUyMzQNCiogMjAxNC0wMi0yNiAtIGJsYQ0KDQpfXyMxNSAtIFs0XShodHRwczovL2dpdGh1Yi5jb20vY2l1bGlvdC9naXRodWItdHJhY2tlci9pc3N1ZXMvMTUpX18NCg0KKiAyMDE0LTAyLTEzIC0gdGVzdGluZywgdGVzdGluZw0KDQpfXyMyNCAtIFtoZWhlXShodHRwczovL2dpdGh1Yi5jb20vY2l1bGlvdC9naXRodWItdHJhY2tlci9pc3N1ZXMvMjQpX18NCg0KKiAyMDE0LTAyLTEzIC0gdGVzdDINCg0KX18jOCAtIFt5cmR5XShodHRwczovL2dpdGh1Yi5jb20vY2l1bGlvdC9naXRodWItdHJhY2tlci9pc3N1ZXMvOClfXw0KDQoqIDIwMTQtMDItMjYgLSBMYWxhDQo=",
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