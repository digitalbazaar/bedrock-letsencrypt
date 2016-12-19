# bedrock-letsencrypt

A Bedrock module that automates the HTTPS certificate registration, setup,
and renewal process. This module adds automatic TLS Certificate setup and 
updating via the ACME protocol and the Let's Encrypt Certificate Authority.

## Quick Examples

```
npm install bedrock bedrock-letsencrypt
```

Create a basic Bedrock application server:

```js
var bedrock = require('bedrock');
var config = require('bedrock').config;

// modules
require('bedrock-server');
require('bedrock-express');
require('bedrock-letsencrypt');

// config
config.server.port = 443;
config.server.httpPort = 80;
config.server.bindAddr = ['letsencrypt-1.example.com'];
config.server.domain = 'letsencrypt-1.example.com';
config.server.host = 'letsencrypt-1.example.com';
config.server.baseUri = 'https://' + config.server.host;

config.letsencrypt.domains = ['letsencrypt-1.example.com'];
config.letsencrypt.email = 'admin@example.com';

// setup landing page
bedrock.events.on('bedrock-express.configure.routes', function(app) {
  app.get('/', function(req, res) {
    res.send('Hello Bedrock, Let\'s Encrypt!');
  });
});

bedrock.start();
```

Run the application above on any host with public access to the Web. 
You need to ensure that at least ports 80 and 443 are available on 
the public Internet because the Let's Encrypt servers will attempt 
to contact your host during the certificate issurance process.

## Configuration

For documentation on this module's configuration, see [config.js](./lib/config.js).

## How It Works

This module adds automatic TLS Certificate registration, setup, and renewal 
via the ACME protocol and the Let's Encrypt Certificate Authority. When
the application server starts up, the following process occurs:

1. The server scans the config file for Let's Encrypt auto-registration 
   domains listed in ```bedrock.config.letsencrypt.domains```.
2. A private key is generated and a certificate request is sent to 
   the Let's Encrypt Certificate Authority (LECA).
3. The LECA challenges the server to publish a nonce that has been
   digitally signed at a specific URL under /.well-known/acme-challenge/
4. Once the server publishes the LECA challenge to the appropriate
   URL, the LECA provides the signed certificate, which the server
   then uses to encrypt all future HTTPs traffic.
   
Registration, setup, and renewal occurs automatically. By default,
certificates are valid for 90 days and the server will begin attempting
to renew the certificate after 80 days. This process is automatic
and the certificates are free. Hooray.

## Requirements

- node v4.4+
- npm 3+
