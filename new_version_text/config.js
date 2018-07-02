const path = require('path');

const config = {
	httpPort: 1236,
	staticFolder: path.join(__dirname, 'public'),
};

module.exports = config;