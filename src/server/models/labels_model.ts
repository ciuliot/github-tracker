export interface Label {
	name?: string;
	color?: string;
	id: string;
	url?: string;
};

export interface IndexResult {
	phases: Label[];
	categories: Label[];
	types: Label[];
	declaration: any;
};