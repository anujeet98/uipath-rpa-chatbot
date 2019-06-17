 Function errorHandler(error) {
    // at this point, it is likely better to treat this as fatal
    throw error;
}
server = http.createServer();
server.on('error', errorHandler);
server.listen(config.port, config.host);
logger.info('Server listening on ' + config.host + ':' + config.port);




server.post('/',function (request,response) {
if(request.body.result.parameters['open-somaiya']) {
req.send("{}");
req.end(function(res) {
if(res.error) {
response.setHeader('Content-Type', 'application/json');
response.send(JSON.stringify({
"speech" : "Error. Can you try it again ? ",
"displayText" : "Error. Can you try it again ? "
}));
} else if(res.body.results.length > 0) {
let result = res.body.results;
let output = '';
for(let i = 0; i<result.length;i++) {
output += result[i].title;
output+="\n"
}
response.setHeader('Content-Type', 'application/json');
response.send(JSON.stringify({
"speech" : output,
"displayText" : output
}));
}
});
}
}





server.get(‘/getName’,function (req,res){
res.send(‘Swarup Bam’);
});