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

let t02Schema = new Schema({
	author: String,
	score: Number,
	views: Number
}, {versionKey: false});
exports.t02Model = mongoose.model("t02", t02Schema);

let t03Schema = new Schema({
	name: String,
	item: String,
	sizes: mongoose.Schema.Types.Mixed
}, {versionKey: false});
exports.t03Model = mongoose.model("t03", t03Schema);

let t04Schema = new Schema({
	name: Number,
	item: String,
	price: Number,
	quantity: Number,
	date: Date,
	title: String,
	author: String,
	copies: Number
}, {versionKey: false});
exports.t04Model = mongoose.model("t04", t04Schema);

let t05Schema = new Schema({
	name: String,
	q1: Boolean,
	q2: Boolean
}, {versionKey: false});
exports.t05Model = mongoose.model("t05", t05Schema);

let t06_orders = new Schema({
	item: String,
	price: Number,
	quantity: Number
}, {versionKey: false});
exports.t06_orders = mongoose.model("t06_orders", t06_orders);

let t06_inventory = new Schema({
	sku: String,
	description: String,
	instock: Number
}, {versionKey: false});
exports.t06_inventory = mongoose.model("t06_inventory", t06_inventory);
