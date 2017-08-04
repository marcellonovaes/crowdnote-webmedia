
function task(host,dao,activeTask){

	var fs = require('fs');
	
	this.show = show;
	this.aggregate = aggregate;

	function show(res,Dataset,Fingerprint,Input) {
		dao.loadContributions(activeTask,Fingerprint,function(contributions){
			if(Input.lifo.isEmpty()){
				while( !Input.fifo.isEmpty() ){
					Input.lifo.push( Input.fifo.pop() );
				}
			}

			//Annotated all items
			if(contributions.length >= Input.lifo.getItems().length + Input.fifo.getItems().length){
				return res.render('ejs/finish', values);
			}

			//Select an iten that didn't receive a contribution from this worker
			var tmp = new Array();
			var flag = true;
			var item = Input.lifo.pop();
			while( exists(contributions,item._id) ){
					tmp.push(item);
					item = Input.lifo.pop();
			}
			for(var i=0; i < tmp.length; i++){
				Input.lifo.push(tmp[i]);
			}
			Input.fifo.push(item);

			var values = {};
			values.fingerprint = Fingerprint;
			values.item_id = item._id;
			values.name = Dataset[item.video].name;
			values.mime = Dataset[item.video].mime;
			values.start = Dataset[item.video].start;
			values.stop = Dataset[item.video].stop;
			values.host = host;
			values.task = activeTask;

			var path = 'dataset/'+values.name+'-'+values.start+'-'+values.stop+'.'+values.mime;
			var vbin = fs.readFileSync(path);
			var v64 = new Buffer(vbin).toString('base64');
			values.v64 = v64;

			res.render('ejs/task_'+activeTask, values);

		});
		
	}

	function aggregate(){
		dao.loadOutput(activeTask,function(contributions){
			console.log(contributions);
		});
	}

	function exists(contributions, id){
		for(var i=0; i < contributions.length; i++){
			if(String(contributions[i].item).valueOf() == new String(id).valueOf()){
				return true;
			}
		}
		return false;
	}

}

module.exports.task = task;

