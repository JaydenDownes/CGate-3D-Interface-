console.log("");
console.log(" ██████ ██████  ██    ██ ███████     ███████ ███    ███  █████  ██████  ████████     ██   ██  ██████  ███    ███ ███████");
console.log("██      ██   ██ ██    ██ ██          ██      ████  ████ ██   ██ ██   ██    ██        ██   ██ ██    ██ ████  ████ ██      ");
console.log("██      ██████  ██    ██ ███████     ███████ ██ ████ ██ ███████ ██████     ██        ███████ ██    ██ ██ ████ ██ █████   ");
console.log("██      ██   ██ ██    ██      ██          ██ ██  ██  ██ ██   ██ ██   ██    ██        ██   ██ ██    ██ ██  ██  ██ ██      ");
console.log(" ██████ ██████   ██████  ███████     ███████ ██      ██ ██   ██ ██   ██    ██        ██   ██  ██████  ██      ██ ███████ ");
console.log("");
console.log("██ ███    ██ ████████ ███████ ██████  ███████  █████   ██████ ███████");
console.log("██ ████   ██    ██    ██      ██   ██ ██      ██   ██ ██      ██     ");
console.log("██ ██ ██  ██    ██    █████   ██████  █████   ███████ ██      █████  ");
console.log("██ ██  ██ ██    ██    ██      ██   ██ ██      ██   ██ ██      ██     ");
console.log("██ ██   ████    ██    ███████ ██   ██ ██      ██   ██  ██████ ███████");
console.log("");
console.log("Version 2.0, Created by Jayden Downes");
console.log("");
// Import required modules
var _ = require('underscore');
var express = require('express');
var fs = require('fs');
var path = require('path');
var http = require('http');
var socketIo = require('socket.io');
var cron = require('cron').CronJob;
// Load configuration and common files
CONFIG = require('./config');
COMMON = require('./common');
DB = require('./db.json');
////////////////////////
// LOAD THE CONNECTORS
////////////////////////
// If configuration enables C-Gate, initialize C-Gate connection
if (CONFIG.cgate) {
	console.log('(\u001b[32m#\u001b[0m) Initializing the cgate connector');
	CBUS = require('./cgate').init();
}
// Initialize Express.js for main app and set up HTTP server and Socket.IO
var app = express();
var server = http.Server(app);
IO = socketIo(server);
////////////////////////
// WEBSERVER SETUP
////////////////////////
// Initialize Express.js for light interface and attach it to main app
var lightApp = express();
app.use('/light-interface', lightApp);
// Set up static files directory
app.use('/light-interface', express.static(path.join(__dirname, 'light-interface')));
// Routes for light interface
lightApp.get('/cgate', function(req, res) {
	if (req.query.cmd) {
		var command = req.query.cmd.trim() + '\r';
		console.log('remoteCommand : ' + command);
		CBUS.write(command);
		res.json({
			status: 'ok',
			executed: req.query.cmd
		});
	} else {
		res.json({
			status: 'error',
			message: 'you must specify a command!'
		}, 400);
	}
});
lightApp.get('/cmd', function(req, res) {
	console.log(req.query);
	var commandArray = [{
		type: 'lighting',
		group: req.query.device,
		level: parseInt(req.query.level),
		delay: parseInt(req.query.delay),
		timeout: parseInt(req.query.timeout)
	}];
	COMMON.doCommands(commandArray);
	res.json(JSON.stringify({
		status: 'ok'
	}));
});
lightApp.get('/locations', function(req, res) {
	// loop over the keys and build the response (an array of objects)
	var resp = _.uniq(_.pluck(COMMON.deviceObjToArray(DB.devices), 'location'));
	resp = _.sortBy(resp, function(str) {
		return str;
	});
	res.json(resp);
});
lightApp.get('/scenes', function(req, res) {
	res.json(DB.scenes);
});
lightApp.get('/devices', function(req, res) {
	res.json(COMMON.deviceObjToArray(DB.devices));
});
//////////////////////////
// GLOBAL HELPER METHODS
//////////////////////////
var cronjobs = {};
var cronjob = require('cron').CronJob;
// load up everything currently in the DB
_.each(DB.tasks, function(task) {
	// only create cron jobs for tasks that are enabled
	if (task.enabled) {
		addCronJob(task.id, task.cronstring, task.expression, task.commands, CONFIG.location.timezone);
	}
})

function addCronJob(id, cronstring, expression, commands, timezone) {
	try {
		console.log('(\u001b[32m#\u001b[0m) Adding cronjob task: ' + id);
		cronjobs[id] = new cronjob(cronstring, function() {
			console.log('(\u001b[32m#\u001b[0m) Starting Cronjob Task: ' + id);
			// some of these tasks may have a conditional expression, some can just run
			if (expression) {
				if (eval(expression)) {
					COMMON.doCommands(commands);
				}
			} else {
				COMMON.doCommands(commands);
			}
		}, function() {
			console.log('(\u001b[32m#\u001b[0m) Cronjob stopped: ' + id)
		}, true, timezone);
	} catch (ex) {
		console.log("(\u001b[31m#\u001b[0m) cronstring pattern not valid for " + id + ": " + cronstring);
	}
}

function deleteCronJob(id) {
	console.log('(\u001b[32m#\u001b[0m) Killing cronjob ' + id);
	if (cronjobs[id]) {
		cronjobs[id].stop();
	}
	delete cronjobs[id];
}
//////////////////////////
// API INTERFACE FOR CONFIGURATION
//////////////////////////
// Initialize Express.js for configuration interface and attach it to main app
var configApp = express();
app.use('/configuration-interface', configApp);
// Enable JSON body parsing for configuration interface
configApp.use(express.json());
// Routes for configuration interface
configApp.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, './configuration-interface/index.html'));
});
configApp.get('/api/configuration/tasks', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let tasks = JSON.parse(data).tasks;
		res.json({
			tasks: tasks
		});
	});
});
configApp.put('/api/configuration/tasks/:id', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let updatedTask = req.body;
		let taskIndex = db.tasks.findIndex(task => task.id === updatedTask.id);
		if (taskIndex >= 0) {
			db.tasks[taskIndex] = updatedTask;
			fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
				if (err) throw err;
				res.sendStatus(200);
			});
		} else {
			res.sendStatus(404);
		}
	});
});
configApp.post('/api/configuration/tasks', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let newTask = req.body;
		// Generate a new ID for the task
		newTask.id = Date.now().toString();
		db.tasks.push(newTask);
		fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
			if (err) throw err;
			res.sendStatus(201);
		});
	});
});
configApp.delete('/api/configuration/tasks/:id', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let taskId = req.params.id;
		let taskIndex = db.tasks.findIndex(task => task.id === taskId);
		if (taskIndex >= 0) {
			db.tasks.splice(taskIndex, 1);
			fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
				if (err) throw err;
				res.sendStatus(200);
			});
		} else {
			res.sendStatus(404);
		}
	});
});
configApp.get('/api/configuration/rules', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let rules = JSON.parse(data).rules;
		res.json({
			rules: rules
		});
	});
});
configApp.put('/api/configuration/rules/:id', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let updatedRule = req.body;
		let ruleIndex = db.rules.findIndex(rule => rule.id === updatedRule.id);
		if (ruleIndex >= 0) {
			db.rules[ruleIndex] = updatedRule;
			fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
				if (err) throw err;
				res.sendStatus(200);
			});
		} else {
			res.sendStatus(404);
		}
	});
});
configApp.post('/api/configuration/rules', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let newRule = req.body;
		// Generate a new ID for the rule
		newRule.id = Date.now().toString();
		db.rules.push(newRule);
		fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
			if (err) throw err;
			res.sendStatus(201);
		});
	});
});
configApp.delete('/api/configuration/rules/:id', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let ruleId = req.params.id;
		let ruleIndex = db.rules.findIndex(rule => rule.id === ruleId);
		if (ruleIndex >= 0) {
			db.rules.splice(ruleIndex, 1);
			fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
				if (err) throw err;
				res.sendStatus(200);
			});
		} else {
			res.sendStatus(404);
		}
	});
});
configApp.get('/api/configuration/scenes', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let scenes = JSON.parse(data).scenes;
		res.json({
			scenes: scenes
		});
	});
});
configApp.put('/api/configuration/scenes/:id', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let updatedScene = req.body;
		let sceneIndex = db.scenes.findIndex(scene => scene.id === updatedScene.id);
		if (sceneIndex >= 0) {
			db.scenes[sceneIndex] = updatedScene;
			fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
				if (err) throw err;
				res.sendStatus(200);
			});
		} else {
			res.sendStatus(404);
		}
	});
});
configApp.post('/api/configuration/scenes', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let newScene = req.body;
		// Generate a new ID for the scene
		newScene.id = Date.now().toString();
		db.scenes.push(newScene);
		fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
			if (err) throw err;;
			res.sendStatus(201);
		});
	});
});
configApp.delete('/api/configuration/scenes/:id', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let sceneId = req.params.id;
		let sceneIndex = db.scenes.findIndex(scene => scene.id === sceneId);
		if (sceneIndex >= 0) {
			db.scenes.splice(sceneIndex, 1);
			fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
				if (err) throw err;
				res.sendStatus(200);
			});
		} else {
			res.sendStatus(404);
		}
	});
});
configApp.get('/api/configuration/devices', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let devices = JSON.parse(data).devices;
		res.json({
			devices: devices
		});
	});
});
configApp.put('/api/configuration/devices/:id', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let updatedDevice = req.body;
		if (db.devices[updatedDevice.id]) {
			db.devices[updatedDevice.id] = updatedDevice;
			fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
				if (err) throw err;
				res.sendStatus(200);
			});
		} else {
			res.sendStatus(404);
		}
	});
});
configApp.post('/api/configuration/devices', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let newDevice = req.body;
		// Generate a new ID for the device
		newDevice.id = Date.now().toString();
		db.devices[newDevice.id] = newDevice;
		fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
			if (err) throw err;
			res.sendStatus(201);
		});
	});
});
configApp.delete('/api/configuration/devices/:id', (req, res) => {
	fs.readFile('db.json', (err, data) => {
		if (err) throw err;
		let db = JSON.parse(data);
		let deviceId = req.params.id;
		if (db.devices[deviceId]) {
			delete db.devices[deviceId];
			fs.writeFile('db.json', JSON.stringify(db, null, 2), err => {
				if (err) throw err;
				res.sendStatus(200);
			});
		} else {
			res.sendStatus(404);
		}
	});
});
//////////////////////////
// SERVER INITIALIZATION
//////////////////////////
// Start server on configured host and port
server.listen(CONFIG.webserver.port, CONFIG.webserver.host);
// Log successful server start
console.log('(\u001b[32m#\u001b[0m) Standalone Configuration Interface is running on: http://' + CONFIG.webserver.host + ':' + CONFIG.webserver.port + '/configuration-interface');
console.log('(\u001b[32m#\u001b[0m) Standalone Lighting Control Interface is running on: http://' + CONFIG.webserver.host + ':' + CONFIG.webserver.port + '/light-interface');