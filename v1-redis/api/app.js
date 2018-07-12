const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const fs = require('fs');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const mail_dir = '/mail_content';
const multer  = require('multer');
const upload = multer({ dest: mail_dir+'/' });
const redis = require('redis');
const addRequestId = require('express-request-id')();
// require('console-stamp')(console, { pattern: 'HH:MM:ss.l', label: false });

const app = express();
const client = redis.createClient('6379', 'redis');

app.use(cors()); // Allow CORS
app.use(addRequestId);
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
	if (!req.headers.authorization) return res.status(400).json({ error: 'No authentication token' });
	next();
});

//-------------------------------------------HELPER FUNCTIONS-------------------------------------------

client.on('error', err => { console.log('Error ' + err); });
client.on('ready', err => { console.log('Redis client is ready!!!'); });

const writeFile = (path, contents, callback) => {
	mkdirp(getDirName(path), (err) => {
		if (err) return console.log('Error: ', err);
		fs.writeFile(path, contents, 'utf-8', callback);
	});
};

const readFile = (path, callback) => {
	mkdirp(getDirName(path), (err) => {
		if (err) return console.log('Error: ', err);
		fs.readFile(path, 'utf-8', callback);
	});
};

const push = (key, value, callback) => {
	client.lpush(key, value, callback);
};

const pop = (key, callback) => {
	client.rpop(key, callback);
};

const range = (key, start, stop) => {
	client.lrange(key, start, stop, (err, reply) => {
		if (err) console.log('Error: ', err);
		else if (reply) console.log('Reply: ', reply);
	});
};

//-------------------------------------------HELPER FUNCTIONS-------------------------------------------

//-----------------------------------------------API CODE-----------------------------------------------
app.post('/spam', upload.single('spam'), (req, res) => {
	console.log('\n/spam requested');
	readFile(req.file.path, (err, data) => {
		if (err) return console.log(err);
		if (data) {
			// console.log('data: ', data);
			push('toLearn', '{ msg_id: '+req.id+', method: spam, data: '+data+' }', (err, reply) => {
				if (err) console.log('Error: ', err);
				else if (reply) console.log('position in queue: ', reply);
			});
			range('toLearn', 0, -1);
		}
	});
});

app.post('/ham', upload.single('ham'), (req, res) => {
	console.log('\n/ham requested');
	
});

app.put('/test', upload.single('test'), (req, res) => {
	console.log('\n/test requested');
	
});

//------------------------------------------- EXTRA API CODE -------------------------------------------
app.post('/peek', (req, res) => {
	console.log('\n/peek requested');
	range('toLearn', 0, -1);
	range('learned', 0, -1);
});

app.post('/clear', (req, res) => {
	console.log('\n/clear requested');
	
});

app.post('/spams', (req, res) => {
	console.log('\n/spams requested');
	const json = req.body.path;
	if (json === undefined) {
		console.log('<--- wrong format body --->');
		res.status(400).json({ status: 'WRONG_FORMAT', message: 'format should be application/json' });
	} else {
		
		// console.log('<--- trained spams ( folder: '+json+' ) --->');
		// if (data.substring(20, 21) !== '0') res.json({ status: 'success' }).end();
		// else {
		// 	res.json({ 
		// 		status: 'SP_ERR',
		// 		message: 'send duplicate mail content to learn'
		// 	}).end();
		// }
	}
});

app.post('/hams', (req, res) => {
	console.log('\n/hams requested');
	const json = req.body.path;
	if (json === undefined) {
		console.log('<--- wrong format body --->');
		res.status(400).json({ status: 'WRONG_FORMAT', message: 'format should be application/json' });
	} else {
		
		// console.log('<--- trained hams ( folder: '+json+' ) --->');
		// if (data.substring(20, 21) !== '0') res.json({ status: 'success' }).end();
		// else {
		// 	res.json({ 
		// 		status: 'SP_ERR', 
		// 		message: 'send duplicate mail content to learn'
		// 	}).end();
		// }
	}
});

app.post('/clearRedis', (req, res) => {
	console.log('\n/clearRedis requested');
	client.flushdb((err, succeeded) => {
		console.log(succeeded); // will be true if successfull
		if (succeeded) res.status(200).json({ status: 'success', message: 'clear redis succeeded' });
		else res.status(500).json({ status: 'RD_ERR', message: 'error clearing redis' });
	});
});
//------------------------------------------- EXTRA API CODE -------------------------------------------
//-----------------------------------------------API CODE-----------------------------------------------
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.json({
		error: {
			message: err.message,
		}
	});
	next(err);
});

// Serve static files
app.use('/', (req, res) => {
	express.static(config.staticFolder, {
		lastModified: true, 
		maxAge: '1d',
	})(req, res, () => {
		res.sendFile(config.staticFolder + '/index.html');
	});
});

app.listen(config.httpPort, () => {
	console.log('Listening on port ' + config.httpPort);
});