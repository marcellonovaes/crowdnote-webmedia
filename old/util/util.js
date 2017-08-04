
function Fingerprint(){

	this.get = get;

	function get(req){
		var fingerprint = require('ip').address();
		fingerprint += req.headers['user-agent'];
		fingerprint = require('crypto').createHash('md5').update(fingerprint).digest("hex");
		return fingerprint;
	}
}

function LIFO(){
	var items = new Array();

	this.push = push;
	this.pop = pop;
	this.isEmpty = isEmpty;
	this.clean = clean;
	this.setItems = setItems;
	this.getItems = getItems;

	function push(item){
		items.push(item);	
	}

	function pop(){
		if(!isEmpty()){
			return items.pop();
		}
		return null;
	}

	function isEmpty(){
		if(items.length > 0){ 
			return false;
		}
		return true;
	}

	function clean(){
		items = [];
	}

	function setItems(v){
		items = v;
	}

	function getItems(){
		return items;
	}

}

function FIFO(){
	var items = new Array();

	this.push = push;
	this.pop = pop;
	this.isEmpty = isEmpty;
	this.clean = clean;
	this.setItems = setItems;
	this.getItems = getItems;

	function push(item){
		items.push(item);	
	}

	function pop(){
		if(!isEmpty()){
			item = items[0];
			items.shift();
			return item;
		}
		return null;
	}

	function isEmpty(){
		if(items.length > 0){ 
			return false;
		}
		return true;
	}

	function clean(){
		items = [];
	}

	function setItems(v){
		items = v;
	}

	function getItems(){
		return items;
	}
}


module.exports.LIFO = LIFO;
module.exports.FIFO = FIFO;
module.exports.Fingerprint = Fingerprint;

