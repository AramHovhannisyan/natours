const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const Tour = require('../../models/tourModel')
const User = require('../../models/userModel')
const Review = require('../../models/reviewModel')

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose.connect(DB).then(() => console.log('Successful Connection') )

//  READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

//  IMPORT TO DB
const importData = async () => {
    try {
        await Tour.create(tours)
        await User.create(user, { validateBeforeSave: false })
        await Review.create(review)
        console.log('Data Successfully Loaded!');
    } catch (error) {
        console.log(error);
    }
    process.exit()
}

const deleteData = async () => {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Successfully Deleted!');
    } catch (error) {
        console.log(error);
    }
    process.exit()
}

if(process.argv[2] === '--import'){
    importData()
}else if(process.argv[2] === '--delete'){
    deleteData()
}