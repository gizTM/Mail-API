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
require('console-stamp')(console, { pattern: 'HH:MM:ss.l', label: false });

const app = express();
app.use(cors()); // Allow CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

const clearMailDir = () => {
	// const files = ['/spam.json', '/ham.json', '/test.json', '/clear.json'];
	// console.log('\x1b[40m%s\x1b[0m', 'files cleared');
	// for (let i=0; i<files.length; i++) {
	// fs.stat(mail_dir+files[i], (err, stats) => {
	// 	console.log(stats);//here we got all information of file in stats variable
	// 	if (err) return console.error(err);
	// 	fs.unlink(mail_dir+files[i], err => {
	// 		 if(err) return console.log(err);
	// 		 console.log('file deleted successfully');
	// 	});  
	//  });
	// }
};
//-------------------------------------------HELPER FUNCTIONS-------------------------------------------

//-----------------------------------------------API CODE-----------------------------------------------
app.post('/spam', upload.single('spam'), (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/spam requested');
	clearMailDir();
	// const json = JSON.stringify(req.body.content);
	// writeFile(mail_dir+'/spam.json', json, () => { console.log('\x1b[34m%s\x1b[0m', '---spam written---') });
	fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/spam.json'));
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType == 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) return console.log('\x1b[31m%s\x1b[0m', err);
				if (data) {
					console.log('\x1b[35m%s\x1b[0m', data);
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

app.post('/ham', upload.single('ham'), (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/ham requested');
	clearMailDir();
	// const json = JSON.stringify(req.body.content);
	// writeFile(mail_dir+'/ham.json', json, () => { console.log('\x1b[34m%s\x1b[0m', '---ham written---'); });
	fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/ham.json'));
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType == 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) return console.log('\x1b[31m%s\x1b[0m', err);
				if (data) {
					console.log('\x1b[35m%s\x1b[0m', data);
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

app.put('/test', upload.single('test'), (req, res) => {
	console.log('\x1b[46m%s\x1b[0m', '/test requested');
	clearMailDir();
	// const json = JSON.stringify(req.body.content);
	// writeFile(mail_dir+'/test.json', req.body, () => { console.log('\x1b[34m%s\x1b[0m', '---test written---') });
	// const target_path = mail_dir+'/'+req.file.originalname;
	fs.createReadStream(req.file.path).pipe(fs.createWriteStream(mail_dir+'/test.json'));
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType === 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) return console.log('\x1b[31m%s\x1b[0m', err);
				if (data) {
					// console.log('\x1b[35m%s\x1b[0m', data);
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
	console.log('\x1b[46m%s\x1b[0m', '/clear requested');
	clearMailDir();
	const json = 'clear bayes db';
	writeFile(mail_dir+'/clear.json', json, () => {});
	const watcher = fs.watch(mail_dir, { persistent: false }, (eventType, filename) => {
		if (filename === 'response.json' && eventType === 'change') {
			watcher.close();
			readFile(mail_dir+'/response.json', (err, data) => {
				if (err) return console.log('\x1b[31m%s\x1b[0m', err);
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