
const repository = require('../persistence/repository')
const { v4: uuidv4 } = require('uuid');
const GameState = require('../domain/GameState');
const groupArray = require('group-array');
const Team = require('../domain/Team');

function getTurnPlayer(playersByTeam, turn) {
    const team = turn % 2 === 0 ? Team.GREEN : Team.BLUE
    const teamPlayers = playersByTeam[team]

    return teamPlayers[Math.floor(turn / 2) % teamPlayers.length]
}

exports.findGame = async function(gameId) {
    const game = await repository.findGame(gameId)

    if (!game) {
        return null
    }

    game.playersByTeam = groupArray(game.players, p => p.team)
    
    game.currentPlayer = getTurnPlayer(game.playersByTeam, game.currentTurn)
    game.nextPlayer = getTurnPlayer(game.playersByTeam, game.currentTurn + 1)

    return game
}

exports.addWords = async function (gameId, playerId, words) {
    await repository.addWords(gameId, words.map(content => ({
        id: uuidv4(),
        playerId: playerId,
        content: content
    })))

    const allPlayersDone = (await repository.findPlayersWithoutWords(gameId)).length === 0

    if (allPlayersDone) {
        repository.setGameState(gameId, GameState.PLAYING)
    }
}

exports.findPlayerWords = async function (gameId, playerId) {
    return await repository.findPlayerWords(gameId, playerId)
}

exports.findPlayersWithoutWords = async function(gameId) {
    return await repository.findPlayersWithoutWords(gameId)
}

