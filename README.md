## SIMPLE S3 URL SIGNER

This is a pathetically simple Node.js service which will take a path in a given request,
and generate a signed S3 URL for the corresponding path in a given configured bucket. The
server uses HTTPS, it does not provide an option for HTTP. 

The server does not attempt to check the existence of the required path in the destination
bucket before generating a signed URL, so do not take the returning of a signed URL as 
confirmation that the target requested file exists. 

## CONFIG

Configuration is achieved through a .env file in the root of the project. You should supply
your own. It should look like this: 

```
PORT=8843
PERMITTED_FILE_EXTENSIONS=mp3
CORS_ALLOW_ORIGIN=localhost,my.domain.com
CORS_ALLOW_METHODS=GET,PUT,POST
DEV_AWS_KEY=<key>
DEV_AWS_SECRET=<secret>
DEV_AWS_BUCKET=<bucket>
DEV_HTTPS_KEY_PATH=./ssl_keys/dev/privatekey.pem
DEV_HTTPS_CERT_PATH=./ssl_keys/dev/certificate.pem
PROD_AWS_KEY=<key>
PROD_AWS_SECRET=<secret>
PROD_AWS_BUKET=<bucket>
PROD_HTTPS_KEY_PATH=./ssl_keys/prod/privatekey.pem
PROD_HTTPS_CERT_PATH=./ssl_keys/prod/certificate.pem
```

## TESTS

None. Help add some?

## RUNNING 

You can start the signing service by simply executing `npm start`. The default port is 8843. 

## GENERATING YOUR OWN SSL CERT

Run this in `ssl_certs/<env>/`

```
openssl genrsa -out privatekey.pem 1024 
openssl req -new -key privatekey.pem -out certrequest.csr 
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```

## LICENSE

MIT. 
