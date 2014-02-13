/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>

import knockout_mapping = require("knockout.mapping");
import labelsViewModel = require("./labels_view_model");
import collaboratorModel = require("../models/collaborator_model");
import ko = require("knockout");
import $ = require("jquery");

export class Issue {
	canStart: KnockoutComputed<boolean>;
	canAssign: KnockoutComputed<boolean>;
	canPause: KnockoutComputed<boolean>;
	canStop: KnockoutComputed<boolean>;
	canAccept: KnockoutComputed<boolean>;
	canReject: KnockoutComputed<boolean>;
	canReview: KnockoutComputed<boolean>;
	canComplete: KnockoutComputed<boolean>;
	haveBranch: KnockoutComputed<boolean>;
	checkoutCommand: KnockoutComputed<string>;

	assignee: KnockoutObservable<collaboratorModel>;
	branch: KnockoutObservable<any>;
	number: KnockoutObservable<number>;
	phase: KnockoutObservable<labelsViewModel.Label>;
	category: KnockoutObservable<labelsViewModel.Label>;
	title: KnockoutObservable<string>;
	estimate: KnockoutObservable<string>;
	description: KnockoutObservable<string>;
	compareUrl: KnockoutObservable<string>;
	type: KnockoutObservable<labelsViewModel.Label>;

	assigneeTooltip: KnockoutComputed<string>;

	static empty: any = {
		number: null,
		description: null,
		title: null,
		milestone: null,
		estimate: null,
		assignee: { login: null, avatar_url: null, estimate: null },
		branch: { name: null },
		type: $.extend({}, labelsViewModel.Label.empty ),
		environment: null,
		compareUrl: null,
		expectedBehavior: null,
		phase: $.extend({}, labelsViewModel.Label.empty ),
		category: $.extend({}, labelsViewModel.Label.empty )
	};

	constructor(public mainLabelsViewModel: labelsViewModel.LabelsViewModel, public collaborators: KnockoutObservableArray<collaboratorModel>, data: any = {}) {
		data = $.extend(true, {}, Issue.empty, data);

		knockout_mapping.fromJS(data, {
			'assignee': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data));
				}
			},
			'branch': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data));
				}
			},
			'type': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data));
				}
			},
			'phase': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data));
				}
			},
			'category': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data));
				}
			}
		}, this);
		var self = this;	

		this.canStart = ko.computed(() => {
			if (self.mainLabelsViewModel.labels().declaration) {
				var phases = self.mainLabelsViewModel.labels().declaration.phases;
				return self.phase().id() === phases.backlog() || self.phase().id() === phases.onhold();
			} else {
				return false;
			}
		}, this);

		this.canAssign = ko.computed(() => {
			if (self.mainLabelsViewModel.labels().declaration) {
				var phases = self.mainLabelsViewModel.labels().declaration.phases;
				return self.phase().id() !== phases.closed();
				} else {
				return false;
			}
		}, this);

		this.canPause = ko.computed(() => {
			if (self.mainLabelsViewModel.labels().declaration) {
				var phases = self.mainLabelsViewModel.labels().declaration.phases;
				return self.phase().id() === phases.inprogress();
			} else {
				return false;
			}
		}, this);

		this.canStop = ko.computed(() => {
			if (self.mainLabelsViewModel.labels().declaration) {
				var phases = self.mainLabelsViewModel.labels().declaration.phases;
				return self.phase().id() !== phases.closed();
			} else {
				return false;
			}
		}, this);

		this.canComplete = ko.computed(() => {
			if (self.mainLabelsViewModel.labels().declaration) {
				var phases = self.mainLabelsViewModel.labels().declaration.phases;
				return self.phase().id() === phases.inprogress();
			} else {
				return false;
			}
		}, this);

		this.canReview = ko.computed(() => {
			if (self.mainLabelsViewModel.labels().declaration) {
				var phases = self.mainLabelsViewModel.labels().declaration.phases;
				return self.phase().id() === phases.inprogress();
			} else {
				return false;
			}
		}, this);

		this.canAccept = ko.computed(() => {
			if (self.mainLabelsViewModel.labels().declaration) {
				var phases = self.mainLabelsViewModel.labels().declaration.phases;
				return self.phase().id() === phases.implemented();
			} else {
				return false;
			}
		}, this);

		this.canReject = ko.computed(() => {
			if (self.mainLabelsViewModel.labels().declaration) {
				var phases = self.mainLabelsViewModel.labels().declaration.phases;
				return self.phase().id() === phases.implemented();
			} else {
				return false;
			}
		}, this);

		this.haveBranch = ko.computed(() => {
			return self.branch() !== null && self.branch().name() !== null;
		}, this);

		this.assigneeTooltip = ko.computed(() => {
			return self.assignee().login() === null ? 'Assign' : ('Assigned to ' + self.assignee().login());
		});

		this.checkoutCommand = ko.computed(() => {
			return self.branch() === null ? "" : ("git checkout -b " + self.branch().name());
		});
	}

	setEstimate(newEstimate: string): void {
		this.estimate(newEstimate);
	}

	moveToPhase(newPhaseId: string): void {
		var newPhase = this.mainLabelsViewModel.labels().phases().filter(x => { return x.id() == newPhaseId; })[0];
		var rawData = knockout_mapping.toJS(newPhase);
		
		knockout_mapping.fromJS(rawData, this.phase());
	}

	moveToCategory(newCategoryId: string): void {
		var newCategory = this.mainLabelsViewModel.labels().categories().filter(x => { return x.id() == newCategoryId; })[0];
		var rawData = knockout_mapping.toJS(newCategory);
		
		knockout_mapping.fromJS(rawData, this.category());
	}
}

export class IssueDetail extends Issue {
	milestone: KnockoutObservable<string>;
}


export class Phase extends labelsViewModel.Label {
	issues: KnockoutComputed<Issue[]>;
	filteredIssues: KnockoutComputed<Issue[]>;
	isColumnVisible: KnockoutComputed<boolean>;

	constructor(public category: Category, private filter: KnockoutObservable<string>, data: string) {
		super();

		var self = this;
		knockout_mapping.fromJS(data, {}, this);

		this.issues = ko.computed(() => {
			return ko.utils.arrayFilter(self.category.viewModel.issuesData().issues(), x => {
				var meta = self.category.viewModel.issuesData().meta();
				var isPriorityType: boolean = meta !== null && meta.priorityTypes().indexOf(x.type().id()) >= 0;

				var isInPhase = x.phase().id() === self.id();
				var isTopPriorityCategory = self.category.isTopPriority();

				var isInCategory = (isTopPriorityCategory && isPriorityType) ||
				                   (!isTopPriorityCategory && !isPriorityType && x.category().id() === self.category.id());

				return isInPhase && isInCategory;
			});
		});

		this.filteredIssues = ko.computed(() => {
			return ko.utils.arrayFilter(self.issues(), x => {
				var filterValue: string = self.filter().toLowerCase();
				return filterValue.length === 0 
				    || (x.number().toString().indexOf(filterValue) >= 0)
				    || (x.title().toLowerCase().indexOf(filterValue) >= 0)
				    || (self.category.name().toLowerCase().indexOf(filterValue) >= 0)
				    || (self.name().toLowerCase().indexOf(filterValue) >= 0)
				    || (x.assignee().login() !== null && x.assignee().login().toLowerCase().indexOf(filterValue) >= 0);
			});
		});

		this.isColumnVisible = ko.computed(() => {
			if (self.category.viewModel.labelsViewModelInstance.labels().declaration) {
				var phases = self.category.viewModel.labelsViewModelInstance.labels().declaration.phases;
				return self.id() !== phases.closed() ||
					(self.category.viewModel.closedIssuesVisible() && self.id() === phases.closed());
			}
			return true;
		});
	}
}

export class Category extends labelsViewModel.Label  {
	phases: KnockoutComputed<Phase[]>;
	isTopPriority: KnockoutObservable<boolean> = ko.observable(false);
	visibleIssueCount: KnockoutComputed<number>;

	constructor(public viewModel: IssuesViewModel, data: string) {
		super();

		var self = this;
		knockout_mapping.fromJS(data, {}, this);

		self.phases = ko.computed(() => {
			return ko.utils.arrayMap(self.viewModel.labelsViewModelInstance.labels().phases(), phase => {
				return new Phase(self, viewModel.filter, knockout_mapping.toJS(phase));
			});
		});

		self.visibleIssueCount = ko.computed(() => {
			var result = 0;
			for (var i=0; i< self.phases().length; i++) {
				var phase = self.phases()[i];
				result += phase.isColumnVisible() ? phase.filteredIssues().length : 0;
			}
			return result;
		});
	}
}

export class IssuesData {
	issues: KnockoutObservableArray<Issue>;
	meta: KnockoutObservable<any>;

	constructor(public viewModel: IssuesViewModel, data: any) {
		var self = this;
		data = $.extend(true, {
			issues: [],
			meta: {
				estimateSizes: null,
				branchNameFormat: null,
				priorityTypes: []
			}
		}, data);
		knockout_mapping.fromJS(data, {
			'issues': {
				create: (options: any) => {
					return new Issue(self.viewModel.labelsViewModelInstance, self.viewModel.collaborators, options.data);
				}
			},
			'meta': {
				create: (options: any) => {
					return ko.observable(knockout_mapping.fromJS(options.data));
				}
			}
		}, this);
	}
}

export class IssuesViewModel {
	issuesData: KnockoutObservable<IssuesData>;
	categories: KnockoutComputed<Category[]>;
	filter: KnockoutObservable<string> = ko.observable("");
	lastTemporaryId: number = 0;

	constructor(public labelsViewModelInstance: labelsViewModel.LabelsViewModel, public collaborators: KnockoutObservableArray<collaboratorModel>, 
		loadingCount: KnockoutObservable<number>, savingCount: KnockoutObservable<number>, public closedIssuesVisible: KnockoutObservable<boolean>) {
		var self = this;
		var mapping = {
			create: (options: any) => {
				return ko.observable(new IssuesData(self, options.data)); 
			}
		};
		this.issuesData = knockout_mapping.fromJS(undefined, mapping);

		this.issuesData.extend({ 
			mapToJsonResource: { 
				url: "/issues",
				mapping: mapping,
				loadingCount: loadingCount,
				savingCount: savingCount,
				loadOnStart: false,
				findById: self.findIssueOnCollection,
				setId: (where: any, id: number) => {
					where.number(id);
				}

			}
		});

		this.categories = ko.computed(() => {
			var result = ko.utils.arrayMap(self.labelsViewModelInstance.labels().categories(), category => {
				return new Category(self, knockout_mapping.toJS(category));
			});

			var highPriorityCategory = new Category(self, labelsViewModel.Label.empty);
			highPriorityCategory.isTopPriority(true);
			result.unshift(highPriorityCategory);

			return result;
		});

		$(document).on('click', '.checkout-command', function (e) { e.stopPropagation(); });

		$(document).on("mouseenter", ".issue", function() {
			$(".actions", this).show();
			$(".description", this).addClass("background");
		}).on("mouseleave", ".issue", function() {
			$(".actions", this).hide();
			$(".description", this).removeClass("background");
		});
	}

	private findIssueOnCollection(where: any, number: number): Issue {
		return ko.utils.arrayFirst(where().issues(), (x: Issue) => { return x.number() === number });
	}

	findIssue(number: number): Issue {
		return this.findIssueOnCollection(this.issuesData, number);
	}
}
