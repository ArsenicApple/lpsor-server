const BadWordsFilter = require('bad-words');
const { characters } = require('shortid');
const blFilter = new BadWordsFilter();

// get whitelist
var whitelist;
var ChatFilter;

module.exports.initialize = function(config){
    ChatFilter = config.ChatFilter
    
    // init whitelist
    if(ChatFilter == "Whitelist"){
        const fs = require('fs');
        whitelist = fs.readFileSync('../Whitelist.txt').toString().split("\n");
    }
    
}

// uses blacklist
// filtername throws numbers to be sent back to the user
module.exports.filterName = function(str,maxLength){
    // checks for correct length
    if(str.length>maxLength) throw 5;
    if(str.length<4) throw 6;

    // check for any bad words
    if(blFilter.isProfane(str)) throw 7;
}

// uses whitelist
//filtermessage only throws an error to the console for the mods
module.exports.filterMessage= function(str,maxLength){
    // checks for correct length
    if(str.length>maxLength) throw "Message too long";


    switch(ChatFilter)
    {
        // filter with whitelist
        case "Whitelist":
            // splits message into words
            var words = str.split(" ");

            // checks if it's in the whitelist
            words.forEach(messageWord =>{
                if(whitelist.find(whWord=> whWord==messageWord)) throw "Inappropriate Message";
            });
            break;

        // filter with blacklist
        case "Blacklist":
            if(blFilter.isProfane(str)) throw "Inappropriate Message";
            break;
    }
}