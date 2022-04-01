import '@babel/polyfill'
import {login, logout} from './login'
import {updateSettings} from './updateSettings'
import {bookTour} from './stripe'

const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nac__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour')

if(loginForm){

    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        login(email, password)
    })
}

if(logoutBtn){
    logoutBtn.addEventListener('click', e => {
        e.preventDefault()

        logout()
    })
}

if(userDataForm){
    userDataForm.addEventListener('submit', e => {
        e.preventDefault()

        const form = new FormData()
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])
        
        updateSettings(form, 'data')
    })
}

if(userPasswordForm){
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault()

        const currentPassword = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value

        await updateSettings({currentPassword, password, passwordConfirm}, 'password')

        document.getElementById('password-current').value = ''
        document.getElementById('password').value = ''
        document.getElementById('password-confirm').value = ''
    })
}

if(bookBtn){
    
    bookBtn.addEventListener('click', event => {

        event.target.textContent = "Processing..."
        const { tourId } = event.target.dataset
        bookTour(tourId)
    })

}