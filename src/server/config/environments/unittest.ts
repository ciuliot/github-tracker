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
		repoIssues(data: any, callback: Function) { TestDataFactory.get(testModels.IssuesRepoIssuesModel, data, callback); },
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
			testModels.IssueCommentModel(payload).save((err: any, data: any) => {
				callback(err, TestDataFactory.convertResult(err, data));
			});
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

	static getOneWithErrorIfNone(model: mongoose.IMongooseSearchable, args: any, callback: Function) {
		model.findOne(args, (err:any, data:any) => {
			data = TestDataFactory.convertResult(err, data);

			/* istanbul ignore else */
			if (!err) {
				err = data ? data : "No record found";
			}
			callback(err, data);
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