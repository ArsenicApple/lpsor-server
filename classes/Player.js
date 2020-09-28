module.exports = class Player {
    constructor(userData){
        this.userName = "";
        this.keyId = "";
        this.inventory = [];
        this.friends = [];
        this.kibble = 0;
        this.bronze = 0;
        this.silver = 0;
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

}