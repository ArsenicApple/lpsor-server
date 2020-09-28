const encryptor = require('bcrypt');


module.exports.generateHashAsync = async function(conf,short){
    try{
        const saltRounds = conf.SaltRounds;
        var hash = await encryptor.hash(short,saltRounds)
        return hash;
    }
    catch(error){
        console.error(`Error in generating hash: ${error}`);
    }
}
module.exports.compareHashesAsync = async function(short1,hash){
    try{
        var compare = encryptor.compare(short1,hash)
        return compare;
    }
    catch(error){
    console.error(`Error in comparing hashes: ${error}`);
    }
}
