const { Order, Delivery, sequelize } = require('@/app/models/index.js');
const orderStatus = require('@/app/enums/orderStatus.js');
const { Op } = require('sequelize');

class ReserveOrderService {
    async reserveOrderForDrone(droneId) {
        const transaction = await sequelize.transaction();

        try {
            const order = await Order.findOne({
                where: {
                    status: orderStatus.PENDING,
                    reserved: false,
                },
                order: [['createdAt', 'ASC']],
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!order) {
                throw new Error('No pending orders available for reservation');
            }

            await Delivery.create({
                orderId: order.id,
                droneId: droneId,
                status: 'reserved',
                reservedAt: new Date()
            }, { transaction });

            await transaction.commit();

            return order
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = ReserveOrderService;