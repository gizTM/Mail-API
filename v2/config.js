const path = require('path');

const config = {
	httpPort: 1235,
	staticFolder: path.join(__dirname, 'public'),
};

module.exports = config;