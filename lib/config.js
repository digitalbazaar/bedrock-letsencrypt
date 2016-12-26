/*
 * Bedrock Let's Encrypt Module Configuration
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;

config['letsencrypt'] = {
  // the operating mode for lets encrypt
  // set to 'staging' to test an Internet-facing server with fake certificates
  // set to 'production' to go live, Let's Encrypt rate limiting applies
  // set to anything else to disable Let's Encrypt
  // see https://letsencrypt.org/docs/rate-limits/ for more info
  mode: 'disabled',
  // domains that Let's Encrypt certificates will be fetched for
  domains: [],
  // email for domain administrator
  email: '',
  // default key size for certificates
  rsaKeySize: 2048,
  // options to pass to the Redis driver
  redisOptions: {}
};
