const Player = require('../classes/Player.js');
var config;

var playerCache = {};
module.exports.players = playerCache;

module.exports.initialize = function(conf){
    config = conf;
}

module.exports.addPlayer = function(userName){
    var player = new Player(config);
    playerCache[userName] = player;
    return player;
}

module.exports.loadPlayer = function(userName, playerData){
    playerCache[userName].loadPlayer(playerData);
}

module.exports.getPlayer = function(userName){
    return playerCache[userName];
}

module.exports.getFilteredPlayer = function(userName){
    var playerData = {userName:userName};
    return playerData;
}

module.exports.removePlayer = function(userName){
    delete playerCache[userName];
}

///////////////////////////////////////////////////

