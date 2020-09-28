const DatabaseHandler = require('../handlers/DatabaseHandler.js');

const KeyGen = require('../adapters/KeyGen.js');
const KeyEncrypt = require('../adapters/KeyEncrypt.js');
const StringFilter = require('../adapters/StringFilter.js')

const PlayerHandler = require('../handlers/PlayerHandler.js');
const CharacterHandler = require('../handlers/CharacterHandler.js');
const RoomHandler = require('../handlers/RoomHandler.js');

var sockets = [];
var io;

module.exports = function manageSockets(config,socketio)
{
    // init scripts
    DatabaseHandler.initialize(config);
    StringFilter.initialize(config);
    RoomHandler.initialize(config);

    io = socketio;

    // Wait for player connection to server (socket)
    io.on('connection',function(socket){ 
        console.log('A player awaiting authentication has connected to the server.');

        // User connecting with username and shortidKey
        socket.on('userConnect',(userData)=> authenticateUser(socket,userData,config))
        
        socket.on('disconnect',()=>disconnectUser(socket));

        // below are untested events
        // User joining a world
        socket.on('joinWorld',(userData)=> joinWorld(socket,userData))
        
        // User creating a character
        socket.on('setCharacter',(userData)=> setPlayingCharacter(socket,userData))   
                
        // User creating a character
        socket.on('newCharacter',(userData)=> createCharacter(socket,userData,config))   
        
        // User sends message through chat
        socket.on('chat',(userData)=>sendChatMessage(socket,userData));
        
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
    return sockets[socket];
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
    // saving + removing player
    var player = PlayerHandler.getPlayer(userName);
    await DatabaseHandler.updatePlayer(player);
    PlayerHandler.removePlayer(userName);
    
    // saving + removing character data + room entry
    var character = CharacterHandler.getCharacter(userName);
    if(character){
        await DatabaseHandler.updateCharacter(character);
        RoomHandler.removeCharacter(character.map);
        CharacterHandler.removeCharacter(userName);
    } 

    console.log(`User ${userName} has disconnected from the server.`);
}
/////////////////////// AUTHENTICATE THE USER ///////////////////////////////////

async function authenticateUser(socket, userData, config){ 
    let playerData = await DatabaseHandler.findPlayer(userData.userName)// Checks for playerdata
    let authorized = false;
    let keyIdRaw = '';
    
    try{
        // Authentication
        if(playerData){ // if playerdata returns an object without errors
            authenUser(userData);
        }
        else{// generating a new key + adding a player to the database
            playerData = registerUser(userData, config);
        }
        // finally integrating the player if there's no problems
        addUser(socket,playerData);
    }
    catch(errCode){
        socket.emit('authenSuccess',{"returnCode":errCode});
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
    var player = PlayerHandler.addPlayer(userData.userName);
    player.setUserName(userData.userName);
    player.setKeyId(keyId);

    playerData = await DatabaseHandler.addPlayer(player);
    return playerData;
}


function authenUser(userData){ // throws errors if failed authen
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
    PlayerHandler.loadPlayer(userData.userName);
    sockets[socket] = userData.userName;   

    // get rooms
    var roomData = roomHandler.rooms;
    
    //success msg
    console.log(`User ${userData.userName} has connected to the server.`);
    socket.emit('authenSuccess',{'returnCode':0,'playerData':playerData,'keyId':keyIdRaw,'rooms':roomData}); 
}

/////////////////////// PLAYER JOINS A ROOM ///////////////////////////////////

function joinWorld(socket, userData){ 
    var userName = getUserName(socket);
    var character = CharacterHandler.getCharacter(userName);

    // Join the map
    var map = data.roomName+"_"+data.mapName;
    socket.join(map);
    
    character.setMap(map);

    // spawn all the characters in this room
    CharacterHandler.characters.forEach(otherChara => { 
        if (otherChara.room == map){
            socket.emit('spawnCharacter',character);
        }
    })

    // announce to others that currentCharacter has spawned
    io.to(map).emit('spawnCharacter',currentCharacter); 
}

async function setPlayingCharacter(socket,userData){
    var userName = getUserName(socket);
    // load character into room
    var characterData = await DatabaseHandler.findOneCharacter(userData.charId);
    var character = CharacterHandler.newCharacter(userName,characterData);

    // if there's already a character
    var loadedCharacter = CharacterHandler.getCharacter(userName)
    if(loadedCharacter) {
        await DatabaseHandler.updateCharacter(loadedCharacter);
        CharacterHandler.removeCharacter(userName);
    }

    CharacterHandler.loadCharacter(userName,character,characterData);
}

/////////////////////// PLAYER CREATES A CHARACTER ///////////////////////////////////

function createCharacter(socket,userData,config){
    var userName = getUserName(socket);
    try{
        // check if data is valid
        StringFilter.filterName(userData.name,config.CharNameMaxChars);
        validateCharacter(userName,userData);

        // add character to database
        var character = CharacterHandler.addCharacter(userName,userData);
        character.newAdoptDate();
        character.newFavouriteFood();

        DatabaseHandler.addCharacter(character);
    }
    catch(errCode)
    {
        console.error(`Cannot create character: code ${errCode}`);
        socket.emit('authenSuccess',{"returnCode":errCode});  
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

function sendChatMessage(socket,userData){ 
    var userName = getUserName(socket);
    var character = CharacterHandler.getCharacter(userName);
    // try to filter chat, 
    try{
        // throws error if message is inappropriate
        StringFilter.filterMessage(userData.message);

        // emits to everyone so the filtered result is on everyone's client
        io.to(character.map).emit('charChat',{"userName":userName,'message':userData.message});
    }
    catch(error){
        console.log(`Failed to send message: ${error}`);
    }
    finally{
        // logs the message
        console.log(`${userName}: ${userData.message}`);
    }
}  

/////////////////////// CHARACTER TILE MOVEMENT ///////////////////////////////////

function moveCharacter(socket,userData){
    var userName = getUserName(socket);
    var character = CharacterHandler.getCharacter(userName);

    io.to(character.map).emit('charMoveTile',{"userName":userName,'tile':userData.tile});
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