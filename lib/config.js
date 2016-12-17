/*
 * Bedrock Let's Encrypt Module Configuration
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;

config['letsencrypt'] = {
  // domains that Let's Encrypt certificates will be fetched for
  domains: [],
  // default key size for certificates
  rsaKeySize: 2048
};
