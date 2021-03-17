const DatabaseHandler = require('../handlers/DatabaseHandler.js');

const KeyGen = require('../adapters/KeyGen.js');
const KeyEncrypt = require('../adapters/KeyEncrypt.js');
const StringFilter = require('../adapters/StringFilter.js')

const PlayerHandler = require('../handlers/PlayerHandler.js');
const CharacterHandler = require('../handlers/CharacterHandler.js');
const RoomHandler = require('../handlers/RoomHandler.js');

var sockets = {};
var io;

module.exports = function manageSockets(config,socketio)
{
    // init scripts
    DatabaseHandler.initialize(config);
    StringFilter.initialize(config);
    RoomHandler.initialize(config);
    PlayerHandler.initialize(config);

    io = socketio;

    // Wait for player connection to server (socket)
    io.on('connection',function(socket){ 
        console.log('A player awaiting authentication has connected to the server.');

        // User connecting to the server + disconnecting
        socket.on('userConnect',(userData)=> authenticateUser(socket,userData,config));
        socket.on('disconnect',()=>disconnectUser(socket));

        // User requests room data
        socket.on('getRooms',()=> getRooms(socket));
        
        // User requests to get all character data
        socket.on('getAllCharacters',()=>getAllCharacters(socket));

        // below are untested events
        // User joining a map
        socket.on('joinMap',(userData)=> joinMap(socket,userData))
        
        // User setting their current character
        socket.on('setCharacter',(userData)=> setPlayingCharacter(socket,userData))   
                
        // User creating a character
        socket.on('newCharacter',(userData)=> createCharacter(socket,userData,config))   
        
        // User sends message through chat
        socket.on('chat',(userData)=>sendChatMessage(socket,userData));
        // User gets chat filter data
        socket.on('filterData',()=> getFilterData(socket));

        // Moving the character by changing their tile
        socket.on('moveTile',(userData) => moveCharacter(socket,userData));

        // User performs action for their character
        socket.on('performAction', (userData) => characterAction(socket,userData));  
        
        // User changes character outfit
        socket.on('changeOutfit', (userData)=> updateCharacterOutfit(socket,userData))  
        
        // Character health is modified
        socket.on('modifyHealth', (userData)=> updateCharacterHealth(socket,userData))

        /*unimplemented events
        socket.on('purchaseItem')
        socket.on('giftItem')
        socket.on('luckItem')*/

        
    })
}

/////////////////////// GENERAL FUNCTIONS ///////////////////////////////////

function getUserName(socket){
    var find;
    Object.keys(sockets).forEach(key=>{
        if(sockets[key] == socket){
            find = key
        }
    })
    return find;
}

function checkHasItem(userName,itemId){
    var player = PlayerHandler.getPlayer(userName);
    var hasItem = false;

    // loops through inventory to look for item
    player.inventory.forEach(item => { 
        if (item == itemId) hasItem = true;
    })

    // if they dont have the item, throw an exception
    if(!hasItem) throw `Invalid Outfit: ${userName} does not have item ${itemId}`;
}

/////////////////////// DISCONNECT THE USER /////////////////////////////////////

async function disconnectUser(socket){

    var userName = getUserName(socket);
    var player = PlayerHandler.getPlayer(userName);

    // saving + removing character data + room entry
    var character = CharacterHandler.getCharacter(userName);
    if(character){
        await DatabaseHandler.updateCharacter(character);
        RoomHandler.removeCharacter(player.room,userName);
        CharacterHandler.removeCharacter(userName);

        socket.to(player.getWorld()).emit('removePlayer',{returnCode:0,data:{userName:userName}})
    } 
    // announcing to server the player left

    if(player)
    {
        await DatabaseHandler.updatePlayer(player);
        PlayerHandler.removePlayer(userName);
    }
    
    console.log(`User ${userName} has disconnected from the server.`);
}
/////////////////////// AUTHENTICATE THE USER ///////////////////////////////////

async function authenticateUser(socket, userData, config){ 
    userData = JSON.parse(userData);
    let playerData = await DatabaseHandler.findPlayer(userData.userName)// Checks for playerdata
    try{
        // Authentication
        if(playerData){ // if playerdata returns an object without errors
            authenUser(userData,playerData);
        }
        else{// generating a new key + adding a player to the database
            playerData = await registerUser(userData, config);
        }
        
        // finally integrating the player if there's no problems
        addUser(socket,userData,playerData);
    }
    catch(errCode){
        
        console.log("Failure in authen: " + errCode);
        if(typeof errCode!="number") errCode = 4;
        socket.emit('userConnect',{"returnCode":errCode});
    }

}

async function registerUser(userData, config){
    // there isn't supposed to be a keyid attatched to it, return error code to user
    if(userData.keyId!=''){
        console.error('Could not register user.');
        throw 4;
    }
    // filter the username
    StringFilter.filterName(userData.userName,config.UserNameMaxChars);
    
    // raw id is the unencrypted keyid
    keyIdRaw = KeyGen(); 
    
    // encrypts the key into a hash
    
    var keyId = await KeyEncrypt.generateHashAsync(config,keyIdRaw);
    userData.keyId = keyId;
    
    
    // add player to database
    var playerData = PlayerHandler.addPlayer(userData.userName);
    playerData.setUserName(userData.userName);
    playerData.setKeyId(keyId);
    returnDB = await DatabaseHandler.addPlayer(playerData);

    playerData._id = returnDB.insertedId;
    playerData.keyIdRaw = keyIdRaw;

    return playerData;
}


function authenUser(userData,playerData){ // throws errors if failed authen
    
    // checks if theres a valid key
    if(userData.keyId == ''){
        console.error('Could not authenticate user.');
        throw 1;
    }
    // checks if hashes match
    if(!KeyEncrypt.compareHashesAsync(userData.keyId,playerData.keyId)) throw 2;
}

function addUser(socket, userData, playerData){

    // add player to session
    PlayerHandler.addPlayer(userData.userName);
    PlayerHandler.loadPlayer(userData.userName,playerData);
    
    //sockets[socket] = userData.userName;   
    sockets[userData.userName] = socket;
    //success msg
    console.log(`User ${userData.userName} has connected to the server.`);
    socket.emit('userConnect',{'returnCode':0,'data':{'playerData':playerData,'keyId':playerData.keyIdRaw}}); 
}

/////////////////////// REQUESTING ALL CHARACTERS ///////////////////////////////////

async function getAllCharacters(socket){
    var userName = getUserName(socket);
    var player = PlayerHandler.getPlayer(userName);

    console.log(`Getting characters for ${userName}`)
    var characters = await DatabaseHandler.getCharacters(player);
    socket.emit('getAllCharacters',{returnCode:0,data:characters});
}

/////////////////////// PLAYER JOINS A ROOM ///////////////////////////////////

function getRooms(socket){
    var roomData = RoomHandler.rooms;
    socket.emit('getRooms',{'returnCode':0,'data':roomData}); 
}

function joinMap(socket, userData){ 
    userData = JSON.parse(userData);
    var userName = getUserName(socket);
    var character = CharacterHandler.getCharacter(userName);
    var player = PlayerHandler.getPlayer(userName);

    // Join the map
    var world = userData.roomName+"_"+userData.mapName;

    player.setWorld(userData.roomName,userData.mapName);
    RoomHandler.addCharacter(userData.roomName,userName);
    

    socket.join(player.getWorld(),()=>{
         // spawn all the characters in this room
        Object.values(PlayerHandler.players).forEach(otherPlayer => {
            if (otherPlayer.getWorld() == world){
                var otherUserName = otherPlayer.userName;
                socket.emit('large cock');
                socket.emit('spawnPlayer',{returnCode:0,data:{playerData:PlayerHandler.getFilteredPlayer(otherUserName),characterData:CharacterHandler.getCharacter(otherUserName)}}); 
            }
        })
        socket.to(world).emit('large cock');
        // announce to others that currentCharacter has spawned
        socket.to(world).emit('spawnPlayer',{returnCode:0,data:{playerData:PlayerHandler.getFilteredPlayer(userName),characterData:character}}); 
    });
}

async function setPlayingCharacter(socket,userData){
    userData = JSON.parse(userData);
    var userName = getUserName(socket);
    // load character into room
    try{
        var characterData = await DatabaseHandler.findCharacter(userData._id);
        // if there's already a character
        var loadedCharacter = CharacterHandler.getCharacter(userName)
        if(loadedCharacter) {
            await DatabaseHandler.updateCharacter(loadedCharacter);
            CharacterHandler.removeCharacter(userName);
        }

        var character = CharacterHandler.newCharacter(userName,characterData);
        CharacterHandler.loadCharacter(userName,character);
    }
    catch(err){
        console.log(`Could not set current playing character for ${userName}: ${err}`);
    }
}

/////////////////////// PLAYER CREATES A CHARACTER ///////////////////////////////////

function createCharacter(socket,userData,config){
    userData = JSON.parse(userData);
    console.log(userData);
    var userName = getUserName(socket);
    try{
        // check if data is valid
        StringFilter.filterName(userData.name,config.CharNameMaxChars);
        validateCharacter(userName,userData);

        // add character to database
        var character = CharacterHandler.newCharacter(userName,userData);
        character.newAdoptDate();
        character.newFavouriteFood();

        DatabaseHandler.addCharacter(character);
    }
    catch(err)
    {
        console.error(`Cannot create character: code ${err}`);
        socket.emit('authenSuccess',{"returnCode":err});  
    }
}

function validateCharacter(userName,userData){
    var player = PlayerHandler.players[userName];
    // if there's bronze tickets
    if(userData.ticket == 0 && player.bronze > 0)player.bronze--;
    // if theres silver tickets
    else if(userData.ticket == 1 && player.silver > 0)player.silver--;
    // throw error if the user can't make the character
    else throw 8;
}

/////////////////////// PLAYER CHAT ///////////////////////////////////

function sendChatMessage(socket,message){ 
    var userName = getUserName(socket);
    var player = PlayerHandler.getPlayer(userName);
    // try to filter chat, 
    try{
        // throws error if message is inappropriate
        StringFilter.filterMessage(userData.message);

        // emits to everyone so the filtered result is on everyone's client
        io.to(player.getWorld()).emit('chat',{'returnCode':0,'data':{'userName':userName,'message':message}});
    }
    catch(error){
        console.log(`Failed to send message: ${error}`);
    }
    finally{
        // logs the message
        console.log(`${userName}: ${message}`);
    }
}  

function getFilterData(socket){
    console.log("Getting filter data");
    socket.emit("filterData",{returnCode:0,data:StringFilter.getFilter()});
}

/////////////////////// CHARACTER TILE MOVEMENT ///////////////////////////////////

function moveCharacter(socket,userData){
    userData = JSON.parse(userData);
    var userName = getUserName(socket);
    var character = CharacterHandler.getCharacter(userName);
    var player = PlayerHandler.getPlayer(userName);

    character.lastLocation = {x:userData.x,y:userData.y};
    //console.log(socket.rooms);
    socket.to(player.getWorld()).emit('large cock');
    io.to(player.getWorld()).emit('moveTile',{'returnCode':0,'data':{"userName":userName,'tile':character.lastLocation}});
}


/////////////////////// CHARACTER ACTION ///////////////////////////////////

function characterAction(socket,userData){ 
    var userName = getUserName(socket);
    var character = CharacterHandler.getCharacter(userName);


    io.to(character.map).emit('charPerformAction',{"userName":userName,'actionType':userData.actionType,'actionAnim':userData.actionAnim});
}

/////////////////////// CHANGE THE CHARACTER OUTFIT ///////////////////////////////////

function updateCharacterOutfit(socket,userData){ 
    var userName = getUserName(socket);
    var character = CharacterHandler.getCharacter(userName);

    try{
        checkHasItem(userName,userData.itemId);
        CharacterHandler.updateOutfit(userName,data.slot,userData.itemId);

        socket.to(Room).emit('charUpdateOutfit',{"userName":userName,'wearing':character.wearing});
    }
    catch(error){
        console.error(error);
    }
}

function IsClothing(itemId){
    // look thru item database....
    
}

/////////////////////// MODIFYING THE CHARACTER HEALTH ///////////////////////////////////

function updateCharacterHealth(socket,userData){ 
    var userName = getUserName(socket);
    var character = CharacterHandler.getCharacter(userName);
    try{
        character.setHealth(userData.health); 
    }
    catch(error){
        console.log(error);
    }
    
}