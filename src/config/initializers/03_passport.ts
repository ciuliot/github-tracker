/// <reference path='../../../interfaces/mongoose.d.ts'/>
/// <reference path='../../../interfaces/log4js.d.ts'/>

import express = require("express");
import mongoose = require('mongoose');
import log4js = require('log4js');
import configuration = require('../configuration')

var mongoStore = require('connect-mongodb')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

function initializeDatabase(app: express.Application, done: (result?: any) => void) {
    var logger = log4js.getLogger("Passport");
    logger.info("Setting up authentication");

    passport.serializeUser(function(user: string, done: any) {
        done(null, 1);
    });

    passport.deserializeUser(function(id: string, done: any) {
        done(null, { id: 1, name: "admin" });
    });

    passport.use(new LocalStrategy(
        (username: string, password: string, done: (id: string, state?: any, result?: any) => void) => {
            if (username == "admin" && password == configuration.adminPassword) {
                return done(null, { name: "admin" });
            } else {
                return done(null, false, { message: 'Invalid username or password.' });
            }
        }
        ));

    app.use(express["session"]({
        secret: 'secret',
        store: new mongoStore({ db: mongoose.connection.db })
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    done();
}

function initialize(done: (result?: any) => void) {
    var app = this;
    initializeDatabase(app, done);
}

export = initialize;
