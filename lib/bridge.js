'use strict';

// 3rd party
var config = require('config');
var log4js = require('log4js');

// local
var hybridServer = require('./hybridServer');
var chat = require('./chat');
var orchestrator = require('./orchestrator');
var dialogflow = require('./dialogflow');
var logger = log4js.getLogger('bridge');
/**
 * @param {number} timeout
 * @param {number} code
 */
function rageQuit(timeout, code) {
    setTimeout(function () {
        process.exit(code);
    }, timeout);
}

process.on('uncaughtException', function (exception) {
    logger.fatal(exception);
    hybridServer.shutdown(function (ignore) {
        log4js.shutdown(function (ignore) {
            rageQuit(100, 1);
        });
    });
    // make sure that we do not get stuck in the tear-down
    rageQuit(5000, 1);
});

log4js.configure(config.log);
orchestrator.setup(config.orchestrator);
dialogflow.setup(config.dialogflow);
hybridServer.run(config.server, chat.messageHandler);
