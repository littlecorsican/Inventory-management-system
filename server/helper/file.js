const generalConfig = require('../config/general');
const fs = require('fs')
const crypto = require("crypto");
const ImageDataURI = require('image-data-uri');


const helperFile={
    generateFileName: ()=> {
        const uuid = crypto.randomUUID();
        const exists = fs.existsSync(generalConfig.storagePath + uuid + ".png");
        if (exists) helperFile.generateFileName();
        return uuid
    },
    createFile: async(dataURI)=>{
        const fileName = helperFile.generateFileName();
        const output = await ImageDataURI.outputFile(dataURI, generalConfig.storagePath + fileName)
        console.log("output", output)
        return fileName + ".png"
    }
}

module.exports = helperFile