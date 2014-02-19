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

var IssuesSchema = mongoose.Schema({
	user: String,
	repo: String,
	milestone: String,
	state: String,
    result: mongoose.Schema.Types.Mixed
});

export var IssuesModel = mongoose.model('Issues', IssuesSchema);

var GitDataGetReferenceSchema = mongoose.Schema({
	user: String,
	repo: String,
	ref: String,
    result: mongoose.Schema.Types.Mixed
});

export var GitDataGetReferenceModel = mongoose.model('GitDataGetReference', GitDataGetReferenceSchema);

var IssueCommentSchema = mongoose.Schema({
	user: String,
	repo: String,
	number: Number,
    result: mongoose.Schema.Types.Mixed
});

export var IssueCommentModel = mongoose.model('IssueComment', IssueCommentSchema);