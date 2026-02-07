const { Op } = require('sequelize');
const { Delivery } = require('@/app/models/index.js');
const orderService = require('@/app/services/orderService.js');
const orderStatus = require('@/app/enums/orderStatus.js');
const reserveOrderService = require('@/app/services/reserveOrderService.js');

module.exports = {
    show: async (req, res) => {
        const droneId = req.user.userableId
        const orderId = req.params.id
        const service = new orderService()

        let order = await service.getOrder(orderId, {}, {
            model: Delivery,
            as: 'deliveries',
            where: {
                droneId: droneId,
                status: {
                    [Op.in]: ['pending', 'collected']
                }
            }
        })

        if (! order) {
            return res.status(404).json({
                message: 'Order not found or not assigned to this drone'
            })
        }

        return res.status(200).json({
            order: order
        })
    },
    reserve: async (req, res) => {
        const droneId = req.user.userableId
        const service = new reserveOrderService()
        console.log('here')

        try {
            const order = await service.reserveOrderForDrone( droneId)

            return res.status(200).json({
                message: 'Order reserved successfully',
                order: order
            })
        } catch (error) {
            return res.status(400).json({
                message: error.message
            })
        }


    },
    collected: async (req, res) => {
        const droneId = req.user.userableId
        const orderId = req.params.id
        const service = new orderService()
        const {location} = req.body

        let order = await service.getOrder(orderId, {status: orderStatus.PENDING}, {
            model: Delivery,
            as: 'deliveries',
            where: {
                droneId: droneId
            }
        })

        if (! order) {
            return res.status(404).json({
                message: 'Order not found or not assigned to this drone'
            })
        }

        if (order.status === orderStatus.COLLECTED) {
            return res.status(400).json({
                message: 'Order has already been collected'
            })
        }

        if (order.status !== orderStatus.PENDING) {
            return res.status(400).json({
                message: 'Order cannot be collected in its current status'
            })
        }

        // we suppose to make location check here but since this is a simulation we will skip it
        await order.collect()

        return res.status(200).json({
            message: 'Order collected successfully',
            order: order
        })
    },
    delivered: async (req, res) => {
        const droneId = req.user.userableId
        const orderId = req.params.id
        const service = new orderService()
        const {location} = req.body

        let order = await service.getOrder(orderId, {status: orderStatus.PENDING}, {
            model: Delivery,
            as: 'deliveries',
            where: {
                droneId: droneId
            }
        })

        if (! order) {
            return res.status(404).json({
                message: 'Order not found or not assigned to this drone'
            })
        }

        if (order.status === orderStatus.DELIVERED) {
            return res.status(400).json({
                message: 'Order has already been delivered'
            })
        }

        if (order.status !== orderStatus.COLLECTED) {
            return res.status(400).json({
                message: 'Order cannot be collected in its current status'
            })
        }

        // we suppose to make location check here but since this is a simulation we will skip it
        await order.deliver()

        return res.status(200).json({
            message: 'Order collected successfully',
            order: order
        })
    }
}