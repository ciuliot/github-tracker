/// <reference path='../../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>

import knockout_mapping = require("knockout.mapping");
import labelsViewModel = require("./labels_view_model");
import collaboratorModel = require("../models/collaborator_model");
import ko = require("knockout");
import $ = require("jquery");

export enum BoardType { developer, qa };

export var ProductBacklogMilestone: string = "none";

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
	pull_request: KnockoutObservable<any>;
	number: KnockoutObservable<number>;
	updated_at: KnockoutObservable<string>;
	milestone: KnockoutObservable<string>;
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
		pull_request: { html_url: null, state: null },
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
			'pull_request': {
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
		var phases = self.mainLabelsViewModel.labels().declaration().phases;

		this.canStart = ko.computed(() => {
			if (phases() !== null) {
				return self.phase().id() === phases().backlog() || self.phase().id() === phases().onhold();
			} else {
				return false;
			}
		}, this);

		this.canAssign = ko.computed(() => {
			if (phases() !== null) {
				return self.phase().id() !== phases().closed();
			} else {
				return false;
			}
		}, this);

		this.canPause = ko.computed(() => {
			if (phases() !== null) {
				return self.phase().id() === phases().inprogress() || self.phase().id() === phases().inreview();
			} else {
				return false;
			}
		}, this);

		this.canStop = ko.computed(() => {
			if (phases() !== null) {
				return self.phase().id() !== phases().closed();
			} else {
				return false;
			}
		}, this);

		this.canComplete = ko.computed(() => {
			if (phases() !== null) {
				return self.phase().id() === phases().inprogress();
			} else {
				return false;
			}
		}, this);

		this.canReview = ko.computed(() => {
			if (phases() !== null) {
				return self.phase().id() === phases().inreview();
			} else {
				return false;
			}
		}, this);

		this.canAccept = ko.computed(() => {
			if (phases() !== null) {
				return self.phase().id() === phases().implemented();
			} else {
				return false;
			}
		}, this);

		this.canReject = ko.computed(() => {
			
			if (phases() !== null) {
				return self.phase().id() === phases().implemented();
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

function isIssueMatchingFilter(x: Issue, category: labelsViewModel.Label, phase: labelsViewModel.Label, filter: KnockoutObservable<string>): boolean {
	var filterValue: string = filter().toLowerCase();
	return filterValue.length === 0 
	    || (x.number().toString().indexOf(filterValue) >= 0)
	    || (x.title().toLowerCase().indexOf(filterValue) >= 0)
	    || (category.name() === null ? false : (category.name().toLowerCase().indexOf(filterValue) >= 0))
	    || (phase ? (phase.name().toLowerCase().indexOf(filterValue) >= 0) : false)
	    || (x.assignee().login() !== null && x.assignee().login().toLowerCase().indexOf(filterValue) >= 0);
}

export class DeveloperBoardColumn extends labelsViewModel.Label {
	issues: KnockoutComputed<Issue[]>;
	filteredIssues: KnockoutComputed<Issue[]>;
	isColumnVisible: KnockoutComputed<boolean>;

	constructor(public category: Category, private filter: KnockoutObservable<string>, data: string) {
		super();

		var self = this;
		knockout_mapping.fromJS(data, {}, this);

		this.issues = ko.computed(() => {
			return ko.utils.arrayFilter(self.category.issues(), x => {
				var isInPhase = x.phase().id() === self.id();

				return isInPhase;
			});
		});

		this.filteredIssues = ko.computed(() => {
			return ko.utils.arrayFilter(self.issues(), x => {
				return isIssueMatchingFilter(x, self.category, self, self.filter);
			});
		});
	}
}

export class QABoardColumn {
	issues: KnockoutComputed<Issue[]>;
	filteredIssues: KnockoutComputed<Issue[]>;

	constructor(public category: Category, private filter: KnockoutObservable<string>, data: any[]) {
		var self = this;
		this.issues = knockout_mapping.fromJS(data);

		this.filteredIssues = ko.computed(() => {
			var boardType = self.category.viewModel.boardType();
			return ko.utils.arrayFilter(self.issues(), x => {
				return isIssueMatchingFilter(x, self.category, undefined, self.filter);
			});
		});
	}
}

export class Category extends labelsViewModel.Label  {
	developerBoardColumns: KnockoutComputed<DeveloperBoardColumn[]>;
	issues: KnockoutComputed<Issue[]>;
	isTopPriority: KnockoutObservable<boolean> = ko.observable(false);
	visibleIssueCount: KnockoutComputed<number>;
	qaBoardColumns: KnockoutComputed<QABoardColumn[]>;

	constructor(public viewModel: IssuesViewModel, data: string) {
		super();

		var self = this;
		knockout_mapping.fromJS(data, {}, this);

		this.issues = ko.computed(() => {
			return ko.utils.arrayFilter(self.viewModel.issuesData().issues(), x => { 
				var meta = self.viewModel.issuesData().meta();
				var isPriorityType: boolean = meta !== null && meta.priorityTypes().indexOf(x.type().id()) >= 0;

				var isInPhase = x.category().id() === self.id(); 
				var isTopPriorityCategory = self.isTopPriority();
				var isInMilestone = (self.viewModel.selectedMilestone() === ProductBacklogMilestone && x.milestone() === null) ||
								    (self.viewModel.selectedMilestone() === x.milestone());

				return isInMilestone && ((isTopPriorityCategory && isPriorityType) ||
				        (!isTopPriorityCategory && !isPriorityType && x.category().id() === self.id()));
			});
		});

		self.developerBoardColumns = ko.computed(() => {
			var phases = self.viewModel.labelsViewModelInstance.labels().declaration().phases();
			var developerPhases = ko.utils.arrayFilter(self.viewModel.labelsViewModelInstance.labels().phases(), phase => {
				return phases !== null ? (phase.id() !== phases.implemented() && phase.id() !== phases.closed()) : false;
			});

			return ko.utils.arrayMap(developerPhases, phase => {
				if (phase.id() !== phases.implemented() && phase.id() != phases.closed()) {
					return new DeveloperBoardColumn(self, viewModel.filter, knockout_mapping.toJS(phase));
				}
			});
		});

		self.qaBoardColumns = ko.computed(() => {
			var boardType = self.viewModel.boardType();
			var phases = self.viewModel.labelsViewModelInstance.labels().declaration().phases;

			var implementedIssues = ko.utils.arrayFilter(self.issues(), x => {
				return x.phase().id() === phases().implemented();
			});

			var closedIssues = ko.utils.arrayFilter(self.issues(), x => {
				return x.phase().id() === phases().closed();
			});

			var columns = [], result = [];
			for (var i=0; i < 4; i++) {
				columns.push([]);
			}

			for (var i=0; i < implementedIssues.length; i++) {
				columns[i%2].push(implementedIssues[i]);
			}

			for (var i=0; i < closedIssues.length; i++) {
				columns[2 + i%2].push(closedIssues[i]);
			}

			for (var i=0; i < columns.length; i++) {
				result.push(new QABoardColumn(self, self.viewModel.filter, columns[i]));
			}

			return result;
		});

		self.visibleIssueCount = ko.computed(() => {
			var result = 0;
			var columns: any[] = self.viewModel.boardType() === BoardType.developer ? self.developerBoardColumns() : self.qaBoardColumns();

			for (var i=0; i < columns.length; i++) {
				result += columns[i].filteredIssues().length;
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
				key: (data: Issue) => {
					return ko.utils.unwrapObservable(data.number);
				},
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
	headers: KnockoutComputed<labelsViewModel.Label[]>;
	filter: KnockoutObservable<string> = ko.observable("");
	lastTemporaryId: number = 0;

	constructor(public labelsViewModelInstance: labelsViewModel.LabelsViewModel, public collaborators: KnockoutObservableArray<collaboratorModel>, 
		loadingCount: KnockoutObservable<number>, savingCount: KnockoutObservable<number>, public boardType: KnockoutObservable<BoardType>,
		public selectedMilestone: KnockoutObservable<string>) {
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

		this.headers = ko.computed(() => {
			var phases = self.labelsViewModelInstance.labels().declaration().phases();

			return ko.utils.arrayFilter(self.labelsViewModelInstance.labels().phases(), phase => {
				var isImplementedOrClosed = phases !== null && (phase.id() === phases.implemented() || phase.id() === phases.closed());

				return (self.boardType() === BoardType.developer && !isImplementedOrClosed) ||
					   (self.boardType() === BoardType.qa && isImplementedOrClosed);
			});
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
