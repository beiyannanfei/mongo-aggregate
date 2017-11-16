/**
 * Created by wyq on 17/11/14.
 * $group 的使用
 */
const Bluebird = require("bluebird");
const co = require("co");
const path = require("path");
const client = require("./client.js")[`t${path.basename(__filename).split("_")[0]}Model`];

function run() {
	co(function *() {
		yield init();

		//根据年月日分组,然后统计
		let aggregateResponse = yield client.aggregate([
			{
				$match: {
					name: {"$lt": 7000}
				}
			},
			{
				$group: {
					_id: {
						month: {$month: "$date"},
						day: {$dayOfMonth: "$date"},
						year: {$year: "$date"}
					},
					totalPrice: {
						$sum: {   //总价
							$multiply: ["$price", "$quantity"]    //$multiply 取两个数的成绩
						}
					},
					averageQuantity: {  //均价
						$avg: "$quantity"
					},
					count: {    //计数
						$sum: 1
					}
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{"_id": {"month": 3, "day": 15, "year": 2014}, "totalPrice": 50, "averageQuantity": 10, "count": 1},
			{"_id": {"month": 4, "day": 4, "year": 2014}, "totalPrice": 200, "averageQuantity": 15, "count": 2},
			{"_id": {"month": 3, "day": 1, "year": 2014}, "totalPrice": 40, "averageQuantity": 1.5, "count": 2}
		];

		aggregateResponse = yield client.aggregate([
			{
				$match: {
					name: {"$lt": 7000}
				}
			},
			{
				$group: {
					_id: null,    //如果id为null,则将所有文档做统计
					totalPrice: {
						$sum: {   //总价
							$multiply: ["$price", "$quantity"]    //$multiply 取两个数的成绩
						}
					},
					averageQuantity: {  //均价
						$avg: "$quantity"
					},
					count: {    //计数
						$sum: 1
					}
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [{"_id": null, "totalPrice": 290, "averageQuantity": 8.6, "count": 5}];

		//只分组
		aggregateResponse = yield client.aggregate([
			{
				$match: {
					name: {"$lt": 7000}
				}
			},
			{
				$group: {
					_id: "$item",    //如果id为null,则将所有文档做统计
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [{"_id": "xyz"}, {"_id": "jkl"}, {"_id": "abc"}];

		//按照作者统计作品
		aggregateResponse = yield client.aggregate([
			{
				$match: {
					name: {"$gte": 7000}
				}
			},
			{
				$group: {
					_id: "$author",
					books: {$push: "$title"}
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{"_id": "Homer", "books": ["Iliad", "The Odyssey"]},
			{"_id": "Dante", "books": ["The Banquet", "Divine Comedy", "Eclogues"]}
		];

		//按照作者统计文档
		aggregateResponse = yield client.aggregate([
			{
				$match: {
					name: {"$gte": 7000}
				}
			},
			{
				$group: {
					_id: "$author",
					books: {$push: "$$ROOT"}
				}
			}
		]);
		console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{
				"_id": "Homer",
				"books": [
					{"_id": "5a0acb4fe7f7611cf5ba5a51", "name": 7000, "title": "The Odyssey", "author": "Homer", "copies": 10},
					{"_id": "5a0acb4fe7f7611cf5ba5a52", "name": 7020, "title": "Iliad", "author": "Homer", "copies": 10}
				]
			},
			{
				"_id": "Dante",
				"books": [
					{"_id": "5a0acb4fe7f7611cf5ba5a4e", "name": 8751, "title": "The Banquet", "author": "Dante", "copies": 2},
					{"_id": "5a0acb4fe7f7611cf5ba5a4f", "name": 8752, "title": "Divine Comedy", "author": "Dante", "copies": 1},
					{"_id": "5a0acb4fe7f7611cf5ba5a50", "name": 8645, "title": "Eclogues", "author": "Dante", "copies": 2}
				]
			}
		];
	}).catch(err => {
		console.log("err: %s", err.message || err);
	});
}

function init() {   //初始化数据
	let doc = [
		{"name": 1, "item": "abc", "price": 10, "quantity": 2, "date": new Date("2014-03-01T08:00:00Z")},
		{"name": 2, "item": "jkl", "price": 20, "quantity": 1, "date": new Date("2014-03-01T09:00:00Z")},
		{"name": 3, "item": "xyz", "price": 5, "quantity": 10, "date": new Date("2014-03-15T09:00:00Z")},
		{"name": 4, "item": "xyz", "price": 5, "quantity": 20, "date": new Date("2014-04-04T11:21:39.736Z")},
		{"name": 5, "item": "abc", "price": 10, "quantity": 10, "date": new Date("2014-04-04T21:23:13.331Z")},
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