interface MilestoneModel {
	id: number;
	number?: number;
	state?: string;
	title: string;
	open_issues?: number;
	closed_issues?: number;
}

export = MilestoneModel;