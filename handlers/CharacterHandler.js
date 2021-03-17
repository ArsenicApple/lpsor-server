const Character = require('../classes/Character.js');

var characterCache = {};
module.exports.characters = characterCache;

module.exports.newCharacter = function(userName,characterData){
    var character = new Character();
    character.loadCharacter(userName,characterData);
    return character;
}

// Loads character into cache
module.exports.loadCharacter = function(userName,character){
    characterCache[userName] = character;
}
// Gets the character from cache
module.exports.getCharacter = function(userName){
    return characterCache[userName];
}
// Removes character from cache
module.exports.removeCharacter = function(userName){
    characterCache[userName] = null;
}

module.exports.updateOutfit = function(userName,slot,itemId){
    var character = characterCache[userName];
    if(typeof itemId != string || typeof slot != number) throw "Invalid Outfit Update";

    character.setOutfit(slot,itemId);
}