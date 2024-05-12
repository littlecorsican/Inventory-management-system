const express=require('express')
const router=express.Router()
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '5mb' }));
// router.use(bodyParser.raw());
const models = require('../models/index')
const { Sequelize } = require('sequelize');
require('dotenv').config();
const Op = Sequelize.Op; 
const helperFile = require('../helper/file.js');

router.get('/', function (req, res) { // Get all with pagination
    const {limit, offset, sortBy, contains} = req.query
    const sortBy_column = "name"
    const sortBy_order = "ASC"
    //const sortBy_column = sortToColumnMap[sortBy.split(" ")[0]]
    // const sortBy_order = sortBy.split(" ")[1]
    console.log("limit", limit)
    console.log("offset", offset)
    try {
        models.item.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset*limit),
            where: {
                name: {
                    [Op.like]: `%${contains||""}%`
                }
            },
            order: [
                [sortBy_column, sortBy_order],
            ],
        }).then((response)=>res.send({  
            success: 1,
            data: response,
            limit: limit,
            offset: offset
        }))
    } catch(err) {
        res.send({  
            success: 0,
            message: err.toString()
        });
    }
})

router.get('/search', function (req, res) { // Get all with search
    const {limit, offset, search} = req.query
    try {
        models.item.findAll({
            limit: limit,
            offset: offset,
            where: {
                name: {
                    [Op.like]: '%' + search + '%'
                }
            }
        }).then((response)=>res.send({  
            success: 1,
            data: response,
            limit: limit,
            offset: offset
        }))
    } catch(err) {
        res.send({  
            success: 0,
            message: err.toString()
        });
    }
})

router.get('/:id', function (req, res) { // Get one by id
    const id = req.params.id
    try {
        models.item.findOne({ where: { id } })
        .then((response)=>res.send({  
            success: 1,
            data: response
        }))
    } catch(err) {
        res.send({  
            success: 0,
            message: err.toString()
        });
    }
})

router.put('/:id', async function (req, res) { // Update one by id
    const id = req.params.id
    const dataURI = req.body.imageUri
    const dataToWrite = {...req.body}
    if (dataURI) dataToWrite.image_path = await helperFile.createFile(dataURI)

    try {
        models.item.update(dataToWrite, {
            where: {
                id
            }
        }).then((response)=>{
            res.send({  
                success: 1,
                data: response
            });
        })
    } catch(err) {
        res.send({  
            success: 0,
            message: err.toString()
        });
    }
})

router.delete('/:id', async function (req, res) { // Update one by id
    const id = req.params.id
    try {
        models.item.destroy({
            where: {
                id
            }
        }).then((response)=>{
            res.send({  
                success: 1,
                data: response
            });
        })
    } catch(err) {
        res.send({  
            success: 0,
            message: err.toString()
        });
    }
})

router.post('/', async function (req, res) { // Create new one

    try {
        const dataURI = req.body.imageUri
        const dataToWrite = {...req.body}
        if (dataURI) dataToWrite.image_path = helperFile.createFile(dataURI)
        console.log("dataToWrite", dataToWrite)
        
        const result = await models.item.create(dataToWrite)
        console.log("result", result)
        res.send({  
            success: 1,
            message: "Item created"
        });
    }
    catch(err) {
        res.send({  
            success: 0,
            message: err.toString()
        });
    }
})

module.exports = router