const express = require('express');
const authMiddleware = require("@/app/http/middlewares/authMiddleware");
const adminMiddleware = require("@/app/http/middlewares/adminMiddleware");
const {store, index, show, update} = require("@/app/http/controllers/admin/orderContrller");
const droneController = require("@/app/http/controllers/admin/droneContrller");
const router = express.Router();

router.use('/', authMiddleware, adminMiddleware)

router.post('/orders', store)
router.get('/orders', index)
router.get('/orders/:id', show)
router.put('/orders/:id', update)

router.get('/drones', droneController.index)
router.patch('/drones/:id/broken', droneController.setBroken)
router.patch('/drones/:id/fixed', droneController.setFixed)

module.exports = router;
