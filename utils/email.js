const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email{
    
    constructor(user, url){
        this.to = user.email,
        this.firstname = user.name.split(' ')[0]
        this.url = url
        this.from = 'Aram Hovhannisyan <8hovhannisyanaram@gmail.com>'
    }

    createTransport() {
        // create transporter

        return nodemailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            secure: false,
            auth: {
                user: process.env.SMPT_USER,
                pass: process.env.SMPT_PASSWORD
            }
        })
    }

    // Send the actual email
    async send(template, subject){
        // 1. render html based on a pug tpl
        
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstname: this.firstname,
            url: this.url,
            subject
        })

        // 2. Define email options

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        }

        // Create Transport and send the email
        await this.createTransport().sendMail(mailOptions)
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome To the Natours Family!')
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password Reset token ( valid for 10 minutes )')
    }
}