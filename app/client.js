/**
 * Created by wyq on 17/11/10.
 */
"use strict";
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect("mongodb://localhost/aggregate_test", {useMongoClient: true});
const Schema = mongoose.Schema;

let t01Schema = new Schema({
	title: String,
	isbn: String,
	author: mongoose.Schema.Types.Mixed,
	copies: Number
}, {versionKey: false});
exports.t01Model = mongoose.model("t01", t01Schema);