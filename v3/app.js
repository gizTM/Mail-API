const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const fs = require('fs');
const cmd = require('node-cmd');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const mail_dir = './mail_content';
require('console-stamp')(console, { pattern: 'HH:MM:ss.l', label: false});

const app = express();
app.use(cors()); // Allow CORS
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
//-------------------------------------------HELPER FUNCTIONS-------------------------------------------

//-----------------------------------------------API CODE-----------------------------------------------
app.post('/spam', (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/spam requested');
	writeFile(mail_dir+'/spam.txt', req.body, () => {});
	cmd.get('sa-learn --spam '+mail_dir+'/spam.txt',
		(err, data, stderr) => {
			if (err) console.log('\x1b[31m%s\x1b[0m', err);
			else {
				console.log('\x1b[35m%s\x1b[0m', data.substring(0, data.length-1));
				if (data.substring(20, 21) === '1') {
					console.log('\x1b[32m%s\x1b[0m', '<---spam success --->\n');
					res.status(200).json({ status: 'success' }).end();
				} else {
					console.log('\x1b[36m%s\x1b[0m', '<---spam duplicate --->\n');
					res.json({
						status: 'SP_ERR',
						message: 'send duplicate mail content to learn'
					}).end();
				}
			}
		}
	);
});

app.post('/ham', (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/ham requested');
	writeFile(mail_dir+'/ham.txt', req.body, () => {});
	cmd.get('sa-learn --ham '+mail_dir+'/ham.txt',
		(err, data, stderr) => {
			if (err) console.log('\x1b[31m%s\x1b[0m', err);
			else {
				console.log('\x1b[35m%s\x1b[0m', data.substring(0, data.length-1));
				if (data.substring(20, 21) === '1') {
					console.log('\x1b[32m%s\x1b[0m', '<---ham success --->\n');
					res.status(200).json({ status: 'success' }).end();
				} else {
					console.log('\x1b[36m%s\x1b[0m', '<---ham duplicate --->\n');
					res.json({
						status: 'SP_ERR', 
						message: 'send duplicate mail content to learn'
					}).end();
				}
			}
		});
});

app.put('/test', (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/test requested');
	writeFile(mail_dir+'/test.txt', req.body, () => {});
	cmd.get('TEST=$(spamassassin -t '+mail_dir+`/test.txt)
		STATUS=\${TEST#*X-Spam-Status: }
		SCORE=\${TEST#*score=}
		REQUIRE=\${TEST#*required=}
		echo "\${STATUS%%,*}" "\${SCORE%% *}" "\${REQUIRE%% *}"`,
	(err, data, stderr) => {
		if (err) console.log('error', err);
		else {
			const status = data.split(' ')[0];
			const score = parseFloat(data.split(' ')[1]);
			const threshold = parseFloat(data.split(' ')[2]);
			// console.log('\x1b[35m%s\x1b[0m', status+' '+score+' '+threshold);
			if (status === 'Yes') {
				console.log('\x1b[32m%s\x1b[0m', '<--- mail is spam ( '+score+' / '+threshold+' ) !!! --->\n');
				res.status(200).json({ 
					status: 'success',
					score: score,
					threshold: threshold,
					result: 'spam'
				}).end();
			} else {
				console.log('\x1b[32m%s\x1b[0m', '<--- mail is ham ( '+score+' / '+threshold+' ) !!! --->\n');
				res.status(200).json({ 
					status: 'success',
					score: score,
					threshold: threshold,
					result: 'ham'
				}).end();
			}
		}
	});
});

//------------------------------------------- EXTRA API CODE -------------------------------------------
app.post('/peek', (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/peek requested');
	cmd.get('sa-learn --backup | grep "^v"', (err, data, stderr) => {
		if (err) console.log('\x1b[31m%s\x1b[0m', err);
		else {
			const backup = data.split('\n');
			const num_spam = backup[1].split('\t')[1];
			const num_ham = backup[2].split('\t')[1];
			console.log('\x1b[35m%s\x1b[0m', 'trained db => num_spam: '+num_spam+', num_ham: '+num_ham);
			console.log('\x1b[32m%s\x1b[0m', '<--- peek spamassassin db success --->\n');
			res.json({ 
				status: 'success',
				spam: num_spam,
				ham: num_ham
			}).end();
		}
	});
});

app.post('/clear', (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/clear requested');
	cmd.get('sa-learn --clear', (err, data, stderr) => {
		if (err) console.log('\x1b[31m%s\x1b[0m', err);
		else {
			// console.log('\x1b[35m%s\x1b[0m', data.substring(0, data.length-1));
			console.log('\x1b[32m%s\x1b[0m', '<--- clear success --->\n');
			res.json({ status: 'success' }).end();
		}
	});
});

app.post('/spams', (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/spams requested');
	// console.log('\x1b[36m%s\x1b[0m', req.body);
	cmd.get('sa-learn --spam /data/mailtest/'+JSON.parse(req.body).path, (err, data, stderr) => {
		if (err) console.log('\x1b[31m%s\x1b[0m', err);
		else {
			console.log('\x1b[35m%s\x1b[0m', data.substring(0, data.length-1));
			if (data.substring(20, 21) !== '0') {
				console.log('\x1b[32m%s\x1b[0m', '<--- spams (folder) success --->\n');
				res.json({ status: 'success' }).end();
			} else {
				console.log('\x1b[36m%s\x1b[0m', '<--- spams (folder) all duplicate --->\n');
				res.json({ 
					status: 'SP_ERR', 
					message: 'send duplicate mail content to learn'
				}).end();
			}
		}
	});
});

app.post('/hams', (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/hams requested');
	// console.log('\x1b[36m%s\x1b[0m', req.body);
	cmd.get('sa-learn --ham /data/mailtest/'+JSON.parse(req.body).path, (err, data, stderr) => {
		if (err) console.log('\x1b[31m%s\x1b[0m', err);
		else {
			console.log('\x1b[35m%s\x1b[0m', data.substring(0, data.length-1));
			if (data.substring(20, 21) !== '0') {
				console.log('\x1b[32m%s\x1b[0m', '<--- hams (folder) success --->\n');
				res.json({ status: 'success' }).end();
			} else {
				console.log('\x1b[36m%s\x1b[0m', '<--- hams (folder) all duplicate --->\n');
				res.json({ 
					status: 'SP_ERR', 
					message: 'send duplicate mail content to learn'
				}).end();
			}
		}
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
});