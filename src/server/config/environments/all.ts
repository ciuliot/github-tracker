/// <reference path='../../../../interfaces/express/express.d.ts'/>

import express = require("express");
import path = require("path");
import configuration = require("../configuration");

var poweredBy = require('connect-powered-by')
    , util = require('util')
    , nib = require('nib')
    , stylus = require('stylus')    
    , GitHubApi = require("github");

function initialize() {
    // Warn of version mismatch between global "lcm" binary and local installation
    // of Locomotive.
    if (this.version !== require('locomotive').version) {
        console.warn(util.format('version mismatch between local (%s) and global (%s) Locomotive module', require('locomotive').version, this.version));
    }

    var config = configuration;

    // Configure application settings.  Consult the Express API Reference for a
    // list of the available [settings](http://expressjs.com/api.html#app-settings).

    var viewsDir = path.resolve(config.startupDirectory, "./views");
    var stylesDir = path.resolve(config.startupDirectory, "./styles");
    var publicDir = path.resolve(config.startupDirectory, "./dist/public");

    config.logger.debug("Views directory: %s", viewsDir);
    config.logger.debug("Styles directory: %s", stylesDir);
    config.logger.debug("Public directory: %s", publicDir);

    function compile(str: string, path: string) {
        console.log(str);
        console.log(path);

        return stylus(str)
            .set('filename', path)
            .set('compress', true)
            .use(nib());
    }

    this.use(stylus.middleware({
          src: process.cwd()
        , dest: publicDir
        , compile: compile
    }));

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
    this.use(express.logger());
    this.use(express.favicon());
    this.use(express["cookieParser"]());
    this.use(express.static(publicDir));
    this.use(express.bodyParser());
    this.use(express.methodOverride());

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
}

export = initialize;