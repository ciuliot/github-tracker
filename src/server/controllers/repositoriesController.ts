/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");

class RepositoriesController extends abstractController {
	constructor() {
		super("repositories");

		this.ensureLogin("*");
	}

	index() {
		var self = this;
		var repositories: any[];

		async.waterfall([
			(getOwnReposCallback: Function) => { self.getGitHubClient().repos.getAll({}, getOwnReposCallback); },
			(repos: any[], convertOwnReposCallback: Function) => {
				repositories = repos.map(x => { return { id: x.id, name: x.full_name }; });
				convertOwnReposCallback();
			}, 
			(getOrgsCallback: Function) => { self.getGitHubClient().user.getOrgs({}, getOrgsCallback); },
			(orgs: any[], getOrgsRepositories: any) => {
				async.concat(orgs, (x: any, cb: Function) => {
					self.getGitHubClient().repos.getFromOrg( { org: x.login }, cb);
				}, getOrgsRepositories);
			},
			(repos:any[], convertOrgsRepositories: Function) => {
				var map = repos.map(x => { return { id: x.id, name: x.full_name }; });
				repositories = repositories.concat(map);
				convertOrgsRepositories();
			}
			], (err: any) => {
				self.jsonResponse(err, repositories);
			}
		);
	}
}

var instance: any = new RepositoriesController();
export = instance;