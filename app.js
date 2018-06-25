const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const config = require('./config');

const app = express();
app.use(cors()) // Allow CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/spam', (req, res) => {
  console.log('spam called')
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
        message: err.message
        }
    });
});

// Serve static files
app.use('/', (req, res) => {
  express.static(config.staticFolder, {
    lastModified: true, 
    maxAge: '1d'
  })(req, res, () => {
    res.sendFile(config.staticFolder + '/index.html');
  });
});

app.listen(config.httpPort, () => {
  console.log('Listening on port ' + config.httpPort);
})