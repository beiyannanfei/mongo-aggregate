/**
 * Created by wyq on 17/11/14.
 * $unwind 使用
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
				$match: {
					name: "1"
				}
			},
			{   //$unwind 可以将数组拍平形成多个文档
				$unwind: "$sizes"
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{"_id": "5a0aa7cc9b81221aa3267fba", "name": "1", "item": "ABC1", "sizes": "S"},
			{"_id": "5a0aa7cc9b81221aa3267fba", "name": "1", "item": "ABC1", "sizes": "M"},
			{"_id": "5a0aa7cc9b81221aa3267fba", "name": "1", "item": "ABC1", "sizes": "L"}
		];

		//如果要拍平的自动不存在或者数组为空则会忽略,如果不是数组则会被视为单个元素的数组
		aggregateResponse = yield client.aggregate([{$unwind: "$sizes"}]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{"_id": "5a0aa959fd9cd71ab7c92b38", "name": "1", "item": "ABC1", "sizes": "S"},
			{"_id": "5a0aa959fd9cd71ab7c92b38", "name": "1", "item": "ABC1", "sizes": "M"},
			{"_id": "5a0aa959fd9cd71ab7c92b38", "name": "1", "item": "ABC1", "sizes": "L"},
			{"_id": "5a0aa959fd9cd71ab7c92b3a", "name": "3", "item": "IJK", "sizes": "M"}
		];

		//includeArrayIndex 拍平数组时同时输出元素在原数组中的下标
		aggregateResponse = yield client.aggregate([
			{
				$unwind: {
					path: "$sizes",
					includeArrayIndex: "_arrIndex"
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{"_id": "5a0aa9ff9075df1ac011b807", "name": "1", "item": "ABC1", "sizes": "S", "_arrIndex": 0},
			{"_id": "5a0aa9ff9075df1ac011b807", "name": "1", "item": "ABC1", "sizes": "M", "_arrIndex": 1},
			{"_id": "5a0aa9ff9075df1ac011b807", "name": "1", "item": "ABC1", "sizes": "L", "_arrIndex": 2},
			{"_id": "5a0aa9ff9075df1ac011b809", "name": "3", "item": "IJK", "sizes": "M", "_arrIndex": null}
		];

		//preserveNullAndEmptyArrays 拍平时输出为空的字段
		aggregateResponse = yield client.aggregate([
			{
				$unwind: {
					path: "$sizes",
					preserveNullAndEmptyArrays: true
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{"_id": "5a0aaad6f86d271ac8770ccb", "name": "1", "item": "ABC1", "sizes": "S"},
			{"_id": "5a0aaad6f86d271ac8770ccb", "name": "1", "item": "ABC1", "sizes": "M"},
			{"_id": "5a0aaad6f86d271ac8770ccb", "name": "1", "item": "ABC1", "sizes": "L"},
			{"_id": "5a0aaad6f86d271ac8770ccc", "name": "2", "item": "EFG"},
			{"_id": "5a0aaad6f86d271ac8770ccd", "name": "3", "item": "IJK", "sizes": "M"},
			{"_id": "5a0aaad6f86d271ac8770cce", "name": "4", "item": "LMN"},
			{"_id": "5a0aaad6f86d271ac8770ccf", "name": "4", "item": "XYZ", "sizes": null}
		];
	}).catch(err => {
		console.log("err: %s", err.message || err);
	});
}

function init() {   //初始化数据
	let doc = [
		{name: "1", item: "ABC1", sizes: ["S", "M", "L"]},
		{name: "2", item: "EFG", sizes: []},
		{name: "3", item: "IJK", sizes: "M"},
		{name: "4", item: "LMN"},
		{name: "4", item: "XYZ", sizes: null}
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