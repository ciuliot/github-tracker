interface MilestoneModel {
	id: string;
	number?: number;
	state?: string;
	title: string;
	open_issues?: number;
	closed_issues?: number;
}

export = MilestoneModel;