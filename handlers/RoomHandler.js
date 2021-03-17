
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
        roomData[i] = { 'name':v,
                        'population': 0,
                        'maxPopulation':maxPopulation,
                        'players': []
                    };
    });
}

function getRoom(name){
    let room;
    roomData.forEach(v=>{
        if(v.name==name){ 
            room = v;
        }
    });
    return room;
}

// add a character to a room
module.exports.addCharacter = function(roomName,userName){
    let room = getRoom(roomName);
    room.population++;
    room.players.push(userName);
}

// removes character from room
// set population to normal
module.exports.removeCharacter = function(roomName,userName){
    let room = getRoom(roomName);
    room.population--;
 
    var characterindex = room.players.indexOf(userName);
    if(characterindex){
        room.players[characterindex] = null;  
    }
    
}
