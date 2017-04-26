//
// function-queue — FunctionQueue
// today is 7/25/12, it is now 3:25 PM
// created by TotenDev
// see LICENSE for details.
//
	
/**
* Initialize FunctionQueue function
**/
module.exports = function () { return new FunctionQueue(); }
function FunctionQueue() {
	this.container = new Array();
};

/**
* Push function to queue
**/
FunctionQueue.prototype.push = function push(leFunction,optionalArg) {
	//Checks
	if (!leFunction) { 
		var errorStr="leFunction *REQUIRED* parameter is missing;"; 
		console.error(errorStr);
		return false; 
	}
	
	this.container.push({callFunction:leFunction,arg:optionalArg});
	if (this.container.length == 1) { this.nextInQueue(); }
};

/**
* Execute and call next in queue if have it
**/
FunctionQueue.prototype.nextInQueue = function nextInQueue() {
	var thisRef = this;
	if (this.container.length>0) {
		var callback = function () {
			thisRef.container.splice(0,1);
			thisRef.nextInQueue();
		}
		//execute function with callback, to execute next one
        var obj = thisRef.container[0];
		obj.callFunction(callback,obj.arg);
	}
}


/**
* Remove all object
**/
FunctionQueue.prototype.removeAllObjects = function removeAllObjects() {
	this.container.splice(0,this.container.length);
}