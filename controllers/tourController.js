const multer = require('multer')
const sharp = require('sharp')
const Tour = require('../models/tourModel')
const util = require('util')
const { json } = require('express/lib/response')

const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')

const factory = require('./handlerFactory')

// exports.checkBody = (req, res, next) => {
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status: 'fail',
//             message: "Missing name Or price"
//         })
//     }

//     next()
// }

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image, Pleas upload image', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
])

exports.resizeTourImages = catchAsync( async (req, res, next) => {
    console.log(req.files);

    if(!req.files.imageCover || !req.files.images) return next()

    // 1. imageCover

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover}`

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`)

    // 2. images

    req.body.images = []

    await Promise.all(req.files.images.map( async (file, i) => {
        const fileName = `tour-${req.params.id}-${Date.now()}-${i}}`

        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${fileName}`)

        req.body.images.push(fileName)
    }))

            
    console.log("Files: ", req.files);
    console.log("Body: ", req.body);

    next()
})

exports.aliasTopTout = async (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'

    next()
}

exports.getAllTours = factory.getAll(Tour)

exports.getTour = factory.getOne(Tour, { path: 'reviews' })

exports.createTour = factory.createOne(Tour)

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour)