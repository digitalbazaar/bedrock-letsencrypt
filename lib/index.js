/*
 * Bedrock Let's Encrypt Module
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bedrock = require('bedrock');

var BedrockError = bedrock.util.BedrockError;
var logger = bedrock.loggers.get('app');

require('./config');

// add routes
bedrock.events.on('bedrock-express.configure.routes', addRoutes);

function addRoutes(app) {
  // FIXME: Add routes for handling ACME requests
}
