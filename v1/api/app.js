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
// require('console-stamp')(console, { pattern: 'HH:MM:ss.l', label: false });

const app = express();
app.use(cors()); // Allow CORS
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
	if (!req.headers.authorization) return res.status(400).json({ error: 'No authentication token' });
	next();
});

//-------------------------------------------HELPER FUNCTIONS-------------------------------------------
const writeFile = (path, contents, callback) => {
	mkdirp(getDirName(path), (err) => {
		if (err) return console.log('\x1b[31m%s\x1b[0m', err);
		fs.writeFile(path, contents, 'utf-8', callback);
	});
};

const readFile = (path, callback) => {
	mkdirp(getDirName(path), (err) => {
		if (err) return console.log('\x1b[31m%s\x1b[0m', err);
		fs.readFile(path, 'utf-8', callback);
	});
};
//-------------------------------------------HELPER FUNCTIONS-------------------------------------------

//-----------------------------------------------API CODE-----------------------------------------------
app.post('/spam', upload.single('spam'), (req, res) => {
	console.log('\n/spam requested');
	fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/spam.json'));
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType == 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) return console.log(err);
				if (data) {
					// console.log(data);
					if (data.substring(20, 21) === '1') {
						console.log('<--- train spam success --->');
						res.status(200).json({ status: 'success' });
					} else {
						console.log('<--- train spam duplicate --->');
						res.json({
							status: 'SP_ERR', 
							message: 'send duplicate mail content to learn'
						});
					}
				}
			});
		}
	});
});

app.post('/ham', upload.single('ham'), (req, res) => {
	console.log('\n/ham requested');
	fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/ham.json'));
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType == 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) return console.log(err);
				if (data) {
					// console.log(data);
					if (data.substring(20, 21) === '1') {
						console.log('<--- train ham success --->');
						res.status(200).json({ status: 'success' });
					} else {
						console.log('<--- train ham duplicate --->');
						res.json({
							status: 'SP_ERR', 
							message: 'send duplicate mail content to learn'
						});
					}
				}
			});
		}
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
						});
					} else {
						console.log('<--- mail is ham ( '+score+' / '+threshold+' )!!! --->');
						res.status(200).json({ 
							status: 'success',
							score: score,
							threshold: threshold,
							result: 'ham'
						});
					}
				}
			});
		}
	});
});

//------------------------------------------- EXTRA API CODE -------------------------------------------
app.post('/peek', (req, res) => {
	console.log('\n/peek requested');
	const json = 'peek bayes db';
	writeFile(mail_dir+'/peek.json', json, () => {});
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType === 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) return console.log(err);
				if (data) {
					const backup = data.split('\n');
					const num_spam = backup[1].split('\t')[1];
					const num_ham = backup[2].split('\t')[1];
					console.log('<--- peek bayes db --->');
					res.status(200).json({ 
						status: 'success',
						spam: num_spam,
						ham: num_ham
					});
				}
			});
		}
	});
});

app.post('/clear', (req, res) => {
	console.log('\n/clear requested');
	const json = 'clear bayes db';
	writeFile(mail_dir+'/clear.json', json, () => {});
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType === 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) return console.log(err);
				if (data) {
					console.log('<--- clear bayes db --->');
					res.status(200).json({ 
						status: 'success'
					});
				}
			});
		}
	});
});

app.post('/spams', (req, res) => {
	console.log('\n/spams requested');
	const json = req.body.path;
	if (json === undefined) {
		console.log('<--- wrong format body --->');
		res.status(400).json({ status: 'WRONG_FORMAT', message: 'format should be application/json' });
	} else {
		writeFile(mail_dir+'/spams.json', json, () => {});
		const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
			if (filename === 'response.json' && eventType === 'change') {
				watcher.close();
				readFile(mail_dir+'/response.json', (err, data) => {
					if (err) return console.log(err);
					if (data) {
						// console.log(data);
						console.log('<--- trained spams ( folder: '+json+' ) --->');
						if (data.substring(20, 21) !== '0') res.json({ status: 'success' });
						else {
							res.json({ 
								status: 'SP_ERR',
								message: 'send duplicate mail content to learn'
							});
						}
					}
				});
			}
		});
	}
});

app.post('/hams', (req, res) => {
	console.log('\n/hams requested');
	const json = req.body.path;
	if (json === undefined) {
		console.log('<--- wrong format body --->');
		res.status(400).json({ status: 'WRONG_FORMAT', message: 'format should be application/json' });
	} else {
		writeFile(mail_dir+'/hams.json', json, () => {});
		const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
			if (filename === 'response.json' && eventType === 'change') {
				watcher.close();
				readFile(mail_dir+'/response.json', (err, data) => {
					if (err) return console.log(err);
					if (data) {
						// console.log(data);
						console.log('<--- trained hams ( folder: '+json+' ) --->');
						if (data.substring(20, 21) !== '0') res.json({ status: 'success' });
						else {
							res.json({ 
								status: 'SP_ERR', 
								message: 'send duplicate mail content to learn'
							});
						}
					}
				});
			}
		});
	}
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