const DroneLocationService = require('@/app/services/droneLocationService.js')

module.exports = async (req, res) => {
    const droneId = req.user.userableId
    const {location} = req.body
    const service = new DroneLocationService()

    let droneLocation = null


    try {
        droneLocation = await service.setLocation(droneId, location)
    } catch (error) {
        return res.status(400).json({
            message: error.message
        })
    }

    return res.status(200).json({
        message: 'drone location updated successfully',
        location: droneLocation
    })
}