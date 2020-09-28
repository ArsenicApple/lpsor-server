console.log("Starting server...");
// Import the config file + external APIs before doing anything
const fs = require('fs');

// read the config file
const configFile = fs.readFileSync('config.json');
const config = JSON.parse(configFile);

// start the HTTP server
const http2 = require('http2');
const server = http2.createServer()

// start socket.io using the server port
const PORT = process.env.PORT || config.PORT;
server.listen(PORT);
const io = require('socket.io')(server);

// require shell
const CommandShell = require('./adapters/CommandShell.js');

// require socket event handler
const manageSockets = require('./handlers/manageSockets.js');
manageSockets(config,io);

// http get request asking if the server is there

server.on('stream',(stream,headers)=>{
    stream.respond({
        "status":200
    });
})

// server is ready
console.log('Server has started. Listening on port '+PORT);
//var Console = new CommandShell();

////////////////////////////////////////////////////////////
//const http = require('http');
//const server = http.createServer();


