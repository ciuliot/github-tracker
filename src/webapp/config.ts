/// <reference path='../../interfaces/require/require.d.ts'/>

requirejs.config({
  paths:{
    "sprintf": "libs/sprintf.min",
    "log4js": "libs/log4js-lib",
    "jquery": "libs/jquery",
    "underscore": "libs/underscore",
    "async": "libs/async",
    "knockout": "libs/knockout",
    "knockout.mapping": "libs/knockout.mapping",
    "moment": "libs/moment.min",
    "bootstrap": "libs/bootstrap.min"
  },
  shim: {
    jquery: {
      exports: "$"
    },
    underscore: {
      exports: '_'
    },
    knockout: {
      exports: "ko"
    },
    log4js: {
      exports: "Log4js"
    },
    moment: {
      exports: "moment"
    }
  }
});

declare var MainModule: string;

//the "main" function to bootstrap your code
require(["./utilities", MainModule], function (utilities:any, mainModule: any) {
  utilities.getLogger("config").info("Initialization completed");
});