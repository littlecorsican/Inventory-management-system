const generalConfig = require('../config/general');
const fs = require('fs')
const crypto = require("crypto");


const helperFile={
    generateFileName: ()=> {
        const uuid = crypto.randomUUID();
        const exists = fs.existsSync(generalConfig.storagePath + uuid + ".png");
        if (exists) helperFile.generateFileName();
        return uuid
    }
    
}

module.exports = helperFile