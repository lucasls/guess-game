
const repository = require('../persistence/repository')

async function setGameState(gameId, state) {
    await repository.setGameState(gameId, state)
    return await repository.findGame(gameId)
}

module.exports = setGameState
