const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const factory = require('./handlerFactory')

exports.checkoutSession = catchAsync(async (req, res, next) => {
    // Get Booked Tour
    const tour = await Tour.findById(req.params.tourId)

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `http://localhost:3000?success`,
        cancel_url: `http://localhost:3000?cancel`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],   //  tour-2-cover.jpg
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    console.log("aaaa", session);

    // Create session as response

    return res.status(200).json({
        status: 'success',
        session
    })
})