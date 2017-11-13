/**
 * Created by wyq on 17/11/13.
 * $project 为后续流程准备字段
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
				$project: {   //结果只会有 title、author、_id 字段
					title: 1, author: 1
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [{
			"_id": "5a096aca74fcd90d02e0818e",
			"title": "abc123",
			"author": {"first": "aaa", "last": "zzz"}
		}];


		aggregateResponse = yield client.aggregate([
			{
				$project: {   //结果只会有 title、author 字段,同时去掉_id字段
					title: 1, author: 1, _id: 0
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{
				"title": "abc123",
				"author": {"first": "aaa", "last": "zzz"}
			}
		];

		aggregateResponse = yield client.aggregate([
			{
				$project: {   //添加新字段
					title: 1,
					isbn: {
						prefix: {$substr: ["$isbn", 0, 3]},
						group: {$substr: ["$isbn", 3, 2]},
						publisher: {$substr: ["$isbn", 5, 4]},
						title: {$substr: ["$isbn", 9, 3]},
						checkDigit: {$substr: ["$isbn", 12, 1]}
					},
					lastName: "$author.last",
					copiesSold: "$copies"
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{
				"_id": "5a096fdb6097370d17e2f417",
				"title": "abc123",
				"isbn": {"prefix": "000", "group": "11", "publisher": "2222", "title": "333", "checkDigit": "4"},
				"lastName": "zzz",
				"copiesSold": 5
			}
		];

		aggregateResponse = yield client.aggregate([
			{
				$project: {   //添加新数组字段       不存在的字段返回null
					myArray: ["$copies", "$title", "$someField"]
				}
			}
		]);
		console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [{"_id": "5a0971033034080d28745644", "myArray": [5, "abc123", null]}];


	}).catch(err => {
		console.log("err: %s", err.message || err);
	});
}


function init() {   //初始化数据
	let doc = [
		{
			title: "abc123",
			isbn: "0001122223334",
			author: {last: "zzz", first: "aaa"},
			copies: 5
		}
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



