var express = require('express');
var app = express();
const cors = require('cors');

app.use(cors({
   origin: '*'
}));

const router = express.Router()

const itemRoute=require('./routes/item')
const containerRoute=require('./routes/container')

app.use('/api/container', containerRoute)
app.use('/api/item', itemRoute)


app.get('/', function (req, res) {
   res.send('Hello World');
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://localhost:8081", host, port)
})

module.exports = server