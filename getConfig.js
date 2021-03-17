const configTemplate = {
    PORT:52300,
    Console:true,

    Rooms:["Bengal Cat"],
    Tickets:{"Bronze":4,"Silver":2},

    UserNameMaxChars:20,
    CharNameMaxChars:15,
    ChatMaxChars:40,
    ChatFilter: "Blacklist",

    Database:"Mongo",
    DatabaseName:"lpsor_game",
    DBUri:"",
    "SaltRounds":10
}

module.exports = function getConfig(){
    const fs = require('fs');
    var path = 'config.json';

    // read the config file
    if(fs.existsSync(path)){
        var configFile = fs.readFileSync(path);
        return JSON.parse(configFile);
    }
    else{
        var jsonFile = JSON.stringify(configTemplate,null,2)
        fs.writeFileSync(path,jsonFile)
        return configTemplate;
    }
}