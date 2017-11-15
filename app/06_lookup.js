/**
 * Created by wyq on 17/11/15.
 * $lookup 的使用方法
 */
const Bluebird = require("bluebird");
const co = require("co");
const path = require("path");
const client_t06_orders = require("./client.js").t06_orders;
const client_t06_inventory = require("./client.js").t06_inventory;

function run() {
	co(function *() {
		yield init();

		//$lookup 类似做外连接 (如果要进行外联的字段是数组的话需要结合$unwind一起使用)
		let aggregateResponse = yield client_t06_orders.aggregate([
			{
				$lookup: {
					from: "t06_inventories",      //注意mongoose在创建表的时候会修改表名称
					localField: "item",
					foreignField: "sku",
					as: "inventory_docs"
				}
			}
		]);
		// console.log("aggregateResponse = %j;", aggregateResponse);
		aggregateResponse = [
			{
				"_id": "5a0c0ca76e79cf23c4b00260", "item": "abc", "price": 12, "quantity": 2,
				"inventory_docs": [
					{"_id": "5a0c0ca76e79cf23c4b00263", "sku": "abc", "description": "product 1", "instock": 120}
				]
			},
			{
				"_id": "5a0c0ca76e79cf23c4b00261", "item": "jkl", "price": 20, "quantity": 1,
				"inventory_docs": [
					{"_id": "5a0c0ca76e79cf23c4b00266", "sku": "jkl", "description": "product 4", "instock": 70}
				]
			},
			{
				"_id": "5a0c0ca76e79cf23c4b00262", "item": null,
				"inventory_docs": [
					{"_id": "5a0c0ca76e79cf23c4b00267", "sku": null, "description": "Incomplete"}
				]
			}
		];
	}).catch(err => {
		console.log("err: %s", err.message || err);
	});
}

function init() {   //初始化数据
	let doc_order = [
		{"item": "abc", "price": 12, "quantity": 2},
		{"item": "jkl", "price": 20, "quantity": 1},
		{"item": null}
	];
	let doc_inventory = [
		{"sku": "abc", description: "product 1", "instock": 120},
		{"sku": "def", description: "product 2", "instock": 80},
		{"sku": "ijk", description: "product 3", "instock": 60},
		{"sku": "jkl", description: "product 4", "instock": 70},
		{"sku": null, description: "Incomplete"}
	];
	return Bluebird.all([
		client_t06_orders.remove({}),
		client_t06_inventory.remove({})
	]).then(response => {
		console.log("delete all doc response: %j", response);
		return Bluebird.all([
			client_t06_orders.create(doc_order),
			client_t06_inventory.create(doc_inventory)
		]);
	});
}
run();



