const express = require('express');
const router = express.Router();

const authMiddleware = require("@/app/http/middlewares/authMiddleware");
const adminMiddleware = require("@/app/http/middlewares/adminMiddleware");

const createOrderRequest = require("@/app/http/requests/createOrderRequest");
const updateOrderRequest = require("@/app/http/requests/updateOrderRequest");

const {store, index, show, update} = require("@/app/http/controllers/admin/orderContrller");
const droneController = require("@/app/http/controllers/admin/droneContrller");


router.use('/', authMiddleware, adminMiddleware)

router.post('/orders', createOrderRequest, store)
router.get('/orders', index)
router.get('/orders/:id', show)
router.put('/orders/:id', updateOrderRequest,  update)

router.get('/drones', droneController.index)
router.patch('/drones/:id/broken', droneController.setBroken)
router.patch('/drones/:id/fixed', droneController.setFixed)

module.exports = router;
