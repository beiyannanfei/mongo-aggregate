/**
 * Created by wyq on 17/11/13.
 * $match的用法
 */
const Bluebird = require("bluebird");
const co = require("co");
const path = require("path");
const client = require("./client.js")[`t${path.basename(__filename).split("_")[0]}Model`];

function run() {
	co(function *() {
		yield init();

		//$match 过滤
		let aggregateResponse = yield client.aggregate([
			{
				$match: {author: "dave"}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{"_id": "5a0972bb77a96c0d5c30e346", "author": "dave", "score": 80, "views": 100},
			{"_id": "5a0972bb77a96c0d5c30e347", "author": "dave", "score": 85, "views": 521}
		];

		// 统计数量
		aggregateResponse = yield client.aggregate([
			{
				$match: {
					$or: [
						{score: {$gt: 70, $lte: 90}},
						{views: {$gte: 1000}}
					]
				}
			},
			{
				$group: {
					_id: null,
					count: {$sum: 1}
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [{"_id": null, "count": 5}];
	}).catch(err => {
		console.log("err: %s", err.message || err);
	});
}

function init() {   //初始化数据
	let doc = [
		{"author": "dave", "score": 80, "views": 100},
		{"author": "dave", "score": 85, "views": 521},
		{"author": "ahn", "score": 60, "views": 1000},
		{"author": "li", "score": 55, "views": 5000},
		{"author": "annT", "score": 60, "views": 50},
		{"author": "li", "score": 94, "views": 999},
		{"author": "ty", "score": 95, "views": 1000}
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




