/// <reference path='../../../interfaces/mongoose.d.ts'/>
/// <reference path='../../../interfaces/log4js.d.ts'/>

import express = require("express");
import mongoose = require('mongoose');
import log4js = require('log4js');
import configuration = require('../configuration');
import utils = require('utils');

var mongoStore = require('connect-mongodb')
    , passport = require('passport')
    , GitHubStrategy = require('passport-github').Strategy;

function initializeDatabase(app: express.Application, done: (result?: any) => void) {
    var logger = log4js.getLogger("Passport");
    logger.info("Setting up authentication");

    passport.use(new GitHubStrategy({
        clientID: "39796dadb4d9d2a45354",
        clientSecret: "69e659d98975cbdf854e9403ae2ffbee60911194",
        callbackURL: utils.format("http://%s:%d/auth/callback", configuration.http_address, configuration.http_port)
      },
      function(accessToken: string, refreshToken: string, profile: any, done: Function) {
        process.nextTick(function () {
      
          // To keep the example simple, the user's GitHub profile is returned to
          // represent the logged-in user.  In a typical application, you would want
          // to associate the GitHub account with a user record in your database,
          // and return that user instead.
          return done(null, profile);
        });
      }
    ));

    passport.serializeUser(function(user: any, done: Function) {
      done(null, user);
    });

    passport.deserializeUser(function(obj: any, done: Function) {
      done(null, obj);
    });

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
