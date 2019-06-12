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
        console.log(search);
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

    /*
    Dialogflow response example 1: message not understood
    { id: '6c12f938-1b86-4f12-a1ff-278301674a54',
      timestamp: '2018-04-11T08:52:03.398Z',
      lang: 'en',
      result:
       { source: 'agent',
         resolvedQuery: 'sup',
         action: 'input.unknown',
         actionIncomplete: false,
         parameters: {},
         contexts: [],
         metadata:
          { intentId: '6d8603a7-7ce3-4238-bfdc-ba1cea115eef',
            webhookUsed: 'false',
            webhookForSlotFillingUsed: 'false',
            intentName: 'Default Fallback Intent' },
         fulfillment: { speech: 'I didn\'t get that.', messages: [Array] },
         score: 1 },
      status: { code: 200, errorType: 'success', webhookTimedOut: false },
      sessionId: 'cd455623-aca9-487c-ba80-8a3bff7a4f86' }

    Dialogflow response example 2: intent detected
      { id: 'ffdde96d-1340-466a-a2c8-9db55c45c842',
      timestamp: '2018-04-11T08:53:14.578Z',
      lang: 'en',
      result:
       { source: 'agent',
         resolvedQuery: 'open ppt',
         action: 'Open_PPT',
         actionIncomplete: false,
         parameters: { type: 'StartJob' },
         contexts: [],
         metadata:
          { intentId: '397b8f4e-3149-4a67-9636-70b27e4d9e30',
            webhookUsed: 'true',
            webhookForSlotFillingUsed: 'false',
            webhookResponseTime: 3824,
            intentName: 'open_ppt' },
         fulfillment: { messages: [Array] },
         score: 1 },
      status: { code: 200, errorType: 'success', webhookTimedOut: false },
      sessionId: 'cd455623-aca9-487c-ba80-8a3bff7a4f86' }
     */
}

/**
 * @param {string} sessionId
 * @param {string} data
 * @param {function(Error, data: string=)} cb
 */
module.exports.messageHandler = function (sessionId, data, cb) {
    // New connection/session: handle the welcome intent
    if (data === undefined) {
        dialogflow.processWelcome(sessionId, cb);
        return;
    }

    // Message received: process it
    dialogflow.processRequest(
        sessionId,
        data,
        /**
         * @param {Error} err
         * @param {Object} data
         */
        function (err, data) {
            if (err) {
                cb(err);
                return;
            }
            if (!data) { // unexpected
                cb(new Error('Data missing'));
                return;
            }
            console.log(data);
            handleDialogflowResponse(data, cb);
        }
    );
};
