/// <reference path='../../../interfaces/async/async.d.ts'/>

import abstractController = require("./abstractController");
import async = require("async");

var connectEnsureLogin = require('connect-ensure-login');

class HomeController extends abstractController {
	private indexData: any;

	constructor() {
		super("home");

		this.before("*", connectEnsureLogin.ensureLoggedIn("/login"));
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
			],(err: any) => {
				self.indexData = {
					userName: this.req.user.displayName,
					repositories: repositories
				};

				self.logger.debug(self.indexData);
				self.render();
			}
		);
	}
}

var instance: any = new HomeController();
export = instance;