
const repository = require('../persistence/repository')
const { v4: uuidv4 } = require('uuid');
const GameState = require('../domain/GameState');
const groupArray = require('group-array');
const Team = require('../domain/Team');

function getTurnPlayer(playersByTeam, turn, playerOrder) {
    const team = turn % 2 === 0 ? Team.GREEN : Team.BLUE
    const teamPlayers = playersByTeam[team]

    if (!teamPlayers) {
        return null
    }

    const playerOrderNorm = playerOrder % teamPlayers.length

    return {
        playerOrder: playerOrderNorm,
        player: teamPlayers[playerOrderNorm]
    }
}

exports.findGame = async function(gameId) {
    const game = await repository.findGame(gameId)

    if (!game) {
        return null
    }

    if (game.currentState === GameState.PLAYING) {

        game.playersByTeam = groupArray(game.players, p => p.team)
        game.currentTurnInfo = await repository.findTurn(game.id, game.currentPhase, game.currentTurn)

        async function getPrevTurnPlayerOrder(turn) {
            const prevTurn = await repository.findTurn(game.id, game.currentPhase, turn)
            if (prevTurn) {
                return prevTurn.playerOrder + 1
            }
            return 0
        }

        let currentPlayerOrder
        if (game.currentTurnInfo) {
            currentPlayerOrder = game.currentTurnInfo.playerOrder
        } else {
            currentPlayerOrder = await getPrevTurnPlayerOrder(game.currentTurn - 2)
        }

        const nextPlayerOrder = await getPrevTurnPlayerOrder(game.currentTurn -1)
        
        game.currentPlayer = getTurnPlayer(game.playersByTeam, game.currentTurn, currentPlayerOrder).player
        game.nextPlayer = getTurnPlayer(game.playersByTeam, game.currentTurn + 1, nextPlayerOrder).player
    }

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

exports.startTurn = async function(gameId){
    const game = await repository.findGame(gameId)
    const prevTurn = await repository.findTurn(gameId, game.currentPhase, game.currentTurn - 2)

    const playersByTeam = groupArray(game.players, p => p.team)

    let nextPlayerOrder
    if (prevTurn) {
        nextPlayerOrder = prevTurn.playerOrder + 1
    } else {
        nextPlayerOrder = 0
    }

    const {playerOrder, player} = getTurnPlayer(playersByTeam, game.currentTurn, nextPlayerOrder)
    
    const turn = {
        order: game.currentTurn,
        playerId: player.id,
        playerOrder: playerOrder,
        startedAt: new Date()
    }

    await repository.createTurn(game.id, game.currentPhase, turn)
}