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
import knockout_cache = require("../knockout_cache");

import repositoryModel = require("../models/repository_model");
import phaseModel = require("../models/phase_model");
import milestoneModel = require("../models/milestone_model");
import collaboratorModel = require("../models/collaborator_model");
import issuesViewModel = require("./issues_view_model");
import labelsViewModel = require("./labels_view_model");
import impedimentModel = require("../models/impediment_model");
import impedimentsViewModel = require("./impediments_view_model");

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
	impedimentsViewModel: impedimentsViewModel.ImpedimentsViewModel;
	rejectImplementation: KnockoutObservable<impedimentModel>;

	users: KnockoutComputed<string[]>;
	userRepositories: KnockoutComputed<repositoryModel[]>;

	selectedUser: KnockoutObservable<string> = ko.observable(null);
	selectedRepository: KnockoutObservable<string> = ko.observable(null);

	selectRepositoryModalUser: KnockoutObservable<string> = ko.observable(null);
	selectRepositoryModalRepository: KnockoutObservable<string> = ko.observable(null);

	url: KnockoutComputed<string>;
	boardType: KnockoutObservable<issuesViewModel.BoardType>;
	isInDeveloperBoard: KnockoutComputed<boolean>;
	isInQABoard: KnockoutComputed<boolean>;

	columnClass: KnockoutComputed<string>;

	selectedMilestone: KnockoutObservable<number> = ko.observable(issuesViewModel.ProductBacklogMilestone);
	selectedMilestoneTitle: KnockoutComputed<string>;
	issuesColumnWidth: KnockoutComputed<string>;

	newBranchIssueNumber: KnockoutObservable<number> = ko.observable(0);
	
	loadingCount: KnockoutObservable<number> = ko.observable(0);
	savingCount: KnockoutObservable<number> = ko.observable(0);
	logger: log4js.Logger = utilities.getLogger("HomeViewModel");
	socket: any = null;

	currentMilestoneIssues: KnockoutComputed<issuesViewModel.Issue[]>;
	currentMilestoneEffort: KnockoutComputed<number>;
	currentMilestoneOpenEffort: KnockoutComputed<any>;

	haveSelectedRepository: KnockoutComputed<boolean>;

	start() {
		var self = this;

		knockout_cache.init();

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
				keyIgnoreArgs: ["milestone"],
				indexDone: () => {
					//self.url(null);
				}
			}
		});

		this.labelsViewModel = new labelsViewModel.LabelsViewModel(null, this.loadingCount);
		this.impedimentsViewModel = new impedimentsViewModel.ImpedimentsViewModel(this.loadingCount);

		this.milestones = knockout_mapping.fromJS([]).extend({ 
			mapToJsonResource: { 
				url: "/milestones",
				mapping: {
					key: (data: milestoneModel) => {
						return ko.utils.unwrapObservable(data.number);
					}
				},
				loadingCount: self.loadingCount,
				savingCount: self.savingCount,
				keyIgnoreArgs: ["milestone"],
				loadOnStart: false,
				indexDone: () => {
					var milestone = ko.utils.arrayFirst(self.milestones(), (x: milestoneModel) => { 
						return x.number() === issuesViewModel.ProductBacklogMilestone; 
					});

					if (null === milestone) {
						self.milestones.unshift(knockout_mapping.fromJS({ 
							number: issuesViewModel.ProductBacklogMilestone, 
							title: "Product backlog"
						}));
					}
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
				keyIgnoreArgs: ["milestone"],
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

		this.issuesViewModel = new issuesViewModel.IssuesViewModel(this.labelsViewModel, 
			this.collaborators, this.loadingCount, this.savingCount, this.boardType, this.selectedMilestone);

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
				return ko.observable(new issuesViewModel.IssueDetail(self.labelsViewModel, self.collaborators, options.data));
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
				return x.name().indexOf(self.selectRepositoryModalUser() + "/") === 0;
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
				var queryString: string[] = [];
				var parts: string[] = [origin];

				if (repository !== null && user !== null) {
					parts.splice(1, 0, "index", user, repository)

					self.socket.emit("subscribe", {
						user: user,
						repository: repository
					});

					if (self.selectedMilestone() !== null) {
						parts.push(self.selectedMilestone().toString());
					}
					
					queryString.push("board=" + issuesViewModel.BoardType[self.boardType()]);

					if (self.issuesViewModel.filter().length > 0) {
						queryString.push("q=" + self.issuesViewModel.filter());
					}
				}

				var url = parts.join("/");

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
				var milestone = variables.length > 4 ? variables[4] : issuesViewModel.ProductBacklogMilestone.toString();

				if (user.length === 0 && self.users().length > 0) {
					user = self.users()[0];
				}

				if (user.length > 0) {
					self.selectUser(user);
				}

				self.selectRepository(repository, false);
				self.selectMilestone(Number(milestone));

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

 		this.currentMilestoneIssues = ko.computed(() => {
 			return ko.utils.arrayFilter(self.issuesViewModel.issuesData().issues(), issue => {
				return issue.isInMilestone(self.selectedMilestone);
			});
 		});

 		this.currentMilestoneEffort = ko.computed(() => {
 			var sum = 0;
 			
 			for(var i = 0; i < self.currentMilestoneIssues().length; i++) {
 				sum += self.currentMilestoneIssues()[i].getNumericEstimate();
 			}

			return sum;
 		});

 		this.currentMilestoneOpenEffort = ko.computed(() => {
 			var categories = self.labelsViewModel.labels().categories();
 			var currentIssues = self.currentMilestoneIssues();
 			var res: any[] = [];
 			var openedSum = 0;

 			var currentMilestoneEffort = self.currentMilestoneEffort();

 			if (currentMilestoneEffort > 0 && self.labelsViewModel.labels().declaration().phases() != null) {
 				var closedPhase = self.labelsViewModel.labels().declaration().phases().closed();

	 			for (var i = 0; i < categories.length; i++) {
	 				var category = categories[i];
	 				var sum = 0;

	 				var issues = ko.utils.arrayFilter(currentIssues, issue => {
	 					return issue.category().id() === category.id() && issue.phase().id() !== closedPhase;
	 				});

	 				for(var j = 0; j < issues.length; j++) {
	 					sum += currentIssues[j].getNumericEstimate();
	 				}

	 				openedSum += sum;

	 				res.push({
	 					label: category,
	 					sum: sum,
	 					percents: (100 * sum / currentMilestoneEffort).toString() + "%",
	 					text: null
	 				});
	 			}

	 			var closedSum = currentMilestoneEffort - openedSum;

	 			res.splice(0, 0, {
	 				label: null,
	 				sum: closedSum,
	 				percents: (100 * closedSum / currentMilestoneEffort).toString() + "%",
	 				text: Math.floor(100 * closedSum / currentMilestoneEffort).toString() + "%"
	 			});
	 		}

 			return res;
 		});

		this.haveSelectedRepository = ko.computed(() => {
			return self.selectedRepository() !== null && this.selectedUser() !== null;
		});

		this.logger.info("Started & bound");
		ko.applyBindings(this);
		utilities.loadMapper();

		window.addEventListener("popstate", (e: any) => {
		    self.url(null);
		});

		self.url(null);
	}

	selectUser(user: string) {
		this.logger.info("Selecting user: " + user);

		this.selectedUser(user);
	}

	selectRepository(repository: string, loadIssues: boolean = true) {
		var self = this;
		this.selectedRepository(repository);
		this.logger.info("Selecting repository: " + repository);

		if (loadIssues) {
			this.loadIssues(false, () => {
				self.selectMilestone(issuesViewModel.ProductBacklogMilestone);
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
				},
				(impedimentsLoadCompleted: Function) => {
					var impedimentsCall: Function = forceReload ? self.impedimentsViewModel.impedimentsData.reload : self.impedimentsViewModel.impedimentsData.load;
					impedimentsCall(callData, impedimentsLoadCompleted);
				}
			], (err: any) => {
				if (err) {
					self.logger.error(err.toString());
				}
				callback(err);
			});
		} else {
			this.labelsViewModel.removeAll();
			this.milestones.remove((x: milestoneModel) => { return x.number() !== issuesViewModel.ProductBacklogMilestone; });
			this.collaborators.removeAll();
			this.issuesViewModel.issuesData().issues.removeAll();

			callback();
		}
	}

	selectMilestone(milestone: number) {
		var self = this;
		this.logger.info("Selecting milestone: ", milestone);
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
		
		this.issueDetail().comments.removeAll();
		this.issueDetail().comments.reloadItem(issue.number(), { repository: this.selectedRepository(), user: this.selectedUser() });
	}

	issueSave():void {
		var self = this;
		var id = this.issueDetail().number();
		var args: any = {
			user: this.selectedUser(),
			repository: this.selectedRepository(),
			title: this.issueDetail().title(),
			milestone: this.issueDetail().milestone(),
		};

		var issue: issuesViewModel.Issue = null;

		if (id === null) {
			var phase = self.labelsViewModel.labels().phases()[0];

			issue = self.issuesViewModel.issuesData().createIssueFromJS(); // new issuesViewModel.Issue(self.labelsViewModel, self.collaborators);

			this.issueDetail().moveToPhase(phase.id());
			self.issuesViewModel.issuesData().issues.push(issue);
		} else {
			issue = this.issuesViewModel.findIssue(id);
		}

		args.milestone = args.milestone === issuesViewModel.ProductBacklogMilestone ? null : args.milestone;

		var rawData = knockout_mapping.toJS(this.issueDetail());
		knockout_mapping.fromJS(rawData, issue);

		issue.moveToCategory(this.issueDetail().category().id());

		issue.milestone(args.milestone);

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
		this.issueDetail().comments.removeAll();
		this.issueDetail().milestone(this.selectedMilestone().toString());
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

	showImpediments(): void {

	}

	openSelectRepositoryModal(): void {
		this.selectRepositoryModalRepository(this.selectedRepository());
		this.selectRepositoryModalUser(this.selectedUser());

		$("#select-repository").modal("show");
	}

	selectUserAndRepository(repository: string): void {
		this.selectUser(this.selectRepositoryModalUser());
		this.selectRepository(repository);
	}
}

$(() => {
	require(["bootstrap", "knockout.bootstrap", "socket.io", "moment"], (bootstrap: any, ko_bootstrap: any, io: any) => {
		socketio = io;
		new HomeViewModel().start();
	});
});