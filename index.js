'use strict';

require('dotenv').load();

var https   = require('https');
var fs      = require('fs');
var path    = require('path');
var winston = require('winston');
var env     = process.env.NODE_ENV || 'development';
var port    = process.env.PORT;

var ROOT_PATH = path.resolve(__dirname);

var awsKey, awsSecret, awsBucket, httpsOpts;

var log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({'timestamp':true})
  ]
});

if(env.toLowerCase() === 'production') {
  awsKey    = process.env.PROD_AWS_KEY;
  awsSecret = process.env.PROD_AWS_SECRET;
  awsBucket = process.env.PROD_AWS_BUCKET;
  httpsOpts = {
    key: fs.readFileSync(path.resolve(process.env.PROD_HTTPS_KEY_PATH), 'utf8'),
    cert: fs.readFileSync(path.resolve(process.env.PROD_HTTPS_CERT_PATH), 'utf8'),
    requestCert: true,
    rejectUnauthorized: false
  };
} else if(env.toLowerCase() === 'development') {
  awsKey    = process.env.DEV_AWS_KEY;
  awsSecret = process.env.DEV_AWS_SECRET;
  awsBucket = process.env.DEV_AWS_BUCKET;
  httpsOpts = {
    key: fs.readFileSync(path.resolve(process.env.DEV_HTTPS_KEY_PATH), 'utf8'),
    cert: fs.readFileSync(path.resolve(process.env.DEV_HTTPS_CERT_PATH), 'utf8'),
    requestCert: true,
    rejectUnauthorized: false
  };
}

var signer = require('amazon-s3-url-signer').urlSigner(awsKey, awsSecret);

function validPath(path) {
  var permittedExtensions = '(' + process.env.PERMITTED_FILE_EXTENSIONS.split(',').join('|')+')$';
  var extensionRegex      = new RegExp(permittedExtensions,"ig");
  if(path.match(/^\//) && path.match(extensionRegex)) {
    return true;
  } else {
    return false;
  }
}

function handleError(message, request, response) {
  log.error('[x] ' + request.url);
  response.writeHead(500);
  response.end(message);
}

function checkCorsOrigin(request, response) {
  var origin = request.headers.host;
  var permittedOrigins = process.env.CORS_ALLOW_ORIGIN.split(',');

  if( permittedOrigins.indexOf(origin) >= 0 ) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Methods', process.env.CORS_ALLOW_METHODS);
  }
}

function handleRequest(request, response){
  if(!validPath(request.url)) {
    handleError('PC LOAD LETTER', request, response);
    return;
  }

  response.setHeader('Content-type', 'text/plain');
  checkCorsOrigin(request, response);

  log.info('[√] ' + request.url);
  var signedUrl = signer.getUrl('GET', request.url, awsBucket, 10);
  response.end(signedUrl);
}

var server = https.createServer(httpsOpts, handleRequest);

server.listen(port, function(){
  console.log("Server listening on: https://localhost:%s", port);
});

