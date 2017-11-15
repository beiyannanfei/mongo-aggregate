/**
 * Created by wyq on 17/11/15.
 * $indexStats 统计索引的使用情况
 */
const Bluebird = require("bluebird");
const co = require("co");
const path = require("path");
const client = require("./client.js")[`t${path.basename(__filename).split("_")[0]}Model`];

function run() {
	co(function *() {
		yield init();

		//首先执行两次查询,之后统计索引的使用情况
		yield client.find({type: "apparel"});
		yield client.find({item: "abc"}).sort({quantity: 1});

		let aggregateResponse = yield client.aggregate([
			{
				$indexStats: {}
			}
		]);
		console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{
				"name": "item_1_quantity_1",
				"key": {"item": 1, "quantity": 1},
				"host": "beiyannanfei.local:27017",
				"accesses": {
					"ops": 1,     //索引使用次数
					"since": "2017-11-15T10:35:00.277Z"
				}
			},
			{
				"name": "_id_",
				"key": {"_id": 1},
				"host": "beiyannanfei.local:27017",
				"accesses": {
					"ops": 0,
					"since": "2017-11-15T10:35:00.240Z"
				}
			},
			{
				"name": "type_1_item_1",
				"key": {"type": 1, "item": 1},
				"host": "beiyannanfei.local:27017",
				"accesses": {
					"ops": 0,
					"since": "2017-11-15T10:35:00.307Z"
				}
			}
		];
	});
}

function init() {   //初始化数据
	let doc = [
		{"item": "abc", "price": 12, "quantity": 2, "type": "apparel"},
		{"item": "jkl", "price": 20, "quantity": 1, "type": "electronics"},
		{"item": "abc", "price": 10, "quantity": 5, "type": "apparel"}
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
