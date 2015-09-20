'use strict';

require('dotenv').load();

var https = require('https');
var fs    = require('fs');
var path  = require('path');
var env   = process.env.NODE_ENV || 'development';
var port  = 8843;

var ROOT_PATH = path.resolve(__dirname);

var awsKey, awsSecret, awsBucket, httpsOpts;

if(env.toLowerCase() === 'production') {
  awsKey = process.env.PROD_AWS_KEY;
  awsSecret = process.env.PROD_AWS_SECRET;
  awsBucket = process.env.PROD_AWS_BUCKET;
  httpsOpts = {
    key: fs.readFileSync(path.resolve(process.env.PROD_HTTPS_KEY_PATH), 'utf8'),
    cert: fs.readFileSync(path.resolve(process.env.PROD_HTTPS_CERT_PATH), 'utf8'),
  };
} else if(env.toLowerCase() === 'development') {
  awsKey = process.env.DEV_AWS_KEY;
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
  if(path.match(/^\//) && path.match(/.mp3$/)) {
    return true;
  } else {
    return false;
  }
}

function handleError(message, request, response) {
  response.writeHead(500);
  response.end(message);
}

function handleRequest(request, response){
  if(!validPath(request.url)) {
    handleError('PC LOAD LETTER', request, response);
    return;
  }

  var signedUrl = signer.getUrl('GET', request.url, awsBucket, 10);
  response.end(signedUrl);
}

var server = https.createServer(httpsOpts, handleRequest);

server.listen(port, function(){
  console.log("Server listening on: https://localhost:%s", port);
});

