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
	title: KnockoutObservable<string>;

	assigneeTooltip: KnockoutComputed<string>;

	constructor(private labelsViewModel: labelsViewModel.LabelsViewModel, public collaborators: KnockoutObservableArray<collaboratorModel>, public phase: Phase, data: string) {
		knockout_mapping.fromJS(data || { assignee: null, branch: null, type: null, environment: null, expectedBehavior: null }, {
			'assignee': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data || { login: null, avatar_url: null, estimate: null, description: null }));
				}
			},
			'branch': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data || { name: null }));
				}
			},
			'type': {
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
			return self.assignee().login() === null ? 'Assign' : ('Assigned to ' + self.assignee().login());
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
	filteredIssues: KnockoutComputed<Issue[]>;

	constructor(public category: Category, private filter: KnockoutObservable<string>, data: string) {
		super();

		var self = this;
		knockout_mapping.fromJS(data, {
			"issues": {
				create(options: any) {
					return new Issue(self.category.viewModel.labelsViewModel, self.category.viewModel.collaborators, self, options.data);
				}
			}
		}, this);

		this.filteredIssues = ko.computed(() => {
			return ko.utils.arrayFilter(self.issues(), x => {
				var filterValue = self.filter().toLowerCase();

				return filterValue.length === 0 
					|| (x.number().toString().indexOf(filterValue) >= 0)
					|| (x.title().toLowerCase().indexOf(filterValue) >= 0)
					|| (self.category.name().toLowerCase().indexOf(filterValue) >= 0)
					|| (self.name().toLowerCase().indexOf(filterValue) >= 0)
					|| (x.assignee().login() !== null && x.assignee().login().toLowerCase().indexOf(filterValue) >= 0);
			});
		});
	}
}

export class Category extends labelsViewModel.Label  {
	phases: KnockoutObservableArray<Phase>;

	constructor(public viewModel: IssuesViewModel, data: string) {
		super();
		knockout_mapping.fromJS(data, {
			"phases": {
				create: (options: any) => {
					return new Phase(options.parent, viewModel.filter, options.data);
				}
			}
		}, this);
	}
}

export class IssuesViewModel {
	categories: KnockoutObservableArray<Category>;
	filter: KnockoutObservable<string> = ko.observable("");

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

					$(".issue").on("mouseenter", function() {
						$(".actions", this).show();
						$(".description", this).addClass("background");
					}).on("mouseleave", function() {
						$(".actions", this).hide();
						$(".description", this).removeClass("background");
					});
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
