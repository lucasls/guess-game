
const repository = require('../persistence/repository')

async function findGame(gameId) {
    return repository.findGame(gameId)
}

module.exports = findGame
