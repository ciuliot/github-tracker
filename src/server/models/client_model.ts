/// <reference path='../../../interfaces/mongoose/mongoose.d.ts'/>

import mongoose = require('mongoose');

var ClientSchema = mongoose.Schema({
    sessionId: String,
    repository: String,
    user: String
});

export var ClientModel = mongoose.model('Client', ClientSchema);