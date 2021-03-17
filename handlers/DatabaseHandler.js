const { mongo } = require('mongoose');

var config;
// im so sorry to anyone who has to read this
module.exports.initialize = function initialize(conf)
{
    config = conf;    
}

async function mongoCollectionQueryAsync(data,collectionName,callbackFuncAsync){
    var mongoUri = config.DBUri;
    const MongoClient = require('mongodb').MongoClient;
    var result;
 
    try{
        const client = new MongoClient(mongoUri, { useNewUrlParser: true });
        await client.connect();
        var db = client.db(config.DatabaseName);
        const collection = db.collection(collectionName);
        result = await callbackFuncAsync(data,collection);
        client.close();
    }
    catch(err){
        console.log(`Error in mongo query: ${err}`);
    }
    return result;
}


////////////////////////////////////////////////Player Database//////////////////////////////////////////////
// Checking for players
module.exports.findPlayer = function(data){
    // sets database based on what the server preferences allow. note to add support for custom db or mysql
    switch(config.Database){
        case 'Mongo':
            return mongoCollectionQueryAsync(data,'players',mongoGetPlayerDataAsync);
        default: 
    }
}

async function mongoGetPlayerDataAsync(data,collection){
    let find = false;
    try{
        find = await collection.findOne({'userName': data});
    }
    catch(exception)
    {
        console.error(`Error in playerdata request: ${exception}`);
    }
    finally{
        return find; 
    }
}

    // Adding a new player
module.exports.addPlayer = function(data){
    switch(config.Database){
        case 'Mongo':
            return mongoCollectionQueryAsync(data,'players',mongoAddPlayerAsync);
        default: 
    }
}
async function mongoAddPlayerAsync(data,collection){
    let find = false;
    try{
        find = collection.insertOne(data);
    }
    catch(exception){
        console.error(`Error in adding player: ${exception}`);
    }
    finally{
        return find; 
    }
}

    // Updating player data

module.exports.updatePlayer = function(data){
    switch(config.Database){
        case 'Mongo':
            return mongoCollectionQueryAsync(data,'players',mongoUpdatePlayerAsync);
        default: 
    }
}
async function mongoUpdatePlayerAsync(data,collection){
    try{
        var find = await collection.updateOne({'_id': data.userId},{$set:data});
    }
    catch(exception){
        console.error(`Error in updating player: ${exception}`);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////Character Database//////////////////////////////////////////////

// Adding a character

module.exports.addCharacter = function(data){
    console.log(1);
    switch(config.Database){
        case 'Mongo':
            mongoCollectionQueryAsync(data,'characters',mongoAddCharacterAsync);
        default: 
    }
}
async function mongoAddCharacterAsync(data,collection){
    try{
        console.log(data);
        collection.insertOne(data);
    }
    catch(exception){
        console.error(`Error: ${exception}`);
    }

} 

// Getting all characters with the username tag

module.exports.getCharacters = function(data){
    // sets database based on what the server preferences allow. note to add support for custom db or mysql
    switch(config.Database){
        case 'Mongo':
            return mongoCollectionQueryAsync(data,'characters',mongoGetAllCharacterDataAsync);
        default: 
    }
}

async function mongoGetAllCharacterDataAsync(data,collection){
    let find = false;
    try{
        var searchCursor = await collection.find({'userName': data.userName});
        find = await searchCursor.toArray();
    }
    catch(exception){
        console.error(`Error: ${exception}`);
    }
    finally{
        return find; 
    }
}

// Getting a specific character
module.exports.findCharacter = function(data){
    // sets database based on what the server preferences allow. note to add support for custom db or mysql
    switch(config.Database){
        case 'Mongo':
            
            return mongoCollectionQueryAsync(data,'characters',mongoFindOneCharacterAsync);
        default: 
    }
}

async function mongoFindOneCharacterAsync(charId,collection){
    let find = false;
    try{
        var searchCursor = await collection.findOne({'_id': mongo.ObjectID(charId)});
        find = searchCursor;
    }
    catch(exception){
        console.error(`Error: ${exception}`);
    }
    finally{
        return find; 
    }
} 

// Updating a specific character 
module.exports.updateCharacter = function(data){
    // sets database based on what the server preferences allow. note to add support for custom db or mysql
    switch(config.Database){
        case 'Mongo':
            mongoCollectionQueryAsync(data,'characters',mongoUpdateCharacterAsync);
        default: 
    }
}

async function mongoUpdateCharacterAsync(data,collection){
    try{
        await collection.updateOne({'_id': data.charId},{$set:data});
    }
    catch(exception){
        console.error(`Error: ${exception}`);
    }
}    





