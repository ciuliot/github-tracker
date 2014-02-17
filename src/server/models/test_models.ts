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

var IssuesGetLabelsSchema = mongoose.Schema({
	user: String,
	repo: String,
    result: mongoose.Schema.Types.Mixed
});

export var IssuesGetLabelsModel = mongoose.model('IssuesGetLabels', IssuesGetLabelsSchema);

var IssuesRepoIssuesSchema = mongoose.Schema({
	user: String,
	repo: String,
	milestone: String,
	state: String,
    result: mongoose.Schema.Types.Mixed
});

export var IssuesRepoIssuesModel = mongoose.model('IssuesRepoIssues', IssuesRepoIssuesSchema);

var GitDataGetReferenceSchema = mongoose.Schema({
	user: String,
	repo: String,
	ref: String,
    result: mongoose.Schema.Types.Mixed
});

export var GitDataGetReferenceModel = mongoose.model('GitDataGetReference', GitDataGetReferenceSchema);