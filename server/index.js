var express = require('express');
var app = express();
const cors = require('cors');

app.use(cors({
   origin: '*'
}));

const router = express.Router()

const itemRoute=require('./routes/item')
const containerRoute=require('./routes/container')
const fileRoute=require('./routes/file')

app.use('/api/container', containerRoute)
app.use('/api/item', itemRoute)
//app.use('/api/file', fileRoute)
const path = require('path')
app.use('/media', express.static(path.join(__dirname, 'media')))

// app.get('/media/:filename', (req, res) => {
//    console.log("!!!!!!!!!!")
//    const fileName = req.params.filename
//    res.sendFile(__dirname + `/media/${fileName}`)
// })

app.get('/', function (req, res) {
   res.send('Hello World');
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://localhost:8081", host, port)
})

module.exports = server