/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>

import knockout_mapping = require("knockout.mapping");
import labelsViewModel = require("./labels_view_model");
import collaboratorModel = require("../models/collaborator_model");
import ko = require("knockout");

export class Issue {
	canStart: KnockoutComputed<boolean>;
	canAssign: KnockoutComputed<boolean>;
	canPause: KnockoutComputed<boolean>;
	canStop: KnockoutComputed<boolean>;
	canAccept: KnockoutComputed<boolean>;
	canReject: KnockoutComputed<boolean>;

	constructor(private labelsViewModel: labelsViewModel.LabelsViewModel, public collaborators: KnockoutObservableArray<collaboratorModel>, private phase: Phase, data: string) {
		knockout_mapping.fromJS(data, {}, this);
		var self = this;
		var phases = labelsViewModel.labels().declaration.phases;

		this.canStart = ko.computed(() => {
			return self.phase.id() === phases.backlog() || self.phase.id() === phases.onhold();
		}, this);

		this.canAssign = ko.computed(() => {
			return self.phase.id() !== phases.closed();
		}, this);

		this.canPause = ko.computed(() => {
			return self.phase.id() === phases.inprogress();
		}, this);

		this.canStop = ko.computed(() => {
			return self.phase.id() !== phases.closed();
		}, this);

		this.canAccept = ko.computed(() => {
			return self.phase.id() === phases.implemented();
		}, this);

		this.canReject = ko.computed(() => {
			return self.phase.id() === phases.implemented();
		}, this);
	}
}

export class Phase extends labelsViewModel.Label {
	issues: KnockoutObservableArray<Issue>;

	constructor(private parent: Category, data: string) {
		super();

		var self = this;
		knockout_mapping.fromJS(data, {
			"issues": {
				create(options: any) {
					return new Issue(self.parent.parent.labelsViewModel, self.parent.parent.collaborators, self, options.data);
				}
			}
		}, this);
	}
}

export class Category extends labelsViewModel.Label  {
	phases: KnockoutObservableArray<Phase>;

	constructor(public parent: IssuesViewModel, data: string) {
		super();
		knockout_mapping.fromJS(data, {
			"phases": {
				create: (options: any) => {
					return new Phase(options.parent, options.data);
				}
			}
		}, this);
	}
}

export class IssuesViewModel {
	categories: KnockoutObservableArray<Category>;

	constructor(public labelsViewModel: labelsViewModel.LabelsViewModel, public collaborators: KnockoutObservableArray<collaboratorModel>, loadingCount: KnockoutObservable<number>) {
		var self = this;
		this.categories = knockout_mapping.fromJS([], {
			create: (options: any) => {
				return new Category(self, options.data); 
			}
		}).extend({ 
			mapToJsonResource: { 
				url: "/issues",
				loadingCount: loadingCount,
				loadOnStart: false
			}
		});
	}
}
