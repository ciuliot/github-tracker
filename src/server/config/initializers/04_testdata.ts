/// <reference path='../../../../interfaces/mongoose/mongoose.d.ts'/>
/// <reference path='../../../../interfaces/log4js/log4js.d.ts'/>
/// <reference path='../../../../interfaces/async/async.d.ts'/>

import express = require("express");
import mongoose = require('mongoose');
import log4js = require('log4js');
import path = require('path');
import util = require('util');
import configuration = require('../configuration');
import async = require('async');

var diveSync = require('diveSync');

function initializeDatabase(app: express.Application, done: (result?: any) => void) {
	if (configuration.environment === "unittest") {
		var logger = log4js.getLogger("testData");

		logger.info("Dropping all collections in database %s", configuration.databaseName);

        try {
            mongoose.connection.db.executeDbCommand({ dropDatabase: 1 }, function(err: any) {
                if (err) {
                    logger.error("Error occured during database drop", err);
                } else {
                    logger.info("Database dropped succesfully");
                }
            });
        } catch (ex) {
            logger.error("Exception occured during MongoDb initialization", ex);
        }

		logger.info("Filling unit test data");

		var datastoreDir = path.resolve(path.resolve(configuration.startupDirectory, "./dist/datastores"), configuration.environment);

		logger.debug("Datastores directory: %s", datastoreDir);

		var exts = ['js'];
	    var exception: any;
	    var modelObjects: any[] = [];

	    diveSync(datastoreDir, function(err: Error, filePath: string) {
	        if (exception) {
	            logger.error("Exception occured during data initialization", exception);
	            done();
	            return;
	        }
	        var regex = new RegExp('\\.(' + exts.join('|') + ')$');

	        if (regex.test(filePath)) {
	            logger.debug("Loading model from file %s", filePath);
	            modelObjects.push(require(filePath));
	        }
	    });

	    logger.info("Storing %d models into database", modelObjects.length);

	    async.map(modelObjects, (key: any, callback: (err: any, result?: any) => void) => {
	    	if (util.isArray(key)) {
	    		async.forEachSeries(key, (x: any, cb: Function) => { x.save(cb); }, callback);
	    	} else {
	        	key.save(callback);
	    	}
	    }, (err, results) => {
            if (err) {
                logger.error("Exception occured during data initialization", err);
            } else {
                logger.info("Done initializing all models");
            }
            done(err);
        });

	} else {
		done();
	}
	

}

function initialize(done: (result?: any) => void) {
    var app = this;
    initializeDatabase(app, done);
}

export = initialize;