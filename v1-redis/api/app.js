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
const cmd = require('node-cmd');
// require('console-stamp')(console, { pattern: 'HH:MM:ss.l', label: false });

const app = express();
const client = redis.createClient('6379', 'redis');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
	if (!req.headers.authorization) return res.status(400).json({ error: 'No authentication token' });
	next();
});

client.on('error', err => { console.log('Error ' + err); });
client.on('ready', err => { console.log('Redis client is ready!!!'); });

//-------------------------------------------HELPER FUNCTIONS-------------------------------------------
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

const range = (key) => {
	client.lrange(key, 0, -1, (err, reply) => {
		if (err) console.log('Error: ', err);
		else if (reply) console.log('Reply: ', reply);
	});
};
//-------------------------------------------HELPER FUNCTIONS-------------------------------------------

//-----------------------------------------------API CODE-----------------------------------------------
app.post('/spam', upload.single('spam'), (req, res) => {
	console.log('\n/spam requested');
	client.incr('sc', (err, counter) => {
		if (err) return console.log(err);
		fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/spam/'+counter+'.json'));
		push('toLearnSpam', counter, (err, reply) => {
			if (err) console.log('Error: ', err);
			else if (reply) console.log('position in queue: ', reply);
		});
		res.status(200).json({ status: 'spam mail queued to train' }).end();
	});
});

app.post('/ham', upload.single('ham'), (req, res) => {
	console.log('\n/ham requested');
	client.incr('hc', (err, counter) => {
		if (err) return console.log(err);
		fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/ham/'+counter+'.json'));
		push('toLearnHam', counter, (err, reply) => {
			if (err) console.log('Error: ', err);
			else if (reply) console.log('position in queue: ', reply);
		});
		res.status(200).json({ status: 'ham mail queued to train' }).end();
	});
});

app.put('/test', upload.single('test'), (req, res) => {
	console.log('\n/test requested');
	fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/test.json'));
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType === 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) return console.log(err);
				if (data) {
					const status = data.split(' ')[0];
					const score = parseFloat(data.split(' ')[1]);
					const threshold = parseFloat(data.split(' ')[2]);
					if (status === 'Yes') {
						console.log('<--- mail is spam ( '+score+' / '+threshold+' )!!! --->');
						res.status(200).json({ 
							status: 'success',
							score: score,
							threshold: threshold,
							result: 'spam'
						}).end();
					} else {
						console.log('<--- mail is ham ( '+score+' / '+threshold+' )!!! --->');
						res.status(200).json({ 
							status: 'success',
							score: score,
							threshold: threshold,
							result: 'ham'
						}).end();
					}
				}
			});
		}
	});
});

//------------------------------------------- EXTRA API CODE -------------------------------------------
app.post('/clearRedis', (req, res) => {
	console.log('\n/clearRedis requested');

});

// app.post('/peek', (req, res) => {
// 	console.log('\n/peek requested');
// 	const json = 'peek bayes db';
// 	writeFile(mail_dir+'/peek.json', json, () => {});
// 	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
// 		if (filename === 'response.json' && eventType === 'change') {
// 			watcher.close();
// 			readFile(mail_dir+'/response.json', (err, data) => {
// 				if (err) return console.log(err);
// 				if (data) {
// 					const backup = data.split('\n');
// 					const num_spam = backup[1].split('\t')[1];
// 					const num_ham = backup[2].split('\t')[1];
// 					console.log('<--- peek bayes db --->');
// 					res.status(200).json({ 
// 						status: 'success',
// 						spam: num_spam,
// 						ham: num_ham
// 					}).end();
// 				}
// 			});
// 		}
// 	});
// });

// app.post('/clear', (req, res) => {
// 	console.log('\n/clear requested');
// 	const json = 'clear bayes db';
// 	writeFile(mail_dir+'/clear.json', json, () => {});
// 	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
// 		if (filename === 'response.json' && eventType === 'change') {
// 			watcher.close();
// 			readFile(mail_dir+'/response.json', (err, data) => {
// 				if (err) return console.log(err);
// 				if (data) {
// 					console.log('<--- clear bayes db --->');
// 					res.status(200).json({ 
// 						status: 'success'
// 					}).end();
// 				}
// 			});
// 		}
// 	});
// });

// app.post('/spams', (req, res) => {
// 	console.log('\n/spams requested');
// 	const json = req.body.path;
// 	if (json === undefined) {
// 		console.log('<--- wrong format body --->');
// 		res.status(400).json({ status: 'WRONG_FORMAT', message: 'format should be application/json' });
// 	} else {
// 		writeFile(mail_dir+'/spams.json', json, () => {});
// 		const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
// 			if (filename === 'response.json' && eventType === 'change') {
// 				watcher.close();
// 				readFile(mail_dir+'/response.json', (err, data) => {
// 					if (err) return console.log(err);
// 					if (data) {
// 						// console.log(data);
// 						console.log('<--- trained spams ( folder: '+json+' ) --->');
// 						if (data.substring(20, 21) !== '0') res.json({ status: 'success' }).end();
// 						else {
// 							res.json({ 
// 								status: 'SP_ERR',
// 								message: 'send duplicate mail content to learn'
// 							}).end();
// 						}
// 					}
// 				});
// 			}
// 		});
// 	}
// });

// app.post('/hams', (req, res) => {
// 	console.log('\n/hams requested');
// 	const json = req.body.path;
// 	if (json === undefined) {
// 		console.log('<--- wrong format body --->');
// 		res.status(400).json({ status: 'WRONG_FORMAT', message: 'format should be application/json' });
// 	} else {
// 		writeFile(mail_dir+'/hams.json', json, () => {});
// 		const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
// 			if (filename === 'response.json' && eventType === 'change') {
// 				watcher.close();
// 				readFile(mail_dir+'/response.json', (err, data) => {
// 					if (err) return console.log(err);
// 					if (data) {
// 						// console.log(data);
// 						console.log('<--- trained hams ( folder: '+json+' ) --->');
// 						if (data.substring(20, 21) !== '0') res.json({ status: 'success' }).end();
// 						else {
// 							res.json({ 
// 								status: 'SP_ERR', 
// 								message: 'send duplicate mail content to learn'
// 							}).end();
// 						}
// 					}
// 				});
// 			}
// 		});
// 	}
// });

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