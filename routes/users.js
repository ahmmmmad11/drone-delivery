const express = require('express');
const router = express.Router();

const {index, show, store, cancel} = require('@/app/http/controllers/enduser/orderContrller.js')

const createOrderRequest = require("@/app/http/requests/createOrderRequest");

const authMiddleware = require('@/app/http/middlewares/authMiddleware.js')
const userMiddleware = require('@/app/http/middlewares/userMiddleware.js')

router.use('/', authMiddleware, userMiddleware)

router.post('/orders', createOrderRequest, store)
router.get('/orders', index)
router.get('/orders/:id', show)
router.patch('/orders/:id/cancel', cancel)

module.exports = router;
