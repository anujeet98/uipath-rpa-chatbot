'use strict';

// native
var http = require('http');

// 3rd party
var log4js = require('log4js');
var nodeStatic = require('node-static');
var socketIo = require('socket.io');
var uuidV4 = require('uuid/v4');

// local

var server;
var logger;
var staticFiles;
logger = log4js.getLogger('server');
staticFiles = new nodeStatic.Server('./static');

// noinspection JSValidateJSDoc
/**
 * @param {IncomingMessage|http.Request} req
 * @param {ServerResponse|http.Response} res
 */
function serveStatic(req, res) {
    // noinspection JSUnresolvedFunction
    console.log("hello");
    req.addListener('end', function () {
        staticFiles.serve(req, res);
    }).resume();
}

/**
 * We only support requests for static requests
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
function requestHandler(req, res) {
	console.log("hello12");
    if (req.method === 'GET') {
    	console.log("hello13");
        serveStatic(req, res);
        return;
    }
    // Unexpected method -> bad request
    res.writeHead(400);
    res.end();
}

/** @param {Error} error */
function errorHandler(error) {
    // at this point, it is likely better to treat this as fatal
    throw error;
}

function chatCallbackFactory(socket, remoteAddress) {
    return function (error, data) {
        console.log("llll");
        if (error) {
            logger.error('Error for "' + remoteAddress + '": ' + error);
            if (data) {
                socket.emit('chat message', 'Server error: ' + data);
            } else {
                socket.emit('chat message', 'Server error');
            }
            return;
        }
        socket.emit('chat message', data);
    };
}

/**
 * @param {EventEmitter} io
 * @param {function(sessionId: string, data: *, callback: function)} messageHandler
 */
function setupSocketIoServer(io, messageHandler) {
    io.on(
        'connection',
        /** @param {Socket} socket */
        function (socket) {
            /** @type {string|undefined} */
            var incomingConnectionAddress = socket.conn.remoteAddress;
            /** @type {function(Error, data:*)} */
            var cb = chatCallbackFactory(socket, incomingConnectionAddress);
            /** @type {string} */
            var sessionId = uuidV4();

            logger.debug('New socket: ' + incomingConnectionAddress);
            messageHandler(sessionId, undefined, cb);
            socket.on('chat message', function (data) {
                // echo
                cb(undefined, data);
                // process
                messageHandler(sessionId, data, cb);
            });
            console.log("p");
            socket.on('disconnect', function () {
                logger.debug('Client disconnected: ' + incomingConnectionAddress);
            });
            socket.on('error', function (err) {
                logger.error('Error occurred (' + incomingConnectionAddress + '): ' + err);
            });
        }
    );
}

/**
 * @param {{host: string, port: number}} config
 * @param {function(data: *, callback: function)} messageHandler
 */
module.exports.run = function (config, messageHandler) {
    /** @type {Server} */
    var io;
    var PORT = process.env.PORT || 5000;
    console.log("hello111");
    server = http.createServer(requestHandler);
    console.log("hello44");
    io = socketIo.listen(server);
    server.on('error', errorHandler);
    setupSocketIoServer(io, messageHandler);
    server.listen(PORT);
    logger.info('Server listening on ' + ':' + PORT);
};

/** @param {function(Error=)} cb */
module.exports.shutdown = function (cb) {
    server.close(cb);
    server = undefined;
};
