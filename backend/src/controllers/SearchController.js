const Dev = require('../models/Dev')
const parseArrayAsString = require('../utils/parseStringAsArray')

module.exports = {
  async index(request, response) {
    const { latitude, longitude, techs } = request.query
    if (!latitude || !longitude) {
      response.status(400)
      return response.json({ message: 'No valid location provided' })
    }
    const techsArray = parseArrayAsString(techs)

    let query
    if (techsArray[0] !== '')
      query = {
        techs: { $in: techsArray },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: 10000,
          },
        },
      }
    else
      query = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: 10000,
          },
        },
      }

    console.log(query)
    const devs = await Dev.find(query)

    return response.json({ devs })
  },
}
