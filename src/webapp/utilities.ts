/// <reference path='../../interfaces/knockout/knockout.d.ts'/>
/// <reference path='../../interfaces/knockout.mapping/knockout.mapping.d.ts'/>
/// <reference path='../../interfaces/jquery/jquery.d.ts'/>
/// <reference path='../../interfaces/jsnlog/jsnlog.d.ts'/>
/// <reference path='../../interfaces/mapper.d.ts'/>

import ko = require("knockout");
import knockout_mapping = require("knockout.mapping");

class Utilities {
	static _deferredExtenderLoads: Function[] = [];

	static loadMapper(): void {
		for (var i = 0; i < Utilities._deferredExtenderLoads.length; i++) {
			Utilities._deferredExtenderLoads[i]();
		}

		Utilities._deferredExtenderLoads = [];
	}

	static getLogger(category: string): JSNLogLogger {
	    var consoleAppender = JL.createConsoleAppender('consoleAppender');
	    
		return JL(category).setOptions({"appenders": [consoleAppender]});;
	}
}

ko.bindingHandlers['class'] = {
    update: (element: any, valueAccessor: any) => {
        var currentValue: any = ko.utils.unwrapObservable(valueAccessor()),
            prevValue = element['__ko__previousClassValue__'],

            // Handles updating adding/removing classes
            addOrRemoveClasses = (singleValueOrArray: any, shouldHaveClass: any) => {
                if (Object.prototype.toString.call(singleValueOrArray) === '[object Array]') {          
                    ko.utils.arrayForEach(singleValueOrArray, (cssClass: any) => {
                      var value: any = ko.utils.unwrapObservable(cssClass);
                      ko.utils.toggleDomNodeCssClass(element, value, shouldHaveClass);
                    });
                } else if (singleValueOrArray) {
                    ko.utils.toggleDomNodeCssClass(element, singleValueOrArray, shouldHaveClass);
                }
            };

        // Remove old value(s) (preserves any existing CSS classes)
        addOrRemoveClasses(prevValue, false);

        // Set new value(s)
        addOrRemoveClasses(currentValue, true);

        // Store a copy of the current value
        element['__ko__previousClassValue__'] = currentValue.concat();
    }
};

export = Utilities;