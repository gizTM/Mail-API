const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const fs = require('fs');
const redis = require('redis');

const client = redis.createClient('6379', 'redis');

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

export {
	writeFile,
	readFile,
	push,
	pop
};