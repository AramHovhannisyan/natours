const { type } = require('express/lib/response')
const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
// const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, "Name Must be <= 40"],
        minlength: [10, "Name Must be >= 10"],
        validator: [validator.isAlpha, 'Name Must Only Contain Characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        default: 4.5,
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Possible Values Are: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 5,
        min: [1, "Min Value is 1"],
        max: [5, "Max Value is 5"],
        set: val => Math.round(val *10 ) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val){
                return val < this.price
            },
            message: `Discount Price {VALUE} Must be less than Regular Price`,
        }
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, "A tour must have a description"]
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt:{
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJson
        type: {
            type: String,
            default: 'point',
            ENUM: ['point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'point',
                ENUM: ['point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
{
    toJSON: { virtuals:true },
    toObject: { virtuals:true }
})

tourSchema.index({ price: 1 })

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7
})

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

//  DOCUMENT MIDDLEWARE
// before save(), create()
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true})

    next()
})

tourSchema.pre(/^find/, function(next){

    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })

    next()
})

// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map( async id => await User.findById(id) )
//     this.guides = await Promise.all(guidesPromises)

//     next()
// })

tourSchema.post('save', function(doc, next){
    // console.log(doc);
    
    next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour