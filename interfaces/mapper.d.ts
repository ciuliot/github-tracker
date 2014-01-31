/// <reference path="./knockout/knockout.d.ts" />

interface KnockoutObservable<T> {
	reload(args?: any): any;
	load(args?: any): any;
	update(id: any, args?: any) : void;
}

interface KnockoutExtenders {
	mapToJsonResource(target: any, options: any) : void;
}

interface KnockoutBindingHandlers {
	tooltip: KnockoutBindingHandler;
}