/*
 * Bedrock Let's Encrypt Module
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bedrock = require('bedrock');
var LE = require('letsencrypt');

var BedrockError = bedrock.util.BedrockError;
var logger = bedrock.loggers.get('app');

require('./config');

// Let's Encrypt configuration object
var le;

// setup Let's Encrypt, enable Let's Encrypt HTTPS SNI callback
bedrock.events.on('bedrock.configure', setupLetsEncrypt);

function setupExpress(app) {
  // attach Let's Encrypt express middleware
  app.get('/.well-known/acme-challenge', le.middleware());
}

function setupLetsEncrypt() {
  // shorten config variables used throughout code
  var bedrockDomains = bedrock.config.letsencrypt.domains;
  var bedrockDomainEmail = bedrock.config.letsencrypt.email;

  logger.info('Let\'s Encrypt configured for: ' + bedrockDomains.join(', '));

  // configure Let's Encrypt storage backend for storing keys and certs
  var leStore = require('le-store-redis').create({
    debug: false,
    redisOptions: bedrock.config.letsencrypt.redisOptions
  });

  // perform Let's Encrypt challenge/response via HTTPS SNI callback
  var leChallenge = require('le-challenge-sni').create({
    debug: false
  });

  // function to accept the terms of service agreement if domain is valid
  function leAgree(opts, agreeCb) {
    // protect against spoofing authorizations for unauthorized domains
    async.every(opts.domains, function(domain, callback) {
      var validDomain = bedrockDomains.indexOf(domain) != -1;
      if(!validDomain) {
        logger.error('unauthorized Let\'s Encrypt domain requested:', domain);
      }
      callback(null, validDomain);
    }, function(err, result) {
      if(err || !result) {
        return agreeCb(null, false);
      }
      agreeCb(null, opts.tosUrl);
    });
  }

  // provides the list of approved domains given a requested domain
  function approveDomains(domain, certs, cb) {
    cb(null, {
      options: {
        email: bedrockDomainEmail,
        domains: bedrockDomains,
        agreeTos: true,
    }});
  }

  // create the Let's Encrypt configuration using tls-sni-01
  le = LE.create({
    server: LE.stagingServerUrl,
    store: leStore,
    challenges: {'tls-sni-01': leChallenge},
    challengeType: 'tls-sni-01',
    agreeToTerms: leAgree,
    approveDomains: approveDomains,
    debug: false
  });

  // override the default Bedrock HTTPS server SNI callback
  bedrock.config.server.https.options.SNICallback = le.sni.sniCallback;

  // setup SNI ACME challenge reponse mechanism in express
  bedrock.events.on('bedrock-express.configure.router', setupExpress);

  // pre-cache the domains listed in the config file
  le.check({ domains: bedrockDomains }).then(function (results) {
    if(results) {
      // certificates exist, return early
      return;
    }

    // pre-fetch certificates for domains listed in config file
    le.register({
      domains: bedrockDomains,
      email: bedrockDomainEmail,
      agreeTos: true,
      rsaKeySize: bedrock.config.letsencrypt.rsaKeySize,
      challengeType: 'tls-sni-01'
    }).then(function(results) {
      logger.info(
        'Let\'s Encrypt HTTPS certificates retrieved for: ' +
        bedrockDomains.join(', '));
    }, function (err) {
      if(err) {
        logger.error('Let\'s Encrypt HTTPS certificate retrieval failed:',
          err);
      }
    });

  });

}
