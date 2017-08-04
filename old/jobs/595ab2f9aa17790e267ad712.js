
function job(Dataset,Fingerprint,Jobs,Aggregation,Contributions, dataset, host){

	var fs = require('fs');
	
	this.Dataset = Dataset;
	this.dataset = dataset;
	this.Fingerprint = Fingerprint;
	this.Contributions = Contributions;
	this.host = host;

	this.save = save;
	this.show = show;
	this.aggregation = aggregation;

	Jobs.findOne({_id:'595ab2f9aa17790e267ad712'},function (err, Jobs) {
  		if (err) return console.error(err);

		this.Job = Jobs;

	});

	function save(req, res) {
		var item = req.body.item;
		var fingerprint = req.body.fingerprint;
  		var microtask = req.body.microtask;
  		var contrib = req.body.contrib;
		var instant = req.body.instant;

		var contribution = new Contributions({'item':item , 'microtask':microtask , 'contribution':contrib, 'instant': instant,'date': new Date(), 'fingerprint':fingerprint });

		contribution.save(function (err, m0) {if (err) return console.error(err);});

		show(req, res);
	}

	function show(req, res) {
		var id = 0;
		var tmp = new Array();
		var fingerprint = Fingerprint.get(req);


		Contributions.find({fingerprint: fingerprint, microtask: '5956e7825d39ebf26fb71ee0'},function (err, Contributions) {
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

	function aggregation(){
		Dataset.find({},function (err, Dataset) {
			if (err) return console.error(err);
	
			Contributions.find({microtask : '5956e7825d39ebf26fb71ee0'},function (err, Contributions) {
				if (err) return console.error(err);
	
				var items = new Array();
				for(var i=0; i < Dataset.length; i++){
					items[Dataset[i]._id] = {'info':{'name':Dataset[i].name, 'start':Dataset[i].start}, contributions: new Array()};
				}
	
				for(var i=0; i < Contributions.length; i++){
					items[Contributions[i].item].contributions.push(Contributions[i]);
				}
	
				var points = new Array();
				for(var i=0; i < Dataset.length; i++){
					var list = items[Dataset[i]._id].contributions.sort(function(a,b) {
									var x = parseFloat(a.instant, 10);
									var y = parseFloat(b.instant, 10);
									if(x > y) 	return 1;
									else		return -1;
								});
					var current = new Array();
					current.push(list[0]);
					for(var j=1; j < list.length; j++){
						var it = list[j];
		
						if( parseFloat(it.instant) - parseFloat(current[0].instant) < 1.5){
							current.push(it);
						}else{
							points.push(current);
							current = new Array();
							current.push(it);
						}
		
					}
					points.push(current);
				}
	
				for(var i=0; i < points.length; i++){
					var totalTime=0;
					var sugestions = points[i];
	
					var bigger = sugestions[0].contribution;
					for(var j=0; j < sugestions.length; j++){
						var sugestion = sugestions[j];
						totalTime += parseFloat(sugestion.instant);
		
						if(parseFloat(sugestion.contribution) > parseFloat(bigger)){
							bigger = sugestion.contribution;
						}
	
					}
					var instant = totalTime / sugestions.length;
	
					var query = {'microtask':sugestion.microtask , 'item':sugestion.item , 'contribution':sugestion.contribution, 'instant': instant,'date': new Date() };	
	
					var aggregation = new Aggregation(query);
	
					aggregation.save(function (err, m0) {if (err) return console.error(err);});
				}
	
			}).sort({date: 1});
	
		}).sort({_id: 1});
	}



}

module.exports.job = job;

