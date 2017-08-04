
function job(Dataset,Fingerprint,Jobs,Aggregation,Contributions, dataset, aggregated, host){

	var fs = require('fs');
	
	this.Dataset = Dataset;
	this.dataset = dataset;
	this.Fingerprint = Fingerprint;
	this.Contributions = Contributions;
	this.host = host;

	this.save = save;
	this.show = show;
	this.aggregation = aggregation;

	Jobs.findOne({_id:'59622715494b3d40ff4284a9'},function (err, Jobs) {
  		if (err) return console.error(err);

		this.Job = Jobs;

	});

	function save(req, res) {
		var item = req.body.item;
		var fingerprint = req.body.fingerprint;
  		var microtask = req.body.microtask;
  		var contrib = req.body.contrib;
  		var type = req.body.type;
		var instant = req.body.instant;


		var contribution = new Contributions({'item':item , 'microtask':microtask , 'contribution':contrib,'type':type, 'instant': instant,'date': new Date(), 'fingerprint':fingerprint });


		contribution.save(function (err, m0) {if (err) return console.error(err);});

		show(req, res);
	}

	function show(req, res) {
		var id = 0;
		var tmp = new Array();
		var fingerprint = Fingerprint.get(req);
		var agg = aggregated[1];


		Contributions.find({fingerprint: fingerprint, microtask: '59622bfc494b3d40ff4284ab'},function (err, Contributions) {
			if (err) return console.error(err);

			//Already contributed for all items
			if(Contributions.length == agg.lifo.getItems().length + agg.fifo.getItems().length){
				res.render('finish', {});
				return null;
			}
			//Find an item witch didn't recieve contribution from this user
			var item = agg.lifo.pop();
			var did = true;
			while(did){
				if(agg.lifo.isEmpty()){
					var items = agg.fifo.getItems().sort(function(a,b) {
										var x = parseInt(a._id, 10);
										var y = parseInt(b._id, 10);
										if(x > y) 	return -1;
										else		return 1;
									});
					agg.lifo.setItems(items);
					agg.fifo.clean();	
				}
				var did = false;
				for(var i=0; i < Contributions.length; i++){
					if(Contributions[i].item.toString('utf-8').trim() == item._id.toString('utf-8').trim()){
						tmp.push(item);
						item = agg.lifo.pop();
						did = true;
						break;
					}
				}
			}
			//empilha de novo os que ja tinham recebido contribuicao deste user
			tmp = tmp.reverse();
			for(var i=0; i < tmp.length; i++){
				agg.lifo.push(tmp[i]);
			}
			agg.lifo.setItems(agg.lifo.getItems());
			agg.fifo.push(item);


				
			Dataset.findOne({_id: item.item},function (err, Dataset) {
  				if (err) return console.error(err);
				var values = {};
				values.fingerprint = fingerprint;
				values.host = host;
				values.job = Job._id;
				values.item_id = Dataset._id;
				values.name = Dataset.name;
				values.mime = Dataset.mime;
				values.start = Dataset.start;
				values.stop = Dataset.stop;
				values.microtask = item.microtask;
				values.instant = item.instant;
				values.point = item.contribution;
				var path = 'data/'+Job._id+'/'+Dataset.name+'-'+Dataset.start+'-'+Dataset.stop+'.'+Dataset.mime;
				var vbin = fs.readFileSync(path);
				var v64 = new Buffer(vbin).toString('base64');
				values.v64 = v64;

				res.render('jobs/'+Job._id, values);
			});

		});

	}

	function aggregation(){

	}




}

module.exports.job = job;


