 # LPSOR server
 
Server source code for LPSOr, using node.js and socket.io websockets.
Currently, it's configured to use MongoDB as a database. 
A config.json file is generated when the server starts. You can edit it to suit it to your needs.

The server is built to only support MongoDB databases, but you can open the DatabaseHandler and add your own methods for the database and modify the config file

Text filtering is possible with either Whitelist, Blacklist or None.
Whitelist filters based on the Whitelist.txt file.
Blacklist uses the bad-words package.
None doesn't filter text messages (names + usernames are filtered, however).

## Config.json
### * PORT
The opened by the server. Defaults to 52300. Do note that port forwarding can be dangerous, so make sure you're using a host or the machine you're on is in a DMZ.
### * Console
Toggle the console between true (on) or false (off). Some hosts will not allow the console (Heroku)
### * Rooms
A room is a server that the user selects when they log in.
### * Tickets
The amount of Bronze and Silver tickets that are given to a newly registered user.
### * UserNameMaxChars
The maximum amount of characters in a username
### * ChatMaxChars
The maximum amount of characters written in the chat.
### * ChatFilter
The type of chat filter.
1. **Blacklist:** Filters words based on whether they're inappropriate or not. EX: If "bad" is in the blacklist, then the sentence "This is a bad word" will trigger the blacklist.
The blacklist can be configured by editing blacklist.txt
2. **Whitelist:** Filters words based on whether or not they're in the white list. If the word "bad" is *not* in the whitelist, then the sentence "This is a bad word" will trigger the whitelist
The blacklist can be configured by editing whitelist.txt
3. **None:** No filtering happens for chat message. Use to your own caution.
### * Database
The database type. Only "Mongo" (MongoDB) is supported for now.
### * DatabaseName
The "collection" name of the database.
### * DBUri
The URI used to connect to the database.
### * SaltRounds
The amount of salt rounds used by bcrypt to hash the keyIds. I recommend not changing this.
