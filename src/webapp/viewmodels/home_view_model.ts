/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/jquery/jquery.d.ts'/>
/// <reference path='../../../interfaces/bootstrap/bootstrap.d.ts'/>

import ko = require("knockout");
import $ = require("jquery");
import utilities = require("../utilities");

import repositoryModel = require("../models/repository_model");
import organizationModel = require("../models/organization_model");

class HomeViewModel {
	repositories: KnockoutObservableArray<repositoryModel>;
	organizations: KnockoutComputed<string[]>;
	projects: KnockoutComputed<string[]>;
	selectedOrganization: KnockoutObservable<string> = ko.observable("");

	constructor() {
		utilities.getLogger("HomeViewModel").info("All done");
		
	}

	start() {
		var self = this;
		this.repositories = ko.observableArray<repositoryModel>().extend({ 
			mapToJsonResource: { 
				url: "/repositories", 
				indexDone: () => {
					if (self.organizations().length > 0) {
						self.selectedOrganization(self.organizations()[0]);
					}
				}
			}
		});

		this.organizations = ko.computed(() => {
			var map = ko.utils.arrayMap(this.repositories(), (x: repositoryModel) => { 
				return x.name.split("/")[0];
			});
			return ko.utils.arrayGetDistinctValues(map);
		});

		this.projects = ko.computed(() => {
			var self = this;
			var filter = ko.utils.arrayFilter(this.repositories(), (x: repositoryModel) => {
				return x.name.indexOf(self.selectedOrganization() + "/") === 0;
			});

			return ko.utils.arrayMap(filter, (x: repositoryModel) => {
				return x.name.split("/")[1]; 
			});
		});

		ko.applyBindings(this);
	}

	selectOrganization(organization: string) {
		this.selectedOrganization(organization);
	}
}

$(() => {
	require(["bootstrap"], (bootstrap: any) => {
		new HomeViewModel().start();
	});
});