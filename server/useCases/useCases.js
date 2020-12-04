
const repository = require('../persistence/repository')
const { v4: uuidv4 } = require('uuid');

exports.addWords = async function (gameId, playerId, words) {
    await repository.addWords(gameId, words.map(content => ({
        id: uuidv4(),
        playerId: playerId,
        content: content
    })))
}

exports.findPlayerWords = async function (gameId, playerId) {
    return await repository.findPlayerWords(gameId, playerId)
}

exports.findPlayersWithoutWords = async function(gameId) {
    return await repository.findPlayersWithoutWords(gameId)
}

