const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const fs = require('fs');
const cmd = require('node-cmd');
const mail_dir = './mail_content';
const multer  = require('multer');

const upload = multer({ dest: mail_dir+'/' });
// require('console-stamp')(console, { pattern: 'HH:MM:ss.l', label: false});

const app = express();
app.use(cors()); // Allow CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
	if (!req.headers.authorization) return res.status(400).json({ error: 'No authentication token' });
	next();
});

//-------------------------------------------HELPER FUNCTIONS-------------------------------------------

//-------------------------------------------HELPER FUNCTIONS-------------------------------------------

//-----------------------------------------------API CODE-----------------------------------------------
app.post('/spams', (req, res) => {
	console.log('/spams requested');
	cmd.get('sa-learn --spam /data/mailtest/'+req.body.path, (err, data, stderr) => {
		if (err) console.log('\x1b[31m%s\x1b[0m', err);
		else {
			console.log(data);
			if (data.substring(20, 21) !== '0') {
				console.log('<--- spams (folder) success --->');
				res.json({ status: 'success' }).end();
			} else {
				console.log('<--- spams (folder) all duplicate --->');
				res.json({ 
					status: 'SP_ERR', 
					message: 'send duplicate mail content to learn'
				}).end();
			}
		}
	});
});

app.post('/hams', (req, res) => {
	console.log('/hams requested');
	cmd.get('sa-learn --ham /data/mailtest/'+req.body.path, (err, data, stderr) => {
		if (err) console.log(err);
		else {
			console.log(data);
			if (data.substring(20, 21) !== '0') {
				console.log('<--- hams (folder) success --->');
				res.json({ status: 'success' }).end();
			} else {
				console.log('<--- hams (folder) all duplicate --->');
				res.json({ 
					status: 'SP_ERR', 
					message: 'send duplicate mail content to learn'
				}).end();
			}
		}
	});
});

app.post('/spam', upload.single('spam'), (req, res) => {
	console.log('/spam requested');
	fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/spam.json'));
	cmd.get('sa-learn --spam '+mail_dir+'/spam.json',
		(err, data, stderr) => {
			if (err) console.log(err);
			else {
				console.log(data);
				if (data.substring(20, 21) === '1') {
					console.log('<---spam success --->\n');
					res.status(200).json({ status: 'success' }).end();
				} else {
					console.log('<---spam duplicate --->\n');
					res.json({
						status: 'SP_ERR',
						message: 'send duplicate mail content to learn'
					}).end();
				}
			}
		}
	);
});

app.post('/ham', upload.single('ham'), (req, res) => {
	console.log('/ham requested');
	fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/ham.json'));
	cmd.get('sa-learn --ham '+mail_dir+'/ham.json',
		(err, data, stderr) => {
			if (err) console.log(err);
			else {
				console.log(data);
				if (data.substring(20, 21) === '1') {
					console.log('<---ham success --->\n');
					res.status(200).json({ status: 'success' }).end();
				} else {
					console.log('<---ham duplicate --->\n');
					res.json({
						status: 'SP_ERR', 
						message: 'send duplicate mail content to learn'
					}).end();
				}
			}
		});
});

app.put('/test', upload.single('test'), (req, res) => {
	console.log('/test requested');
	fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/test.json'));
	cmd.get('TEST=$(spamassassin -t '+mail_dir+`/test.json)
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
			console.log(status+' '+score+' '+threshold);
			if (status === 'Yes') {
				console.log('<--- mail is spam ('+score+'/'+threshold+')!!! --->\n');
				res.status(200).json({ 
					status: 'success',
					score: score,
					threshold: threshold,
					result: 'spam'
				}).end();
			} else {
				console.log('<--- mail is ham ('+score+'/'+threshold+')!!! --->\n');
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

app.post('/clear', (req, res) => {
	console.log('/clear requested');
	cmd.get('sa-learn --clear', (err, data, stderr) => {
		if (err) console.log(err);
		else {
			console.log('<--- clear success --->\n');
			res.json({ status: 'success' }).end();
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
});