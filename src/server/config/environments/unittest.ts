import configuration = require("../configuration");
import mongoose = require('mongoose');
import log4js = require('log4js');

import testModels = require('../../models/test_models');

class TestDataFactory {
	static logger = log4js.getLogger("TestData");
	user = {
		get(data: any, callback: Function) { TestDataFactory.getOne(testModels.UserGetModel, data, callback); }
	};
	repos = {
		getCollaborators(data: any, callback: Function) { TestDataFactory.get(testModels.ReposGetCollaboratorsModel, data, callback); }
	};
	issues = {
		getAllMilestones(data: any, callback: Function) { TestDataFactory.get(testModels.IssuesGetAllMilestonesModel, data, callback); },
		getLabels(data: any, callback: Function) { TestDataFactory.get(testModels.IssuesGetLabelsModel, data, callback); },
		repoIssues(data: any, callback: Function) { TestDataFactory.get(testModels.IssuesModel, data, callback); },
		createComment(data: any, callback: Function) {
			var payload = {
				user: data.user,
				repo: data.repo,
				number: data.number,
				result: {
					id: data.number,
					url: "https://api.github.com/repos/octocat/Hello-World/issues/comments/" + data.number,
					html_url: "https://github.com/octocat/Hello-World/issues/" + data.number + "#issuecomment-1",
					body: data.body,
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
			};
			TestDataFactory.save(testModels.IssueCommentModel, payload, callback);
		},
		create: (data: any, callback: Function) => {
			var number = Math.floor(Math.random() * 1000);
			var payload: any = {
				user: data.user,
				repo: data.repo,
				milestone: data.milestone,
				state: "open",
				result: {
				    "url": "https://api.github.com/repos/octocat/Hello-World/issues/" + number,
				    "html_url": "https://github.com/octocat/Hello-World/issues/" + number,
				    "number": + number,
				    "state": "open",
				    "title": data.title,
				    "body": data.body,
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
				    "labels": data.labels.map((x: any) => { return { name: x } }),
				    "milestone": {
				      "url": "https://api.github.com/repos/octocat/Hello-World/milestones/1",
				      "number": 1,
				      "state": "open",
				      "title": "v1.0",
				      "description": "",
				      "creator": {
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
				      "open_issues": 4,
				      "closed_issues": 8,
				      "created_at": "2011-04-10T20:09:31Z",
				      "due_on": null
				    },
				    "comments": 0,
				    "pull_request": {
				      "html_url": "https://github.com/octocat/Hello-World/pull/1347",
				      "diff_url": "https://github.com/octocat/Hello-World/pull/1347.diff",
				      "patch_url": "https://github.com/octocat/Hello-World/pull/1347.patch"
				    },
				    "closed_at": null,
				    "created_at": "2011-04-22T13:33:48Z",
				    "updated_at": "2011-04-22T13:33:48Z"
				}
			};

			TestDataFactory.save(testModels.IssuesModel, payload, callback);
		}
	};
	gitdata = {
		getReference(data: any, callback: Function) { 
			TestDataFactory.getOne(testModels.GitDataGetReferenceModel, data, (err: any, data: any) => {
				if (!data) {
					err = { code: 404 };
				}

				callback(err, data);
			}); 
		}
	}

	authenticate(data: any) {
		//TestDataFactory.logger.info("Authenticating with %s: %s", data.type, data.token);
	}

	static save(model: mongoose.IMongooseSearchable, payload: any, callback: Function) {
		model(payload).save((err: any, data: any) => {
			callback(err, TestDataFactory.convertResult(err, data));
		});
	}

	static get(model: mongoose.IMongooseSearchable, args: any, callback: Function) {
		model.find(args, (err:any, data:any[]) => {
			/* istanbul ignore else */
			if (!err) {
				data = data.map( (x: any) => { return x.result });
			}
			callback(err, data);
		});
	}

	static convertResult(err: any, data: any) {
		/* istanbul ignore else */
		if (!err) {
			data = data ? data.result : undefined;
		}

		return data;
	}

	static getOne(model: mongoose.IMongooseSearchable, args: any, callback: Function) {
		model.findOne(args, (err:any, data:any) => {
			callback(err, TestDataFactory.convertResult(err, data));
		});
	}
}

function initialize() {
    var server = this;
    configuration.dataFactory = (): any => { 
        return new TestDataFactory();
    };
};

export = initialize;