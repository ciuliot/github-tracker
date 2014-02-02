/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/async/async.d.ts'/>
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
import async = require("async");
import knockout_mapping = require("knockout.mapping");

import repositoryModel = require("../models/repository_model");
import phaseModel = require("../models/phase_model");
import milestoneModel = require("../models/milestone_model");
import collaboratorModel = require("../models/collaborator_model");
import issuesViewModel = require("./issues_view_model");
import labelsViewModel = require("./labels_view_model");
import impedimentModel = require("../models/impediment_model");

class HomeViewModel {
	repositories: KnockoutObservableArray<repositoryModel>;
	labelsViewModel: labelsViewModel.LabelsViewModel;
	milestones: KnockoutObservableArray<milestoneModel>;
	collaborators: KnockoutObservableArray<collaboratorModel>;
	issuesViewModel: issuesViewModel.IssuesViewModel;
	issueDetail: KnockoutObservable<issuesViewModel.Issue>;

	user: KnockoutObservable<collaboratorModel>;
	impediment: KnockoutObservable<impedimentModel>;

	users: KnockoutComputed<string[]>;
	userRepositories: KnockoutComputed<repositoryModel[]>;

	selectedUser: KnockoutObservable<string> = ko.observable(null);
	selectedRepository: KnockoutObservable<string> = ko.observable(null);

	allMilestonesItem: milestoneModel = knockout_mapping.fromJS ({ id: "*", title: "All milestones" });
	selectedMilestone: KnockoutObservable<string> = ko.observable("*");
	selectedMilestoneTitle: KnockoutComputed<string>;
	issuesColumnWidth: KnockoutComputed<string>;

	newBranchIssueNumber: KnockoutObservable<number> = ko.observable(0);
	
	loadingCount: KnockoutObservable<number> = ko.observable(0);
	savingCount: KnockoutObservable<number> = ko.observable(0);
	logger: log4js.Logger = utilities.getLogger("HomeViewModel");

	constructor() { 
	}

	start() {
		var self = this;
		this.repositories = knockout_mapping.fromJS([]).extend({ 
			mapToJsonResource: { 
				url: "/repositories", 
				loadingCount: self.loadingCount,
				savingCount: self.savingCount,
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
				savingCount: self.savingCount,
				loadOnStart: false,
				indexDone: () => {
					self.milestones.unshift(knockout_mapping.fromJS ({ id: "none", title: "No milestone" }));
					self.milestones.unshift(self.allMilestonesItem);
				}
			}
		});

		this.collaborators = knockout_mapping.fromJS([]).extend({ 
			mapToJsonResource: { 
				url: "/collaborators",
				loadingCount: self.loadingCount,
				savingCount: self.savingCount,
				loadOnStart: false
			}
		});

		this.user = knockout_mapping.fromJS({ name: null, login: null }, {
			create: (options: any) => {
				return ko.observable(knockout_mapping.fromJS(options.data));
			}
		}).extend({ 
			mapToJsonResource: { 
				url: "/user", 
				loadingCount: self.loadingCount,
				savingCount: self.savingCount
			}
		});

		this.issuesViewModel = new issuesViewModel.IssuesViewModel(this.labelsViewModel, this.collaborators, this.loadingCount, this.savingCount);

		this.impediment = knockout_mapping.fromJS({ issue_id: null, description: null }, {
			create: (options: any) => {
				return ko.observable(knockout_mapping.fromJS(options.data));
			}
		}).extend({
			mapToJsonResource: { 
				url: "/impediments",
				refreshAfterUpdate: false,
				loadingCount: self.loadingCount,
				savingCount: self.savingCount,
				loadOnStart: false
			}
		});

		this.issueDetail = knockout_mapping.fromJS({ number: null }, {
			create: (options: any) => {
				return ko.observable(knockout_mapping.fromJS(options.data));
			}
		})

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
		var self = this;
		this.selectedRepository(repository);
		this.logger.info("Selecting repository: ", repository);

		this.loadIssues(false, () => {
			self.selectMilestone("*", false);

			if (pushState) {
				history.pushState(null, null, self.getUrl());
			}
		});
	}

	reloadIssues(forceReload: boolean = false): void {
		this.loadIssues(forceReload);
	}

	private loadIssues(forceReload: boolean = false, callback: Function = function() {}): void {
		var self = this;
		var callData = { user: self.selectedUser(), repository: self.selectedRepository(), milestone: self.selectedMilestone() };

		if (this.selectedRepository() !== null) {
			async.waterfall([
				(labelsLoadCompleted: Function) => {
					var labelsCall: Function = forceReload ? self.labelsViewModel.labels.reload :self.labelsViewModel.labels.load;
					labelsCall(callData, labelsLoadCompleted);
				},
				(milestonesLoadCompleted: Function) => {
					var milestonesCall: Function = forceReload ? self.milestones.reload : self.milestones.load;
					milestonesCall(callData, milestonesLoadCompleted);
				},
				(collaboratorsLoadCompleted: Function) => {
					var collaboratorsCall: Function = forceReload ? self.collaborators.reload : self.collaborators.load;
					collaboratorsCall(callData, collaboratorsLoadCompleted);
				},
				(issuesLoadCompleted: Function) => {
					var issuesCall: Function = forceReload ? self.issuesViewModel.categories.reload : self.issuesViewModel.categories.load;
					issuesCall(callData, issuesLoadCompleted);
				}
			], (err: any) => {
				callback(err);
			});
		} else {
			this.labelsViewModel.removeAll();
			this.milestones.removeAll();
			this.collaborators.removeAll();
			this.issuesViewModel.categories.removeAll();

			callback();
		}
	}

	selectMilestone(milestone: string, pushState: boolean = true) {
		var self = this;
		this.logger.info("Selecting milestone: " + milestone);
		this.selectedMilestone(milestone);

		this.loadIssues(false, () => {
			if (pushState) {
				history.pushState(null, null, self.getUrl());
			}
		});
	}

	reloadRepositories() {
		this.repositories.reload();
	}

	private updateIssue(issue: issuesViewModel.Issue, body: any): void {
		body.user = this.selectedUser();
		body.repository = this.selectedRepository();
		this.issuesViewModel.categories.updateItem(issue.number(), body);
	}

	private updateIssuePhase(issue: issuesViewModel.Issue, newPhase: string): void {
		issue.moveToPhase(newPhase);
		this.updateIssue(issue, { phase: newPhase });
	}

	assignIssue(issue: issuesViewModel.Issue, collaborator: collaboratorModel): void {
		var rawData = knockout_mapping.toJS(collaborator);
		var self = this;
		this.logger.info("Assigning " + collaborator.login() + " to " + issue.number());

		issue.assignee(knockout_mapping.fromJS(rawData));

		this.updateIssue(issue, { collaborator: collaborator.login() });
	}

	issueStart(issue: issuesViewModel.Issue): void {
		this.assignIssue(issue, this.user());
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration.phases.inprogress());
	}

	issuePause(impediment: impedimentModel): void {
		var issue = this.issuesViewModel.findIssue(this.impediment().issue_id());

		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration.phases.onhold());
		this.impediment.updateItem(issue.number(), { user: this.selectedUser(), repository: this.selectedRepository(), description: this.impediment().description() });
	}

	issuePauseOpen(issue: issuesViewModel.Issue): void {
		this.impediment().issue_id(issue.number());
	}

	issueComplete(issue: issuesViewModel.Issue): void {
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration.phases.implemented());
	}

	issueStop(issue: issuesViewModel.Issue): void {
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration.phases.closed());
	}

	issueAccept(issue: issuesViewModel.Issue): void {
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration.phases.closed());
	}

	issueReject(issue: issuesViewModel.Issue): void {
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration.phases.onhold());
	}

	issueOpen(issue: issuesViewModel.Issue): void {
	}

	copyCheckoutCommand(element: JQuery):void {

	}
}

$(() => {
	require(["bootstrap", "knockout.bootstrap"], () => {
		new HomeViewModel().start();
	});
});