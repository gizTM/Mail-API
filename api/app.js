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

const writeFile = (path, contents, callback) => {
	mkdirp(getDirName(path), (err) => {
		if (err) throw err;
		fs.writeFile(path, contents, 'utf-8', callback);
	});
};

app.post('/spam', (req, res) => {
	console.log('spam called: ', req.body);
	const mail = { content: {} };
	mail.content = req.body;
	const json = JSON.stringify(mail);
	writeFile('./api/tmp/mailcontent.json', json, () => {
		console.log('<---write mail json to file completed--->');
	});

	res.send('spam successfully called');
});

app.post('/ham', (req, res) => {
	console.log('ham called: ', req.body);
	res.send('ham successfully called');
});

app.put('/test', (req, res) => {
	console.log('test called: ', req.body);
	res.send('test successfully called');
});

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