
const { v4: uuidv4 } = require('uuid');
const repository = require('../persistence/repository')

async function createGame(playerName) {
    const player = {
        id: uuidv4(),
        name: playerName,
        isHost: true
    }
    
    const game = {
        id: uuidv4(),
        players: [player]
    }

    repository.createGame(game)

    return {
        gameId: game.id,
        playerId: player.id 
    }
}

module.exports = createGame
