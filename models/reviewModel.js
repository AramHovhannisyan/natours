const mongoose = require('mongoose')
const validator = require('validator')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review Can't Be Empty"]
    },
    rating: {
        type: Number,
        max: 5,
        min: 1
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review Must Belong To a Tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review Must Belong To a User']
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }    
})

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })

    next()
})

reviewSchema.statics.calcAverageRatings = async function(tourId){
    
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])

    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 5,
            ratingsQuantity: 0
        })
    }

}

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne().clone()

    next()
})

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

reviewSchema.post('save', async function(){
    // this.constructor points current review model
    await this.constructor.calcAverageRatings(this.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review