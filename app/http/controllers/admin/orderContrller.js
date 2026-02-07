const orderService = require('@/app/services/orderService.js')
const orderStatues = require("@/app/enums/orderStatus");

module.exports = {
    index: async (req, res) => {
        const service = new orderService()

        return res.status(200).json({
            ...await service.getOrders(req.user.userableId, req.user.userableType)
        })
    },

    show: async (req, res) => {
        const orderId = req.params.id

        const service = new orderService()
        const order = await service.getOrder(orderId, {
            creatorId: req.user.userableId,
            creatorType: req.user.userableType
        })

        if (!order) {
            return res.status(404).json({
                message: 'order not found'
            })
        }

        return res.status(200).json({
            order: order
        })
    },

    store: async (req, res) => {
        let data = req.body

        data.creatorId = req.user.userableId
        data.creatorType = req.user.userableType

        const service = new orderService()

        return res.status(201).json({
            message: 'order created successfully',
            order: await service.create(data)
        })
    },

    update: async (req, res) => {
        let data = req.body

        const service = new orderService()

        const order = await service.update(req.params.id, data)

        return res.status(200).json({
            message: 'order updated successfully',
            order: order
        })
    },
}