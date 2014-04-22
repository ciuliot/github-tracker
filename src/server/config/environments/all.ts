/// <reference path='../../../../interfaces/express/express.d.ts'/>

import express = require("express");
import path = require("path");
import configuration = require("../configuration");

var poweredBy = require('connect-powered-by')
    , util = require('util')
    , nib = require('nib')
    , stylus = require('stylus')    
    , GitHubApi = require("github")
    , morgan = require("morgan")
    , favicon = require("static-favicon")
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override');

function initialize() {
    var config = configuration;

    // Configure application settings.  Consult the Express API Reference for a
    // list of the available [settings](http://expressjs.com/api.html#app-settings).

    var viewsDir = path.resolve(config.startupDirectory, "./views");
    var stylesDir = path.resolve(config.startupDirectory, "./styles");
    var publicDir = path.resolve(config.startupDirectory, "./dist/public");

    config.logger.info("Views directory: %s", viewsDir);
    config.logger.info("Styles directory: %s", stylesDir);
    config.logger.info("Public directory: %s", publicDir);

    this.set('views', viewsDir);
    this.set('view engine', 'jade');

    // Register Jade as a template engine.
    this.engine('jade', require('jade').__express);

    // Override default template extension.  By default, Locomotive finds
    // templates using the `name.format.engine` convention, for example
    // `index.html.ejs`  For some template engines, such as Jade, that find
    // layouts using a `layout.engine` notation, this results in mixed conventions
    // that can cuase confusion.  If this occurs, you can map an explicit
    // extension to a format.
    this.format('html', { extension: '.jade' })

  // Register formats for content negotiation.  Using content negotiation,
  // different formats can be served as needed by different clients.  For
  // example, a browser is sent an HTML response, while an API client is sent a
  // JSON or XML response.
  /* this.format('xml', { engine: 'xmlb' }); */

  // Use middleware.  Standard [Connect](http://www.senchalabs.org/connect/)
  // middleware is built-in, with additional [third-party](https://github.com/senchalabs/connect/wiki)
  // middleware available as separate modules.  

    this.use(poweredBy('Locomotive'));
    this.use(morgan());
    this.use(favicon());
    this.use(cookieParser());

    this.use("/src", express.static(path.resolve(config.startupDirectory, "./src")));
    this.use(express.static(publicDir));

    this.use(bodyParser());
    this.use(methodOverride());

    /* istanbul ignore next */
    config.dataFactory = (): any => { 
        return new GitHubApi ({
            // required
            version: "3.0.0",
            // optional
            debug: false,
            protocol: "https",
            host: "api.github.com",
            timeout: 5000
        });
    };

    config.logger.debug("Common environment init completed");
}

export = initialize;