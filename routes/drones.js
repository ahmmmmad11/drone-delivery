const express = require('express');
const router = express.Router();

const droneController = require('@/app/http/controllers/drone/droneController.js')
const locationController = require('@/app/http/controllers/drone/locationController.js')
const ordersController = require('@/app/http/controllers/drone/orderController.js')

router.post('/set-location', locationController)
router.patch('/set-broken', droneController.setBroken)
router.get('/orders/:id', ordersController.show)
router.patch('/orders/:id/collected', ordersController.collected)
router.patch('/orders/:id/delivered', ordersController.delivered)

module.exports = router;
