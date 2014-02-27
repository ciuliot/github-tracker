/// <reference path='../../../../interfaces/mongoose/mongoose.d.ts'/>
/// <reference path='../../../../interfaces/log4js/log4js.d.ts'/>

import express = require("express");
import mongoose = require('mongoose');
import log4js = require('log4js');
import configuration = require('../configuration');

var mongoStore = require('connect-mongodb');

function initializeDatabase(done: (result?: any) => void) {
    var logger = log4js.getLogger("MongoDb");
    logger.info("Connecting to database %s", configuration.databaseName);

    try {
        mongoose.connect(configuration.databaseName);

        var db = mongoose.connection;

        db.on('error', logger.error.bind(logger, 'connection error:'));
        db.once('open', (err: String) => {
            /* istanbul ignore if */
            if (err) {
                logger.error("Error occured during database open", err);
            } else {
                logger.info("Succesfully connected to database")
	    	}

            configuration.sessionStore.store = new mongoStore({ db: mongoose.connection.db });

            done(err);
        });
    }
    catch (ex) {
        /* istanbul ignore next */ 
        logger.error("Exception occured during MongoDb initialization", ex);
        /* istanbul ignore next */ 
        done(ex);
    }
}

function initialize (done: (result?: any) => void) {
    initializeDatabase(done);
}

export = initialize;
