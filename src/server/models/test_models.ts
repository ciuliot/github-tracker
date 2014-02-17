/// <reference path='../../../interfaces/mongoose/mongoose.d.ts'/>

import mongoose = require('mongoose');

var UserGetSchema = mongoose.Schema({
    result: mongoose.Schema.Types.Mixed
});

export var UserGetModel = mongoose.model('UserGet', UserGetSchema);

var ReposGetCollaboratorsSchema = mongoose.Schema({
	user: String,
	repo: String,
    result: mongoose.Schema.Types.Mixed
});

export var ReposGetCollaboratorsModel = mongoose.model('ReposGetCollaborators', ReposGetCollaboratorsSchema);

var IssuesGetAllMilestonesSchema = mongoose.Schema({
	user: String,
	repo: String,
    result: mongoose.Schema.Types.Mixed
});

export var IssuesGetAllMilestonesModel = mongoose.model('IssuesGetAllMilestones', IssuesGetAllMilestonesSchema);