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

const timeout = 1000;
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

const startWaiting = (path, callback, timeout) => {
	mkdirp(getDirName(path), (err) => {
		if (err) throw err;
		const timer = setTimeout( () => {
			stopWaiting(path);
			console.log('Timed out.');
		}, timeout);
		fs.watchFile(path, { persistent: true, interval: 1000 }, (curr, prev) => {
			onChanged(curr, prev, path, timer, callback);
		});
	});
};

const onChanged = (current, previous, path, timer, clientCallback) => {
	let type = 'File modified.';
	if (current.mode === 0 && previous.mode === 0) type = 'No file.';
	else if (current.mode > 0 && previous.mode === 0) type = 'File created.';
	else if (current.mode === 0 && previous.mode > 0) type = 'File deleted.';
	if (type !== 'No file.') {
		stopWaiting(path);
		clearTimeout(timer);
	}
	clientCallback(type, current, previous);
};

const stopWaiting = (path) => {
	fs.unwatchFile(path, this);
};
//-------------------------------------------HELPER FUNCTIONS-------------------------------------------
//-----------------------------------------------API CODE-----------------------------------------------
app.post('/spam', (req, res) => {
	const json = JSON.stringify(req.body);
	writeFile('/mail_content/spam.json', json, () => {
		console.log('\x1b[36m%s\x1b[0m', '<---write spam mail json to file completed--->');
	});
	startWaiting('/mail_content/response.json', readFile('/mail_content/response.json', (err,data) => {
		console.log('response.json: ',data);
		console.log('substr: ', data.substring(20,21));
		if (data.substring(20,21) === '0') 
			res.json({
				status: 'SP_ERR',
				message: 'Send duplicated mail content to learn'
			 }).end();
		else res.status(200).json({ status: 'success' });
	}), timeout);
});

app.post('/ham', (req, res) => {
	const json = JSON.stringify(req.body);
	writeFile('/mail_content/ham.json', json, () => {
		console.log('\x1b[36m%s\x1b[0m', '<---write ham mail json to file completed--->');
	});
	res.send('ham successfully called');
});

app.put('/test', (req, res) => {
	writeFile('/mail_content/test.json', json, () => {
		console.log('\x1b[36m%s\x1b[0m', '<---write test mail json to file completed--->');
	});
	res.send('test successfully called');
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