export interface Label {
	name?: string;
	color?: string;
	id: string;
};

export interface IndexResult {
	phases: Label[];
	categories: Label[];
	types: Label[];
	declaration: any;
};