module.exports = class Player {
    constructor(config){
        this.userName = "";
        this.keyId = "";
        this.inventory = [];
        this.friends = [];
        this.kibble = 0;
        this.bronze = config.Tickets.Bronze;
        this.silver = config.Tickets.Silver;
    }
    loadPlayer(userData){
        this.userName = userData.userName;
        this.userId = userData._id;
        this.keyId = userData.keyId;
        this.inventory = userData.inventory;
        this.friends = userData.friends;
        this.kibble = userData.kibble;
        this.bronze = userData.bronze;
        this.silver = userData.silver;
    }

    // set Keyvalues + userName 
    // used for new entry
    setKeyId(keyId){
        this.keyId = keyId;
    }
    setUserName(userName){
        this.userName = userName;
    }
    hasKeyId(){
        return (this.keyId!=null)
    }

    //
    addFriend(userName){
        this.friends.push(userName);
    }
    addItem(itemId){
        this.inventory.push(itemId);
    }
    addKibble(kibble){
        this.kibble+=kibble;
    }
    setWorld(roomName,mapName){
        this.room = roomName;
        this.map = mapName;
    }
    getWorld(){
        return this.room+"_"+this.map;
    }

}