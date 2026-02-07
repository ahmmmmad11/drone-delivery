const { Order, Delivery, sequelize } = require('@/app/models/index.js');
const orderStatus = require('@/app/enums/orderStatus.js');

class ReserveOrderService {
    async reserveOrderForDrone(droneId) {
        const transaction = await sequelize.transaction();

        try {
            const order = await Order.findOne({
                where: {
                    status: orderStatus.PENDING,
                },
                include: [{
                    model: Delivery,
                    as: 'deliveries',
                    required: false,
                    attributes: []
                }],
                order: [['createdAt', 'ASC']],
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!order) {
                throw new Error('No pending orders available for reservation');
            }

            const existingDelivery = await Delivery.findOne({
                where: { orderId: order.id },
                transaction
            });

            if (existingDelivery) {
                throw new Error('Order already has a delivery assigned');
            }

            const delivery = await Delivery.create({
                orderId: orderId,
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