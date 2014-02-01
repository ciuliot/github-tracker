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
	canComplete: KnockoutComputed<boolean>;
	haveBranch: KnockoutComputed<boolean>;
	checkoutCommand: KnockoutComputed<string>;

	assignee: KnockoutObservable<collaboratorModel>;
	branch: KnockoutObservable<any>;
	number: KnockoutObservable<number>;
	phaseId: KnockoutObservable<string>;

	assigneeTooltip: KnockoutComputed<string>;

	constructor(private labelsViewModel: labelsViewModel.LabelsViewModel, public collaborators: KnockoutObservableArray<collaboratorModel>, public phase: Phase, data: string) {
		knockout_mapping.fromJS(data || { assignee: null, branch: null }, {
			'assignee': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data || { login: null, avatar_url: null }));
				}
			},
			'branch': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data || { name: null }));
				}
			}
		}, this);
		var self = this;
		var phases = labelsViewModel.labels().declaration.phases;

		this.phaseId = ko.observable(phase.id());

		this.canStart = ko.computed(() => {
			return self.phaseId() === phases.backlog() || self.phaseId() === phases.onhold();
		}, this);

		this.canAssign = ko.computed(() => {
			return self.phaseId() !== phases.closed();
		}, this);

		this.canPause = ko.computed(() => {
			return self.phaseId() === phases.inprogress();
		}, this);

		this.canStop = ko.computed(() => {
			return self.phaseId() !== phases.closed();
		}, this);

		this.canComplete = ko.computed(() => {
			return self.phaseId() === phases.inprogress();
		}, this);

		this.canAccept = ko.computed(() => {
			return self.phaseId() === phases.implemented();
		}, this);

		this.canReject = ko.computed(() => {
			return self.phaseId() === phases.implemented();
		}, this);

		this.haveBranch = ko.computed(() => {
			return self.branch().name() !== null;
		}, this);

		this.assigneeTooltip = ko.computed(() => {
			return self.assignee().login() || 'Assign';
		});

		this.checkoutCommand = ko.computed(() => {
			return "git checkout " + self.branch().name();
		});
	}

	moveToPhase(newPhaseId: string): void {
		var self = this;
		self.phase.issues.remove(self);

		var newPhase = self.phase.category.phases().filter(x => {
			return x.id() == newPhaseId;
		});

		newPhase[0].issues.push(self);
		self.phase = newPhase[0];
		self.phaseId(newPhase[0].id());
	}
}

export class Phase extends labelsViewModel.Label {
	issues: KnockoutObservableArray<Issue>;

	constructor(public category: Category, data: string) {
		super();

		var self = this;
		knockout_mapping.fromJS(data, {
			"issues": {
				create(options: any) {
					return new Issue(self.category.viewModel.labelsViewModel, self.category.viewModel.collaborators, self, options.data);
				}
			}
		}, this);
	}
}

export class Category extends labelsViewModel.Label  {
	phases: KnockoutObservableArray<Phase>;

	constructor(public viewModel: IssuesViewModel, data: string) {
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

	constructor(public labelsViewModel: labelsViewModel.LabelsViewModel, public collaborators: KnockoutObservableArray<collaboratorModel>, 
		loadingCount: KnockoutObservable<number>, savingCount: KnockoutObservable<number>) {
		var self = this;
		this.categories = ko.observableArray<Category>();

		this.categories.extend({ 
			mapToJsonResource: { 
				url: "/issues",
				mapping: {
					create: (options: any) => {
						return new Category(self, options.data); 
					}
				},
				loadingCount: loadingCount,
				savingCount: savingCount,
				loadOnStart: false,
				findById: self.findIssueOnCollection,
				indexDone: () => {
					$('.checkout-command').on('click', function (e) { e.stopPropagation(); });
				}
			}
		});
	}

	private findIssueOnCollection(where: any, number: number): Issue {
		var result: Issue = null;

		for (var i=0; i < where().length && result === null; i++) {
			var category = where()[i];
			for (var j = 0; j < category.phases().length && result === null; j++) {
				var phase = category.phases()[j];
				for (var k = 0; k < phase.issues().length; k++) {
					var issue = phase.issues()[k];
					if (issue.number() === number) {
						result = issue;
						break;
					}
				}
			}
		}

		return result;
	}

	findIssue(number: number): Issue {
		return this.findIssueOnCollection(this.categories, number);
	}
}
