const path = require("path")

const config = {
  httpPort: 1234,
  staticFolder: path.join(__dirname, 'public')
}

module.exports = config