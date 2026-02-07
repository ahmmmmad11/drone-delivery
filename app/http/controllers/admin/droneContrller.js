const droneService = require('@/app/services/droneService.js')

module.exports = {
    index: async (req, res) => {
        const service = new droneService()

        return res.status(200).json({
            ...await service.getDrones()
        })
    },

    setBroken: async (req, res) => {
        const droneId = req.params.id
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

    setFixed: async (req, res) => {
        const droneId = req.params.id

        const service = new droneService()

        let drone = null

        try {
            drone = await service.setFixed(droneId)
        } catch (error) {
            return res.status(400).json({
                message: error.message
            })
        }

        return res.status(200).json({
            message: 'drone set to active successfully',
            drone: drone
        })
    },
}