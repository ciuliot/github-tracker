/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/jquery/jquery.d.ts'/>
/// <reference path='../../../interfaces/bootstrap/bootstrap.d.ts'/>
/// <reference path='../../../interfaces/log4js/log4js.d.ts'/>
/// <reference path='../../../interfaces/require/require.d.ts'/>
/// <reference path='../../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>
/// <reference path='../../../interfaces/mapper.d.ts'/>

"use strict";

import ko = require("knockout");
import $ = require("jquery");
import utilities = require("../utilities");
import log4js = require("log4js");
import knockout_mapping = require("knockout.mapping");

import repositoryModel = require("../models/repository_model");
import phaseModel = require("../models/phase_model");
import milestoneModel = require("../models/milestone_model");
import issuesViewModel = require("./issues_view_model");
import labelsViewModel = require("./labels_view_model");

class HomeViewModel {
	repositories: KnockoutObservableArray<repositoryModel>;
	labelsViewModel: labelsViewModel.LabelsViewModel;
	milestones: KnockoutObservableArray<milestoneModel>;
	issuesViewModel: issuesViewModel.IssuesViewModel;

	users: KnockoutComputed<string[]>;
	userRepositories: KnockoutComputed<repositoryModel[]>;

	selectedUser: KnockoutObservable<string> = ko.observable(null);
	selectedRepository: KnockoutObservable<string> = ko.observable(null);

	allMilestonesItem: milestoneModel = knockout_mapping.fromJS ({ id: "*", title: "All milestones" });
	selectedMilestone: KnockoutObservable<string> = ko.observable("*");
	selectedMilestoneTitle: KnockoutComputed<string>;
	issuesColumnWidth: KnockoutComputed<string>;
	
	loadingCount: KnockoutObservable<number> = ko.observable(0);
	logger: log4js.Logger = utilities.getLogger("HomeViewModel");

	constructor() { 
	}

	start() {
		var self = this;
		this.repositories = knockout_mapping.fromJS([]).extend({ 
			mapToJsonResource: { 
				url: "/repositories", 
				loadingCount: self.loadingCount,
				indexDone: () => {
					self.setFromUrl();
				}
			}
		});

		this.labelsViewModel = new labelsViewModel.LabelsViewModel(null, this.loadingCount);

		this.milestones = knockout_mapping.fromJS([]).extend({ 
			mapToJsonResource: { 
				url: "/milestones",
				loadingCount: self.loadingCount,
				loadOnStart: false,
				indexDone: () => {
					self.milestones.unshift(knockout_mapping.fromJS ({ id: "none", title: "No milestone" }));
					self.milestones.unshift(self.allMilestonesItem);
				}
			}
		});

		this.issuesViewModel = new issuesViewModel.IssuesViewModel(this.labelsViewModel, this.loadingCount);

		this.selectedMilestoneTitle = ko.computed(() => {
			var milestone = ko.utils.arrayFirst(self.milestones(), (x: milestoneModel) => {
				return x.id() === self.selectedMilestone();
			});

			return null === milestone ? self.allMilestonesItem.title() : milestone.title();
		});

		this.users = ko.computed(() => {
			var map = ko.utils.arrayMap(self.repositories(), (x: repositoryModel) => { 
				return x.name().split("/")[0];
			});
			return ko.utils.arrayGetDistinctValues(map);
		});

		this.userRepositories = ko.computed(() => {
			var filter = ko.utils.arrayFilter(this.repositories(), (x: repositoryModel) => {
				return x.name().indexOf(self.selectedUser() + "/") === 0;
			});

			return ko.utils.arrayMap(filter, (x: repositoryModel) => {
				return knockout_mapping.fromJS ({ name: x.name().split("/")[1], id: x.id() }); 
			});
		});

		this.issuesColumnWidth = ko.computed(() => {
			var phases = self.labelsViewModel.labels().phases();
			return (phases.length > 0 ? (100 / phases.length) : 100) + "%"; 
		});

		this.logger.info("Started & bound");
		ko.applyBindings(this);
		utilities.loadMapper();

		window.addEventListener("popstate", (e: any) => {
		    self.setFromUrl(false);
		});
	}

	private getUrlVars(): string[] {
	    var vars: any[] = [], hash: any;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
	}

	private setFromUrl(pushState: boolean = true): void {
		var variables = window.location.pathname.split("/") || [];
		var user = variables.length > 2 ? variables[2] : "";
		var repository = variables.length > 3 ? variables[3] : null;
		var milestone = variables.length > 4 ? variables[4] : "*";


		if (user.length === 0 && this.users().length > 0) {
			user = this.users()[0];
		}

		if (user.length > 0) {
			this.selectUser(user, pushState);
		}

		this.selectRepository(repository, pushState);
		this.selectMilestone(milestone, pushState);
	}

	private getUrl(): string {
		var origin = [window.location.protocol, "//", window.location.hostname, ":", window.location.port].join("");
		var parts = [origin, "index", this.selectedUser()];

		if (this.selectedRepository() !== null) {
			parts.push(this.selectedRepository());

			if (this.selectedMilestone() !== null) {
				parts.push(this.selectedMilestone());
			}
		}

		return parts.join("/");
	}

	selectUser(user: string, pushState: boolean = true) {
		this.logger.info("Selecting user: " + user);
		if (this.selectedUser() !== user) {
			this.selectRepository(null, false);
		}

		this.selectedUser(user);

		if (pushState) {
			history.pushState(null, null, this.getUrl());
		}
	}

	selectRepository(repository: string, pushState: boolean = true) {
		this.selectedRepository(repository);
		this.logger.info("Selecting repository: ", repository);
		
		if (repository !== null) {
			this.labelsViewModel.labels.load({ user: this.selectedUser(), repository: repository });
			this.milestones.load({ user: this.selectedUser(), repository: repository });
		} else {
			this.labelsViewModel.removeAll();
			this.milestones.removeAll();
		}

		this.selectMilestone("*", false);

		if (pushState) {
			history.pushState(null, null, this.getUrl());
		}
	}

	selectMilestone(milestone: string, pushState: boolean = true) {
		this.logger.info("Selecting milestone: " + milestone);
		this.selectedMilestone(milestone);

		this.reloadIssues();

		if (pushState) {
			history.pushState(null, null, this.getUrl());
		}
	}

	reloadRepositories() {
		this.repositories.reload();
	}

	reloadIssues(forceReload: boolean = false) {
		if (this.selectedRepository() !== null) {
			var call = forceReload ? this.issuesViewModel.categories.reload : this.issuesViewModel.categories.load;
			call({ user: this.selectedUser(), repository: this.selectedRepository(), milestone: this.selectedMilestone() });
		} else {
			this.issuesViewModel.categories.removeAll();
		}
	}
}

$(() => {
	require(["bootstrap"], (bootstrap: any) => {
		new HomeViewModel().start();
	});
});