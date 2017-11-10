/**
 * Created by wyq on 17/11/10.
 */
"use strict";
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect("mongodb://localhost/aggregate_test");
const Schema = mongoose.Schema;

let t1Schema = new Schema({
	item: String,
	qty: Number,
	tags: [String],
	dim_cm: [Number]
}, {versionKey: false});
exports.t1Model = mongoose.model("t1", t1Schema);