module.exports = class Character {
    constructor(){
        this.userName = "";
        this.charId = data._id;
        // sets the character's name
        this.name = "";

        // sets sprite data
        this.species = 0;
        this.subSpecies = 0;
        this.palette = []; // palette is based on the palette order in a species
        this.parts = [];
        this.gender = 0;

        this.adoptDate = "";
        this.wearing = [0,0,0,0,0,0,0,0]; // sets a blank wearing slot
        this.health = [100,100,100]; // character with full health bars
        this.favFood = [];
        
    }

    loadCharacter(userName,data){
        this.userName = userName;
        this.charId = data._id;

        // sets the character's name
        this.name = data.name;

        // sets sprite data
        this.species = data.species;
        this.subSpecies = data.subSpecies;
        this.palette = data.palette; // palette is based on the palette order in a species
        this.parts = data.parts;
        this.gender = data.gender;

        // misc data
        this.adoptDate = data.adoptDate;
        this.wearing = data.wearing;
        this.health = data.health;
        this.favFood = data.favFood;        
    }

    setOutfit(index,id){
        this.wearing[index] = id;
    }
    // setting only 
    setHealth(value){
        if(typeof value[0] != number || typeof value[1] != number || typeof value[2] != number) throw "Invalid Health Value";

        this.health[0] = value[0];
        this.health[1] = value[1];
        this.health[2] = value[2];
    }
    setRoom(room){
        this.map = map;
    }

    // Generate new values for Adoption date and favourite food
    newAdoptDate(){
        this.adoptDate = new Date().toDateString;
    }
    newFavouriteFood(){
        this.favFood = generateFavouriteFood();
    }
}

function generateFavouriteFood(){
    // look thru database for objects labelled "food"
    // get random 3 foods
    return [0,0,0];
}