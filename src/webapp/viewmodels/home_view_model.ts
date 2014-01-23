/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/jquery/jquery.d.ts'/>
/// <reference path='../../../interfaces/bootstrap/bootstrap.d.ts'/>
/// <reference path='../../../interfaces/log4js/log4js.d.ts'/>
/// <reference path='../../../interfaces/mapper.d.ts'/>

import ko = require("knockout");
import $ = require("jquery");
import utilities = require("../utilities");
import log4js = require("log4js");

import repositoryModel = require("../models/repository_model");
import phaseModel = require("../models/phase_model");
import milestoneModel = require("../models/milestone_model");

class HomeViewModel {
	repositories: KnockoutObservableArray<repositoryModel>;
	labels: KnockoutObservableArray<repositoryModel>;
	milestones: KnockoutObservableArray<milestoneModel>;

	users: KnockoutComputed<string[]>;
	userRepositories: KnockoutComputed<repositoryModel[]>;

	phases: KnockoutComputed<phaseModel[]>;
	issues: KnockoutComputed<phaseModel[]>;
	
	selectedUser: KnockoutObservable<string> = ko.observable(null);
	selectedRepository: KnockoutObservable<string> = ko.observable(null);
	selectedMilestone: KnockoutObservable<milestoneModel> = ko.observable(null);
	
	loadingCount: KnockoutObservable<number> = ko.observable(0);
	logger: log4js.Logger = utilities.getLogger("HomeViewModel");

	constructor() { }

	start() {
		var self = this;
		this.repositories = ko.observableArray<repositoryModel>().extend({ 
			mapToJsonResource: { 
				url: "/repositories", 
				loadingCount: self.loadingCount,
				indexDone: () => {
					if (self.users().length > 0) {
						self.selectedUser(self.users()[0]);
					}
				}
			}
		});

		this.labels = ko.observableArray<repositoryModel>().extend({ 
			mapToJsonResource: { 
				url: "/labels",
				loadingCount: self.loadingCount,
				loadOnStart: false
			}
		});

		this.milestones = ko.observableArray<milestoneModel>().extend({ 
			mapToJsonResource: { 
				url: "/milestones",
				loadingCount: self.loadingCount,
				loadOnStart: false,
				indexDone: () => {
					self.milestones.unshift({
						id: -1,
						title: "No milestone"
					});
					if (self.selectedMilestone() === null) {
						self.selectedMilestone(self.milestones()[0]);
					}
				}
			}
		});

		this.users = ko.computed(() => {
			var map = ko.utils.arrayMap(self.repositories(), (x: repositoryModel) => { 
				return x.name.split("/")[0];
			});
			return ko.utils.arrayGetDistinctValues(map);
		});

		this.userRepositories = ko.computed(() => {
			var filter = ko.utils.arrayFilter(this.repositories(), (x: repositoryModel) => {
				return x.name.indexOf(self.selectedUser() + "/") === 0;
			});

			return ko.utils.arrayMap(filter, (x: repositoryModel) => {
				return { name: x.name.split("/")[1], id: x.id }; 
			});
		});

		this.phases = ko.computed(() => {
			var re = /\d\s*-\s*(.+)/;
			var map = ko.utils.arrayMap(self.labels(), (x: phaseModel) => { 
				var m = re.exec(x.name);
				var model: phaseModel = { id: x.name, name: m === null ? null : m[1] }; 
				return model;
			});

			return ko.utils.arrayFilter(map, (x: phaseModel) => { return x.name !== null; });
		});

		/*this.issues = ko.computed(() => {
			var map = ko.utils.arrayMap(self.labels(), (x: phaseModel) => { 
				var model: phaseModel = { id: x.name, name: x.name.indexOf("@") == 0 ? x.name.substring(1) : null }; 
				return model;
			});

			var phases = ko.utils.arrayFilter(map, (x: phaseModel) => { return x.name !== null; });
		});*/


		this.logger.info("Started & bound");
		ko.applyBindings(this);
	}

	selectUser(user: string) {
		this.logger.info("Selecting user: " + user);
		this.selectedUser(user);
	}

	selectRepository(repository: repositoryModel) {
		this.selectedRepository(repository.name);
		this.logger.info("Selecting repository '%s'", repository);
		this.labels.reload({ user: this.selectedUser(), repository: repository.name });
		this.milestones.reload({ user: this.selectedUser(), repository: repository.name });
	}

	selectMilestone(milestone: milestoneModel) {
		this.logger.info("Selecting milestone: " + milestone);
		this.selectedMilestone(milestone);
		//this.labels.reload({ user: this.selectedUser(), repository: repository.name });
	}
}

$(() => {
	require(["bootstrap"], (bootstrap: any) => {
		new HomeViewModel().start();
	});
});