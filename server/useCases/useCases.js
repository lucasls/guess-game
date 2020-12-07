
const repository = require('../persistence/repository')
const { v4: uuidv4 } = require('uuid');
const GameState = require('../domain/GameState');
const groupArray = require('group-array');
const Team = require('../domain/Team');

const TURN_DURATION_SECONDS = 90

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

async function getAndUpdateCurrentTurn(game) {
    const currentTurnInfo = await repository.findTurn(game.id, game.currentPhase, game.currentTurn)

    if (currentTurnInfo) {
        if (new Date() - currentTurnInfo.startedAt > TURN_DURATION_SECONDS * 1000) {
            await repository.updateGameTurn(game.id, game.currentTurn + 1)
        }
    }

    return currentTurnInfo
}

async function getAndUpdateCurrentPhase(game) {
    const remainingWords = await repository.findNumRemainingWordsInPhase(game.id, game.currentPhase)

    if (remainingWords === 0) {
        if (game.currentPhase < 2) {
            await repository.updateGamePhase(game.id, game.currentPhase + 1)
        } else {
            await repository.setGameState(game.id, GameState.GAME_RESULTS)
        }
    }

    return {
        remainingWords: remainingWords
    }
}

exports.findGame = async function(gameId) {
    const game = await repository.findGame(gameId)

    if (!game) {
        return null
    }

    game.turnDurationSeconds = TURN_DURATION_SECONDS

    if (game.currentState === GameState.PLAYING || game.currentState === GameState.GAME_RESULTS) {

        game.playersByTeam = groupArray(game.players, p => p.team)
        game.currentTurnInfo = await getAndUpdateCurrentTurn(game)
        game.currentPhaseInfo = await getAndUpdateCurrentPhase(game)
        game.wordToGuess = await repository.findNextWord(game.id, game.currentPhase, game.currentTurn)
        game.points = await repository.calculatePoints(game.id)

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

exports.startTurn = async function(gameId) {
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

    const remainingWords = await repository.findRemainingWordsInPhaseRandomly(game.id, game.currentPhase)

    await repository.addWordsToTurn(game.id, game.currentPhase, game.currentTurn, remainingWords)
}

function normalize(str) {
    return str.trim().replace(/\s+/g, " ").toLowerCase()
}

exports.guessWord = async function(gameId, word) {
    const game = await repository.findGame(gameId)
    const wordToGuess = await repository.findNextWord(game.id, game.currentPhase, game.currentTurn)

    const isCorrect = normalize(word) === normalize(wordToGuess.content)

    if (isCorrect) {
        repository.setWordIsGuessed(game.id, game.currentPhase, game.currentTurn, wordToGuess.id)
    }

    return isCorrect
}

exports.skipWord = async function(gameId, wordId) {
    const game = await repository.findGame(gameId)
    await repository.skipWord(game.id, game.currentPhase, game.currentTurn, wordId)
}

exports.deletePlayer = async function(gameId, playerId) {
    await repository.deletePlayer(gameId, playerId)
}