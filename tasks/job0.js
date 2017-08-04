
function task(Dataset,Fingerprint,Host){

	var fs = require('fs');
	
	this.show = show;

	function show(req, res) {


		Contributions.find({fingerprint: fingerprint, job: '5956e7825d39ebf26fb71ee0'},function (err, Contributions) {
			if (err) return console.error(err);

			//Already contributed for all items
			if(Contributions.length == dataset.lifo.getItems().length + dataset.fifo.getItems().length){
				res.render('finish', {});
				return null;
			}

			//Find an item witch didn't recieve contribution from this user
			var item = dataset.lifo.pop();
			var did = true;
			while(did){
				if(dataset.lifo.isEmpty()){
					var items = dataset.fifo.getItems().sort(function(a,b) {
										var x = parseInt(a._id, 10);
										var y = parseInt(b._id, 10);
										if(x > y) 	return -1;
										else		return 1;
									});
					dataset.lifo.setItems(items);
					dataset.fifo.clean();	
				}
				var did = false;
				for(var i=0; i < Contributions.length; i++){
					if(Contributions[i].item.toString('utf-8').trim() == item._id.toString('utf-8').trim()){
						tmp.push(item);
						item = dataset.lifo.pop();
						did = true;
						break;
					}
				}
			}
			//empilha de novo os que ja tinham recebido contribuicao deste user
			tmp = tmp.reverse();
			for(var i=0; i < tmp.length; i++){
				dataset.lifo.push(tmp[i]);
			}
			dataset.lifo.setItems(dataset.lifo.getItems());
			dataset.fifo.push(item);

			var values = {};
			values.fingerprint = fingerprint;
			var dir = item.job;
			var name = item.name;
			var mime = item.mime;
			var start = item.start;
			var stop = item.stop;

			var path = 'data/'+dir+'/'+name+'-'+start+'-'+stop+'.'+mime;
			var vbin = fs.readFileSync(path);
			var v64 = new Buffer(vbin).toString('base64');
			values.v64 = v64;

			values.host = host;
			values.item_id = item._id;
			values.job = item.job;
			values.name = item.name;
			values.mime = item.mime;
			values.start = item.start;
			values.stop = item.stop;

			values.microtask = '5956e7825d39ebf26fb71ee0';

			values.instruction = Job.instruction;

			res.render('jobs/'+item.job, values);

		});

	}


}

module.exports.task = task;

