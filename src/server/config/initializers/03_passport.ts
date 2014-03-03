/// <reference path='../../../../interfaces/mongoose/mongoose.d.ts'/>
/// <reference path='../../../../interfaces/log4js/log4js.d.ts'/>

import express = require("express");
import mongoose = require('mongoose');
import log4js = require('log4js');
import configuration = require('../configuration');
import util = require('util');

var   passport = require('passport')
    , GitHubStrategy = require('passport-github').Strategy
    , BasicStrategy = require('passport-http').BasicStrategy;

function initializeDatabase(app: express.Application, done: (result?: any) => void) {
    var logger = log4js.getLogger("Passport");

    logger.info("Using strategy %s", configuration.loginStrategy);

    /* istanbul ignore else */
    if (configuration.loginStrategy === "basic") {
        passport.use(new BasicStrategy(
          function(username: any, password: any, done: Function) {
            /* istanbul ignore else */
            if (username === "tester" && password === "123") {
              return done(null, {
                displayName: "uTester",
                accessToken: "1234"
              });
            } else {
              return done("Not found", false);
            }
          }
        ));
    }
    else if (configuration.loginStrategy === "github") { // Unit tests doesn't cover GitHub integration
        var dnsName = configuration.githubApplication.dnsName || util.format("%s:%d", configuration.http_address, configuration.http_port);
        var callbackURL = util.format("http://%s/auth/callback", dnsName);
        logger.info("Setting up authentication using ID %s, secret %s and callback URL %s",
          configuration.githubApplication.clientID, configuration.githubApplication.clientSecret, callbackURL);

        passport.use(new GitHubStrategy({
            clientID: configuration.githubApplication.clientID,
            clientSecret: configuration.githubApplication.clientSecret,
            scope: configuration.githubApplication.scope,
            callbackURL: callbackURL
          },
          function(accessToken: string, refreshToken: string, profile: any, done: Function) {
            profile.accessToken = accessToken;
            process.nextTick(function () {
          
              // To keep the example simple, the user's GitHub profile is returned to
              // represent the logged-in user.  In a typical application, you would want
              // to associate the GitHub account with a user record in your database,
              // and return that user instead.
              return done(null, profile);
            });
          }
        ));
    }

    passport.serializeUser(function(user: any, done: Function) {
        done(null, user);
    });

    /* istanbul ignore next */
    passport.deserializeUser(function(obj: any, done: Function) {
      //logger.debug("Deserialize:", obj);
      done(null, obj);
    });

    app.use(express["session"](configuration.sessionStore));

    app.use(passport.initialize());
    app.use(passport.session());

    done();
}

function initialize(done: (result?: any) => void) {
    var app = this;
    initializeDatabase(app, done);
}

export = initialize;
