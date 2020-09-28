const Player = require('../classes/Player.js');

var playerCache = [];
module.exports.players = playerCache;

module.exports.addPlayer = function(userName){
    player = new Player();
    playerCache[userName] = player;
    return player;
}

module.exports.loadPlayer = function(userName, playerData){
    playerCache[userName].loadPlayer(playerData);
}

module.exports.getPlayer = function(userName){
    return playerCache[userName];
}

module.exports.removePlayer = function(userName){
    playerCache[userName] = null;
}

///////////////////////////////////////////////////

