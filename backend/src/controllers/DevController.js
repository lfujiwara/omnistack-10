const axios = require('axios')
const Dev = require('../models/Dev')
const parseArrayAsString = require('../utils/parseStringAsArray')

module.exports = {
  index: async (request, response) => {
    const devs = await Dev.find()
    return response.json(devs)
  },
  store: async (request, response) => {
    const { github_username, techs, latitude, longitude } = request.body

    let dev = await Dev.findOne({ github_username })

    if (!dev) {
      const apiResponse = await axios.get(
        `https://api.github.com/users/${github_username}`
      )

      const {
        name = apiResponse.data.login,
        avatar_url,
        bio,
      } = apiResponse.data
      const techsArray = parseArrayAsString(techs)
      const location = { type: 'Point', coordinates: [longitude, latitude] }

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        location,
        bio,
        techs: techsArray,
      })
    }
    return response.json(dev)
  },
  update: async (request, response) => {
    const { github_username } = request.params
    const dev = await Dev.findOne({ github_username })

    if (!dev) {
      response.code(404)
      return response.json({ message: 'Dev not found' })
    }

    Object.entries(request.body)
      .filter(entry => entry[0] !== 'github_username')
      .forEach(([k, v]) => (dev[k] = v))

    dev.save()

    return response.json(dev)
  },
  destroy: async (request, response) => {
    const { github_username } = request.params
    const dev = await Dev.findOne({ github_username })

    if (!dev) {
      response.code(404)
      return response.json({ message: 'User not found' })
    }

    dev
      .remove()
      .then((err, old_dev) =>
        response.json(err ? err : { message: 'Deleted', old_dev })
      )
  },
}
