
// ---------------------- Includes and Globals ------------------------

var host = 'localhost';
var http = require('http');
var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
app.set('view engine', 'ejs');

var bodyParser = require('body-parser')

var util = require('./util/util.js');
var dataset = {'lifo':null, 'fifo':null}; 

var aggregated = new Array();

var Fingerprint = new util.Fingerprint();

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/db');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', function() {});

var jobsSchema, Jobs;
var microtasksSchema, Microtasks;
var datasetsSchema, Dataset;
var contributionsSchema, Contributions;
var aggregationSchema,Aggregation;
var Schema = mongoose.Schema; 
var ObjectId = Schema.ObjectId;
var Timestamp = Schema.Timestamp;


// ---------------------  Init Functions -----------------------------

compileSchemas();
loadDataset();
loadAggregated();

app.use( bodyParser.json() );      
app.use(bodyParser.urlencoded({ extended: true })); 

//-----------------------  Endpoints   -------------------------------

// Homepage / Active Job
app.get('/', function(req, res) {




});


//----------------------------- Jobs ----------------------------------

// Job 0
var Job_0 = require('./jobs/595ab2f9aa17790e267ad712.js');
Job_0 = new Job_0.job(Dataset, Fingerprint, Jobs, Aggregation, Contributions, dataset, host);
app.get('/jobs/0',Job_0.show);
app.post('/jobs/0',Job_0.save);

//Job 1
var Job_1 = require('./jobs/59622715494b3d40ff4284a9.js');
Job_1 = new Job_1.job(Dataset, Fingerprint, Jobs, Aggregation, Contributions, dataset, aggregated, host);
app.get('/jobs/1',Job_1.show);
app.post('/jobs/1',Job_1.save);


//------------------------ Aggragation --------------------------------

//Job 0
app.get('/aggregation/0',Job_0.aggregation);



// ----------------------   File Services -----------------------------

app.get('/scripts', function(req, res) {
	var name = req.query.name;
	var mime = req.query.mime;
	var path = 'util/'+name+'.'+mime; 
	fs.readFile(path, function (err, data){
		res.setHeader('content-type', 'text/javascript');
		res.end(data);
   	});
});

app.get('/dataset', function(req, res) {

	var dir = req.query.job;
	var name = req.query.name;
	var mime = req.query.mime;
	var start = req.query.start;
	var stop = req.query.stop;
	var path = 'data/'+dir+'/'+name+'-'+start+'-'+stop+'.'+mime;
	fs.readFile(path, function (err, data){
		res.writeHead(200, {"Content-Type":"video/"+mime});
       		res.end(data);
   	});
});

// ------------- Database Functions ------------------------------

function compileSchemas(){

	jobsSchema = Schema({
   	 	_id: ObjectId,
    		order: Number,
    		objective: String,
    		instruction: String,
	});
	Jobs = mongoose.model('Jobs', jobsSchema);

	microtasksSchema = Schema({
   	 	_id: ObjectId,
    		job: ObjectId,
    		order: Number,
    		workflow: String,
    		media_type: String,
    		contribution_type: Number,
		minConvergence: Number,
		closed: Boolean
	});
	Microtasks = mongoose.model('Microtasks', microtasksSchema);

	datasetsSchema = Schema({
	    	_id: ObjectId,
    		job: ObjectId,
    		mime: String,
    		name: String,
		start: Number,
		stop: Number,
    		converged: Boolean,
    		mode: String
	});
	Dataset = mongoose.model('Datasets', datasetsSchema);

	contributionsSchema = Schema({
    		microtask: ObjectId,
    		item: ObjectId,
    		contribution: String,
    		instant: String,
		date : Date,
		fingerprint: String 
	});
	Contributions = mongoose.model('Contributions', contributionsSchema);

	aggregationSchema = Schema({
    		microtask: ObjectId,
    		item: ObjectId,
    		contribution: String,
    		instant: String,
		date : Date,
	});
	Aggregation = mongoose.model('Aggregation', aggregationSchema);


}

function loadDataset(){

	dataset.lifo = new util.LIFO();
	dataset.fifo = new util.FIFO();

	Dataset.find({},function (err, Dataset) {
  		if (err) return console.error(err);

		dataset.lifo.setItems(Dataset.reverse());

	});
}

function loadAggregated(){
	Aggregation.find({},function (err, Aggregation) {
  		if (err) return console.error(err);

		aggregated = organizeAggregated(Aggregation.reverse());

	}).sort({microtask : 1});
}

function organizeAggregated(list){
	if(list.length < 1) return null;

	aggregated.push({'lifo': new util.LIFO(), 'fifo': new util.FIFO()});

	var lifo; 
	var items = new Array()

	var item = list[0];	
	items.push(item);

	for(var i=1; i < list.length; i++){

		if(parseFloat(list[i].microtask) != parseFloat(item.microtask)){
			lifo = new util.LIFO();
			lifo.setItems(items);
			aggregated.push({'lifo': lifo, 'fifo': new util.FIFO()});
			items = new Array();
		}

		item = list[i];		
		items.push(item);
	}
	lifo = new util.LIFO();
	lifo.setItems(items.reverse());
	aggregated.push({'lifo': lifo, 'fifo': new util.FIFO()});
}

// Exec as sudo to run in port 80
app.listen(80);
