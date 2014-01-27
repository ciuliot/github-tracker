/// <reference path="./knockout/knockout.d.ts" />
/// <reference path='./node/node.d.ts'/>

interface KnockoutObservableArray<T> {
	reload(args?: any): any;
	load(args?: any): any;
}
