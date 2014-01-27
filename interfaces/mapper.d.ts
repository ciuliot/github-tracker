/// <reference path="./knockout/knockout.d.ts" />
/// <reference path='./node/node.d.ts'/>

interface KnockoutObservable<T> {
	reload(args?: any): any;
	load(args?: any): any;
}
