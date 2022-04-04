const crypto = require('crypto')
const {promisify} = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const { token } = require('morgan')
const Email = require('../utils/email')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendPassword = (user, statusCode, res) => {
    const token = signToken(user._id)
    
    const cookieOptions = {
        expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV == 'production'){
        cookieOptions.secure = true
    }

    res.cookie('jwt', token, cookieOptions)
    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt || ''
    })

    const url = `${req.protocol}://${req.get('host')}/me`
    await new Email(newUser, url).sendWelcome()

    createSendPassword(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body

    if(!email || !password){
        return next(new AppError('Please Provide Email And Password', 400))
    }

    const user = await User.findOne({email}).select('+password')
    
    if(!user || !await user.correctPassword(password, user.password)){
        return next(new AppError('User Not Found', 401))
    }

    createSendPassword(user, 200, res)

})

exports.logout = (req, res, next) => {

    res.cookie('jwt', 'loggedout', {
        expiresIn: new Date( Date.now() * 10 * 1000 ),
        httpOnly: true
    })

    res.status(200).json({
        status: 'success'
    })
}

exports.protect = catchAsync( async (req, res, next) => {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt){
        token = req.cookies.jwt
    }
    
    if(!token){
        return next(new AppError('You are not LOGGED IN', 401))
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    const freshUser = await User.findById(decoded.id)

    if(!freshUser){
        return next(new AppError('The User Belonging to this token, does no longer exist', 401))
    }

    // Check If User Recently Changed The Pass
    if(await freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('Password Recently changed, please log in again', 401))
    }

    req.user = freshUser
    res.locals.user = freshUser
    
    next()
})

exports.restrictTo = (...roles ) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You Do Not Have Permissions', 403))
        }

        next()
    }
}

exports.forgotPassword = async (req, res, next) => {
    // get user by email
    const user = await User.findOne({'email': req.body.email})
    if(!user){
        return next(new AppError("User with provided email doesn't exists", 404))
    }

    // generate random token
    const resetToken = user.createPasswordResetToken()
    
    await user.save({validateBeforeSave: false})

    // send back as an email

    try {
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

        await new Email(user, resetUrl).sendPasswordReset()
    
        res.status(200).json({
            status: 'success',
            message: 'Token Send to your email'
        })
    } catch (error) {
        user.createPasswordResetToken = undefined
        user.passwordExpires          = undefined
        await user.save({validateBeforeSave: false})

        return next(new AppError('There was an error sending email, please try again later', 500))
    }
}

exports.resetPassword = catchAsync(async (req, res, next) => {

    const hashedToken = crypto.createHash('sha256')
                              .update(req.params.token)
                              .digest('hex')

    // get user by token
    const user = await User.findOne({
        'passwordResetToken': hashedToken,
        'passwordExpires': {$gt: Date.now()}
    })

    // if user and token is not expired set new password
    
    if(!user){
        return next(new AppError("Token is invalid, or it's expired", 400))
    }

    // changed at update
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordExpires = undefined

    await user.save()

    // log user in

    createSendPassword(user, 200, res)
})

exports.updatePassword = catchAsync( async (req, res, next) => {
    // get user from collection
    const user = await User.findById(req.user.id).select('+password')

    // check if current password is correct
    if(!(await user.correctPassword(req.body.currentPassword, user.password))){
        return next(new AppError('Your Current Password Is Not Correct', 401))
    }

    // if so, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    
    await user.save()

    createSendPassword(user, 200, res)


    // log user in, send jwt
})

// Only for rendered page
exports.isLoggedIn =  async (req, res, next) => {

    // console.log(`Cookies: ${req.cookies}`);

    if(req.cookies.jwt){
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

            const freshUser = await User.findById(decoded.id)

            if(!freshUser){
                return next()
            }

            if(await freshUser.changedPasswordAfter(decoded.iat)){
                return next()
            }

            // There is logged in user
            res.locals.user = freshUser
            
            return next()
        } catch (error) {
            return next()
        }
    }
    
    next()
}