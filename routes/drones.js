const express = require('express');
const router = express.Router();

const authMiddleware = require('@/app/http/middlewares/authMiddleware.js')

const updateLocationRequest = require('@/app/http/requests/updateLocationRequest.js')

const droneController = require('@/app/http/controllers/drone/droneController.js')
const locationController = require('@/app/http/controllers/drone/locationController.js')
const ordersController = require('@/app/http/controllers/drone/orderController.js')

router.use('/', authMiddleware)

router.post('/set-location', updateLocationRequest,  locationController)
router.post('/orders/reserve', ordersController.reserve)
router.get('/orders/current-order', ordersController.show)
router.patch('/set-broken', droneController.setBroken)
router.patch('/orders/:id/collected',  ordersController.collected)
router.patch('/orders/:id/delivered',  ordersController.delivered)

module.exports = router;
