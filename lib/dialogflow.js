'use strict';

// 3rd party
//var log4js = require('log4js');
var dialogflow = require('apiai');

//var logger = log4js.getLogger('Dialogflow');
/** @type {Application} */
var dialogflowClient;

module.exports.setup = function (config) {
    dialogflowClient = dialogflow(config.token);
};

/**
 * @param {Object} response
 * @returns {string|undefined}
 */
function extractDefaultMessage(response) {
    var i;
    /** @type {Array} */
    var messages;
    /** @type {string} */
    var speech;

    if (response.result && response.result.fulfillment && response.result.fulfillment.messages) {
        messages = response.result.fulfillment.messages;
    }
    if (messages.length > 0) {
        for (i = 0; i < messages.length; i += 1) {
            if (messages[i].type === 0) {
                speech = messages[i].speech;
            }
        }
    }
    return speech;
}

/**
 * @param {string} sessionId
 * @param {function(Error, data: string=)} callback
 */
module.exports.processWelcome = function (sessionId, callback) {
    /** @type {EventRequest} */
    console.log(sessionId);
    var request = dialogflowClient.eventRequest({name: 'WELCOME'}, {sessionId: sessionId});
    request.on('response', function (response) {
        callback(undefined, extractDefaultMessage(response));
    });

    request.on('error', function (err) {
        callback(err);
    });

    // TODO add a timeout to ensure callback
    request.end();
};

/**
 * @param {string} sessionId
 * @param {string} data
 * @param {function(Error, data: Object=)} callback
 */
module.exports.processRequest = function (sessionId, data, callback) {
    // noinspection JSCheckFunctionSignatures
    /** @type {TextRequest|type[]} */
    var request = dialogflowClient.textRequest(data, {sessionId: sessionId});
    request.on('response', function (response) {
        callback(undefined, response);
    });

    request.on('error', function (err) {
        callback(err);
    });

    request.end();
};
