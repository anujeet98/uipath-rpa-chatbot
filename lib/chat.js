'use strict';

var dialogflow = require('./dialogflow');
var orchestrator = require('./orchestrator');

/**
 * @param {Object} data
 * @param {function(Error, data: string=)} cb
 */
function handleDialogflowResponse(data, cb) {
    /** @type {string} */
    var action = data.result.action;
    /** @type {string} */
    var search;

    // TODO use a switch instead
    if (action === 'open-somaiya') {
        search = data.result.parameters['open-somaiya'];
        if (search.length > 0) {
            // reply that we are working on it
            cb(undefined, data.result.fulfillment.speech);
            // then actually get the work done
            orchestrator.amazonSearch(search, cb);
            // Note: the cb is called multiple time to provide multiple responses
            return;
        }
    }
    // Fallback to the default reply
    cb(undefined, data.result.fulfillment.speech || data.result.fulfillment.messages[0]);
}


module.exports.messageHandler = function (sessionId, data, cb) {
    if (data === undefined) {
        dialogflow.processWelcome(sessionId, cb);
        return;
    }

    dialogflow.processRequest(sessionId,data,function (err, data) {
            if (err) {
                cb(err);
                return;
            }
            if (!data) { // unexpected
                cb(new Error('Data missing'));
                return;
            }
            handleDialogflowResponse(data, cb);
        }
    );
};
