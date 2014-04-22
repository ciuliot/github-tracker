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

var socketio: any;

class HomeViewModel {
	repositories: KnockoutObservableArray<repositoryModel>;
	labelsViewModel: labelsViewModel.LabelsViewModel;
	milestones: KnockoutObservableArray<milestoneModel>;
	issueMilestones: KnockoutComputed<milestoneModel[]>;
	collaborators: KnockoutObservableArray<collaboratorModel>;
	issuesViewModel: issuesViewModel.IssuesViewModel;
	issueDetail: KnockoutObservable<issuesViewModel.IssueDetail>;

	user: KnockoutObservable<collaboratorModel>;
	impediment: KnockoutObservable<impedimentModel>;
	rejectImplementation: KnockoutObservable<impedimentModel>;

	users: KnockoutComputed<string[]>;
	userRepositories: KnockoutComputed<repositoryModel[]>;

	selectedUser: KnockoutObservable<string> = ko.observable(null);
	selectedRepository: KnockoutObservable<string> = ko.observable(null);

	url: KnockoutComputed<string>;
	boardType: KnockoutObservable<issuesViewModel.BoardType>;
	isInDeveloperBoard: KnockoutComputed<boolean>;
	isInQABoard: KnockoutComputed<boolean>;

	columnClass: KnockoutComputed<string>;

	selectedMilestone: KnockoutObservable<string> = ko.observable("none");
	selectedMilestoneTitle: KnockoutComputed<string>;
	issuesColumnWidth: KnockoutComputed<string>;

	newBranchIssueNumber: KnockoutObservable<number> = ko.observable(0);
	
	loadingCount: KnockoutObservable<number> = ko.observable(0);
	savingCount: KnockoutObservable<number> = ko.observable(0);
	logger: log4js.Logger = utilities.getLogger("HomeViewModel");
	socket: any = null;

	start() {
		var self = this;

		self.boardType = ko.observable(issuesViewModel.BoardType.developer);

		self.isInDeveloperBoard = ko.computed(() => { return self.boardType() === issuesViewModel.BoardType.developer });
		self.isInQABoard = ko.computed(() => { return self.boardType() === issuesViewModel.BoardType.qa });

		self.socket = socketio.connect();
		self.socket.on("issue-update", (data:any) => {
			var issue = self.issuesViewModel.findIssue(data.number);
			if (issue !== null) {
				knockout_mapping.fromJS(data, issue);
			}
		});

		this.repositories = knockout_mapping.fromJS([]).extend({ 
			mapToJsonResource: { 
				url: "/repositories", 
				loadingCount: self.loadingCount,
				savingCount: self.savingCount,
				indexDone: () => {
					self.url(null);
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
					self.milestones.push(knockout_mapping.fromJS ({ number: "none", title: "Product backlog" }));
				}
			}
		});

		this.issueMilestones = ko.computed(() => {
			return ko.utils.arrayFilter(self.milestones(), x => {
				return x.number().toString() !== "*";
			})
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

		this.issuesViewModel = new issuesViewModel.IssuesViewModel(this.labelsViewModel, this.collaborators, this.loadingCount, this.savingCount, this.boardType);

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

		this.rejectImplementation = knockout_mapping.fromJS({ issue_id: null, description: null }, {
			create: (options: any) => {
				return ko.observable(knockout_mapping.fromJS(options.data));
			}
		}).extend({
			mapToJsonResource: { 
				url: "/comments",
				refreshAfterUpdate: false,
				loadingCount: self.loadingCount,
				savingCount: self.savingCount,
				loadOnStart: false
			}
		});

		this.issueDetail = knockout_mapping.fromJS(issuesViewModel.Issue.empty, {
			create: (options: any) => {
				return ko.observable(new issuesViewModel.Issue(self.labelsViewModel, self.collaborators, options.data));
			}
		})

		this.selectedMilestoneTitle = ko.computed(() => {
			var milestone = ko.utils.arrayFirst(self.milestones(), (x: milestoneModel) => {
				return x.number().toString() === self.selectedMilestone().toString();
			});

			return null === milestone ? "Milestone" : milestone.title();
		});

		this.users = ko.computed(() => {
			var map = ko.utils.arrayMap(self.repositories(), (x: repositoryModel) => { 
				return x.name().split("/")[0];
			});
			return ko.utils.arrayGetDistinctValues(map);
		});

		this.userRepositories = ko.computed(() => {
			var filter = ko.utils.arrayFilter(self.repositories(), (x: repositoryModel) => {
				return x.name().indexOf(self.selectedUser() + "/") === 0;
			});

			return ko.utils.arrayMap(filter, (x: repositoryModel) => {
				return knockout_mapping.fromJS ({ name: x.name().split("/")[1], id: x.id() }); 
			});
		});

		this.columnClass = ko.computed(() => {
			return self.boardType() === issuesViewModel.BoardType.developer ? "col-lg-3" : "col-lg-6";
		});

		this.issuesColumnWidth = ko.computed(() => {
			var phases = self.labelsViewModel.labels().phases();
			return (phases.length > 0 ? (100 / phases.length) : 100) + "%"; 
		});

		this.url = ko.computed({
			read: () => {
				var origin = [window.location.protocol, "//", window.location.hostname, ":", window.location.port].join("");
				var user = self.selectedUser(), repository = self.selectedRepository();
				var parts = [origin, "index", user];

				if (repository !== null) {
					parts.push(repository);

					self.socket.emit("subscribe", {
						user: user,
						repository: repository
					});

					if (self.selectedMilestone() !== null) {
						parts.push(self.selectedMilestone());
					}
				}

				var url = parts.join("/");
				var queryString = ["board=" + issuesViewModel.BoardType[self.boardType()]];

				if (self.issuesViewModel.filter().length > 0) {
					queryString.push("q=" + self.issuesViewModel.filter());
				}

				if (queryString.length > 0) {
					url += "?" + queryString.join("&");
				}

				if (self.url) {
					history.pushState(null, null, url);
				}

				return url;
			},
			write: (newValue: string) => {
				var href = newValue || window.location.href;
				var pathParts = href.split("//")[1].split("?");
				var variables = pathParts[0].split("/") || [];				

				var user = variables.length > 2 ? variables[2] : "";
				var repository = variables.length > 3 ? variables[3] : null;
				var milestone = variables.length > 4 ? variables[4] : "none";

				if (user.length === 0 && self.users().length > 0) {
					user = self.users()[0];
				}

				if (user.length > 0) {
					self.selectUser(user, false);
				}

				self.selectRepository(repository, false);
				self.selectMilestone(milestone);

				if (pathParts[1]) { // Querystring
					var queryString = pathParts[1].split("&");

					for (var i = 0; i < queryString.length; i++) {
						var parts = queryString[i].split("=");
							if (parts.length === 2) {
							var key = parts[0], value: string = parts[1];
							if (key === "q") {
								self.issuesViewModel.filter(value);
							}
							else if (key === "board") {
								var boardType: issuesViewModel.BoardType = (<any>issuesViewModel.BoardType)[value];
								self.boardType(boardType);
							}
						}
					}
				}
			}
		});

		this.logger.info("Started & bound");
		ko.applyBindings(this);
		utilities.loadMapper();

		window.addEventListener("popstate", (e: any) => {
		    self.url(null);
		});
	}

	selectUser(user: string, selectRepository: boolean = true) {
		this.logger.info("Selecting user: " + user);
		if (selectRepository && this.selectedUser() !== user) {
			this.selectRepository(null);
		}

		this.selectedUser(user);
	}

	selectRepository(repository: string, loadIssues: boolean = true) {
		var self = this;
		this.selectedRepository(repository);
		this.logger.info("Selecting repository: ", repository);

		if (loadIssues) {
			this.loadIssues(false, () => {
				self.selectMilestone("none");
			});
		}
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
					var issuesCall: Function = forceReload ? self.issuesViewModel.issuesData.reload : self.issuesViewModel.issuesData.load;
					issuesCall(callData, issuesLoadCompleted);
				}
			], (err: any) => {
				callback(err);
			});
		} else {
			this.labelsViewModel.removeAll();
			this.milestones.removeAll();
			this.collaborators.removeAll();
			this.issuesViewModel.issuesData().issues.removeAll();

			callback();
		}
	}

	selectMilestone(milestone: string) {
		var self = this;
		this.logger.info("Selecting milestone: " + milestone);
		this.selectedMilestone(milestone);

		this.loadIssues(false);
	}

	reloadRepositories() {
		this.repositories.reload();
	}

	private updateIssue(issue: issuesViewModel.Issue, body: any): void {
		body.user = this.selectedUser();
		body.repository = this.selectedRepository();
		this.issuesViewModel.issuesData.updateItem(issue.number(), issue, body);
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
		var phases = this.labelsViewModel.labels().declaration().phases;
		if (issue.phase().id() === phases().backlog()) {
			this.issueDetail().number(issue.number());
			$("#new-branch.alert").addClass("in");
		}

		this.updateIssuePhase(issue, phases().inprogress());
		this.assignIssue(issue, this.user());
	}

	issuePause(impediment: impedimentModel): void {
		var issue = this.issuesViewModel.findIssue(this.impediment().issue_id());

		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration().phases().onhold());
		this.impediment.updateItem(issue.number(), {}, { 
			user: this.selectedUser(), 
			description: this.impediment().description(), 
			repository: this.selectedRepository() 
		});
	}

	issuePauseOpen(issue: issuesViewModel.Issue): void {
		this.impediment().issue_id(issue.number());
		this.impediment().description("");
	}

	issueRejectOpen(issue: issuesViewModel.Issue): void {
		this.rejectImplementation().issue_id(issue.number());
		this.rejectImplementation().description("");
	}

	issueReject(issue: issuesViewModel.Issue): void {
		var issue = this.issuesViewModel.findIssue(this.rejectImplementation().issue_id());
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration().phases().onhold());

		this.rejectImplementation.updateItem(issue.number(), {}, { 
			user: this.selectedUser(), 
			description: this.rejectImplementation().description(), 
			repository: this.selectedRepository() 
		});
	}

	issueComplete(issue: issuesViewModel.Issue): void {
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration().phases().inreview());
	}

	issueReview(issue: issuesViewModel.Issue): void {
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration().phases().implemented());
	}

	issueStop(issue: issuesViewModel.Issue): void {
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration().phases().closed());
	}

	issueAccept(issue: issuesViewModel.Issue): void {
		this.updateIssuePhase(issue, this.labelsViewModel.labels().declaration().phases().closed());
	}

	issueOpen(issue: issuesViewModel.Issue): void {
		var rawData = knockout_mapping.toJSON(issue);
		knockout_mapping.fromJS(issuesViewModel.Issue.empty, this.issueDetail()); // Cleanup fields
		knockout_mapping.fromJSON(rawData, this.issueDetail());
		this.issueDetail().milestone(this.selectedMilestone());
	}

	issueSave():void {
		var self = this;
		var id = this.issueDetail().number();
		var args: any = {
			user: this.selectedUser(),
			repository: this.selectedRepository(),
			title: this.issueDetail().title()
		};
		
		var issue: issuesViewModel.Issue = null;

		if (id === null) {
			args.milestone = (this.selectedMilestone() === "*" || this.selectedMilestone() === "none") ? undefined : this.selectedMilestone();

			var phase = self.labelsViewModel.labels().phases()[0];

			issue = new issuesViewModel.Issue(self.labelsViewModel, self.collaborators);

			this.issueDetail().moveToPhase(phase.id());
			self.issuesViewModel.issuesData().issues.push(issue);
		} else {
			issue = this.issuesViewModel.findIssue(id);
		}

		var rawData = knockout_mapping.toJS(this.issueDetail());
		knockout_mapping.fromJS(rawData, issue);

		issue.moveToCategory(this.issueDetail().category().id());

		var newType = this.labelsViewModel.labels().types().filter(x => x.id () === self.issueDetail().type().id());
		var newTypeJSON = knockout_mapping.toJSON(newType.length > 0 ? newType[0] : labelsViewModel.Label.empty);
		knockout_mapping.fromJSON(newTypeJSON, issue.type);

		if (id === null) {
			this.issuesViewModel.issuesData.createItem(issue, args);
		} else {
			this.issuesViewModel.issuesData.updateItem(id, issue, args);
		}
	}

	issueAdd(issue: issuesViewModel.Issue): void {
		knockout_mapping.fromJS(issuesViewModel.Issue.empty, this.issueDetail); // Cleanup fields
		this.issueDetail().milestone(this.selectedMilestone());
	}

	changeDetailIssueType(type: labelsViewModel.Label) {
		this.issueDetail().type().id(type.id());
	}

	selectDeveloperBoard(): void {
		this.boardType(issuesViewModel.BoardType.developer);
	}

	selectQABoard(): void {
		this.boardType(issuesViewModel.BoardType.qa);
	}
}

$(() => {
	require(["bootstrap", "knockout.bootstrap", "socket.io"], (bootstrap: any, ko_bootstrap: any, io: any) => {
		socketio = io;
		new HomeViewModel().start();
	});
});