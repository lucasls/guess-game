
const repository = require('../persistence/repository')

async function setPlayerTeam(gameId, playerId, team) {
    await repository.setPlayerTeam(gameId, playerId, team)
    return await repository.findGame(gameId)
}

module.exports = setPlayerTeam
