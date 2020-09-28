 #LPSOR server
 
Server source code for LPSOr, using node.js and socket.io websockets.
Currently, it's configured to run on a Heroku server, using MongoDB as a database. Open the config.json to configure the server to your needs.

The server is built to only support MongoDB databases, but you can open the DatabaseHandler and add your own methods for the database and modify the config file

Text filtering is possible with either Whitelist, Blacklist or None
Whitelist filters based on the Whitelist.txt file
Blacklist uses the bad-words package
None doesn't filter text messages (names + usernames are filtered, however)
