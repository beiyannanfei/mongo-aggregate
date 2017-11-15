/**
 * Created by wyq on 17/11/15.
 * $out 的用法
 */
const Bluebird = require("bluebird");
const co = require("co");
const path = require("path");
const client = require("./client.js")[`t${path.basename(__filename).split("_")[0]}Model`];

function run() {
	co(function *() {
		yield init();

		//$out 只能放在管道的最后一层,将管道上边的计算结果输出到另外一个稳定
		let aggregateResponse = yield client.aggregate([
			{
				$group: {
					_id: "$author",
					books: {$push: "$title"}
				}
			},
			{ //执行成功后会创建一个07_authors表,并将结果插入
				$out: "07_authors"
			}
		]);
		console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [];
	}).catch(err => {
		console.log("err: %s", err.message || err);
	});
}

function init() {   //初始化数据
	let doc = [
		{"name": 8751, "title": "The Banquet", "author": "Dante", "copies": 2},
		{"name": 8752, "title": "Divine Comedy", "author": "Dante", "copies": 1},
		{"name": 8645, "title": "Eclogues", "author": "Dante", "copies": 2},
		{"name": 7000, "title": "The Odyssey", "author": "Homer", "copies": 10},
		{"name": 7020, "title": "Iliad", "author": "Homer", "copies": 10}
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


