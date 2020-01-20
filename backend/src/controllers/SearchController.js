const Dev = require('../models/Dev')
const parseArrayAsString = require('../utils/parseStringAsArray')

module.exports = {
  async index(request, response) {
    const { latitude, longitude, techs } = request.query
    const techsArray = parseArrayAsString(techs)

    const query = {
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

    if (techsArray.length) query['techs'] = { techs: { $in: techsArray } }
    const devs = await Dev.find()

    return response.json({ devs })
  },
}
