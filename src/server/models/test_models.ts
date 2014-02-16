/// <reference path='../../../interfaces/mongoose/mongoose.d.ts'/>

import mongoose = require('mongoose');

var UserGetSchema = mongoose.Schema({
    result: mongoose.Schema.Types.Mixed
});

export var UserGetModel = mongoose.model('Thing', UserGetSchema);