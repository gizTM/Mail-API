# Mail-API

Rest API for mail content scanning based on NodeJS, Amavisd and Spamassassin

## Installation

``` sh
npm install
./app.js
```

or start server with nodemon (just save, no need to terminate and restart server)

``` sh
npm install
nodemon ./app.js
```

 If nodemon not found, try installing nodemon globally

 ```sh
(sudo) npm install -g nodemon
npm install
nodemon ./app.js
 ```

## Usage

The API consists of 3 function calls

- mark mail as **spam**
  - method: POST
  - body: mail content
- mark mail as **ham**
  - method: POST
  - body: mail content
- test mail **spam / ham** score
  - method: PUT
  - body: mail content