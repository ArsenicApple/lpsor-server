const bad_words = require('bad-words');
const { characters } = require('shortid');
const blackList = new bad_words({emptyList:true});
const whiteList = new bad_words({emptyList:true})

var blacklistWords = [];
var whitelistWords = [];

var ChatFilter;

module.exports.initialize = function(config){
    ChatFilter = config.ChatFilter

    // init whitelist
    const fs = require('fs');
    blacklistWords = fs.readFileSync('./blacklist.txt').toString().split("\n");
    whitelistWords = fs.readFileSync('./whitelist.txt').toString().split("\n");
    blackList.addWords(...blacklistWords);
    whiteList.addWords(...whitelistWords);
    
}

// uses blacklist
// filtername throws numbers to be sent back to the user
module.exports.filterName = function(str,maxLength){
    // checks for correct length
    if(str.length>maxLength) throw 5;
    if(str.length<4) throw 6;

    // check for any bad words
    if(blackList.isProfane(str)) throw 7;
}

// Returns the server's filter settings
module.exports.getFilter = function(){
    switch(ChatFilter)
    {
        case "Whitelist":
            return {filterType:ChatFilter,filterWords:whitelistWords};
        case "Blacklist":
            return {filterType:ChatFilter,filterWords:blacklistWords};
        case "None":
            return {filterType:ChatFilter,filterWords:[]};
    }
    
}

// uses whitelist
//filtermessage only throws an error to the console for the mods
module.exports.filterMessage= function(message,maxLength){
    // checks for correct length
    if(message.length>maxLength) throw "Message too long";
    switch(ChatFilter)
    {
        // filter with whitelist
        case "Whitelist":
            // splits message into words
            var words = message.split(" ");

            // checks if it's in the whitelist
            words.forEach(messageWord =>{
                if(!whiteList.isProfane(messageWord)) throw "Inappropriate Message";
            });
            break;

        // filter with blacklist
        case "Blacklist":
            if(blackList.isProfane(message)) throw "Inappropriate Message";
            break;
    }
}