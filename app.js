const path = require('path')
const fs = require('fs')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const AppError = require('./utils/AppError')
const globalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRouter')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRoutes')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
// GLOBAL MIDDLEWARES

// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')))

// Security http headers
app.use(helmet())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// Allow only 100 request in 1h from 1 IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too Many Requests Whit This Ip, Please Try Again Later'
})
app.use('/api', limiter)

// Body Parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended: true, limit: '10kb'}))
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent Parameter Pollusion
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}))

app.use((req, res, next) => {
    // console.log("Cookies: ", req.cookies)
    // res.setHeader( 'Content-Security-Policy', "script-src 'self' https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js" ); 
    // res.setHeader( 'X-Frame-Options', "SAMEORIGIN" )
    // res.setHeader( 'Cross-Origin-Embedder-Policy', "require-corp" )
    res.setHeader( 'Content-Security-Policy', "script-src 'self' https://js.stripe.com" )
    // res.cookie({sameSite: 'none', secure: true})
    // res.setHeader( 'Access-Control-Allow-Origin', "https://js.stripe.com" )
    
    next()
})


// Routes
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)


app.all('*', (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl} on this server`, 404))
})

/**
 * specify 4 params
 * so it's error handling function
 */
app.use(globalErrorHandler)

module.exports = app