
// ---------------------- Includes and Globals ------------------------

var host = 'localhost';
var http = require('http');
var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
app.set('view engine', 'ejs');

var bodyParser = require('body-parser')

var util = require('./lib/util.js');
var fingerprint = new util.Fingerprint();

var database = require('./lib/database.js');
var dao = new database.DAO();
var dataset;
dao.loadDataset(function (d){ init(d); });

var activeTask = 4;
var input;

// ---------------------  Init Functions -----------------------------


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb'}));


function init(d){
	dataset = d;
	dao.loadInput(activeTask, function (i){ initTask(i); });	
}

function initTask(i){
	input = i;
	var t = require('./tasks/task_'+activeTask+'.js');
	task = new t.task(host,dao,activeTask);

	if(activeTask == 2) task.stackInput(input);	
}
 

//-----------------------  Endpoints   -------------------------------

// Homepage / Active Task
app.get('/', function(req, res) {
	task.show(res,dataset,fingerprint.get(req),input);
});

app.post('/', function(req, res) {
	dao.store(req.body.item_id, req.body.video_id, activeTask, req.body.instant, req.body.point, req.body.suggestion , req.body.fingerprint, function(){
		task.show(res,dataset,req.fingerprint,input);		
	});
});

app.get('/aggregation', function(req, res) {
	var t = require('./tasks/task_'+activeTask+'.js');
	task = new t.task(host,dao,activeTask);
	task.aggregate();
});




// ----------------------   File Services -----------------------------

app.get('/include', function(req, res) {
	var name = req.query.name;
	var mime = req.query.mime;
	var path = 'views/'+mime+'/'+name+'.'+mime; 
	fs.readFile(path, function (err, data){
		res.setHeader('content-type', 'text/javascript');
		res.end(data);
   	});
});

app.get('/dataset', function(req, res) {
	var name = req.query.name;
	var mime = req.query.mime;
	var start = req.query.start;
	var stop = req.query.stop;
	var path = 'dataset/'+name+'-'+start+'-'+stop+'.'+mime;
	fs.readFile(path, function (err, data){
		res.writeHead(200, {"Content-Type":"video/"+mime});
       		res.end(data);
   	});
});

// ------------- Database Functions ------------------------------



// Exec as sudo to run in port 80
app.listen(80);
