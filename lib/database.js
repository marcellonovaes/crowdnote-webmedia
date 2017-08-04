
function DAO(){


	this.loadDataset = loadDataset;
	this.loadInput = loadInput;
	this.loadOutput = loadOutput;
	this.loadContributions = loadContributions;
	this.store = store;

	var util = require('./util.js');

	var mongoose = require('mongoose');
	mongoose.Promise = global.Promise;
	mongoose.connect('mongodb://localhost/db');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('openUri', function() {});

	var videosSchema, Videos;
	var Schema = mongoose.Schema; 
	var ObjectId = Schema.ObjectId;
	var Timestamp = Schema.Timestamp;

	compileSchemas();


	function compileSchemas(){

		videoSchema = Schema({
    			mime: String,
    			name: String,
    			start: Number,
			stop: Number
		});
		Video = mongoose.model('Video', videoSchema);

		inputSchema = Schema({
    			video: String,
			task: Number,
			item:ObjectId,
			instant: String,
			point: String,
			type: String,
			suggestion: String
		});
		Input = mongoose.model('Input', inputSchema);

		outputSchema = Schema({
			item: ObjectId,
    			video: String,
			task: Number,
			date: Date,
			instant: String,
			point: String,
			suggestion: String,
			fingerprint: String
		});
		Output = mongoose.model('Output', outputSchema);

	}

	function loadDataset(callback){
		Video.find({},function (err, V) {
  			if (err) return console.error(err);
			var dataset = new Array();
			for(var i=0; i < V.length; i++){
				dataset[V[i]._id] = V[i];
			}
			callback(dataset);
		}).sort({'_id' : 1});
	}


	function loadInput(task, callback){
		Input.find({task:task},function (err, I) {
  			if (err) return console.error(err);
			var input = {'lifo': new util.LIFO(), 'fifo': new util.FIFO()};
			input.lifo.setItems(I);
			callback(input);
		}).sort({'_id' : -1});
	}

	function loadOutput(task, callback){
		Output.find({task:task},function (err, O) {
  			if (err) return console.error(err);
			callback(O);
		}).sort({'instant' : 1});
	}

	function loadContributions(task, fingerprint, callback){
		Output.find({task:task, fingerprint:fingerprint},function (err, O) {
  			if (err) return console.error(err);
			callback(O);
		}).sort({'item' : 1});
	}



	function store(Item_ID, Video_ID, activeTask, Instant, Point, Suggestion, Fingerprint, callback){

		var contribution = new Output({'item':Item_ID ,'video': Video_ID,  'task':activeTask ,'date': new Date(),  'instant': Instant, 'point':Point, 'suggestion':Suggestion, 'fingerprint':Fingerprint });

		contribution.save(function (err, m0) {if (err) return console.error(err);});

		callback();
	}

}	

module.exports.DAO = DAO;



