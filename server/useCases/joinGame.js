
const { v4: uuidv4 } = require('uuid');
const repository = require('../persistence/repository')

async function joinGame(gameId, playerName) {
    const player = {
        id: uuidv4(),
        name: playerName,
        isHost: false
    }

    repository.joinGame(gameId, player)

    return {
        playerId: player.id
    }
}

module.exports = joinGame
