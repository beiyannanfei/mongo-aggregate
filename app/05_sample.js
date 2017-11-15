/**
 * Created by wyq on 17/11/15.
 * $sample 的使用
 */
const Bluebird = require("bluebird");
const co = require("co");
const path = require("path");
const client = require("./client.js")[`t${path.basename(__filename).split("_")[0]}Model`];

function run() {
	co(function *() {
		yield init();

		//$sample 随机返回指定数量的文档(可能是重复的)
		let aggregateResponse = yield client.aggregate([
			{
				$sample: {
					size: 3
				}
			}
		]);
		console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [   //随机取样
			{"_id": "5a0c05b008e51b2347ff38e7", "name": "ahn", "q1": true, "q2": true},
			{"_id": "5a0c05b008e51b2347ff38eb", "name": "ty", "q1": false, "q2": true},
			{"_id": "5a0c05b008e51b2347ff38ea", "name": "li", "q1": true, "q2": true}
		];
	}).catch(err => {
		console.log("err: %s", err.message || err);
	});
}

function init() {   //初始化数据
	let doc = [
		{"name": "dave123", "q1": true, "q2": true},
		{"name": "dave2", "q1": false, "q2": false},
		{"name": "ahn", "q1": true, "q2": true},
		{"name": "li", "q1": true, "q2": false},
		{"name": "annT", "q1": false, "q2": true},
		{"name": "li", "q1": true, "q2": true},
		{"name": "ty", "q1": false, "q2": true}
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
