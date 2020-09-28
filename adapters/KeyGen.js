const shortID = require('shortid');

module.exports = function generate(){
    var Key = shortID.generate();
    return Key;
}


