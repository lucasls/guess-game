
const { v4: uuidv4 } = require('uuid')
const repository = require('../persistence/repository')
const Team = require('../domain/Team')

async function joinGame(gameId, playerName) {
    const game = await repository.findGame(gameId)

    const numGreen = game.players
        .filter(it => it.team === Team.GREEN)
        .length

    const numBlue = game.players
        .filter(it => it.team === Team.BLUE)
        .length

    const team = numGreen <= numBlue ? Team.GREEN : Team.BLUE

    const player = {
        id: uuidv4(),
        name: playerName,
        isHost: false,
        team: team
    }

    await repository.joinGame(gameId, player)

    return {
        playerId: player.id
    }
}

module.exports = joinGame
