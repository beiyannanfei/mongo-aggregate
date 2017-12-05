/**
 * Created by wyq on 17/12/5.
 */
const Bluebird = require("bluebird");
const co = require("co");
const path = require("path");
const client = require("./client.js")[`t${path.basename(__filename).split("_")[0]}Model`];

function run() {
	co(function *() {
		yield init();

		let aggregateResponse = yield client.aggregate([
			{
				$project: {
					item: 1,
					result: {$or: [{$gt: ["$qty", 250]}, {$lt: ["$qty", 200]}]}
				}
			}
		]);
		console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{"_id": "5a26637cdeaebc57c1673ba6", "item": "abc1", "result": true},
			{"_id": "5a26637cdeaebc57c1673ba7", "item": "abc2", "result": false},
			{"_id": "5a26637cdeaebc57c1673baa", "item": "VWZ2", "result": true},
			{"_id": "5a26637cdeaebc57c1673ba8", "item": "xyz1", "result": false},
			{"_id": "5a26637cdeaebc57c1673ba9", "item": "VWZ1", "result": true}
		];
		process.exit(0);
	}).catch(err => {
		console.log("err: %s", err.message || err);
	});
}

function init() {   //初始化数据
	let doc = [
		{"name": 1, "item": "abc1", description: "product 1", qty: 300},
		{"name": 2, "item": "abc2", description: "product 2", qty: 200},
		{"name": 3, "item": "xyz1", description: "product 3", qty: 250},
		{"name": 4, "item": "VWZ1", description: "product 4", qty: 300},
		{"name": 5, "item": "VWZ2", description: "product 5", qty: 180}
	];
	return new Bluebird((resolve, reject) => {
		client.remove({}).then(response => {
			console.log("delete all doc response: %j", response);
			return client.create(doc);
		}).then(response => {
			return resolve(response);
		}).catch(err => {
			return reject(err);
		});
	});
}
run();