const app = require('express')();
console.log("Starting server...");
// Import the config file + external APIs before doing anything
const config = require('./getConfig.js')();

// start the HTTP server
const server = require('http').createServer();

// start socket.io using the server port
const PORT = process.env.PORT || config.PORT;

const io = require('socket.io')(server,{pingTimeout: 60000});

// require shell
const CommandShell = require('./adapters/CommandShell.js');
server.listen(PORT);

// require socket event handler
const manageSockets = require('./handlers/manageSockets.js');
manageSockets(config,io);

// http get request asking if the server is there
server.on('request', async function(request, response){
    response.writeHead(200); // writes 200 as a success
    response.end("huhu looks like u typed in the wrong uri :)");
  });

// server is ready
console.log('Server has started. Listening on port '+PORT);

// Some hosts might break if there is a console
if(config.Console){
    const Console = new CommandShell();
}

////////////////////////////////////////////////////////////
//const http = require('http');
//const server = http.createServer();

