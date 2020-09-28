
// room array
var roomData = [];    
module.exports.rooms = roomData;

//initialize roomData
module.exports.initialize = function(config){   
    // add rooms
    config.Rooms.forEach(function(v,i){
        var buddies = 0;
        var maxPopulation = 25;
        // room data
        roomData[v] = { 'name':v.name,
                        'population': 0,
                        'maxPopulation':maxPopulation,
                        'players': []
                    };
    });
}

// add a character to a room
module.exports.addCharacter = function(roomName,userName){
    roomData[roomName].population++;
    roomData[roomName].players.push(userName);
}

// removes character from room
// set population to normal
module.exports.removeCharacter = function(roomName,userName){
    roomData[roomName].population--;
 
    var characterindex = roomData[roomName].players.indexOf(userName)
    if(characterindex){
        roomData[roomName].players[characterindex] = null;  
    }
    
}
