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
			getOwnReposCallback => { self.getGitHubClient().repos.getAll({}, getOwnReposCallback); },
			(repos: any[], convertOwnReposCallback: Function) => {
				repositories = repos.map(x => { return { id: x.id, name: x.full_name }; });
				convertOwnReposCallback();
			}, 
			getOrgsCallback => { self.getGitHubClient().user.getOrgs({}, getOrgsCallback); },
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
				self.logger.debug(repositories);
				self.jsonResponse(err, repositories);
			}
		);
	}
}

var instance: any = new RepositoriesController();
export = instance;

/*

async.waterfall([
			getOwnReposCallback => { self.getGitHubClient().repos.getAll({}, getOwnReposCallback); },
			(repos: any[], convertOwnReposCallback: Function) => {
				repositories.push({ 
					id: -1, 
					organization: this.req.user.id,
					repositories: repos.map(x => { return { id: x.id, name: x.name }; })
				});
				convertOwnReposCallback();
			}, 
			getOrgsCallback => { self.getGitHubClient().user.getOrgs({}, getOrgsCallback); },
			(orgs: any[], getOrgsRepositories: any) => {
				async.map(orgs, (x: any, cb: Function) => {
					self.getGitHubClient().repos.getFromOrg( { org: x.login }, (err: any, data: any) => {
						repositories.push({ 
							id: x.id,
							organization: x.login,
							repositories: data.map((y: any) => { return { id: y.id, name: y.name }; })
						});
						cb(err, data);
					});
				}, getOrgsRepositories);
			}
			], (err: any) => {
				self.logger.debug(repositories);
				self.jsonResponse(err, repositories);
			}
		);

		*/