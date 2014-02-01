/// <reference path="./knockout/knockout.d.ts" />

interface KnockoutObservable<T> {
	reload(args?: any): any;
	load(args?: any): any;
	updateItem(id: any, args?: any) : void;
}

interface KnockoutExtenders {
	mapToJsonResource(target: any, options: any) : void;
}

interface KnockoutBindingHandlers {
	tooltip: KnockoutBindingHandler;
}