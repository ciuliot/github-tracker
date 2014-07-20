/// <reference path='../../interfaces/require/require.d.ts'/>

requirejs.config({
  paths:{
    "sprintf": "/js/sprintf/sprintf.min",
    "jsnlog": "/js/jsnlog/jsnlog.min",
    "crossroads": "/js/crossroads/crossroads.min",
    "hasher": "/js/hasher/hasher.min",
    "signals": "/js/crossroads/signals",
    "jquery": "/js/jquery/jquery.min",
    "async": "/js/async/async",
    "knockout": "/js/knockout/knockout",
    "knockout.mapping": "/js/knockout-mapping/knockout.mapping",
    "knockout.bootstrap": "/js/knockout-bootstrap/knockout-bootstrap.min",
    "moment": "/js/moment/moment.min",
    "bootstrap": "/js/bootstrap/bootstrap.min",
    "socket.io": "/socket.io/socket.io"
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
    },
    "socket.io": {
      exports: "io"
    },
    crossroads: {
      exports: "crossroads"
    }
  }
});

declare var MainModule: string;

//the "main" function to bootstrap your code
require(["./utilities", "jsnlog", MainModule], function (utilities:any, jsnlog: any, mainModule: any) {
  utilities.getLogger("config").info("Initialization completed");
});