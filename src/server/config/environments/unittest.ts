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
		getCollaborators(data: any, callback: Function) { TestDataFactory.get(testModels.ReposGetCollaboratorsModel, data, callback); },
		getContent(data: any, callback: Function) { 
			TestDataFactory.getOne(testModels.ReposContentModel, {
				user: data.user,
				repo: data.repo,
				path: data.path
			}, callback); 
		},
		updateFile(data: any, callback: Function) { 
			testModels.ReposContentModel.findOne({
				user: data.user,
				repo: data.repo,
				path: data.path
			}, (err: any, file: any) => {
				file.content = data.content;
				file.save(callback);
			}); 
		}
	};
	pullRequests = {
		get(data: any, callback: Function) { 
			TestDataFactory.getOne(testModels.PullRequestModel, data, (err:any, data: any) => {
				if (!data && !err) {
					err = { message:"Not Found", documentation_url:"http://developer.github.com/v3", code: 404 };
				}

				callback(err, data);
			}); 
		},
		merge(data: any, callback: Function) { 
			testModels.PullRequestModel.findOne(data, (err:any, data: any) => {
				data.state = "closed";
				data.result.state = "closed";

				data.save((err: any, data: any) => {
					callback(err, TestDataFactory.convertResult(err, data));
				});

				
			}); 
		},
		createFromIssue(data: any, callback: Function) { 
			var payload = {
				user: data.user,
				repo: data.repo,
				number: data.issue,
				state: "open",
				result: {
				      "url": "https://api.github.com/repos/octocat/Hello-World/pulls/" + data.issue,
					  "html_url": "https://github.com/octocat/Hello-World/pull/" + data.issue,
					  "diff_url": "https://github.com/octocat/Hello-World/pulls/1351.diff",
					  "patch_url": "https://github.com/octocat/Hello-World/pulls/1351.patch",
					  "issue_url": "https://api.github.com/repos/octocat/Hello-World/issues/1351",
					  "commits_url": "https://api.github.com/repos/octocat/Hello-World/pulls/1351/commits",
					  "review_comments_url": "https://api.github.com/repos/octocat/Hello-World/pulls/1351/comments",
					  "review_comment_url": "https://api.github.com/repos/octocat/Hello-World/pulls/comments/{number}",
					  "comments_url": "https://api.github.com/repos/octocat/Hello-World/issues/1/comments",
					  "statuses_url": "https://api.github.com/repos/octocat/Hello-World/statuses/6dcb09b5b57875f334f61aebed695e2e4193db5e",
					  "number": data.issue,
					  "state": "open",
					  "title": "new-feature",
					  "body": "Please pull these awesome changes",
					  "created_at": "2011-01-26T19:01:12Z",
					  "updated_at": "2011-01-26T19:01:12Z",
					  "closed_at": "2011-01-26T19:01:12Z",
					  "merged_at": "2011-01-26T19:01:12Z"
				  }
			}

			TestDataFactory.save(testModels.PullRequestModel, payload, callback);
		}
	}
	issues = {
		getAllMilestones(data: any, callback: Function) { TestDataFactory.get(testModels.IssuesGetAllMilestonesModel, data, callback); },
		getLabels(data: any, callback: Function) { TestDataFactory.get(testModels.IssuesGetLabelsModel, data, callback); },
		repoIssues(data: any, callback: Function) { TestDataFactory.get(testModels.IssuesModel, data, callback); },
		getRepoIssue(data: any, callback: Function) { 
			TestDataFactory.getOne(testModels.IssuesModel, { user: data.user, repo: data.repo, number: Number(data.number) }, callback); 
		},
		getComments(data: any, callback: Function) { TestDataFactory.get(testModels.IssueCommentModel, data, callback); },
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
				number: number,
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
				      "html_url": null,
				      "diff_url": null,
				      "patch_url": null
				    },
				    "closed_at": null,
				    "created_at": "2011-04-22T13:33:48Z",
				    "updated_at": "2011-04-22T13:33:48Z"
				}
			};

			TestDataFactory.save(testModels.IssuesModel, payload, callback);
		},
		edit: (data: any, callback: Function) => {
			testModels.IssuesModel.findOne({ user: data.user, repo: data.repo, number: Number(data.number) }, (err: any, issue: any) => {
				if (data.assignee) {
					issue.result.assignee = {
				      "login": data.assignee,
				      "id": 1,
				      "avatar_url": "https://github.com/images/error/octocat_happy.gif",
				      "gravatar_id": "somehexcode",
				      "url": "https://api.github.com/users/" + data.assignee,
				      "html_url": "https://github.com/" + data.assignee,
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
				    };
				}

				if (data.state) {
					issue.state = issue.result.state = data.state;
				}

				if (data.labels) {
					issue.result.labels = data.labels.map((x:any) => { return { name: x } });
				}

				if (data.body) {
					issue.result.body = data.body;
				}

				if (data.body) {
					issue.result.title = data.title;
				}

				issue.save((err: any, data: any) => {
					callback(err, TestDataFactory.convertResult(err, data));
				});
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
		},
		createReference(data: any, callback: Function) {
			var payload = {
				user: data.user,
				repo: data.repo,
				ref: data.ref,
				result: {
					ref: data.ref,
					url: "https://api.github.com/repos/octocat/Hello-World/git/" + data.ref,
					object: {
						type: "commit",
						sha: data.sha,
						url: "https://api.github.com/repos/octocat/Hello-World/git/commits/" + data.sha
					}
				}
			}

			TestDataFactory.save(testModels.GitDataGetReferenceModel, payload, callback);
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