const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const fs = require('fs');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;

const app = express();
app.use(cors()); // Allow CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mail_dir = '/mail_content';

//-------------------------------------------HELPER FUNCTIONS-------------------------------------------
const writeFile = (path, contents, callback) => {
	mkdirp(getDirName(path), (err) => {
		if (err) throw err;
		fs.writeFile(path, contents, 'utf-8', callback);
	});
};

const readFile = (path, callback) => {
	mkdirp(getDirName(path), (err) => {
		if (err) throw err;
		fs.readFile(path, 'utf-8', callback);
	});
};
//-------------------------------------------HELPER FUNCTIONS-------------------------------------------

//-----------------------------------------------API CODE-----------------------------------------------
app.post('/spam', (req, res) => {
	const json = JSON.stringify(req.body);
	writeFile(mail_dir+'/spam.json', json, () => { console.log('\x1b[34m%s\x1b[0m', '---spam written---') });
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType == 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) throw err;
				if (data) {
					if (data.substring(20, 21) === '1') {
						console.log('\x1b[32m%s\x1b[0m', '<---spam success response sent--->\n');
						res.status(200).json({ status: 'success' }).end();
					} else {
						console.log('\x1b[36m%s\x1b[0m', '<---spam duplicate error response sent--->\n');
						res.json({
							status: 'SP_ERR', 
							message: 'send duplicate mail content to learn'
						}).end();
					}
				}
			});
		}
	});
});

app.post('/ham', (req, res) => {
	const json = JSON.stringify(req.body);
	writeFile(mail_dir+'/ham.json', json, () => { console.log('\x1b[34m%s\x1b[0m', '---ham written---') });
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType == 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) throw err;
				if (data) {
					if (data.substring(20, 21) === '1') {
						console.log('\x1b[32m%s\x1b[0m', '<---ham success response sent--->\n');
						res.status(200).json({ status: 'success' }).end();
					} else {
						console.log('\x1b[36m%s\x1b[0m', '<---ham duplicate error response sent--->\n');
						res.json({
							status: 'SP_ERR', 
							message: 'send duplicate mail content to learn'
						}).end();
					}
				}
			});
		}
	});
});

app.put('/test', (req, res) => {
	const json = JSON.stringify(req.body);
	writeFile(mail_dir+'/test.json', json, () => { console.log('\x1b[34m%s\x1b[0m', '---test written---') });
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType === 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) throw err;
				if (data) {
					const status = data.split(' ')[0];
					const score = parseFloat(data.split(' ')[1]);
					const threshold = parseFloat(data.split(' ')[2]);
					if (status === 'Yes') {
						console.log('\x1b[32m%s\x1b[0m', '<--- mail is spam ('+score+'/'+threshold+')!!! --->\n');
						res.status(200).json({ 
							status: 'success',
							score: score,
							threshold: threshold,
							result: 'spam'
						}).end();
					} else {
						console.log('\x1b[32m%s\x1b[0m', '<--- mail is ham ('+score+'/'+threshold+')!!! --->\n');
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

app.post('/clear', (req, res) => {
	const json = 'clear bayes db';
	writeFile(mail_dir+'/clear.json', json, () => {});
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType === 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) throw err;
				if (data) {
					console.log('\x1b[32m%s\x1b[0m', '<--- clear bayes db --->\n');
					res.status(200).json({ 
						status: 'success',
						message: data
					 }).end();
				}
			});
		}
	});
});
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
		},
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
	console.log();
});