github-tracker
==============

[Travis CI](https://travis-ci.org/ciuliot/github-tracker): ![Build status](https://travis-ci.org/ciuliot/github-tracker.png)
[![Coverage Status](https://coveralls.io/repos/ciuliot/github-tracker/badge.png)](https://coveralls.io/r/ciuliot/github-tracker)

Bringing issue tracking to new level. We all know how what it currently means to use 
bug tracking issues - we need to login to separate system every day to find out what 
are open tasks. We need to manually trigger that we wish to work on task, and after 
work is done manually add information to issue tracker to keep track between source
code repository and issue tracking and move task to completed state. Tracking real 
effort means to keep up log of hours reported on piece of paper and manually
logging into the system.

## Enter github-tracker

GitHub-tracker is build on top of GitHub issues API so it's directly integrated
with your source code repository and it's built with following targets in mind:

### Fast action

Don't wait on your issue tracker - all important information is cached in your 
browser's session storage so you won't lose it after page reload and we are also
caching update requests so you don't have to wait for operations to complete to 
server. 

### Automate as much as possible

If you already executed some action or provided information in one system why you
should copy it over to other one if it can be done automatically? GitHub tracker
can help you with that by:

* Opening task means that it will be assigned to you and create feature braches 
on your private branch
* Keeping record of time spent on the task by monitoring commits into branch
* Monitoring pull requests to indicate if task is ready to be reviewed and that it
can be verified after merge
* Automating impediment list maintenance for tasks on hold

### Keep up to date

Live updates are delivered by WebSockets interface so you don't have to reload 
webpage and you are still getting fresh data.

### All relevant information is kept in source code repository

All configuration files, templates and lists are kept in source code repository 
so you have all your information available all the time from one place.

### Important information is just a glance away

You should need only one look at the issue board to get an good picture where 
project is and what is going on at the same time. 

### Actions are just click (or tap) away

Gestures, drag & drop looks nice on paper and in demos but in real world are getting
in the way. GitHub tracker shows buttons and offer keyboard shortcuts
for all with important actions. 

## Repository setup

Initial procedure for repository setup should include (this will be automated in later
phases):

* Allow issues to be used on your project
* Create following labels: `#inprogress`, `#onhold`, `#implemented`
* Create category labels with prefix `@`, e.g. `@frontend`, `@backend`
* Fork project into your account
* Create following files in root level:
   * impediments.md

## Prerequisites

Following frameworks are required:

* [Node.js](http://www.nodejs.org/)
* [MongoDb](http://www.mongodb.org/)

After cloning the repository perform following commands:
 
    cd github-tracker
    npm install -g grunt-cli
    npm install .
    
Project compilation works with [Grunt](http://gruntjs.com/) task runner so in order to build project execute:

    grunt
    
To start backend server execture following command:

    node dist/app.js
    
