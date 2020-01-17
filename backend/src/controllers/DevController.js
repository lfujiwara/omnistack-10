const axios = require('axios')
const Dev = require('../models/Dev')
const parseArrayAsString = require('../utils/parseStringAsArray')

module.exports = {
  index: async (request, response) => {
    let filters = request.query
    if (filters)
      // Se houver filtros, transforme strings em regex
      filters = Object.entries(filters).reduce((acc, cur) => {
        if (cur[1] instanceof String || typeof cur[1] === 'string')
          acc[cur[0]] = { $regex: cur[1] }
        else acc[cur[0]] = cur[1]
        return acc
      }, {})
    const devs = await Dev.find(filters ? filters : {})
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
  syncWithGithub: async (request, response) => {
    const { github_username } = request.params

    let dev = await Dev.findOne({ github_username })

    if (!dev) {
      response.status(404)
      return response.json({ message: 'Dev not found' })
    }

    const apiResponse = await axios.get(
      `https://api.github.com/users/${github_username}`
    )

    const { name = apiResponse.data.login, avatar_url, bio } = apiResponse.data

    if (name) dev.name = name
    if (avatar_url) dev.avatar_url = avatar_url
    if (bio) dev.bio = bio

    dev.save()

    return response.json(dev)
  },
}
