/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/jquery/jquery.d.ts'/>
/// <reference path='../../../interfaces/bootstrap/bootstrap.d.ts'/>
/// <reference path='../../../interfaces/log4js/log4js.d.ts'/>
/// <reference path='../../../interfaces/require/require.d.ts'/>
/// <reference path='../../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>
/// <reference path='../../../interfaces/mapper.d.ts'/>

import ko = require("knockout");
import $ = require("jquery");
import utilities = require("../utilities");
import log4js = require("log4js");
import knockout_mapping = require("knockout.mapping");

import repositoryModel = require("../models/repository_model");
import phaseModel = require("../models/phase_model");
import milestoneModel = require("../models/milestone_model");
import issueModel = require("../models/issue_model");

class HomeViewModel {
	repositories: KnockoutObservableArray<repositoryModel>;
	labels: KnockoutObservableArray<repositoryModel>;
	milestones: KnockoutObservableArray<milestoneModel>;
	issues: KnockoutObservableArray<issueModel>;

	users: KnockoutComputed<string[]>;
	userRepositories: KnockoutComputed<repositoryModel[]>;

	phases: KnockoutComputed<phaseModel[]>;
	
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
					if (self.users().length > 0 && self.selectedUser() === null) {
						self.selectedUser(self.users()[0]);
					}
				}
			}
		});

		this.labels = knockout_mapping.fromJS([]).extend({ 
			mapToJsonResource: { 
				url: "/labels",
				loadingCount: self.loadingCount,
				loadOnStart: false
			}
		});

		this.milestones = knockout_mapping.fromJS([]).extend({ 
			mapToJsonResource: { 
				url: "/milestones",
				loadingCount: self.loadingCount,
				loadOnStart: false,
				indexDone: () => {
					self.milestones.unshift(knockout_mapping.fromJS ({ id: "none", title: "No milestone" }));
					self.milestones.unshift(self.allMilestonesItem);

					if (self.selectedMilestone() === null) {
						self.selectedMilestone(self.milestones()[0].id());
					}
				}
			}
		});

		this.issues = knockout_mapping.fromJS([]).extend({ 
			mapToJsonResource: { 
				url: "/issues",
				loadingCount: self.loadingCount,
				loadOnStart: false
			}
		});

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
			return (this.issues().length > 0 ? (100 / this.issues().length) : 100) + "%"; 
		});

		this.phases = ko.computed(() => {
			var re = /\d\s*-\s*(.+)/;
			var map = ko.utils.arrayMap(self.labels(), (x: phaseModel) => { 
				var m = re.exec(x.name());
				var model: phaseModel = knockout_mapping.fromJS({ id: x.name(), name: m === null ? null : m[1] }); 
				return model;
			});

			return ko.utils.arrayFilter(map, (x: phaseModel) => { return x.name() !== null; });
		});

		this.logger.info("Started & bound");
		ko.applyBindings(this);
	}

	selectUser(user: string) {
		this.logger.info("Selecting user: " + user);
		this.selectedUser(user);
	}

	selectRepository(repository: repositoryModel) {
		this.selectedRepository(repository.name());
		this.logger.info("Selecting repository '%s'", repository);
		this.labels.reload({ user: this.selectedUser(), repository: repository.name });
		this.milestones.reload({ user: this.selectedUser(), repository: repository.name });
	}

	selectMilestone(milestone: milestoneModel) {
		this.logger.info("Selecting milestone: " + milestone.id());
		this.selectedMilestone(milestone.id());
		this.issues.reload({ user: this.selectedUser(), repository: this.selectedRepository(), milestone: this.selectedMilestone() });
	}

	reloadRepositories() {
		this.repositories.reload();
	}
}

$(() => {
	require(["bootstrap"], (bootstrap: any) => {
		new HomeViewModel().start();
	});
});