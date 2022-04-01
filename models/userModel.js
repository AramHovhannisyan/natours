const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name Field Is Required']
    },
    email: {
        type: String,
        required: [true, 'Email Is Required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Email is not valid']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Password field is reuired'],
        minlength: 8,
        maxlength: 32,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm Password Field Is Required'],
        validate: {
            validator: function (el){
                return el === this.password
            },
            message: "Passwords Are Not The Same"
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: String,
    passwordExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){ return next }

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined

    next()
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password') || this.isNew){
        return next()
    }

    this.passwordChangedAt = Date.now() - 1000

    next()
})

userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}})

    next()
})

userSchema.methods.correctPassword = async function(condidatePass, userPass){
    return await bcrypt.compare(condidatePass, userPass)
}

userSchema.methods.changedPasswordAfter = async function(JSTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10 )
                
        return JSTTimestamp < changedTimeStamp
    }

    return false
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordExpires = Date.now() + 10 * 60 * 1000

    // console.log({resetToken}, this.passwordResetToken);

    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User