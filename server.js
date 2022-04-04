const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const app = require('./app')

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose.connect(DB).then(() => console.log('Successful Connection') )

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    // console.log(`Running On Port ${port}`);
})

process.on('unhandledRejection', err => {
    // console.log(err.name, err.message);
    // console.log('Shutting Down...');
    server.close(() => {
        process.exit(1)
    })
})

process.on('uncaughtException', err => {
    // console.log(err.name, err.message);
    // console.log('Shutting Down...');
    server.close(() => {
        process.exit(1)
    })
})