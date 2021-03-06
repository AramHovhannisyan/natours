const express = require('express')
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')

const router = express.Router()

// router.use(authController.isLoggedIn)

router.get('/', viewsController.getOverview)

// router.get('/tour', viewsController.getTour)
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour)
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm)
router.get('/me', authController.protect, viewsController.getAccount)

module.exports = router