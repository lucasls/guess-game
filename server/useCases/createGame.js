
const { v4: uuidv4 } = require('uuid');
const repository = require('../persistence/repository')
const GameState = require('../domain/GameState')

async function createGame(playerName) {
    const player = {
        id: uuidv4(),
        name: playerName,
        isHost: true
    }
    
    const game = {
        id: uuidv4(),
        players: [player],
        currentPhase: 0,
        currentTurn: 0,
        currentState: GameState.JOIN_GAME
    }

    repository.createGame(game)

    return {
        gameId: game.id,
        playerId: player.id 
    }
}

module.exports = createGame
