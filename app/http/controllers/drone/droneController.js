const droneService = require('@/app/services/droneService.js')

module.exports = {
    setBroken: async (req, res) => {
        const droneId = req.user.userableId
        const service = new droneService()

        let drone = null

        try {
            drone = await service.setBroken(droneId)
        } catch (error) {
            return res.status(400).json({
                message: error.message
            })
        }

        return res.status(200).json({
            message: 'drone set to broken successfully',
            drone: drone
        })
    },
}