//
// SimpleUsage.js — FunctionQueue
// today is 7/25/12, it is now 3:25 PM
// created by TotenDev
// see LICENSE for details.
//
	
var FunctionQueue = require("./../src/function-queue.js")();
FunctionQueue.push(function (callback) {
	console.log("dede");
	setTimeout(function () {
		console.log("timeout");
		callback()
	},1000);
})
FunctionQueue.push(function (callback) {
	console.log("dede2");
	setTimeout(function () {
		console.log("timeout2");
		callback()
	},1000);
})
FunctionQueue.push(function (callback) {
	console.log("dede3");
	callback();
	FunctionQueue.removeAllObjects();
})
/*Should output:
dede
timeout
dede2
timeout2
dede3
*/